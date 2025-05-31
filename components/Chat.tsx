"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ChatHeader } from "@/components/ChatHeader"
import { ChatBody } from "@/components/ChatBody"
import { ChatFooter } from "@/components/ChatFooter"
import { ChatMessage, Conversation } from "@/lib/types/conversation"
import { createUiMessage } from "@/lib/utils/converters"
import * as conversationService from "@/lib/conversation-service"
import * as streamingService from "@/lib/conversation-streaming-service" 
import { useParams } from "next/navigation"
import { AuthRequiredDialog } from "@/components/AuthRequiredDialog"

const thinkingMessage = "Assistant is thinking..."

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
        
        if (err.status === 401) {
          setShowAuthDialog(true)
          setError("Authentication required")
        } else {
          setError("Failed to load conversation")
        }
        
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
  
  // Function to handle API errors
  const handleApiError = (err: any) => {
    console.error("API Error:", err); // Add logging for debugging
    
    if (err.status === 401) {
      setShowAuthDialog(true)
      setError("Authentication required")
      
      // Update the pending message to show auth error
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages]
        const lastMessage = updatedMessages[updatedMessages.length - 1]
        if (lastMessage && lastMessage.role === "assistant" && lastMessage.status === "pending") {
          updatedMessages[updatedMessages.length - 1] = {
            ...lastMessage,
            status: "error",
            content: "Authentication required. Please sign in to continue.",
          }
        }
        return updatedMessages
      })
    } else {
      const errorMessage = err.message || 'An error occurred'
      setError(errorMessage)
      
      // Update the pending message to show error
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages]
        const lastMessage = updatedMessages[updatedMessages.length - 1]
        if (lastMessage && lastMessage.role === "assistant" && lastMessage.status === "pending") {
          updatedMessages[updatedMessages.length - 1] = {
            ...lastMessage,
            status: "error",
            content: `Failed to get response. ${errorMessage}`,
          }
        }
        return updatedMessages
      })
    }
  }
  
  // Function to create a new conversation with streaming
  const createNewStreamingConversation = async (content: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Add user message to UI immediately
      const userMessage = createUiMessage(content, 'user', 'success')
      setMessages(prev => [...prev, userMessage])
      
      // Add a pending bot message that will be updated with streaming chunks
      const pendingBotMessage = createUiMessage(thinkingMessage, 'assistant', 'pending')
      setTimeout(() => {
        setMessages(prev => [...prev, pendingBotMessage])
      }, 300)
      
      await streamingService.createStreamingConversation(
        content,
        systemPrompt,
        {
          onChunk: (chunk) => {
            // Update the assistant message content as chunks arrive
            setMessages(prevMessages => {
              const updatedMessages = [...prevMessages]
              const lastMessage = updatedMessages[updatedMessages.length - 1]
              if (lastMessage && lastMessage.role === "assistant" && lastMessage.status === "pending") {
                if (lastMessage.content === thinkingMessage) {
                  updatedMessages[updatedMessages.length - 1] = {
                    ...lastMessage,
                    content: chunk,
                  }
                } else {
                  updatedMessages[updatedMessages.length - 1] = {
                    ...lastMessage,
                    content: lastMessage.content + chunk,
                  }
                }
              }
              return updatedMessages
            })
          },
          onToolExecution: (message, toolCalls) => {
            // Add a tool execution message showing which tools are being executed
            const toolMessage = createUiMessage(
              `${message}${toolCalls && toolCalls.length > 0 ? ` (${toolCalls.join(', ')})` : ''}`,
              'tool',
              'pending'
            )
            setMessages(prev => [...prev, toolMessage])
          },
          onToolComplete: (message) => {
            // Update the last tool message to completed status
            setMessages(prevMessages => {
              const updatedMessages = [...prevMessages]
              // Find the last tool message with pending status and update it
              for (let i = updatedMessages.length - 1; i >= 0; i--) {
                if (updatedMessages[i].role === 'tool' && updatedMessages[i].status === 'pending') {
                  updatedMessages[i] = {
                    ...updatedMessages[i],
                    content: message,
                    status: 'success'
                  }
                  break
                }
              }
              return updatedMessages
            })
          },
          onComplete: async (conversationId) => {
            // Fetch the updated conversation to ensure we have all data
            try {
              const result = await conversationService.getConversation(conversationId)
              setConversation(result.conversation)
              setConversationId(result.conversation.id)
              setMessages(result.messages)
            } catch (err) {
              console.error("Error fetching conversation after streaming:", err)
            }
            setIsLoading(false)
          },
          onError: (error) => {
            // Update any pending tool messages to error status
            setMessages(prevMessages => {
              const updatedMessages = [...prevMessages]
              for (let i = updatedMessages.length - 1; i >= 0; i--) {
                if (updatedMessages[i].role === 'tool' && updatedMessages[i].status === 'pending') {
                  updatedMessages[i] = {
                    ...updatedMessages[i],
                    content: `Tool execution failed: ${error.message}`,
                    status: 'error'
                  }
                  break
                }
              }
              return updatedMessages
            })
            handleApiError(error)
            setIsLoading(false)
          }
        }
      )
      
    } catch (err: any) {
      handleApiError(err)
      setIsLoading(false)
    }
  }
  
  // Function to create a new conversation (non-streaming version)
  const createNewConversation = async (content: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Add user message to UI immediately
      const userMessage = createUiMessage(content, 'user', 'success')
      setMessages(prev => [...prev, userMessage])
      
      // Add a pending bot message
      const pendingBotMessage = createUiMessage(thinkingMessage, 'assistant', 'pending')
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
                status: "success",
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
      handleApiError(err)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Function to send a streaming message to an existing conversation
  const sendStreamingMessageToConversation = async (content: string) => {
    if (!conversationId) {
      createNewStreamingConversation(content)
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Add user message to UI immediately
      const userMessage = createUiMessage(content, 'user', 'success')
      setMessages(prev => [...prev, userMessage])
      
      // Add a pending bot message that will be updated with streaming chunks
      const pendingBotMessage = createUiMessage(thinkingMessage, 'assistant', 'pending')
      setTimeout(() => {
        setMessages(prev => [...prev, pendingBotMessage])
      }, 300)
      
      await streamingService.sendStreamingMessage(
        conversationId,
        content,
        {
          onChunk: (chunk) => {
            // Update the assistant message content as chunks arrive
            setMessages(prevMessages => {
              const updatedMessages = [...prevMessages]
              const lastMessage = updatedMessages[updatedMessages.length - 1]
              if (lastMessage && lastMessage.role === "assistant" && lastMessage.status === "pending") {
                if (lastMessage.content === thinkingMessage) {
                  updatedMessages[updatedMessages.length - 1] = {
                    ...lastMessage,
                    content: chunk,
                  }
                } else {
                  updatedMessages[updatedMessages.length - 1] = {
                    ...lastMessage,
                    content: lastMessage.content + chunk,
                  }
                }
              }
              return updatedMessages
            })
          },
          onToolExecution: (message, toolCalls) => {
            // Add a tool execution message showing which tools are being executed
            const toolMessage = createUiMessage(
              `${message}${toolCalls && toolCalls.length > 0 ? ` (${toolCalls.join(', ')})` : ''}`,
              'tool',
              'pending'
            )
            setMessages(prev => [...prev, toolMessage])
          },
          onToolComplete: (message) => {
            // Update the last tool message to completed status
            setMessages(prevMessages => {
              const updatedMessages = [...prevMessages]
              // Find the last tool message with pending status and update it
              for (let i = updatedMessages.length - 1; i >= 0; i--) {
                if (updatedMessages[i].role === 'tool' && updatedMessages[i].status === 'pending') {
                  updatedMessages[i] = {
                    ...updatedMessages[i],
                    content: message,
                    status: 'success'
                  }
                  break
                }
              }
              return updatedMessages
            })
          },
          onComplete: async (conversationId) => {
            // Fetch the updated conversation to ensure we have all messages
            try {
              const result = await conversationService.getConversation(conversationId)
              setMessages(result.messages)
            } catch (err) {
              console.error("Error fetching conversation after streaming:", err)
            }
            setIsLoading(false)
          },
          onError: (error) => {
            // Update any pending tool messages to error status
            setMessages(prevMessages => {
              const updatedMessages = [...prevMessages]
              for (let i = updatedMessages.length - 1; i >= 0; i--) {
                if (updatedMessages[i].role === 'tool' && updatedMessages[i].status === 'pending') {
                  updatedMessages[i] = {
                    ...updatedMessages[i],
                    content: `Tool execution failed: ${error.message}`,
                    status: 'error'
                  }
                  break
                }
              }
              return updatedMessages
            })
            handleApiError(error)
            setIsLoading(false)
          }
        }
      )
    } catch (err: any) {
      handleApiError(err)
      setIsLoading(false)
    }
  }
  
  // Function to send a message to an existing conversation (non-streaming)
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
      const pendingBotMessage = createUiMessage(thinkingMessage, 'assistant', 'pending')
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
                status: "success",
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
      handleApiError(err)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Function to handle sending a message
  const sendMessage = (content: string) => {
    if (!content.trim()) return
    
    if (demoMode) {
      sendMessageToConversation(content)
    } else if (enableStreaming) {
      if (conversation) {
        sendStreamingMessageToConversation(content)
      } else {
        createNewStreamingConversation(content)
      }
    } else {
      if (conversation) {
        sendMessageToConversation(content)
      } else {
        createNewConversation(content)
      }
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
        <ChatFooter onSendMessage={sendMessage} disabled={isLoading} />
      </Card>
      
      <AuthRequiredDialog 
        isOpen={showAuthDialog}
        onClose={handleCloseAuthDialog}
      />
    </>
  )
} 