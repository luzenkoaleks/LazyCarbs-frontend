// START: src/App.tsx
import { useState } from 'react';
import './index.css'; // Importiere Tailwind CSS
import CalculatorForm from './CalculatorForm';
import BolusFactorEditor from './BolusFactorEditor';
import CalorieFactorEditor from './CalorieFactorEditor';

function App() {
  // Zustand, um zu steuern, welche Ansicht angezeigt wird
  const [currentView, setCurrentView] = useState<'calculator' | 'bolusEditor' | 'calorieEditor'>('calculator');

  return (
    // Gesamter Hintergrund jetzt noch dunkler (fast schwarz)
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono">
      {/* Hauptcontainer: Dunklerer Kasten mit grünem Rand für Konsolen-Look */}
      <div className="bg-gray-950 p-8 rounded-lg shadow-lg border border-green-500/50 w-full max-w-2xl">
        {/* Bild anstelle der Überschrift */}
        {/* Ersetze 'https://placehold.co/600x100/000000/FFFFFF?text=LazyCarbs+Logo' durch die URL deines Bildes */}
        <img
  src="/images/LazyCarbs_Logo.png" // Beachte den führenden Schrägstrich für den 'public'-Ordner
  alt="LazyCarbs Logo"
  className="mx-auto mb-8 rounded-md"
/>

        {/* Navigation zwischen den Ansichten */}
        <div className="flex justify-center space-x-4 mb-8 flex-wrap">
          <button
            onClick={() => setCurrentView('calculator')}
            className={`px-4 py-2 rounded-md font-semibold transition duration-300 mb-2 ${
              currentView === 'calculator' ? 'bg-green-700 text-white shadow-md' : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            Bolus berechnen
          </button>
          <button
            onClick={() => setCurrentView('bolusEditor')}
            className={`px-4 py-2 rounded-md font-semibold transition duration-300 mb-2 ${
              currentView === 'bolusEditor' ? 'bg-green-700 text-white shadow-md' : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            Ruhebolus-Faktoren anpassen
          </button>
          <button
            onClick={() => setCurrentView('calorieEditor')}
            className={`px-4 py-2 rounded-md font-semibold transition duration-300 mb-2 ${
              currentView === 'calorieEditor' ? 'bg-green-700 text-white shadow-md' : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            Kalorien-Faktoren anpassen
          </button>
        </div>

        {/* Bedingtes Rendern der Komponenten */}
        {currentView === 'calculator' && <CalculatorForm />}
        {currentView === 'bolusEditor' && <BolusFactorEditor />}
        {currentView === 'calorieEditor' && <CalorieFactorEditor />}
      </div>
    </div>
  );
}

export default App;
// END: src/App.tsx
