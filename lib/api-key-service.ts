import { fetchCsrfToken } from './auth-service';

export interface ApiKeyData {
  user_id: string;
  service: string;
  api_key?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiKeyResponse {
  message: string;
  data?: ApiKeyData | ApiKeyData[];
  count?: number;
}

export interface ApiKeyWithValue {
  service: string;
  api_key: string;
}

export type MarketplaceService = 'wildberries' | 'ozon' | 'yandexmarket';

const API_BASE_URL = 'http://localhost:3001/api/api-keys';

/**
 * Fetch all configured API keys for the user (without actual key values)
 */
export async function fetchApiKeys(): Promise<{ success: boolean; data?: ApiKeyData[]; error?: string }> {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP error! status: ${response.status}`,
      };
    }

    const result: ApiKeyResponse = await response.json();
    return {
      success: true,
      data: Array.isArray(result.data) ? result.data : [],
    };
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Create or update an API key for a specific service
 */
export async function saveApiKey(
  service: MarketplaceService,
  apiKey: string
): Promise<{ success: boolean; data?: ApiKeyData; error?: string }> {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
      },
      credentials: 'include',
      body: JSON.stringify({
        service,
        api_key: apiKey,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP error! status: ${response.status}`,
      };
    }

    const result: ApiKeyResponse = await response.json();
    return {
      success: true,
      data: result.data as ApiKeyData,
    };
  } catch (error) {
    console.error('Error saving API key:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Delete an API key for a specific service
 */
export async function deleteApiKey(
  service: MarketplaceService
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(`${API_BASE_URL}/${service}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP error! status: ${response.status}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting API key:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Check if an API key exists for a specific service
 */
export async function checkApiKeyExists(
  service: MarketplaceService
): Promise<{ success: boolean; exists: boolean; error?: string }> {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(`${API_BASE_URL}/${service}`, {
      method: 'HEAD',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
      },
      credentials: 'include',
    });

    return {
      success: true,
      exists: response.ok,
    };
  } catch (error) {
    console.error('Error checking API key existence:', error);
    return {
      success: false,
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get marketplace service display names
 */
export function getServiceDisplayName(service: MarketplaceService): string {
  const displayNames: Record<MarketplaceService, string> = {
    wildberries: 'Wildberries',
    ozon: 'Ozon',
    yandexmarket: 'Yandex Market',
  };
  return displayNames[service];
}

/**
 * Get all supported marketplace services
 */
export function getAllServices(): MarketplaceService[] {
  return ['wildberries', 'ozon', 'yandexmarket'];
} 