import { useState } from 'react';
import './index.css'; // Importiere Tailwind CSS
import CalculatorForm from './CalculatorForm';
import BolusFactorEditor from './BolusFactorEditor';
import CalorieFactorEditor from './CalorieFactorEditor';

function App() {
  // Zustand, um zu steuern, welche Ansicht angezeigt wird
  const [currentView, setCurrentView] = useState<'calculator' | 'bolusEditor' | 'calorieEditor'>('calculator');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-300 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">LazyCarbs Bolus Rechner</h1>

        {/* Navigation zwischen den Ansichten */}
        <div className="flex justify-center space-x-4 mb-8 flex-wrap">
          <button
            onClick={() => setCurrentView('calculator')}
            className={`px-4 py-2 rounded-lg font-semibold transition duration-300 mb-2 ${
              currentView === 'calculator' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Bolus berechnen
          </button>
          <button
            onClick={() => setCurrentView('bolusEditor')}
            className={`px-4 py-2 rounded-lg font-semibold transition duration-300 mb-2 ${
              currentView === 'bolusEditor' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Ruhebolus-Faktoren anpassen
          </button>
          <button
            onClick={() => setCurrentView('calorieEditor')}
            className={`px-4 py-2 rounded-lg font-semibold transition duration-300 mb-2 ${
              currentView === 'calorieEditor' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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