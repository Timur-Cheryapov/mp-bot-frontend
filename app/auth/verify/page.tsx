"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notifyAuthStateChanged, checkAuthStatus } from "@/lib/auth-service";
import type { User } from "@/lib/auth-service";

export default function VerifyHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState<User | undefined>(undefined);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Extract token and type from the URL
  const token = searchParams.get("token");
  const type = searchParams.get("type");
  
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 3;
    
    // Function to check authentication status with multiple attempts
    const checkLoginStatus = async () => {
      try {
        attempts++;
        
        // Check if the user is authenticated
        const { isAuthenticated, user } = await checkAuthStatus();
        
        if (isAuthenticated && user) {
          // User is logged in, verification was successful
          setStatus("success");
          setMessage("Your email has been verified successfully!");
          setUserData(user);
          
          // Notify other components about the auth change
          notifyAuthStateChanged();
        } else if (attempts < maxAttempts) {
          // Not authenticated yet, but we'll try again
          console.log(`Authentication check attempt ${attempts} failed, trying again...`);
          setTimeout(checkLoginStatus, 1000); // Wait 1 second before trying again
        } else {
          // After all attempts, still not authenticated
          setStatus("error");
          setMessage("Verification failed or session was not created. Please try signing in manually.");
        }
      } catch (error) {
        console.error("Verification check error:", error);
        setStatus("error");
        setMessage("An error occurred. Please try signing in manually.");
      }
    };
    
    // Start the check with a small delay to allow session to be established
    setTimeout(checkLoginStatus, 500);
  }, [token]);
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Email Verification
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {status === "loading" && (
            <div className="text-center py-8">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-primary border-e-transparent align-[-0.125em]"></div>
              <p className="mt-4 text-gray-600">Checking verification status...</p>
            </div>
          )}
          
          {status === "success" && (
            <div className="space-y-6">
              <div className="rounded-lg bg-green-50 p-6 border border-green-200 text-center">
                <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-green-100">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-green-800">Verification Successful</h3>
                <p className="mt-2 text-sm text-green-600">{message}</p>
              </div>
              
              {userData && (
                <div className="rounded-lg bg-white p-6 border border-gray-200">
                  <h3 className="text-lg font-medium mb-4">Your Account Information</h3>
                  <div className="space-y-3">
                    {userData.name && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-sm font-medium text-gray-500">Name</div>
                        <div className="col-span-2 text-sm text-gray-900">{userData.name}</div>
                      </div>
                    )}
                    {userData.email && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-sm font-medium text-gray-500">Email</div>
                        <div className="col-span-2 text-sm text-gray-900">{userData.email}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {status === "error" && (
            <div className="rounded-lg bg-red-50 p-6 border border-red-200 text-center">
              <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-800">Verification Failed</h3>
              <p className="mt-2 text-sm text-red-600">{message}</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-3">
          {status === "success" && (
            <Link href="/" className="w-full">
              <Button className="w-full">
                Go to Home
              </Button>
            </Link>
          )}
          
          {status === "error" && (
            <>
              <Link href="/auth?tab=signin" className="w-full">
                <Button className="w-full">
                  Sign In Manually
                </Button>
              </Link>
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </>
          )}
        </CardFooter>
      </Card>
    </main>
  );
} 