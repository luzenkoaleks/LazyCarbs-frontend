import { getApiUrl } from './api';
import { useState, useEffect } from 'react';
import type { CalculationRequest, CalculationResponse, CalorieFactors } from './types';

// Props für apiKey, isApiKeyValid, clearApiKey und setShowApiKeyPrompt hinzugefügt
interface CalculatorFormProps {
  apiKey: string;
  isApiKeyValid: boolean;
  clearApiKey: () => void; // Callback zum Löschen des API-Keys bei Fehlern
  setShowApiKeyPrompt: (show: boolean) => void; // Callback zum Anzeigen/Ausblenden des API-Key-Prompts
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({ apiKey, isApiKeyValid, clearApiKey, setShowApiKeyPrompt }) => {
  // Zustand für die Eingabefelder
  const [mealCarbs, setMealCarbs] = useState<number | ''>('');
  const [mealCalories, setMealCalories] = useState<number | ''>('');
  const [usualBeCalories, setUsualBeCalories] = useState<number | ''>('');
  const [insulinTypeCalorieCovering, setInsulinTypeCalorieCovering] = useState<number | ''>('');
  const [currentHour, setCurrentHour] = useState<number | ''>('');
  const [currentMinute, setCurrentMinute] = useState<number | ''>('');
  const [movementFactor, setMovementFactor] = useState<number | ''>('');
  // NEU: Standardmäßig auf false gesetzt, um Berechnungen ohne DB zu erlauben
  const [enableDatabaseStorage, setEnableDatabaseStorage] = useState<boolean>(false);

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
        // GET-Anfragen für Faktoren senden KEINEN API-Key mit, da diese Endpunkte ungeschützt sein sollten.
        const response = await fetch(getApiUrl('/api/calorie-factors'));
        if (!response.ok) {
          if (response.status === 404) {
            // Wenn 404, bedeutet das, dass keine Faktoren in der DB sind,
            // was bei der ersten Initialisierung passieren kann.
            // Wir setzen dann die Standardwerte aus dem Frontend.
            setUsualBeCalories(105.0);
            setInsulinTypeCalorieCovering(200.0);
            console.warn("Kalorienfaktoren nicht in DB gefunden, Standardwerte geladen.");
          } else {
            throw new Error('Fehler beim Laden der Kalorienfaktoren: ' + response.statusText);
          }
        } else {
          const data: CalorieFactors = await response.json();
          setLoadedCalorieFactors(data);
          setUsualBeCalories(data.usualBeCalories);
          setInsulinTypeCalorieCovering(data.insulinTypeCalorieCovering);
        }
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

    // NEU: Wenn Datenbank-Speicherung aktiviert ist, aber kein gültiger API-Key vorhanden ist,
    // zeige den API-Key-Prompt an und breche die Speicherung ab.
    if (enableDatabaseStorage && !isApiKeyValid) {
      setError("Für die Speicherung in der Datenbank ist ein gültiger API-Key erforderlich. Bitte gib ihn ein.");
      setShowApiKeyPrompt(true); // Zeige den API-Key-Prompt an
      setLoading(false);
      return;
    }

    // Header für API-Key hinzufügen, WENN Speicherung aktiviert ist UND Key vorhanden
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (enableDatabaseStorage && isApiKeyValid && apiKey) { // Prüfe isApiKeyValid hier erneut
      headers['X-API-Key'] = apiKey;
    }

    try {
      const response = await fetch(getApiUrl('/api/calculate'), {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      // NEU: Überprüfung auf 401 Unauthorized Status
      if (response.status === 401) {
        clearApiKey(); // API-Key im App-State löschen und Prompt anzeigen
        setError("Speicherung fehlgeschlagen: Ungültiger API-Key. Bitte gib ihn erneut ein.");
        setLoading(false);
        return; // Verarbeitung hier beenden
      }

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
    return <div className="text-center text-white font-mono">Lade Standard-Kalorienfaktoren...</div>;
  }

  if (calorieFactorsError) {
    return <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center font-mono">{calorieFactorsError}</div>;
  }

  return (
    // Formular-Hintergrund dunkelgrau
    <form onSubmit={handleSubmit} className="space-y-4 pt-4 bg-gray-900 p-6 rounded-lg border border-green-700/50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Eingabefelder */}
        <InputField label="Kohlenhydrate der Mahlzeit (g)" type="number" value={mealCarbs} onChange={setMealCarbs} />
        <InputField label="Kalorien der Mahlzeit (kcal)" type="number" value={mealCalories} onChange={setMealCalories} />
        
        {/* "Essen um:" Überschrift und Stunden-/Minutenfelder */}
        <div className="md:col-span-2 mt-4 space-y-2">
          <h3 className="block text-white text-lg font-bold">Essen um:</h3>
          <InputField label="Stunde (0-23)" type="number" value={currentHour} onChange={setCurrentHour} min={0} max={23} />
          <InputField label="Minute (0-59)" type="number" value={currentMinute} onChange={setCurrentMinute} min={0} max={59} />
        </div>
        
        <div className="md:col-span-2 h-2"></div> {/* Kompakterer Abstand */}
        <InputField label="Bewegungsfaktor" type="number" value={movementFactor} onChange={setMovementFactor} step="0.01" />
      </div>

      {/* Checkbox für Datenbank-Speicherung */}
      <div className="flex items-center my-4">
        <input
          id="enableDatabaseStorage"
          type="checkbox"
          checked={enableDatabaseStorage}
          onChange={(e) => setEnableDatabaseStorage(e.target.checked)}
          // Checkbox deaktiviert, wenn API-Key nicht validiert
          disabled={!isApiKeyValid} // Jetzt korrekt deaktiviert, wenn isApiKeyValid false ist
          className="form-checkbox h-5 w-5 text-green-500 rounded-sm border-gray-600 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <label htmlFor="enableDatabaseStorage" className="ml-2 text-white text-base font-medium">
          Berechnung in Datenbank speichern
        </label>
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-3 rounded-md font-semibold text-lg hover:bg-green-700 transition duration-300 shadow-md"
        disabled={loading}
      >
        {loading ? 'Berechne...' : 'Bolus berechnen'}
      </button>

      {/* Fehlermeldung anzeigen */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative font-mono" role="alert">
          <strong className="font-bold">Fehler:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Ergebnisse anzeigen */}
      {result && (
        <div className="bg-gray-900 p-6 rounded-lg shadow-inner mt-8 space-y-3 border border-green-700">
          <h2 className="text-2xl font-bold text-white border-b border-green-700 pb-2 mb-4">Berechnungsergebnisse</h2>
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
    <label className="block text-white text-sm font-bold mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      // Konsolen-Look für Input-Felder
      className="bg-gray-700 text-white border border-green-600 rounded-md w-full py-2 px-3 leading-tight focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 font-mono"
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
  <p className="text-white text-sm">
    <span className="font-semibold text-white">{label}:</span> {value}
  </p>
);

export default CalculatorForm;