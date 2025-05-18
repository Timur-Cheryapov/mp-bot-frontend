import { fetchCsrfToken } from './auth-service';

// Backend API URL - Change this to match your actual backend URL
const API_URL = 'http://localhost:3001/api';

/**
 * PricingPlan type definition
 */
export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  features: string[];
  popular?: boolean;
  creditsPerDay: number;
  creditsPerMonth: number;
}

/**
 * Map of plan IDs to plan details
 */
export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Get started with basic features",
    price: "$0",
    creditsPerDay: 0.50,
    creditsPerMonth: 5.00,
    features: [
      "0.50 credits per day",
      "Basic models only",
      "5MB file uploads",
      "Community support"
    ]
  },
  {
    id: "standard",
    name: "Standard",
    description: "Perfect for regular usage",
    price: "$9.99/month",
    creditsPerDay: 2.00,
    creditsPerMonth: 20.00,
    popular: true,
    features: [
      "2 credits per day",
      "Access to advanced models",
      "50MB file uploads",
      "Email support",
      "API access"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    description: "For power users and professionals",
    price: "$29.99/month",
    creditsPerDay: 10.00,
    creditsPerMonth: 100.00,
    features: [
      "10 credits per day",
      "Access to all models including GPT-4",
      "200MB file uploads",
      "Priority support",
      "Advanced API features",
      "Custom model fine-tuning",
      "Team collaboration"
    ]
  }
];

/**
 * Plan details lookup by plan ID
 */
export const planDetailsMap: Record<string, { name: string; creditsPerDay: number; creditsPerMonth: number }> = {
  free: {
    name: "Free",
    creditsPerDay: 0.50,
    creditsPerMonth: 5.00
  },
  standard: {
    name: "Standard",
    creditsPerDay: 2.00,
    creditsPerMonth: 20.00
  },
  premium: {
    name: "Premium",
    creditsPerDay: 10.00,
    creditsPerMonth: 100.00
  }
};

/**
 * Subscription request payload type
 */
export interface SubscriptionRequest {
  userId: string;
  planId: string;
  planName: string;
  maxCreditsPerDay: number;
  maxCreditsPerMonth: number;
}

/**
 * Process a subscription for a user
 */
export async function processSubscription(subscriptionData: SubscriptionRequest): Promise<boolean> {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(`${API_URL}/plans/subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": token
      },
      credentials: "include",
      body: JSON.stringify(subscriptionData)
    });
    
    if (!response.ok) {
      throw new Error(`Payment failed: ${response.status} ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error("Error processing subscription:", error);
    throw error;
  }
} 