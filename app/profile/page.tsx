"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { checkAuthStatus, logout, notifyAuthStateChanged } from "@/lib/auth-service";
import { fetchMetrics } from "@/lib/metrics-service";

interface UserProfile {
  id: string;
  email: string;
  created_at?: string;
  user_metadata?: {
    name?: string;
  };
  [key: string]: any;
}

interface TokenMetrics {
  user_id: string;
  date: string;
  input_tokens: number;
  output_tokens: number;
  model: string;
  cost_usd: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<TokenMetrics[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const { isAuthenticated, user } = await checkAuthStatus();
        
        if (isAuthenticated && user) {
          setUser(user as UserProfile);
          setError(null);
          // Fetch metrics once authenticated
          fetchUserMetrics();
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

  const fetchUserMetrics = async () => {
    setMetricsLoading(true);
    try {
      const result = await fetchMetrics();
      if (result && result.usage) {
        setMetrics(result.usage);
      }
    } catch (err) {
      console.error("Error fetching metrics:", err);
    } finally {
      setMetricsLoading(false);
    }
  };

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
      return new Date(dateString).toLocaleString().slice(0, 10);
    } catch (e) {
      return dateString;
    }
  };

  const calculateTotalTokens = (type: 'input' | 'output') => {
    return metrics.reduce((total, metric) => total + (type === 'input' ? metric.input_tokens : metric.output_tokens), 0);
  };

  const calculateTotalCost = () => {
    return metrics.reduce((total, metric) => total + metric.cost_usd, 0).toFixed(6);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <div className="w-full max-w-4xl space-y-6">
        <Card className="shadow-lg border border-gray-200">
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
              <div className="space-y-6">
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

        {user && (
          <Card className="shadow-lg border border-gray-200">
            <CardHeader className="pb-0">
              <CardTitle className="text-2xl font-bold text-gray-800">Usage Metrics</CardTitle>
            </CardHeader>
            
            <CardContent>
              {metricsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : metrics.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm font-medium text-blue-700">Input Tokens</p>
                      <p className="text-2xl font-bold text-blue-900">{calculateTotalTokens('input')}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-sm font-medium text-green-700">Output Tokens</p>
                      <p className="text-2xl font-bold text-green-900">{calculateTotalTokens('output')}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <p className="text-sm font-medium text-purple-700">Total Cost (USD)</p>
                      <p className="text-2xl font-bold text-purple-900">${calculateTotalCost()}</p>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Input Tokens</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Output Tokens</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost (USD)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {metrics.map((metric, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(metric.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.model}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.input_tokens}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric.output_tokens}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${metric.cost_usd.toFixed(6)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600">No usage metrics available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
} 