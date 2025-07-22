"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ChatHeader } from "@/components/ChatHeader"
import { ChatBody } from "@/components/ChatBody"
import { ChatFooter } from "@/components/ChatFooter"
import { ChatMessage, Conversation } from "@/lib/types/conversation"
import {
  THINKING_MESSAGE,
  PENDING_MESSAGE_DELAY,
  createUiMessage,
  updateLastMessage,
  updateAssistantMessageWithChunk,
  clearThinkingMessage,
  createErrorMessage,
  isAuthError
} from "@/lib/utils/chat-helpers"
import * as conversationService from "@/lib/conversation-service"
import * as streamingService from "@/lib/conversation-streaming-service"
import type { ToolExecutionEvent, ToolCompleteEvent, StreamCallbacks } from "@/lib/utils/streaming-helpers"
import { useParams } from "next/navigation"
import { AuthRequiredDialog } from "@/components/AuthRequiredDialog"

interface ChatProps {
  initialMessages?: ChatMessage[]
  title?: string
  systemPrompt?: string
  demoMode?: boolean
  conversationId?: string
  enableStreaming?: boolean
}

export function Chat({ 
  initialMessages = [],
  title = "Chat",
  systemPrompt = "You are a friendly AI assistant. Answer shortly.",
  demoMode = false,
  enableStreaming = true,
}: ChatProps) {
  const params = useParams()
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  
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
      } catch (err: any) {
        console.error("Error during initialization:", err)
        handleApiError(err)
        setIsLoading(false)
      }
    }
    
    initialize()
  }, [params])

  // Update URL when conversation ID changes
  useEffect(() => {
    if (conversationId && !demoMode) {
      window.history.replaceState({}, '', `/chat/${conversationId}`)
    } else if (!conversationId && !demoMode) {
      window.history.replaceState({}, '', '/chat')
    }
  }, [conversationId, demoMode])
  
  // Function to handle API errors
  const handleApiError = (err: any) => {
    console.error("API Error:", err)
    
    if (isAuthError(err)) {
      setShowAuthDialog(true)
      setError("Authentication required")
    } else {
      const errorMessage = err.message || 'An error occurred'
      setError(errorMessage)
    }
    
    // Update the pending message to show error
    setMessages(prevMessages => 
      updateLastMessage(prevMessages, "assistant", "pending", {
        status: "error",
        content: createErrorMessage(err),
      })
    )
  }

  // Function to simulate demo mode response
  const simulateDemoResponse = (userContent: string) => {
    setTimeout(() => {
      setMessages(prevMessages => 
        updateLastMessage(prevMessages, "assistant", "pending", {
          status: "success",
          content: `I'm in demo mode. You said: "${userContent}"`,
        })
      )
      setIsLoading(false)
    }, 1500)
  }

  // Function to add user message and pending assistant message
  const addInitialMessages = (content: string) => {
    // Add user message immediately
    const userMessage = createUiMessage(content, 'user', 'success')
    setMessages(prev => [...prev, userMessage])
    
    // Add pending assistant message after delay
    const pendingBotMessage = createUiMessage(THINKING_MESSAGE, 'assistant', 'pending')
    setTimeout(() => {
      setMessages(prev => [...prev, pendingBotMessage])
    }, PENDING_MESSAGE_DELAY)
  }

  // Function to handle stopping generation
  const handleStop = () => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
      setIsLoading(false)
      
      // Clear any pending "thinking" message and mark the last assistant message as completed
      setMessages(prevMessages => {
        return prevMessages.map(msg => {
          if (msg.role === 'assistant' && msg.status === 'pending') {
            return { ...msg, status: 'success' as const }
          }
          return msg
        })
      })
    }
  }

  // Function to handle sending a message (creates new conversation or sends to existing)
  const sendMessage = async (content: string) => {
    if (!content.trim()) return
    
    // Create abort controller for this request
    const controller = new AbortController()
    setAbortController(controller)
    
    setIsLoading(true)
    setError(null)
    
    addInitialMessages(content)
    
    if (demoMode) {
      simulateDemoResponse(content)
      return
    }
    
    const isNewConversation = !conversationId
    
    try {
      if (enableStreaming) {
        // Streaming version
        const streamCallbacks: StreamCallbacks = {
          onConversationCreated: (conversation: Conversation) => {
            setConversation(conversation)
            setConversationId(conversation.id)
          },
          onChunk: (chunk: string) => {
            setMessages(prevMessages => updateAssistantMessageWithChunk(prevMessages, chunk))
          },
          onToolExecution: (toolMessages: ToolExecutionEvent[]) => {
            // Clear thinking message if the answer before tool calling was empty or change status to success
            setMessages(prevMessages => clearThinkingMessage(prevMessages))
            // Add tool messages
            for (const message of toolMessages) {
              const toolMessage = createUiMessage(
                `${message.message} (${message.toolName})`,
                'tool',
                'pending',
                message.toolName
              )
              setMessages(prev => [...prev, toolMessage])
            }
          },
          onToolComplete: (toolMessage: ToolCompleteEvent) => {
            setMessages(prevMessages => 
              updateLastMessage(prevMessages, 'tool', 'pending', {
                content: toolMessage.message,
                status: toolMessage.status
              }, toolMessage.toolName)
            )
            
            // Add a new pending assistant message for continued streaming after tool execution
            const pendingAssistantMessage = createUiMessage(THINKING_MESSAGE, 'assistant', 'pending')
            setMessages(prev => [...prev, pendingAssistantMessage])
          },
          onComplete: async () => {
            setMessages(prevMessages => 
              updateLastMessage(prevMessages, 'assistant', 'pending', {
                status: 'success'
              })
            )
            setAbortController(null)
            setIsLoading(false)
          },
          onError: (error: Error) => {
            setMessages(prevMessages => 
              updateLastMessage(prevMessages, 'tool', 'pending', {
                content: `Tool execution failed: ${error.message}`,
                status: 'error'
              })
            )
            handleApiError(error)
            setAbortController(null)
            setIsLoading(false)
          }
        }

        await streamingService.sendStreamingMessage(
          content, 
          streamCallbacks, 
          conversationId, 
          isNewConversation ? systemPrompt : undefined,
          controller
        )
      } else {
        // Non-streaming version
        let result
        if (isNewConversation) {
          result = await conversationService.createConversation(content, systemPrompt)
          setConversation(result.conversation)
          setConversationId(result.conversation.id)
        } else {
          result = await conversationService.sendMessage(conversationId!, content)
        }
        setMessages(result.messages)
        setAbortController(null)
        setIsLoading(false)
      }
    } catch (err: any) {
      handleApiError(err)
      setAbortController(null)
      setIsLoading(false)
    }
  }
  
  // Function to clear messages and reset conversation
  const clearMessages = () => {
    setMessages([])
    setConversation(null)
    setConversationId(null)
    setError(null)
  }

  // Function to close the auth dialog
  const handleCloseAuthDialog = () => {
    setShowAuthDialog(false)
  }

  return (
    <>
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
        <ChatFooter onSendMessage={sendMessage} onStop={handleStop} disabled={isLoading} />
      </Card>
      
      <AuthRequiredDialog 
        isOpen={showAuthDialog}
        onClose={handleCloseAuthDialog}
      />
    </>
  )
} 