"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { checkAuthStatus } from "@/lib/auth-service";
import { fetchUserPlan, UserPlan } from "@/lib/plan-service";

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 1500; // 1.5 seconds

  const verifyAuthStatus = async (isRetry = false) => {
    try {
      if (!isRetry) setIsLoading(true);
      const { isAuthenticated, user } = await checkAuthStatus();
      
      setIsLoggedIn(isAuthenticated);
      setUserName(user?.user_metadata?.name || "User");
      
      // Reset retry count on success
      setRetryCount(0);
      
      // If logged in, fetch user's plan
      if (isAuthenticated) {
        fetchUserPlanInfo();
      } else {
        setUserPlan(null);
      }
    } catch (error) {
      console.error("Error in auth verification:", error);
      
      // Handle network errors gracefully
      setIsLoggedIn(false);
      setUserName("");
      setUserPlan(null);
      
      // Implement retry logic with max attempts
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          verifyAuthStatus(true);
        }, RETRY_DELAY);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPlanInfo = async () => {
    setIsPlanLoading(true);
    try {
      const planData = await fetchUserPlan();
      if (planData && planData.plan) {
        setUserPlan(planData.plan);
      }
    } catch (error) {
      console.error("Error fetching user plan:", error);
      setUserPlan(null);
    } finally {
      setIsPlanLoading(false);
    }
  };
  
  // Helper to determine badge variant based on plan name
  const getPlanBadgeClasses = (planName: string) => {
    switch(planName) {
      case "Free":
        return "bg-gray-100 hover:bg-gray-100 text-gray-800 border-gray-200";
      case "Standard":
        return "bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-200";
      case "Premium":
        return "bg-purple-100 hover:bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 hover:bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  useEffect(() => {
    // Check initially
    verifyAuthStatus();
    
    // Setup event listener for auth changes
    const handleAuthChange = () => {
      verifyAuthStatus();
    };
    window.addEventListener("authStateChanged", handleAuthChange);
    
    return () => {
      window.removeEventListener("authStateChanged", handleAuthChange);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-3 px-4 md:px-6 mx-auto">
      <div className="mx-auto max-w-7xl w-full bg-white/80 backdrop-blur-sm shadow-sm rounded-xl border border-gray-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold">MP Bot</span>
          </Link>
          <Link href="/pricing">
            <Button variant="ghost" size="sm">
              Pricing
            </Button>
          </Link>
        </div>
        
        
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="flex items-center justify-center w-8 h-8">
              <Spinner size="sm" className="text-muted-foreground" />
            </div>
          ) : isLoggedIn ? (
            <div className="flex items-center gap-2">
              {isPlanLoading ? (
                <Skeleton className="h-6 w-16 rounded-full" />
              ) : userPlan && (
                <Badge 
                  variant="outline"
                  className={getPlanBadgeClasses(userPlan.plan_name)}
                >
                  {userPlan.plan_name}
                </Badge>
              )}
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  <span className="mr-2">👋</span>
                  {userName}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Link href="/auth?tab=signin">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth?tab=signup">
                <Button size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
} 