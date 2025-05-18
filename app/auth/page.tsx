"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { login, signup, notifyAuthStateChanged } from "@/lib/auth-service";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  
  // Form states
  const [signInData, setSignInData] = useState({
    email: "",
    password: ""
  });
  
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // Set active tab based on query parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "signup" || tab === "signin") {
      setActiveTab(tab);
    }
    const redirect = searchParams.get("redirect");
    if (redirect) {
      setRedirectUrl(decodeURIComponent(redirect));
    }
  }, [searchParams]);

  // Handle sign in form submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await login(signInData.email, signInData.password);
      
      if (response.success) {
        // Notify other components about auth state change
        notifyAuthStateChanged();
        
        // Redirect to confirmation page
        router.push(redirectUrl || "/");
      } else {
        alert(`Sign in failed: ${response.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      alert("Failed to connect to the server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sign up form submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await signup(
        signUpData.name,
        signUpData.email,
        signUpData.password
      );
      
      if (response.success) {
        // For Supabase email verification flow, we should redirect to a page 
        // instructing the user to check their email
        router.push(`/auth/check-mail?email=${encodeURIComponent(signUpData.email)}`);
      } else {
        alert(`Sign up failed: ${response.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Sign up error:", error);
      alert("Failed to connect to the server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            {/* Sign In Form */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label htmlFor="signin-email" className="text-sm font-medium">Email</label>
                  <Input 
                    id="signin-email" 
                    type="email" 
                    placeholder="example@example.com" 
                    value={signInData.email}
                    onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signin-password" className="text-sm font-medium">Password</label>
                  <Input 
                    id="signin-password" 
                    type="password" 
                    value={signInData.password}
                    onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            {/* Sign Up Form */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label htmlFor="signup-name" className="text-sm font-medium">Name</label>
                  <Input 
                    id="signup-name" 
                    type="text" 
                    placeholder="John Doe" 
                    value={signUpData.name}
                    onChange={(e) => setSignUpData({...signUpData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-sm font-medium">Email</label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="example@example.com" 
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-sm font-medium">Password</label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="signup-confirm-password" className="text-sm font-medium">Confirm Password</label>
                  <Input 
                    id="signup-confirm-password" 
                    type="password" 
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({...signUpData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
} 