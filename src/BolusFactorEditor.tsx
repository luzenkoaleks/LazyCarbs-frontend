// START: src/BolusFactorEditor.tsx
import React, { useState, useEffect } from 'react';
import type { HourlyBolusFactor } from './types';

const BolusFactorEditor: React.FC = () => {
  // `factors` speichert die ursprünglich geladenen Werte
  const [factors, setFactors] = useState<HourlyBolusFactor[]>([]);
  // `editedFactors` speichert nur die vom Benutzer geänderten Werte in einer Map (Stunde -> neuer Wert)
  const [editedFactors, setEditedFactors] = useState<Map<number, number>>(new Map());

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Effekt zum Laden der Bolusfaktoren beim Komponenten-Mount
  useEffect(() => {
    fetchFactors();
  }, []);

  const fetchFactors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8080/api/bolus-factors');
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Bolusfaktoren.');
      }
      const data: HourlyBolusFactor[] = await response.json();
      data.sort((a, b) => a.hour - b.hour); // Stelle sicher, dass sie nach Stunde sortiert sind
      setFactors(data);
      // editedFactors wird hier nicht initialisiert, da es nur für *geänderte* Werte ist.
      // Wenn ein Feld leer ist, bedeutet das, dass es nicht bearbeitet wurde und der aktuelle Wert gilt.
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist beim Laden der Faktoren aufgetreten.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFactorChange = (hour: number, newValue: string) => {
    const parsedValue = parseFloat(newValue);
    setEditedFactors(prev => {
      const newMap = new Map(prev);
      if (newValue === '') { // Wenn das Feld geleert wird, entferne es aus der Map der bearbeiteten Werte
        newMap.delete(hour);
      } else {
        newMap.set(hour, isNaN(parsedValue) ? 0 : parsedValue);
      }
      return newMap;
    });
  };

  const handleSaveFactor = async (hour: number) => {
    setSaveStatus(null);
    const originalFactor = factors.find(f => f.hour === hour);
    if (!originalFactor) {
      setSaveStatus(`Fehler: Originalfaktor für Stunde ${hour} nicht gefunden.`);
      return;
    }

    // Hole den Wert, der gespeichert werden soll (aus editedFactors, falls vorhanden, sonst den Originalwert)
    const valueToSave = editedFactors.has(hour) ? editedFactors.get(hour)! : originalFactor.bolusFactor;

    if (isNaN(valueToSave) || valueToSave <= 0) {
      setSaveStatus(`Fehler: Ungültiger Bolusfaktor für Stunde ${hour}. Muss eine positive Zahl sein.`);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/bolus-factors/${hour}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hour: hour, bolusFactor: valueToSave }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fehler beim Speichern: ${errorText || response.statusText}`);
      }

      setSaveStatus(`Bolusfaktor für Stunde ${hour} erfolgreich gespeichert!`);
      // Nach erfolgreichem Speichern den Wert im Original-State aktualisieren
      setFactors(prevFactors =>
        prevFactors.map(f => (f.hour === hour ? { ...f, bolusFactor: valueToSave } : f))
      );
      // Den Wert aus editedFactors entfernen, da er jetzt "gespeichert" ist
      setEditedFactors(prev => {
        const newMap = new Map(prev);
        newMap.delete(hour);
        return newMap;
      });
    } catch (err: any) {
      setSaveStatus(err.message || `Fehler beim Speichern des Faktors für Stunde ${hour}.`);
      console.error('Save error:', err);
    }
  };

  if (loading) {
    return <div className="text-center text-white font-mono">Lade Bolusfaktoren...</div>;
  }

  if (error) {
    return <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center font-mono">{error}</div>;
  }

  return (
    <div className="space-y-6 font-mono">
      <h2 className="text-2xl font-bold text-white text-center mb-6">Ruhebolus-Faktoren anpassen</h2>

      {saveStatus && (
        <div className={`px-4 py-3 rounded-lg text-center ${saveStatus.includes('Fehler') ? 'bg-red-900 text-red-300 border border-red-700' : 'bg-green-900 text-green-300 border border-green-700'}`}>
          {saveStatus}
        </div>
      )}

      {/* Header für die Spalten */}
      <div className="grid grid-cols-4 gap-2 text-white font-bold border-b border-green-700 pb-2 mb-2">
        <div className="text-left">Stunde</div>
        <div className="text-center">Aktueller Wert</div>
        <div className="text-center">Neuer Wert</div>
        <div className="text-center">Aktion</div>
      </div>

      {/* Liste der Faktoren - keine separate Scrollbox, direkt im Hauptfenster */}
      <div className="flex flex-col space-y-2">
        {factors.map(factor => (
          <div key={factor.hour} className="grid grid-cols-4 gap-2 items-center bg-gray-900 p-2 rounded-md border border-green-700/50">
            <div className="text-white text-sm">Stunde {factor.hour}:</div>
            <div className="text-white text-sm text-center">{factor.bolusFactor.toFixed(2)}</div> {/* Aktueller Wert */}
            <input
              type="number"
              step="0.01"
              // Zeigt den bearbeiteten Wert an, falls vorhanden, sonst leer
              value={editedFactors.has(factor.hour) ? editedFactors.get(factor.hour)! : ''}
              onChange={(e) => handleFactorChange(factor.hour, e.target.value)}
              placeholder={factor.bolusFactor.toFixed(2)} // Zeigt den aktuellen Wert als Platzhalter
              className="bg-gray-700 text-white border border-green-600 rounded-md py-1 px-2 text-sm leading-tight focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 w-full"
            />
            <button
              onClick={() => handleSaveFactor(factor.hour)}
              // Button ist nur aktiv, wenn ein Wert im Inputfeld steht und dieser eine gültige Zahl ist
              disabled={!editedFactors.has(factor.hour) || isNaN(editedFactors.get(factor.hour)!)}
              className="ml-auto px-3 py-1 bg-green-600 text-white rounded-md font-semibold text-sm hover:bg-green-700 transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Speichern
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-white mt-3 text-center">
        Hinweis: Änderungen werden erst nach dem Speichern aktiv.
      </p>
    </div>
  );
};

export default BolusFactorEditor;
// END: src/BolusFactorEditor.tsx
