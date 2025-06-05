import { ChatMessage, MessageStatus, MessageRole } from "@/lib/types/conversation"

// Constants
export const THINKING_MESSAGE = "Assistant is thinking..."
export const PENDING_MESSAGE_DELAY = 300

/**
 * Creates a UI message with current timestamp
 */
export function createUiMessage(
  content: string, 
  role: MessageRole, 
  status: MessageStatus,
  toolName?: string
): ChatMessage {
  return {
    role,
    content,
    status,
    timestamp: new Date().toISOString(),
    toolName
  }
}

/**
 * Updates the last message of a specific role and status in the messages array
 */
export function updateLastMessage(
  messages: ChatMessage[],
  role: MessageRole,
  status: MessageStatus,
  updates: Partial<ChatMessage>,
  toolName?: string
): ChatMessage[] {
  const updatedMessages = [...messages]
  
  for (let i = updatedMessages.length - 1; i >= 0; i--) {
    if (updatedMessages[i].role === role &&
      updatedMessages[i].status === status &&
      updatedMessages[i].toolName === toolName
    ) {
      updatedMessages[i] = {
        ...updatedMessages[i],
        ...updates,
      }
      break
    }
  }
  
  return updatedMessages
}

/**
 * Updates the last assistant message with streaming content
 */
export function updateAssistantMessageWithChunk(
  messages: ChatMessage[],
  chunk: string
): ChatMessage[] {
  const updatedMessages = [...messages]
  const lastMessage = updatedMessages[updatedMessages.length - 1]
  
  if (lastMessage && lastMessage.role === "assistant" && lastMessage.status === "pending") {
    const isFirstChunk = lastMessage.content === THINKING_MESSAGE
    updatedMessages[updatedMessages.length - 1] = {
      ...lastMessage,
      content: isFirstChunk ? chunk : lastMessage.content + chunk,
    }
  }
  
  return updatedMessages
}

/**
 * Clears thinking message from assistant message if present
 */
export function clearThinkingMessage(messages: ChatMessage[]): ChatMessage[] {
  const updatedMessages = [...messages]
  const lastMessage = updatedMessages[updatedMessages.length - 1]
  
  if (lastMessage && lastMessage.role === "assistant") {
    // If the last message is a thinking message, clear it
    if (lastMessage.content === THINKING_MESSAGE){
      updatedMessages[updatedMessages.length - 1] = {
        ...lastMessage,
        content: '',
      }
    } else {
      // If the last message is not a thinking message, set the status to success
      updatedMessages[updatedMessages.length - 1] = {
        ...lastMessage,
        status: 'success',
      }
    }
  }
  
  return updatedMessages
}

/**
 * Creates an error message for UI display
 */
export function createErrorMessage(error: any): string {
  if (error.status === 401) {
    return "Authentication required. Please sign in to continue."
  }
  
  const errorMessage = error.message || 'An error occurred'
  return `Failed to get response. ${errorMessage}`
}

/**
 * Checks if an error is an authentication error
 */
export function isAuthError(error: any): boolean {
  return error.status === 401
} 