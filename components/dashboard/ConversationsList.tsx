"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, ChevronDown, ChevronUp } from "lucide-react"
import { type Conversation } from "@/lib/types/conversation"

interface ConversationsListProps {
  conversations: Conversation[]
  isLoading: boolean
}

export function ConversationsList({ conversations, isLoading }: ConversationsListProps) {
  const [showAll, setShowAll] = useState(false)
  
  const displayedConversations = showAll ? conversations.slice(0, 10) : conversations.slice(0, 3)
  const hasMore = conversations.length > 3

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-md mx-auto">
        <div className="h-12 bg-muted rounded w-full"></div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b">
            <div className="h-5 bg-muted rounded w-32"></div>
            <div className="h-4 bg-muted rounded w-16"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Start New Conversation Button */}
      <Link href="/chat">
        <Button className="w-full h-12 bg-black hover:bg-black/90 text-white">
          Start a new conversation
        </Button>
      </Link>

      {/* Conversations List */}
      {conversations.length > 0 ? (
        <div className="space-y-0">
          {displayedConversations.map((conversation, index) => (
            <Link key={conversation.id} href={`/chat/${conversation.id}`}>
              <div className="flex items-center justify-between py-4 px-2 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                <span className="text-base font-medium text-gray-900">
                  {conversation.title || `Conversation ${index + 1}`}
                </span>
                <span className="text-sm text-gray-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  {formatDate(conversation.updatedAt)}
                </span>
              </div>
            </Link>
          ))}
          
          {/* Show More/Less Button */}
          {hasMore && (
            <div className="pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAll(!showAll)}
                className="w-full"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Show {Math.min(conversations.length - 3, 7)} More
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No conversations yet. Start your first conversation above!</p>
        </div>
      )}
    </div>
  )
} 