"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { checkAuthStatus, type User } from "@/lib/auth-service"
import { getConversations } from "@/lib/conversation-service"
import { type Conversation } from "@/lib/types/conversation"

// Marketing Components
import { MarketingHero } from "@/components/marketing/MarketingHero"
import { FeaturesSection } from "@/components/marketing/FeaturesSection"
import { CTASection } from "@/components/marketing/CTASection"

// Dashboard Components
import { UserDashboard } from "@/components/dashboard/UserDashboard"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [conversationsLoading, setConversationsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        const { isAuthenticated, user } = await checkAuthStatus()
        setIsAuthenticated(isAuthenticated)
        setUser(user || null)
        
        if (isAuthenticated) {
          await loadConversations()
        }
      } catch (err) {
        console.error("Error checking auth status:", err)
        setError("Failed to load user data")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const loadConversations = async () => {
    try {
      setConversationsLoading(true)
      const result = await getConversations(false, 50, 0) // Get more conversations for show more functionality
      setConversations(result.conversations)
    } catch (err) {
      console.error("Error loading conversations:", err)
      setError("Failed to load conversations")
    } finally {
      setConversationsLoading(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl space-y-6">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  // Marketing page for unauthenticated users
  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen flex-col">
        <MarketingHero />
        <FeaturesSection />
        <CTASection />
      </main>
    )
  }

  // Dashboard for authenticated users
  if (user) {
    return (
      <UserDashboard 
        user={user}
        conversations={conversations}
        conversationsLoading={conversationsLoading}
        error={error}
      />
    )
  }

  return null
}
