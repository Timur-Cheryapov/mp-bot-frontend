"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./button";
import { checkAuthStatus } from "@/lib/auth-service";
import type { User } from "@/lib/auth-service";

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const verifyAuthStatus = async () => {
    try {
      setIsLoading(true);
      const { isAuthenticated, user } = await checkAuthStatus();
      
      setIsLoggedIn(isAuthenticated);
      setUserName(user?.name || "User");
    } catch (error) {
      console.error("Error in auth verification:", error);
      setIsLoggedIn(false);
      setUserName("");
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
            <div className="w-8 h-8 opacity-50"></div>
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