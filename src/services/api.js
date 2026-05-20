const API_BASE = '/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw { status: response.status, ...error };
  }
  return response.json();
};

export const fetchProducts = async () => {
  const response = await fetch(`${API_BASE}/products`);
  return handleResponse(response);
};

export const fetchProduct = async (id) => {
  const response = await fetch(`${API_BASE}/products/${id}`);
  return handleResponse(response);
};

export const fetchLight = async (id) => {
  const response = await fetch(`${API_BASE}/products/${id}/light`);
  return handleResponse(response);
};

export const contributeLight = async (id) => {
  const response = await fetch(`${API_BASE}/products/${id}/light`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse(response);
};

export const fetchAllLights = async () => {
  const response = await fetch(`${API_BASE}/all-lights`);
  return handleResponse(response);
};