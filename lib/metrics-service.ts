import { fetchCsrfToken } from './auth-service';

// Backend API URL - Change this to match your actual backend URL
const API_URL = 'http://localhost:3001/api';

/**
 * Fetches metrics data from the API
 */
export async function fetchMetrics() {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(`${API_URL}/metrics`, {
      headers: {
        'X-CSRF-Token': token
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching metrics: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
}

/**
 * Resets all metrics data
 */
export async function resetMetrics() {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(`${API_URL}/metrics/reset`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': token
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to reset metrics: ${response.status} ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error resetting metrics:', error);
    throw error;
  }
} 