import React, { useState, useEffect } from 'react';
import type { CalorieFactors } from './types';

const CalorieFactorEditor: React.FC = () => {
  const [factors, setFactors] = useState<CalorieFactors>({ usualBeCalories: 0, insulinTypeCalorieCovering: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

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
    setSaveStatus(null);

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
        },
        body: JSON.stringify(factors),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fehler beim Speichern: ${errorText || response.statusText}`);
      }

      setSaveStatus("Kalorienfaktoren erfolgreich gespeichert!");
    } catch (err: any) {
      setSaveStatus(err.message || "Fehler beim Speichern der Kalorienfaktoren.");
      console.error('Save calorie factors error:', err);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600">Lade Kalorienfaktoren...</div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-700 text-center mb-6">Kalorien-Faktoren anpassen</h2>

      {saveStatus && (
        <div className={`px-4 py-3 rounded-lg text-center ${saveStatus.includes('Fehler') ? 'bg-red-100 text-red-700 border border-red-400' : 'bg-green-100 text-green-700 border border-green-400'}`}>
          {saveStatus}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm">
          <label htmlFor="usualBeCalories" className="text-gray-700 font-medium sm:w-1/2 mb-2 sm:mb-0">
            Übliche Kalorien pro BE (kcal/BE):
          </label>
          <input
            id="usualBeCalories"
            type="number"
            step="0.01"
            value={factors.usualBeCalories}
            onChange={(e) => handleFactorChange('usualBeCalories', e.target.value)}
            className="shadow-sm appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-1/2"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm">
          <label htmlFor="insulinTypeCalorieCovering" className="text-gray-700 font-medium sm:w-1/2 mb-2 sm:mb-0">
            Insulin-Typ Kalorienabdeckung (150/200):
          </label>
          <input
            id="insulinTypeCalorieCovering"
            type="number"
            step="0.01"
            value={factors.insulinTypeCalorieCovering}
            onChange={(e) => handleFactorChange('insulinTypeCalorieCovering', e.target.value)}
            className="shadow-sm appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-1/2"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition duration-300 shadow-md mt-6"
      >
        Kalorien-Faktoren speichern
      </button>
      <p className="text-sm text-gray-500 mt-4 text-center">
        Hinweis: Diese Faktoren werden global für alle Berechnungen verwendet.
      </p>
    </div>
  );
};

export default CalorieFactorEditor;