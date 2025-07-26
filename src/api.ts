// API Base URL Konfiguration

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Debug Log für 
console.log("VITE_API_BASE_URL zur Build-Zeit:", import.meta.env.VITE_API_BASE_URL);
console.log("API_BASE_URL zur Laufzeit:", API_BASE_URL);

// Helper-Funktion für API-Calls
export const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`;
  return fetch(url, options);
};

// Oder als einzelne Funktion
export const getApiUrl = (endpoint: string): string => `${API_BASE_URL}${endpoint}`;