import React from 'react';
import './index.css'; // Importiere Tailwind CSS
import CalculatorForm from './CalculatorForm';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">LazyCarbs Bolus Rechner</h1>
        <CalculatorForm />
      </div>
    </div>
  );
}

export default App;