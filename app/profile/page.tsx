"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { checkAuthStatus, logout, notifyAuthStateChanged } from "@/lib/auth-service";

interface UserProfile {
  id: string;
  email: string;
  created_at?: string;
  user_metadata?: {
    name?: string;
  };
  [key: string]: any;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const { isAuthenticated, user } = await checkAuthStatus();
        
        if (isAuthenticated && user) {
          setUser(user as UserProfile);
          setError(null);
        } else {
          setUser(null);
          setError("Not authenticated. Please sign in.");
          // Redirect to sign in page after a brief delay
          setTimeout(() => {
            router.push("/auth?tab=signin");
          }, 2000);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setUser(null);
        setError("Failed to fetch user profile. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleLogout = async () => {
    setIsLogoutLoading(true);
    try {
      const result = await logout();
      if (result.success) {
        notifyAuthStateChanged();
        router.push("/");
      } else {
        setError(`Logout failed: ${result.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Logout error:", err);
      setError("Failed to log out. Please try again.");
    } finally {
      setIsLogoutLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <Card className="w-full max-w-md shadow-lg border border-gray-200">
        <CardHeader className="pb-0">
          <CardTitle className="text-2xl font-bold text-gray-800">Profile</CardTitle>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
              <p className="text-red-800">{error}</p>
            </div>
          ) : user ? (
            <div className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {user.user_metadata?.name || "User"}
                  </h3>
                  <p className="text-gray-500">{user.email}</p>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <h4 className="font-medium text-gray-700">Account ID</h4>
                  <p className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{user.id}</p>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <h4 className="font-medium text-gray-700">Account Created</h4>
                  <p className="text-gray-600">{formatDate(user.created_at)}</p>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
        
        {user && (
          <CardFooter className="flex justify-between border-t pt-6">
            <Button 
              variant="outline"
              onClick={() => router.push("/")}
              className="w-32"
            >
              Back
            </Button>
            <Button 
              variant="destructive"
              onClick={handleLogout}
              disabled={isLogoutLoading}
              className="w-32"
            >
              {isLogoutLoading ? "Logging out..." : "Log Out"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </main>
  );
} 