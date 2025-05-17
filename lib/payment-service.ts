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
    creditsPerDay: 10,
    creditsPerMonth: 200,
    features: [
      "10 credits per day",
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
    creditsPerDay: 50,
    creditsPerMonth: 1000,
    popular: true,
    features: [
      "50 credits per day",
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
    creditsPerDay: 200,
    creditsPerMonth: 5000,
    features: [
      "200 credits per day",
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
    creditsPerDay: 10,
    creditsPerMonth: 200
  },
  standard: {
    name: "Standard",
    creditsPerDay: 50,
    creditsPerMonth: 1000
  },
  premium: {
    name: "Premium",
    creditsPerDay: 200,
    creditsPerMonth: 5000
  }
};

/**
 * Subscription request payload type
 */
export interface SubscriptionRequest {
  userId: string;
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