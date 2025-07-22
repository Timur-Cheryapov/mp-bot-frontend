"use client"

import { type User } from "@/lib/auth-service"
import { type Conversation } from "@/lib/types/conversation"
import { ConversationsList } from "./ConversationsList"

interface UserDashboardProps {
  user: User
  conversations: Conversation[]
  conversationsLoading: boolean
  error: string | null
}

export function UserDashboard({ user, conversations, conversationsLoading, error }: UserDashboardProps) {
  return (
    <main className="flex min-h-screen flex-col justify-center items-center">
      <div className="max-w-4xl mx-auto px-6 py-8 w-full">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Welcome back, {user?.user_metadata?.name || user?.name || "User"}!
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Continue optimizing your Wildberries business with your AI agent. 
            Get insights, analytics, and strategic recommendations through natural conversation.
          </p>
        </div>

        {/* Conversations List */}
        <ConversationsList 
          conversations={conversations} 
          isLoading={conversationsLoading} 
        />

        {/* Error Display */}
        {error && (
          <div className="mt-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}
      </div>
    </main>
  )
} 