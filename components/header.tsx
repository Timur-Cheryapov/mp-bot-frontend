"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { checkAuthStatus } from "@/lib/auth-service";

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
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
    } catch (error) {
      console.error("Error in auth verification:", error);
      
      // Handle network errors gracefully
      setIsLoggedIn(false);
      setUserName("");
      
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
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold">MP Bot</span>
        </Link>
        
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="flex items-center justify-center w-8 h-8">
              <Spinner size="sm" className="text-muted-foreground" />
            </div>
          ) : isLoggedIn ? (
            <Link href="/profile">
              <Button variant="outline" size="sm">
                <span className="mr-2">👋</span>
                {userName}
              </Button>
            </Link>
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