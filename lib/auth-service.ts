const API_BASE_URL = 'http://localhost:3001/api/auth';

// Cache for CSRF token
let cachedCsrfToken: string | null = null;
let tokenExpiryTime: number | null = null;
const TOKEN_LIFETIME_MS = 10 * 60 * 1000; // 10 minutes

export interface User {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

/**
 * Fetches a CSRF token from the server
 * @returns The CSRF token
 */
export async function fetchCsrfToken(): Promise<string> {
  // Return cached token if it's still valid
  const now = Date.now();
  if (cachedCsrfToken && tokenExpiryTime && now < tokenExpiryTime) {
    return cachedCsrfToken;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/csrf-token`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the token with expiry time
    cachedCsrfToken = data.csrfToken;
    tokenExpiryTime = Date.now() + TOKEN_LIFETIME_MS;
    
    return data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
}

/**
 * Invalidates the cached CSRF token
 * Used when a new token is needed (e.g., after logout)
 */
export function invalidateCsrfToken(): void {
  cachedCsrfToken = null;
  tokenExpiryTime = null;
}

/**
 * Checks if the user is authenticated
 * @returns Auth status and user data if authenticated
 */
export async function checkAuthStatus(): Promise<{ isAuthenticated: boolean; user?: User }> {
  try {
    // Use AbortController to set a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      signal: controller.signal
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      return { 
        isAuthenticated: true, 
        user: data.user 
      };
    }
    
    return { isAuthenticated: false };
  } catch (error) {
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('Network error while checking auth status - server might be down');
    } else {
      console.error('Error checking auth status:', error);
    }
    return { isAuthenticated: false };
  }
}

/**
 * Logs in a user
 * @param email User's email
 * @param password User's password
 * @returns Response with success status and user data
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    // Get CSRF token (cached if available)
    const csrfToken = await fetchCsrfToken();
    
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    
    const data = await response.json();
    
    return {
      success: response.ok,
      message: data.message,
      user: data.user,
      token: data.token
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Registers a new user
 * @param name User's name
 * @param email User's email
 * @param password User's password
 * @returns Response with success status and user data
 */
export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  try {
    // Get CSRF token (cached if available)
    const csrfToken = await fetchCsrfToken();
    
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ name, email, password }),
      credentials: 'include'
    });
    
    const data = await response.json();
    
    return {
      success: response.ok,
      message: data.message,
      user: data.user,
      token: data.token
    };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Resends verification email
 * @param email User's email address
 * @returns Success status and message
 */
export async function resendVerificationEmail(email: string): Promise<{ success: boolean; message?: string }> {
  try {
    // Get CSRF token (cached if available)
    const csrfToken = await fetchCsrfToken();
    
    const response = await fetch(`${API_BASE_URL}/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ email }),
      credentials: 'include'
    });
    
    const data = await response.json();
    
    return {
      success: response.ok,
      message: data.message
    };
  } catch (error) {
    console.error('Resend verification error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Logs out the current user
 * @returns Success status and message
 */
export async function logout(): Promise<{ success: boolean; message?: string }> {
  try {
    // Get CSRF token (cached if available)
    const csrfToken = await fetchCsrfToken();
    
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    
    // Invalidate the token after logout
    if (response.ok) {
      invalidateCsrfToken();
    }
    
    return {
      success: response.ok,
      message: data.message
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Notifies other components about authentication state changes
 */
export function notifyAuthStateChanged(): void {
  const event = new Event('authStateChanged');
  window.dispatchEvent(event);
} 