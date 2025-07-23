// START: src/App.tsx
import { useState, useEffect, useCallback } from 'react';
import './index.css'; // Importiere Tailwind CSS
import CalculatorForm from './CalculatorForm';
import BolusFactorEditor from './BolusFactorEditor';
import CalorieFactorEditor from './CalorieFactorEditor';

function App() {
  // Zustand, um zu steuern, welche Ansicht angezeigt wird
  const [currentView, setCurrentView] = useState<'calculator' | 'bolusEditor' | 'calorieEditor'>('calculator');
  // Zustand für den API-Key
  const [apiKey, setApiKey] = useState<string>('');
  // Zustand, ob der API-Key client-seitig als "valid" markiert ist (d.h. eingegeben)
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean>(false);
  // Zustand für Fehlermeldungen bei der API-Key-Eingabe
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  // Zustand, um die API-Key-Eingabe anzuzeigen/auszublenden
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState<boolean>(false);

  // Debug-Logs am Anfang des Render-Zyklus
  console.log("App Render - currentView:", currentView, "apiKey:", apiKey ? "[SET]" : "[EMPTY]", "isApiKeyValid:", isApiKeyValid, "showApiKeyPrompt:", showApiKeyPrompt);


  // Callback-Funktion zum Zurücksetzen des API-Keys und des Validierungsstatus
  // Wird an untergeordnete Komponenten weitergegeben, um bei 401-Fehlern den Key zu löschen
  const clearApiKey = useCallback(() => {
    console.log("clearApiKey called: Resetting API key state.");
    setApiKey('');
    setIsApiKeyValid(false);
    localStorage.removeItem('lazycarbs_api_key'); // Entfernt den Key aus dem lokalen Speicher
    setApiKeyError("Dein API-Key ist ungültig oder abgelaufen. Bitte gib ihn erneut ein.");
    setShowApiKeyPrompt(true); // Prompt wieder anzeigen, da der Key ungültig ist
  }, []);

  // Lade API-Key aus dem lokalen Speicher beim Start
  useEffect(() => {
    const storedApiKey = localStorage.getItem('lazycarbs_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      // Beim Start gehen wir davon aus, dass der gespeicherte Key gültig ist.
      // Die Backend-Validierung wird dies bei der ersten geschützten Aktion bestätigen oder widerlegen.
      setIsApiKeyValid(true);
      console.log("API Key found in localStorage, setting apiKey state and isApiKeyValid=true.");
    } else {
      console.log("No API Key found in localStorage. isApiKeyValid is false.");
      // NEU: showApiKeyPrompt wird hier NICHT automatisch auf true gesetzt.
      // Der Benutzer soll es explizit über den Button öffnen können oder es erscheint bei Bedarf.
    }
  }, []); // Leeres Array bedeutet, dass der Effekt nur einmal beim Mounten ausgeführt wird


  // Funktion zum Speichern des API-Keys im lokalen Speicher
  const handleApiKeySubmit = () => {
    if (apiKey.trim() === '') {
      setApiKeyError("API-Key darf nicht leer sein.");
      setIsApiKeyValid(false);
      console.log("API Key submit: empty key, isApiKeyValid=false");
      return;
    }
    localStorage.setItem('lazycarbs_api_key', apiKey.trim());
    setIsApiKeyValid(true); // Jetzt ist er client-seitig als gültig markiert
    setApiKeyError(null);
    setShowApiKeyPrompt(false); // Prompt ausblenden nach erfolgreicher Eingabe
    console.log("API Key submitted and saved, isApiKeyValid=true, showApiKeyPrompt=false");
  };

  // Handler für die Navigationsbuttons
  const handleNavigationClick = (view: 'calculator' | 'bolusEditor' | 'calorieEditor') => {
    console.log(`Navigation click: ${view}, isApiKeyValid: ${isApiKeyValid}`);
    setCurrentView(view); // Immer zur gewünschten Ansicht wechseln
    setShowApiKeyPrompt(false); // Prompt ausblenden, wenn die Ansicht gewechselt wird
  };

  return (
    // Gesamter Hintergrund dunkelgrau bis schwarz, zentriert den Inhalt
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono">
      {/* Hauptcontainer: Dunkler, leicht abgerundeter Kasten mit grünem Rand für Konsolen-Look */}
      <div className="bg-gray-950 p-8 rounded-lg shadow-lg border border-green-500/50 w-full max-w-2xl">
        {/* Bild anstelle der Überschrift */}
        <img
          src="/images/lazycarbs_logo.png"
          alt="LazyCarbs Logo"
          className="mx-auto mb-8 rounded-md w-64 h-auto"
        />

        {/* NEU: Button zum Ein-/Ausblenden der API-Key-Eingabe */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowApiKeyPrompt(prev => !prev)}
            className="px-4 py-2 bg-gray-700 text-white rounded-md font-semibold hover:bg-gray-600 transition duration-300 shadow-md"
          >
            {showApiKeyPrompt ? 'API-Key-Eingabe schließen' : 'API-Key eingeben/ändern'}
          </button>
        </div>

        {/* API-Key-Eingabe als optionaler Bereich */}
        {showApiKeyPrompt && (
          <div className="mb-8 p-4 bg-gray-900 rounded-md border border-gray-800 relative">
            <h2 className="text-xl font-bold text-white mb-4">API-Key für erweiterte Funktionen</h2>
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <input
                type="password" // Verwende 'password' für sensible Eingaben
                placeholder="Deinen API-Key eingeben"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleApiKeySubmit();
                  }
                }}
                className="flex-grow bg-gray-800 text-white border border-green-600 rounded-md py-2 px-3 leading-tight focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 font-mono"
              />
              <button
                onClick={handleApiKeySubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition duration-300 shadow-md"
              >
                API-Key speichern
              </button>
            </div>
            {apiKeyError && (
              <p className="text-red-400 text-sm mt-2 text-center">{apiKeyError}</p>
            )}
            <p className="text-gray-400 text-xs mt-2 text-center">
              Der API-Key ist für die Anpassung von Faktoren und das Speichern von Berechnungen in der Datenbank erforderlich.
            </p>
            {/* Optionaler Schließen-Button (kann entfernt werden, da es jetzt einen Toggle-Button gibt) */}
            {/* <button
              onClick={() => setShowApiKeyPrompt(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-lg"
              title="Schließen"
            >
              &times;
            </button> */}
          </div>
        )}

        {/* Navigation zwischen den Ansichten */}
        <div className="flex justify-center space-x-4 mb-8 flex-wrap">
          <button
            onClick={() => handleNavigationClick('calculator')}
            className={`px-4 py-2 rounded-md font-semibold transition duration-300 mb-2 ${
              currentView === 'calculator' ? 'bg-green-700 text-white shadow-md' : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            Bolus berechnen
          </button>
          <button
            onClick={() => handleNavigationClick('bolusEditor')}
            // Buttons sind immer klickbar, um die Ansicht zu zeigen
            className={`px-4 py-2 rounded-md font-semibold transition duration-300 mb-2 ${
              currentView === 'bolusEditor' ? 'bg-green-700 text-white shadow-md' : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            Ruhebolus-Faktoren anpassen
          </button>
          <button
            onClick={() => handleNavigationClick('calorieEditor')}
            // Buttons sind immer klickbar, um die Ansicht zu zeigen
            className={`px-4 py-2 rounded-md font-semibold transition duration-300 mb-2 ${
              currentView === 'calorieEditor' ? 'bg-green-700 text-white shadow-md' : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            Kalorien-Faktoren anpassen
          </button>
        </div>

        {/* Bedingtes Rendern der Komponenten, API-Key und Validierungsstatus als Props übergeben */}
        {currentView === 'calculator' && <CalculatorForm apiKey={apiKey} isApiKeyValid={isApiKeyValid} clearApiKey={clearApiKey} setShowApiKeyPrompt={setShowApiKeyPrompt} />}
        {currentView === 'bolusEditor' && <BolusFactorEditor apiKey={apiKey} isApiKeyValid={isApiKeyValid} clearApiKey={clearApiKey} setShowApiKeyPrompt={setShowApiKeyPrompt} />}
        {currentView === 'calorieEditor' && <CalorieFactorEditor apiKey={apiKey} isApiKeyValid={isApiKeyValid} clearApiKey={clearApiKey} setShowApiKeyPrompt={setShowApiKeyPrompt} />}
        
        {/* Die allgemeine Meldung für fehlenden Key wird jetzt von den einzelnen Komponenten selbst ausgelöst, wenn Speichern versucht wird */}
      </div>
    </div>
  );
}

export default App;
// END: src/App.tsx
