import { useState, useEffect } from 'react';
import type { CalculationRequest, CalculationResponse, CalorieFactors } from './types';

const CalculatorForm: React.FC = () => {
  // Zustand für die Eingabefelder
  const [mealCarbs, setMealCarbs] = useState<number | ''>('');
  const [mealCalories, setMealCalories] = useState<number | ''>('');
  const [usualBeCalories, setUsualBeCalories] = useState<number | ''>('');
  const [insulinTypeCalorieCovering, setInsulinTypeCalorieCovering] = useState<number | ''>('');
  const [currentHour, setCurrentHour] = useState<number | ''>('');
  const [currentMinute, setCurrentMinute] = useState<number | ''>('');
  const [movementFactor, setMovementFactor] = useState<number | ''>('');
  const [enableDatabaseStorage, setEnableDatabaseStorage] = useState<boolean>(true);

  // Zustand für die Berechnungsergebnisse
  const [result, setResult] = useState<CalculationResponse | null>(null);
  // Zustand für Ladezustand und Fehlermeldungen
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Zustand für geladene Kalorienfaktoren
  const [loadedCalorieFactors, setLoadedCalorieFactors] = useState<CalorieFactors | null>(null);
  const [loadingCalorieFactors, setLoadingCalorieFactors] = useState<boolean>(true);
  const [calorieFactorsError, setCalorieFactorsError] = useState<string | null>(null);

  // Effekt zum Laden der Kalorienfaktoren beim Komponenten-Mount
  useEffect(() => {
    const fetchCalorieFactors = async () => {
      setLoadingCalorieFactors(true);
      setCalorieFactorsError(null);
      try {
        const response = await fetch('http://localhost:8080/api/calorie-factors');
        if (!response.ok) {
          throw new Error('Fehler beim Laden der Kalorienfaktoren.');
        }
        const data: CalorieFactors = await response.json();
        setLoadedCalorieFactors(data);
        setUsualBeCalories(data.usualBeCalories);
        setInsulinTypeCalorieCovering(data.insulinTypeCalorieCovering);
      } catch (err: any) {
        setCalorieFactorsError(err.message || 'Ein Fehler ist beim Laden der Kalorienfaktoren aufgetreten.');
        console.error('Fetch calorie factors error:', err);
      } finally {
        setLoadingCalorieFactors(false);
      }
    };

    fetchCalorieFactors();
  }, []);

  // Funktion zum Senden der Daten an das Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const requestBody: CalculationRequest = {
      mealCarbs: Number(mealCarbs),
      mealCalories: Number(mealCalories),
      usualBeCalories: Number(usualBeCalories),
      insulinTypeCalorieCovering: Number(insulinTypeCalorieCovering),
      currentHour: Number(currentHour),
      currentMinute: Number(currentMinute),
      movementFactor: Number(movementFactor),
      enableDatabaseStorage: enableDatabaseStorage,
    };

    const fieldsToValidate = ['mealCarbs', 'mealCalories', 'currentHour', 'currentMinute', 'movementFactor'];
    for (const key of fieldsToValidate) {
      const value = requestBody[key as keyof CalculationRequest];
      if (typeof value === 'number' && isNaN(value)) {
        setError(`Bitte füllen Sie alle Felder korrekt aus. Fehler bei: ${key}`);
        setLoading(false);
        return;
      }
    }
    if (isNaN(requestBody.usualBeCalories) || requestBody.usualBeCalories <= 0 ||
        isNaN(requestBody.insulinTypeCalorieCovering) || requestBody.insulinTypeCalorieCovering <= 0) {
      setError('Fehler: Die Kalorienfaktoren (kcal/BE und Insulin-Typ) müssen gültige positive Zahlen sein. Bitte prüfen Sie die Einstellungen.');
      setLoading(false);
      return;
    }

    try {
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

  if (loadingCalorieFactors) {
    return <div className="text-center text-gray-600">Lade Standard-Kalorienfaktoren...</div>;
  }

  if (calorieFactorsError) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">{calorieFactorsError}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-8 bg-red-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField label="Kohlenhydrate der Mahlzeit (g)" type="number" value={mealCarbs} onChange={setMealCarbs} />
        <InputField label="Kalorien der Mahlzeit (kcal)" type="number" value={mealCalories} onChange={setMealCalories} />
        
        <div className="md:col-span-2 mt-6 space-y-2">
          <h3 className="block text-gray-700 text-lg font-bold">Essen um:</h3>
          <InputField label="Stunde (0-23)" type="number" value={currentHour} onChange={setCurrentHour} min={0} max={23} />
          <InputField label="Minute (0-59)" type="number" value={currentMinute} onChange={setCurrentMinute} min={0} max={59} />
        </div>
        
        <div className="md:col-span-2 h-6"></div>
        <InputField label="Bewegungsfaktor" type="number" value={movementFactor} onChange={setMovementFactor} step="0.01" />
      </div>

      <div className="flex items-center my-6">
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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">Fehler:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {result && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner mt-8 space-y-4">
          <h2 className="text-2xl font-bold text-gray-700 border-b pb-2 mb-4">Berechnungsergebnisse</h2>
          <ResultItem label="Status" value={result.statusMessage} />
          <ResultItem label="Datenbank Status" value={result.dbStatus} />
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