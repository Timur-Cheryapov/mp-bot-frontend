import { fetchCsrfToken } from './auth-service';

// Backend API URL - Change this to match your actual backend URL
const API_URL = 'http://localhost:3001/api';

/**
 * User Plan type definition
 */
export type UserPlan = {
  id: string;
  user_id: string;
  plan_name: string;
  max_credits_per_day: number;
  max_credits_per_month: number;
  reset_date: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
  active: boolean;
};

/**
 * Plan Usage type definition
 */
export type PlanUsage = {
  hasReachedLimit: boolean;
  dailyUsageCredits: number;
  dailyLimitCredits: number;
  remainingDailyCredits: number;
  monthlyUsageCredits: number;
  monthlyLimitCredits: number;
  remainingMonthlyCredits: number;
  nextResetDate: string;
};

/**
 * Fetches the current user's plan from the API
 */
export async function fetchUserPlan(): Promise<{ plan: UserPlan }> {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(`${API_URL}/plans`, {
      headers: {
        'X-CSRF-Token': token
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching user plan: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user plan:', error);
    throw error;
  }
}

/**
 * Fetches the current user's plan usage from the API
 */
export async function fetchPlanUsage(): Promise<PlanUsage> {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(`${API_URL}/plans/usage`, {
      headers: {
        'X-CSRF-Token': token
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching plan usage: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching plan usage:', error);
    throw error;
  }
} 