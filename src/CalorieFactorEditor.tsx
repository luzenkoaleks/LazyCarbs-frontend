// START: src/CalorieFactorEditor.tsx
import React, { useState, useEffect } from 'react';
import type { CalorieFactors } from './types';

// Props für apiKey, isApiKeyValid, clearApiKey und setShowApiKeyPrompt hinzugefügt
interface CalorieFactorEditorProps {
  apiKey: string;
  isApiKeyValid: boolean; // NEU: isApiKeyValid Prop
  clearApiKey: () => void; // Callback zum Löschen des API-Keys bei Fehlern
  setShowApiKeyPrompt: (show: boolean) => void; // Callback zum Anzeigen/Ausblenden des API-Key-Prompts
}

const CalorieFactorEditor: React.FC<CalorieFactorEditorProps> = ({ apiKey, isApiKeyValid, clearApiKey, setShowApiKeyPrompt }) => {
  const [factors, setFactors] = useState<CalorieFactors>({ usualBeCalories: 0, insulinTypeCalorieCovering: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null); // Für Erfolgs-/Fehlermeldungen beim Speichern

  // Effekt zum Laden der Kalorienfaktoren beim Komponenten-Mount
  useEffect(() => {
    fetchCalorieFactors();
  }, []);

  const fetchCalorieFactors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8080/api/calorie-factors');
      if (!response.ok) {
        if (response.status === 404) {
          setFactors({ usualBeCalories: 105.0, insulinTypeCalorieCovering: 200.0 });
          setSaveStatus("Standard-Kalorienfaktoren geladen. Bitte speichern, um sie in der Datenbank zu persistieren.");
        } else {
          throw new Error('Fehler beim Laden der Kalorienfaktoren: ' + response.statusText);
        }
      } else {
        const data: CalorieFactors = await response.json();
        setFactors(data);
      }
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist beim Laden der Kalorienfaktoren aufgetreten.');
      console.error('Fetch calorie factors error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFactorChange = (field: keyof CalorieFactors, newValue: string) => {
    const parsedValue = parseFloat(newValue);
    setFactors(prevFactors => ({
      ...prevFactors,
      [field]: isNaN(parsedValue) ? 0 : parsedValue,
    }));
  };

  const handleSave = async () => {
    setSaveStatus(null); // Status zurücksetzen

    // NEU: Prüfe, ob ein API-Key gültig ist, bevor der Speicherversuch unternommen wird
    if (!isApiKeyValid) {
      setSaveStatus("Für das Speichern von Faktoren ist ein gültiger API-Key erforderlich. Bitte gib ihn ein.");
      setShowApiKeyPrompt(true); // Zeige den API-Key-Prompt an
      return;
    }

    if (isNaN(factors.usualBeCalories) || factors.usualBeCalories <= 0 ||
        isNaN(factors.insulinTypeCalorieCovering) || factors.insulinTypeCalorieCovering <= 0) {
      setSaveStatus("Fehler: Beide Kalorienfaktoren müssen positive Zahlen sein.");
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/calorie-factors', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey, // API-Key hier hinzufügen
        },
        body: JSON.stringify(factors),
      });

      // NEU: Überprüfung auf 401 Unauthorized Status
      if (response.status === 401) {
        clearApiKey(); // API-Key im App-State löschen und Prompt anzeigen
        setSaveStatus("Speichern fehlgeschlagen: Ungültiger API-Key. Bitte gib ihn erneut ein.");
        return; // Verarbeitung hier beenden
      }

      if (!response.ok) {
        const errorText = await response.text(); // Backend gibt String zurück
        throw new Error(`Fehler beim Speichern: ${errorText || response.statusText}`);
      }

      setSaveStatus("Kalorienfaktoren erfolgreich gespeichert!");
      // Optional: Faktoren nach erfolgreichem Speichern neu laden, um Konsistenz zu gewährleisten
      // fetchCalorieFactors();
    } catch (err: any) {
      setSaveStatus(err.message || "Fehler beim Speichern der Kalorienfaktoren.");
      console.error('Save calorie factors error:', err);
    }
  };

  if (loading) {
    return <div className="text-center text-white font-mono">Lade Kalorienfaktoren...</div>;
  }

  if (error) {
    return <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center font-mono">{error}</div>;
  }

  return (
    <div className="space-y-6 font-mono">
      <h2 className="text-2xl font-bold text-white text-center mb-6">Kalorien-Faktoren anpassen</h2>

      {saveStatus && (
        <div className={`px-4 py-3 rounded-lg text-center ${saveStatus.includes('Fehler') ? 'bg-red-900 text-red-300 border border-red-700' : 'bg-green-900 text-green-300 border border-green-700'}`}>
          {saveStatus}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-900 p-4 rounded-md border border-green-700/50">
          <label htmlFor="usualBeCalories" className="text-white font-medium sm:w-1/2 mb-2 sm:mb-0 text-sm">
            Übliche Kalorien pro BE (kcal/BE):
          </label>
          <input
            id="usualBeCalories"
            type="number"
            step="0.01"
            value={factors.usualBeCalories}
            onChange={(e) => handleFactorChange('usualBeCalories', e.target.value)}
            className="bg-gray-700 text-white border border-green-600 rounded-md py-2 px-3 text-sm leading-tight focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 w-full sm:w-1/2"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-900 p-4 rounded-md border border-green-700/50">
          <label htmlFor="insulinTypeCalorieCovering" className="text-white font-medium sm:w-1/2 mb-2 sm:mb-0 text-sm">
            Insulin-Typ Kalorienabdeckung (150/200):
          </label>
          <input
            id="insulinTypeCalorieCovering"
            type="number"
            step="0.01"
            value={factors.insulinTypeCalorieCovering}
            onChange={(e) => handleFactorChange('insulinTypeCalorieCovering', e.target.value)}
            className="bg-gray-700 text-white border border-green-600 rounded-md py-2 px-3 text-sm leading-tight focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 w-full sm:w-1/2"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        // Button ist nur aktiv, wenn API-Key gültig ist
        disabled={!isApiKeyValid}
        className="w-full bg-green-600 text-white py-3 rounded-md font-semibold text-lg hover:bg-green-700 transition duration-300 shadow-md mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Kalorien-Faktoren speichern
      </button>
      <p className="text-xs text-white mt-4 text-center">
        Hinweis: Diese Faktoren werden global für alle Berechnungen verwendet.
      </p>
    </div>
  );
};

export default CalorieFactorEditor;
// END: src/CalorieFactorEditor.tsx
