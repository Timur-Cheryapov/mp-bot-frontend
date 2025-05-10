"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ChatHeader } from "@/components/ChatHeader"
import { ChatBody } from "@/components/ChatBody"
import { ChatFooter } from "@/components/ChatFooter"
import { ChatMessage, MessageRole, MessageStatus, Conversation } from "@/lib/types/conversation"
import { createUiMessage } from "@/lib/utils/converters"

interface ChatProps {
  initialMessages?: ChatMessage[]
  title?: string
  systemPrompt?: string
  demoMode?: boolean
}

export function Chat({ 
  initialMessages = [],
  title = "Chat",
  systemPrompt = "You are a friendly AI assistant. Answer shortly.",
  demoMode = false
}: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  
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
      
      // TODO: Change api route to use the new conversation endpoint
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initialSystemPrompt: systemPrompt,
          initialUserMessage: content,
          userId: '00000000-0000-0000-0000-000000000000',
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create conversation')
      }
      
      setConversation(data.conversation)
      
      // Process messages to ensure timestamps are Date objects
      const processedMessages = data.conversation.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
      
      setMessages(processedMessages)
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

      // TODO: Change api route to use the new conversation endpoint
      const response = await fetch(`/api/conversation/${conversation!.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          userId: '00000000-0000-0000-0000-000000000000',
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }
      
      setConversation(data.conversation)
      
      // Process messages to ensure timestamps are Date objects
      const processedMessages = data.conversation.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
      
      setMessages(processedMessages)
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
      <ChatHeader title={conversation?.metadata?.title || title} onClear={clearMessages} />
      <ChatBody messages={messages} />
      <ChatFooter onSendMessage={sendMessage} disabled={isLoading} />
    </Card>
  )
} 