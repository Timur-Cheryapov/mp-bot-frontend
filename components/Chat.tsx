"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ChatHeader } from "@/components/ChatHeader"
import { ChatBody } from "@/components/ChatBody"
import { ChatFooter } from "@/components/ChatFooter"
import { ChatMessage, MessageRole, MessageStatus, Conversation } from "@/lib/types/conversation"
import { createUiMessage } from "@/lib/utils/converters"
import * as conversationService from "@/lib/conversation-service"
import { checkAuthStatus } from "@/lib/auth-service"
import { useRouter, useParams } from "next/navigation"

interface ChatProps {
  initialMessages?: ChatMessage[]
  title?: string
  systemPrompt?: string
  demoMode?: boolean
  conversationId?: string
}

export function Chat({ 
  initialMessages = [],
  title = "Chat",
  systemPrompt = "You are a friendly AI assistant. Answer shortly.",
  demoMode = false,
}: ChatProps) {
  const params = useParams()
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null) // totally not the conversation object, it server-side
  const [conversationId, setConversationId] = useState<string | null>(null)
  
  // Check user authentication and load existing conversation if ID is provided
  useEffect(() => {
    const initialize = async () => {
      try {
        // Load existing conversation if ID is in URL params
        const urlConversationId = params?.conversationId as string
        if (urlConversationId && !demoMode) {
          setIsLoading(true)
          const result = await conversationService.getConversation(urlConversationId)
          setConversation(result.conversation)
          setMessages(result.messages)
          setConversationId(urlConversationId)
          setIsLoading(false)
        }
      } catch (err) {
        console.error("Error during initialization:", err)
        setError("Failed to load conversation")
        setIsLoading(false)
      }
    }
    
    initialize()
  }, [params])

  // Update URL when conversation ID changes
  useEffect(() => {
    if (conversationId && !demoMode) {
      window.history.replaceState({}, '', `/chat/${conversationId}`)
    }
  }, [conversationId, demoMode])
  
  // Function to create a new conversation
  const createNewConversation = async (content: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Add user message to UI immediately
      const userMessage = createUiMessage(content, 'user', 'success')
      setMessages(prev => [...prev, userMessage])
      
      // Add a pending bot message
      const pendingBotMessage = createUiMessage("Assistant is thinking...", 'assistant', 'pending')
      setTimeout(() => {
        setMessages(prev => [...prev, pendingBotMessage])
      }, 300)
      
      if (demoMode) {
        // Simulate API response in demo mode
        setTimeout(() => {
          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage && lastMessage.role === "assistant" && lastMessage.status === "pending") {
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMessage,
                status: "success" as MessageStatus,
                content: `I'm in demo mode. You said: "${content}"`,
              };
            }
            return updatedMessages;
          });
          setIsLoading(false);
        }, 1500);
        return;
      }
      
      // Use the conversation service to create a new conversation
      const result = await conversationService.createConversation(
        content,
        systemPrompt,
      );
      
      setConversation(result.conversation);
      setConversationId(result.conversation.id);
      setMessages(result.messages);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      
      // Update the pending message to show error
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages]
        const lastMessage = updatedMessages[updatedMessages.length - 1]
        if (lastMessage && lastMessage.role === "assistant" && lastMessage.status === "pending") {
          updatedMessages[updatedMessages.length - 1] = {
            ...lastMessage,
            status: "error" as MessageStatus,
            content: "Failed to get response. Please try again.",
          }
        }
        return updatedMessages
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Function to send a message to an existing conversation
  const sendMessageToConversation = async (content: string) => {
    if (!conversation && !demoMode) {
      createNewConversation(content)
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Add user message to UI immediately
      const userMessage = createUiMessage(content, 'user', 'success')
      setMessages(prev => [...prev, userMessage])
      
      // Add a pending bot message
      const pendingBotMessage = createUiMessage("Assistant is thinking...", 'assistant', 'pending')
      setTimeout(() => {
        setMessages(prev => [...prev, pendingBotMessage])
      }, 300)
      
      if (demoMode) {
        // Simulate API response in demo mode
        setTimeout(() => {
          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage && lastMessage.role === "assistant" && lastMessage.status === "pending") {
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMessage,
                status: "success" as MessageStatus,
                content: `I'm in demo mode. You said: "${content}"`,
              };
            }
            return updatedMessages;
          });
          setIsLoading(false);
        }, 1500);
        return;
      }

      // Use the conversation service to send a message to an existing conversation
      const result = await conversationService.sendMessage(
        conversation!.id,
        content,
      );
      
      setMessages(result.messages);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      
      // Update the pending message to show error
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages]
        const lastMessage = updatedMessages[updatedMessages.length - 1]
        if (lastMessage && lastMessage.role === "assistant" && lastMessage.status === "pending") {
          updatedMessages[updatedMessages.length - 1] = {
            ...lastMessage,
            status: "error" as MessageStatus,
            content: "Failed to get response. Please try again.",
          }
        }
        return updatedMessages
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Function to handle sending a message
  const sendMessage = (content: string) => {
    if (!content.trim()) return
    
    if (demoMode) {
      sendMessageToConversation(content)
    } else if (conversation) {
      sendMessageToConversation(content)
    } else {
      createNewConversation(content)
    }
  }
  
  // Function to clear messages and reset conversation
  const clearMessages = () => {
    setMessages([])
    setConversation(null)
    setError(null)
  }

  return (
    <Card 
      className="flex flex-col w-full h-[90vh] sm:h-[80vh] 
        max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl 
        mx-auto overflow-hidden rounded-xl shadow-lg 
        border-muted-foreground/20 p-0"
      role="region"
      aria-label="Chat interface"
    >
      <ChatHeader title={conversation?.title || title} onClear={clearMessages} />
      <ChatBody messages={messages} />
      <ChatFooter onSendMessage={sendMessage} disabled={isLoading} />
    </Card>
  )
} 