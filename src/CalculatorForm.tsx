import React, { useState } from 'react';
import type { CalculationRequest, CalculationResponse } from './types';

const CalculatorForm: React.FC = () => {
  // Zustand für die Eingabefelder
  const [mealCarbs, setMealCarbs] = useState<number | ''>('');
  const [mealCalories, setMealCalories] = useState<number | ''>('');
  const [usualBeCalories, setUsualBeCalories] = useState<number | ''>('');
  const [insulinTypeCalorieCovering, setInsulinTypeCalorieCovering] = useState<number | ''>('');
  const [currentHour, setCurrentHour] = useState<number | ''>('');
  const [currentMinute, setCurrentMinute] = useState<number | ''>('');
  const [movementFactor, setMovementFactor] = useState<number | ''>('');
  // NEU: Zustand für das Kontrollkästchen zur Datenbank-Speicherung
  const [enableDatabaseStorage, setEnableDatabaseStorage] = useState<boolean>(true);

  // Zustand für die Berechnungsergebnisse
  const [result, setResult] = useState<CalculationResponse | null>(null);
  // Zustand für Ladezustand und Fehlermeldungen
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Funktion zum Senden der Daten an das Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Verhindert das Neuladen der Seite beim Absenden des Formulars
    setLoading(true);
    setError(null);
    setResult(null);

    // Eingabewerte validieren und in Zahlen umwandeln
    const requestBody: CalculationRequest = {
      mealCarbs: Number(mealCarbs),
      mealCalories: Number(mealCalories),
      usualBeCalories: Number(usualBeCalories),
      insulinTypeCalorieCovering: Number(insulinTypeCalorieCovering),
      currentHour: Number(currentHour),
      currentMinute: Number(currentMinute),
      movementFactor: Number(movementFactor),
      enableDatabaseStorage: enableDatabaseStorage, // NEU: Wert des Kontrollkästchens hinzufügen
    };

    // Einfache Validierung, ob alle Felder ausgefüllt sind und gültige Zahlen sind
    for (const key in requestBody) {
      // Überspringe die Prüfung für 'enableDatabaseStorage', da es ein Boolean ist
      if (key === 'enableDatabaseStorage') continue;

      // Für alle anderen (numerischen) Felder prüfen, ob es sich um eine gültige Zahl handelt
      const value = requestBody[key as keyof CalculationRequest];
      if (typeof value === 'number' && isNaN(value)) { // Korrigierte Validierung
        setError(`Bitte füllen Sie alle Felder korrekt aus. Fehler bei: ${key}`);
        setLoading(false);
        return;
      }
    }

    try {
      // Sende die POST-Anfrage an dein Spring Boot Backend
      // WICHTIG: Stelle sicher, dass dein Spring Boot Backend auf Port 8080 läuft!
      const response = await fetch('http://localhost:8080/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.statusMessage || 'Fehler bei der Berechnung');
      }

      const data: CalculationResponse = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Eingabefelder */}
        <InputField label="Kohlenhydrate der Mahlzeit (g)" type="number" value={mealCarbs} onChange={setMealCarbs} />
        <InputField label="Kalorien der Mahlzeit (kcal)" type="number" value={mealCalories} onChange={setMealCalories} />
        <InputField label="Übliche Kalorien pro BE (kcal/BE)" type="number" value={usualBeCalories} onChange={setUsualBeCalories} />
        <InputField label="Insulin-Typ Kalorienabdeckung (150/200)" type="number" value={insulinTypeCalorieCovering} onChange={setInsulinTypeCalorieCovering} />
        <InputField label="Aktuelle Stunde (0-23)" type="number" value={currentHour} onChange={setCurrentHour} min={0} max={23} />
        <InputField label="Aktuelle Minute (0-59)" type="number" value={currentMinute} onChange={setCurrentMinute} min={0} max={59} />
        <InputField label="Bewegungsfaktor" type="number" value={movementFactor} onChange={setMovementFactor} step="0.01" />
      </div>

      {/* NEU: Checkbox für Datenbank-Speicherung */}
      <div className="flex items-center mt-4">
        <input
          id="enableDatabaseStorage"
          type="checkbox"
          checked={enableDatabaseStorage}
          onChange={(e) => setEnableDatabaseStorage(e.target.checked)}
          className="form-checkbox h-5 w-5 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500"
        />
        <label htmlFor="enableDatabaseStorage" className="ml-2 text-gray-700 text-base font-medium">
          Berechnung in Datenbank speichern
        </label>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition duration-300 shadow-md"
        disabled={loading}
      >
        {loading ? 'Berechne...' : 'Bolus berechnen'}
      </button>

      {/* Fehlermeldung anzeigen */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">Fehler:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Ergebnisse anzeigen */}
      {result && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner mt-8 space-y-4">
          <h2 className="text-2xl font-bold text-gray-700 border-b pb-2 mb-4">Berechnungsergebnisse</h2>
          <ResultItem label="Status" value={result.statusMessage} />
          <ResultItem label="Datenbank Status" value={result.dbStatus} /> {/* Zeigt den DB-Status an */}
          <ResultItem label="Ausgewählte Methode" value={result.selectedMethodName} />
          <ResultItem label="Begründung der Methode" value={result.methodExplanation} />
          <ResultItem label="Berechneter Bolusfaktor (Uhrzeit)" value={result.usualBolusFactor.toFixed(4)} />
          <ResultItem label="Magerer BE-Faktor" value={result.intermediateLeanBeFactor.toFixed(4)} />
          <ResultItem label="Reiner Kohlenhydrat-BE-Faktor" value={result.intermediatePureCarbBeFactor.toFixed(4)} />
          <ResultItem label="Zwischenwert: Summe der BEs" value={result.intermediateBeSum.toFixed(4)} />
          <ResultItem label="Zwischenwert: Kalorien pro BE" value={result.intermediateBeCalories.toFixed(4)} />
          <ResultItem label="Zwischenwert: Fett/Protein Kalorien" value={result.intermediateFatProteinCalories.toFixed(4)} />
          <ResultItem label="Methode: Korrekter BE-Faktor" value={result.methodCorrectBeFactor.toFixed(4)} />
          <ResultItem label="Methode: Kalorischer Überschuss" value={result.methodCalorieSurplus.toFixed(4)} />
          <ResultItem label="Methode: Verzögerter Kalorien-Bolus" value={result.methodDelayedCalorieBolus.toFixed(4)} />
          <ResultItem label="Methode: Korrekte Bolus-Summe" value={result.methodCorrectBolusSum.toFixed(4)} />
          <ResultItem label="Methode: Fett/Protein Kalorien" value={result.methodFatProteinCalories.toFixed(4)} />
          <ResultItem label="Finaler korrigierter Bolus" value={result.finalCorrectBolus.toFixed(4)} />
        </div>
      )}
    </form>
  );
};

// Hilfskomponente für Eingabefelder
interface InputFieldProps {
  label: string;
  type: string;
  value: number | '';
  onChange: (value: number | '') => void;
  min?: number;
  max?: number;
  step?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, type, value, onChange, min, max, step }) => (
  <div>
    <label className="block text-gray-700 text-sm font-bold mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      min={min}
      max={max}
      step={step}
      required
    />
  </div>
);

// Hilfskomponente für Ergebniszeilen
interface ResultItemProps {
  label: string;
  value: string;
}

const ResultItem: React.FC<ResultItemProps> = ({ label, value }) => (
  <p className="text-gray-800">
    <span className="font-semibold">{label}:</span> {value}
  </p>
);

export default CalculatorForm;