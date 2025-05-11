const API_BASE_URL = 'http://localhost:3001/api/auth';

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
  try {
    const response = await fetch(`${API_BASE_URL}/csrf-token`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    }
    
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
}

/**
 * Checks if the user is authenticated
 * @returns Auth status and user data if authenticated
 */
export async function checkAuthStatus(): Promise<{ isAuthenticated: boolean; user?: User }> {
  try {
    const response = await fetch(`${API_BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      return { 
        isAuthenticated: true, 
        user: data.user 
      };
    }
    
    return { isAuthenticated: false };
  } catch (error) {
    console.error('Error checking auth status:', error);
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
    // Get fresh CSRF token
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
    // Get fresh CSRF token
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
    // Get fresh CSRF token
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
    // Get fresh CSRF token
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