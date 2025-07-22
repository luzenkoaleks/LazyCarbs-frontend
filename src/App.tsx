import React, { useState } from 'react';
import './index.css'; // Importiere Tailwind CSS
import CalculatorForm from './CalculatorForm';
import BolusFactorEditor from './BolusFactorEditor'; // NEU: Import für den BolusFactorEditor

function App() {
  // Zustand, um zu steuern, welche Ansicht angezeigt wird
  const [currentView, setCurrentView] = useState<'calculator' | 'editor'>('calculator');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">LazyCarbs Bolus Rechner</h1>

        {/* Navigation zwischen den Ansichten */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setCurrentView('calculator')}
            className={`px-6 py-2 rounded-lg font-semibold transition duration-300 ${
              currentView === 'calculator' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Bolus berechnen
          </button>
          <button
            onClick={() => setCurrentView('editor')}
            className={`px-6 py-2 rounded-lg font-semibold transition duration-300 ${
              currentView === 'editor' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Ruhebolus-Faktoren anpassen
          </button>
        </div>

        {/* Bedingtes Rendern der Komponenten */}
        {currentView === 'calculator' && <CalculatorForm />}
        {currentView === 'editor' && <BolusFactorEditor />}
      </div>
    </div>
  );
}

export default App;