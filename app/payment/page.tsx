"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { checkAuthStatus } from "@/lib/auth-service";
import { planDetailsMap, processSubscription, SubscriptionRequest } from "@/lib/payment-service";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const { isAuthenticated, user } = await checkAuthStatus();
        
        if (isAuthenticated && user) {
          setUserId(user.id);
        } else {
          // Redirect to signin if not authenticated
          router.push(`/auth?tab=signin&redirect=${encodeURIComponent('/payment?plan=' + planId)}`);
        }
      } catch (err) {
        console.error("Error checking auth status:", err);
        setError("Authentication error. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (planId) {
      checkAuth();
    } else {
      // Redirect to pricing if no plan is specified
      router.push("/pricing");
    }
  }, [planId, router]);

  const handlePayment = async () => {
    if (!planId || !userId) return;
    
    const plan = planDetailsMap[planId];
    if (!plan) {
      setError("Invalid plan selected.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const subscriptionData: SubscriptionRequest = {
        userId,
        planId,
        planName: plan.name,
        maxCreditsPerDay: plan.creditsPerDay,
        maxCreditsPerMonth: plan.creditsPerMonth
      };

      await processSubscription(subscriptionData);
      
      // Redirect to home page on success
      router.push("/?success=payment-complete");
    } catch (err) {
      console.error("Payment processing error:", err);
      setError("Failed to process payment. Please try again later.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center">
          <Spinner className="mb-4" />
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  const selectedPlan = planId ? planDetailsMap[planId] : null;

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Plan</CardTitle>
            <CardDescription>The selected plan is not valid.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/pricing")} className="w-full">
              Return to Pricing
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start pt-24 px-6">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border border-gray-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Complete Your Subscription</CardTitle>
            <CardDescription>You're subscribing to the {selectedPlan.name} plan</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Plan Details</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium">{selectedPlan.name}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Daily Credits:</span>
                  <span className="font-medium">{selectedPlan.creditsPerDay}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Credits:</span>
                  <span className="font-medium">{selectedPlan.creditsPerMonth}</span>
                </li>
              </ul>
            </div>
            
            {/* This would be replaced with actual payment form in production */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-amber-800 text-sm">
              <p className="font-medium mb-1">Demo Mode</p>
              <p>This is a demonstration. In a production environment, this would include payment details form.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              onClick={handlePayment} 
              disabled={isProcessing} 
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                "Make Payment"
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push("/pricing")} 
              className="w-full"
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
} 