const API_BASE = '/api';

// Fallback data for when backend isn't available (like on GitHub Pages)
const FALLBACK_LIGHTS = {
  "2014": 5,
  "2015": 3,
  "2016": 7,
  "2017": 2,
  "2018": 9,
  "2019": 4,
  "2020": 6,
  "2021": 1,
  "2022": 8,
  "2023": 3,
  "2024": 5,
  "2025": 2,
  "2026": 0
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw { status: response.status, ...error };
  }
  return response.json();
};

export const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_BASE}/products`);
    return handleResponse(response);
  } catch {
    // Fallback for GitHub Pages - we don't need this since PRODUCTS are local
    return [];
  }
};

export const fetchProduct = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/products/${id}`);
    return handleResponse(response);
  } catch {
    // Fallback - won't be called since PRODUCTS are local
    return null;
  }
};

export const fetchLight = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/products/${id}/light`);
    return handleResponse(response);
  } catch {
    // Fallback for GitHub Pages
    return { light: FALLBACK_LIGHTS[id] || 0 };
  }
};

export const contributeLight = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/products/${id}/light`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  } catch (error) {
    // Fallback for GitHub Pages/Netlify - just increment locally for demo
    console.warn('API call failed, using local fallback:', error);
    const fallbackKey = 'memoryStore:fallbackLights';
    const currentLights = JSON.parse(localStorage.getItem(fallbackKey) || JSON.stringify(FALLBACK_LIGHTS));
    currentLights[id] = (currentLights[id] || 0) + 1;
    localStorage.setItem(fallbackKey, JSON.stringify(currentLights));
    return { light: currentLights[id] };
  }
};

export const fetchAllLights = async () => {
  try {
    const response = await fetch(`${API_BASE}/all-lights`);
    return handleResponse(response);
  } catch {
    // Fallback for GitHub Pages
    const storedLights = localStorage.getItem('memoryStore:fallbackLights');
    return storedLights ? JSON.parse(storedLights) : FALLBACK_LIGHTS;
  }
};