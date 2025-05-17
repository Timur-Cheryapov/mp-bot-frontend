import { ChatMessage, Conversation } from "@/lib/types/conversation";
import { fetchCsrfToken } from './auth-service';

// Define the base API URL for conversation service
const API_BASE_URL = 'http://localhost:3001/api/conversation';

// Custom error class for API errors
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Function to handle API responses
async function handleResponse(response: Response) {
  if (response.ok) {
    return response.json();
  }
  
  // Handle unauthorized errors specifically
  if (response.status === 401) {
    throw new ApiError('Authentication required', 401);
  }
  
  // Handle other error types
  let errorMessage = 'An error occurred';
  try {
    const errorData = await response.json();
    errorMessage = errorData.message || errorMessage;
  } catch (e) {
    // If parsing fails, use status text
    errorMessage = response.statusText || errorMessage;
  }
  
  throw new ApiError(errorMessage, response.status);
}

/**
 * Creates a new conversation with the initial message
 */
export async function createConversation(
  initialUserMessage: string,
  systemPrompt: string,
): Promise<{ conversation: Conversation, messages: ChatMessage[] }> {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(`${API_BASE_URL}/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token
      },
      body: JSON.stringify({
        message: initialUserMessage,
        systemPrompt,
        title: 'New Conversation' // Default title
      }),
      credentials: 'include'
    });

    return handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to create conversation', 500);
  }
}

/**
 * Sends a message to an existing conversation
 */
export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<{ messages: ChatMessage[] }> {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(`${API_BASE_URL}/${conversationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token
      },
      body: JSON.stringify({
        message: content,
      }),
      credentials: 'include'
    });

    return handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to send message', 500);
  }
}

/**
 * Gets all conversations for the current user
 */
export async function getConversations(
  includeArchived: boolean = false,
  limit: number = 20,
  offset: number = 0
): Promise<{ conversations: Conversation[] }> {
  try {
    const token = await fetchCsrfToken();
    const queryParams = new URLSearchParams({
      includeArchived: String(includeArchived),
      limit: String(limit),
      offset: String(offset)
    });
    
    const response = await fetch(`${API_BASE_URL}?${queryParams}`, {
      headers: {
        'X-CSRF-Token': token
      },
      credentials: 'include'
    });

    return handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to get conversations', 500);
  }
}

/**
 * Gets a specific conversation with its messages
 */
export async function getConversation(
  conversationId: string
): Promise<{ conversation: Conversation, messages: ChatMessage[] }> {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(`${API_BASE_URL}/${conversationId}`, {
      headers: {
        'X-CSRF-Token': token
      },
      credentials: 'include'
    });
    
    return handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to get conversation', 500);
  }
}

/**
 * Updates a conversation's title
 */
export async function updateConversationTitle(
  conversationId: string, 
  title: string
): Promise<void> {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(`${API_BASE_URL}/${conversationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token
      },
      body: JSON.stringify({ title }),
      credentials: 'include'
    });

    return handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to update conversation title', 500);
  }
}

/**
 * Archives a conversation
 */
export async function archiveConversation(conversationId: string): Promise<void> {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(`${API_BASE_URL}/${conversationId}/archive`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': token
      },
      credentials: 'include'
    });

    return handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to archive conversation', 500);
  }
}

/**
 * Unarchives a conversation
 */
export async function unarchiveConversation(conversationId: string): Promise<void> {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(`${API_BASE_URL}/${conversationId}/unarchive`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': token
      },
      credentials: 'include'
    });

    return handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to unarchive conversation', 500);
  }
}

/**
 * Deletes a conversation
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(`${API_BASE_URL}/${conversationId}`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': token
      },
      credentials: 'include'
    });

    return handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to delete conversation', 500);
  }
} 