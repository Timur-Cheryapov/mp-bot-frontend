"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { pricingPlans } from "@/lib/payment-service";

export default function PricingPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    router.push(`/payment?plan=${planId}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-24 pb-12 px-6">
      <div className="w-full max-w-6xl space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the perfect plan for your needs. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`flex flex-col border-2 ${
                plan.popular 
                  ? "border-primary shadow-lg relative" 
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-6">
                <div>
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.price !== "$0" && (
                    <span className="text-muted-foreground ml-1">per month</span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium text-sm text-muted-foreground">
                    CREDITS
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Daily</p>
                      <p className="text-lg font-bold">{plan.creditsPerDay}</p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Monthly</p>
                      <p className="text-lg font-bold">{plan.creditsPerMonth}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium text-sm text-muted-foreground">
                    FEATURES
                  </p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-1 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.id === "free" ? "Get Started" : "Subscribe"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="bg-muted/40 rounded-xl p-8 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Enterprise Options</h2>
              <p className="text-muted-foreground mb-6">
                Need a custom plan for your organization? We offer tailored solutions with dedicated support, custom integrations, and higher usage limits.
              </p>
              <Button variant="outline">Contact Sales</Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Dedicated Account Manager</p>
                  <p className="text-sm text-muted-foreground">Get personalized support from our team</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Custom Integrations</p>
                  <p className="text-sm text-muted-foreground">Connect with your existing workflows</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Higher Usage Limits</p>
                  <p className="text-sm text-muted-foreground">Scale as your needs grow</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center py-6">
          <p className="text-muted-foreground mb-2">
            All plans include secure data storage and regular updates
          </p>
          <p className="text-sm">
            Have questions? <Link href="#" className="text-primary font-medium">Read our FAQ</Link> or <Link href="#" className="text-primary font-medium">contact support</Link>
          </p>
        </div>
      </div>
    </main>
  );
} 