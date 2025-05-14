"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resendVerificationEmail } from "@/lib/auth-service";

export default function CheckMail() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";
  
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ message: string; isError: boolean } | null>(null);
  
  const handleResendEmail = async () => {
    if (!email || email === "your email") {
      setResendStatus({
        message: "Email address is missing. Please go back and try again.",
        isError: true
      });
      return;
    }
    
    setIsResending(true);
    setResendStatus(null);
    
    try {
      const result = await resendVerificationEmail(email);
      
      if (result.success) {
        setResendStatus({
          message: `Verification email has been resent to ${email}`,
          isError: false
        });
      } else {
        setResendStatus({
          message: result.message || "Failed to resend verification email. Please try again.",
          isError: true
        });
      }
    } catch (error) {
      setResendStatus({
        message: "An error occurred. Please try again later.",
        isError: true
      });
      console.error("Error resending verification email:", error);
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Check Your Email</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-blue-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-base text-gray-600">
              We've sent a verification link to <span className="font-semibold">{email}</span>
            </p>
          </div>
          
          {resendStatus && (
            <div className={`rounded-lg p-4 border ${resendStatus.isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
              {resendStatus.message}
            </div>
          )}
          
          <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Instructions</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Click the verification link in the email</li>
                    <li>You'll be redirected back to our site</li>
                    <li>Once verified, you can start using your account</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-3">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleResendEmail}
            disabled={true} // Resend email is not yet implemented
          >
            {isResending ? "Sending..." : "Resend Verification Email"}
          </Button>
          
          <Link href="/auth?tab=signin" className="w-full">
            <Button variant="secondary" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
} 