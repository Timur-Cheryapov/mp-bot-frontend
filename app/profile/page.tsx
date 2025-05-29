"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { checkAuthStatus, logout, notifyAuthStateChanged } from "@/lib/auth-service";
import { fetchMetrics } from "@/lib/metrics-service";
import { fetchUserPlan, fetchPlanUsage, UserPlan, PlanUsage } from "@/lib/plan-service";
import { 
  fetchApiKeys, 
  saveApiKey, 
  deleteApiKey, 
  getAllServices, 
  getServiceDisplayName,
  MarketplaceService,
  ApiKeyData 
} from "@/lib/api-key-service";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, Trash2, Save, Key } from "lucide-react";

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
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [planUsage, setPlanUsage] = useState<PlanUsage | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
  const [apiKeysLoading, setApiKeysLoading] = useState(false);
  const [newApiKeys, setNewApiKeys] = useState<Record<MarketplaceService, string>>({
    wildberries: '',
    ozon: '',
    yandexmarket: ''
  });
  const [savingApiKeys, setSavingApiKeys] = useState<Record<MarketplaceService, boolean>>({
    wildberries: false,
    ozon: false,
    yandexmarket: false
  });
  const [deletingApiKeys, setDeletingApiKeys] = useState<Record<MarketplaceService, boolean>>({
    wildberries: false,
    ozon: false,
    yandexmarket: false
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const { isAuthenticated, user } = await checkAuthStatus();
        
        if (isAuthenticated && user) {
          setUser(user as UserProfile);
          setError(null);
          // Fetch metrics, plan data, and API keys once authenticated
          fetchUserMetrics();
          fetchUserPlanData();
          fetchUserApiKeys();
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

  const fetchUserPlanData = async () => {
    setPlanLoading(true);
    try {
      const plan = await fetchUserPlan();
      const usage = await fetchPlanUsage();
      setUserPlan(plan.plan);
      setPlanUsage(usage);
    } catch (err) {
      console.error("Error fetching plan data:", err);
    } finally {
      setPlanLoading(false);
    }
  };

  const fetchUserApiKeys = async () => {
    setApiKeysLoading(true);
    try {
      const result = await fetchApiKeys();
      if (result.success && result.data) {
        setApiKeys(result.data);
      }
    } catch (err) {
      console.error("Error fetching API keys:", err);
    } finally {
      setApiKeysLoading(false);
    }
  };

  const handleApiKeyChange = (service: MarketplaceService, value: string) => {
    setNewApiKeys(prev => ({
      ...prev,
      [service]: value
    }));
  };

  const handleSaveApiKey = async (service: MarketplaceService) => {
    const apiKey = newApiKeys[service].trim();
    if (!apiKey) {
      setError(`Please enter a valid API key for ${getServiceDisplayName(service)}`);
      return;
    }

    setSavingApiKeys(prev => ({ ...prev, [service]: true }));
    try {
      const result = await saveApiKey(service, apiKey);
      if (result.success) {
        // Clear the input
        setNewApiKeys(prev => ({ ...prev, [service]: '' }));
        // Refresh API keys list
        await fetchUserApiKeys();
        setError(null);
      } else {
        setError(result.error || `Failed to save ${getServiceDisplayName(service)} API key`);
      }
    } catch (err) {
      console.error("Error saving API key:", err);
      setError(`Failed to save ${getServiceDisplayName(service)} API key`);
    } finally {
      setSavingApiKeys(prev => ({ ...prev, [service]: false }));
    }
  };

  const handleDeleteApiKey = async (service: MarketplaceService) => {
    if (!confirm(`Are you sure you want to delete your ${getServiceDisplayName(service)} API key?`)) {
      return;
    }

    setDeletingApiKeys(prev => ({ ...prev, [service]: true }));
    try {
      const result = await deleteApiKey(service);
      if (result.success) {
        // Refresh API keys list
        await fetchUserApiKeys();
        setError(null);
      } else {
        setError(result.error || `Failed to delete ${getServiceDisplayName(service)} API key`);
      }
    } catch (err) {
      console.error("Error deleting API key:", err);
      setError(`Failed to delete ${getServiceDisplayName(service)} API key`);
    } finally {
      setDeletingApiKeys(prev => ({ ...prev, [service]: false }));
    }
  };

  const hasApiKey = (service: MarketplaceService): boolean => {
    return apiKeys.some(key => key.service === service);
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
          <>
            {/* API Keys Card */}
            <Card className="shadow-lg border border-gray-200">
              <CardHeader className="pb-0">
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Key className="h-6 w-6" />
                  Marketplace API Keys
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {apiKeysLoading ? (
                  <div className="space-y-4">
                    {getAllServices().map((service) => (
                      <Skeleton key={service} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-sm text-gray-600">
                      Configure your marketplace API keys to enable integration with your e-commerce platforms.
                    </p>
                    
                    {getAllServices().map((service) => {
                      const hasKey = hasApiKey(service);
                      const isLoading = savingApiKeys[service] || deletingApiKeys[service];
                      
                      return (
                        <div key={service} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-medium text-gray-800">
                                {getServiceDisplayName(service)}
                              </h3>
                              {hasKey && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                  <Key className="h-3 w-3" />
                                  Configured
                                </div>
                              )}
                            </div>
                            
                            {hasKey && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteApiKey(service)}
                                disabled={isLoading}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {deletingApiKeys[service] ? (
                                  "Deleting..."
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Remove
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`${service}-key`} className="text-sm font-medium">
                              {hasKey ? 'Update API Key' : 'Add API Key'}
                            </Label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Input
                                  id={`${service}-key`}
                                  type="password"
                                  placeholder={hasKey ? "Enter new API key to update" : `Enter your ${getServiceDisplayName(service)} API key`}
                                  value={newApiKeys[service]}
                                  onChange={(e) => handleApiKeyChange(service, e.target.value)}
                                  disabled={isLoading}
                                />
                              </div>
                              
                              <Button
                                onClick={() => handleSaveApiKey(service)}
                                disabled={isLoading || !newApiKeys[service].trim()}
                                size="sm"
                                className="whitespace-nowrap"
                              >
                                {savingApiKeys[service] ? (
                                  "Saving..."
                                ) : (
                                  <>
                                    <Save className="h-4 w-4 mr-1" />
                                    {hasKey ? 'Update' : 'Save'}
                                  </>
                                )}
                              </Button>
                            </div>
                            
                            {hasKey && (
                              <p className="text-xs text-gray-500">
                                Last updated: {formatDate(apiKeys.find(k => k.service === service)?.updated_at)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Plan Card */}
            <Card className="shadow-lg border border-gray-200">
              <CardHeader className="pb-0">
                <CardTitle className="text-2xl font-bold text-gray-800">Your Plan</CardTitle>
              </CardHeader>
              
              <CardContent>
                {planLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : userPlan ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
                      <h3 className="text-xl font-bold mb-2">{userPlan.plan_name}</h3>
                      <p className="text-white/80 text-sm">
                        Plan active since {formatDate(userPlan.created_at)}
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-white/80">Daily Credits</p>
                          <p className="text-lg font-bold">{userPlan.max_credits_per_day}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/80">Monthly Credits</p>
                          <p className="text-lg font-bold">{userPlan.max_credits_per_month}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center py-2">
                        <h4 className="font-medium text-gray-700">Plan Status</h4>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${userPlan.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {userPlan.active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center py-2">
                        <h4 className="font-medium text-gray-700">Next Reset Date</h4>
                        <p className="text-gray-600">{formatDate(userPlan.reset_date)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-600">No plan information available.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage Card */}
            <Card className="shadow-lg border border-gray-200">
              <CardHeader className="pb-0">
                <CardTitle className="text-2xl font-bold text-gray-800">Usage Details</CardTitle>
              </CardHeader>
              
              <CardContent>
                {planLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : planUsage ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Daily Usage */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <h3 className="text-md font-medium text-gray-700">Daily Credits</h3>
                          <p className="text-sm text-gray-600">
                            {planUsage.remainingDailyCredits} of {planUsage.dailyLimitCredits} remaining
                          </p>
                        </div>
                        <Progress 
                          value={(planUsage.dailyUsageCredits / planUsage.dailyLimitCredits) * 100} 
                          className="h-2"
                        />
                        <p className="text-xs text-gray-500">
                          Used {planUsage.dailyUsageCredits} credits today
                          {planUsage.hasReachedLimit && 
                            <span className="text-red-500 ml-2 font-medium">
                              (Daily limit reached)
                            </span>
                          }
                        </p>
                      </div>
                      
                      {/* Monthly Usage */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <h3 className="text-md font-medium text-gray-700">Monthly Credits</h3>
                          <p className="text-sm text-gray-600">
                            {planUsage.remainingMonthlyCredits} of {planUsage.monthlyLimitCredits} remaining
                          </p>
                        </div>
                        <Progress 
                          value={(planUsage.monthlyUsageCredits / planUsage.monthlyLimitCredits) * 100} 
                          className="h-2"
                        />
                        <p className="text-xs text-gray-500">
                          Used {planUsage.monthlyUsageCredits} credits this month
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex items-center">
                        <div className="mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-700">Next Reset Date</h4>
                          <p className="text-sm text-blue-600">{formatDate(planUsage.nextResetDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-600">No usage information available.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Existing Metrics Card */}
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
          </>
        )}
      </div>
    </main>
  );
} 