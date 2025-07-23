import React, { useState, useEffect } from 'react';
import type { HourlyBolusFactor } from './types';

const BolusFactorEditor: React.FC = () => {
  const [factors, setFactors] = useState<HourlyBolusFactor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

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
      data.sort((a, b) => a.hour - b.hour);
      setFactors(data);
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist beim Laden der Faktoren aufgetreten.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFactorChange = (hour: number, newValue: string) => {
    const parsedValue = parseFloat(newValue);
    setFactors(prevFactors =>
      prevFactors.map(factor =>
        factor.hour === hour ? { ...factor, bolusFactor: isNaN(parsedValue) ? 0 : parsedValue } : factor
      )
    );
  };

  const handleSaveFactor = async (hour: number) => {
    setSaveStatus(null);
    const factorToSave = factors.find(f => f.hour === hour);
    if (!factorToSave) {
      setSaveStatus(`Fehler: Faktor für Stunde ${hour} nicht gefunden.`);
      return;
    }

    if (isNaN(factorToSave.bolusFactor) || factorToSave.bolusFactor <= 0) {
      setSaveStatus(`Fehler: Ungültiger Bolusfaktor für Stunde ${hour}. Muss eine positive Zahl sein.`);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/bolus-factors/${hour}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(factorToSave),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fehler beim Speichern: ${errorText || response.statusText}`);
      }

      setSaveStatus(`Bolusfaktor für Stunde ${hour} erfolgreich gespeichert!`);
    } catch (err: any) {
      setSaveStatus(err.message || `Fehler beim Speichern des Faktors für Stunde ${hour}.`);
      console.error('Save error:', err);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600">Lade Bolusfaktoren...</div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-700 text-center mb-6">Ruhebolus-Faktoren anpassen</h2>

      {saveStatus && (
        <div className={`px-4 py-3 rounded-lg text-center ${saveStatus.includes('Fehler') ? 'bg-red-100 text-red-700 border border-red-400' : 'bg-green-100 text-green-700 border border-green-400'}`}>
          {saveStatus}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
        {factors.map(factor => (
          <div key={factor.hour} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm">
            <label htmlFor={`hour-${factor.hour}`} className="text-gray-700 font-medium w-1/3">
              Stunde {factor.hour}:
            </label>
            <input
              id={`hour-${factor.hour}`}
              type="number"
              step="0.01"
              value={factor.bolusFactor}
              onChange={(e) => handleFactorChange(factor.hour, e.target.value)}
              className="shadow-sm appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-1/3"
            />
            <button
              onClick={() => handleSaveFactor(factor.hour)}
              className="ml-3 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition duration-200 shadow-md"
            >
              Speichern
            </button>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-4 text-center">
        Hinweis: Jeder Faktor wird einzeln gespeichert. Änderungen sind sofort aktiv.
      </p>
    </div>
  );
};

export default BolusFactorEditor;