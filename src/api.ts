import { getApiUrl } from './api.js'
// API Base URL Konfiguration
export const response = await fetch(getApiUrl('/api/calorie-factors'));

// Helper-Funktion für API-Calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  return fetch(url, options);
};

// Oder als einzelne Funktion
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;