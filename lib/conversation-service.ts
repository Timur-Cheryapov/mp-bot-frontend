import { ChatMessage, Conversation } from "@/lib/types/conversation";
import { fetchCsrfToken } from './auth-service';

// Backend API URL
const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Creates a new conversation with the initial message
 */
export async function createConversation(
  initialUserMessage: string,
  systemPrompt: string,
  userId: string | null = null
): Promise<{ conversation: Conversation, messages: ChatMessage[] }> {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(`${API_BASE_URL}/conversation/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token
      },
      body: JSON.stringify({
        message: initialUserMessage,
        systemPrompt,
        userId,
        title: 'New Conversation' // Default title
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create conversation');
    }

    const data = await response.json();
    
    // Process messages to ensure timestamps are Date objects
    const processedMessages = data.history.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));

    return {
      conversation: data.conversation,
      messages: processedMessages
    };
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

/**
 * Sends a message to an existing conversation
 */
export async function sendMessage(
  conversationId: string,
  content: string,
  userId: string | null = null
): Promise<{ messages: ChatMessage[] }> {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(`${API_BASE_URL}/conversation/${conversationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token
      },
      body: JSON.stringify({
        message: content,
        userId
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to send message');
    }

    const data = await response.json();
    
    // Process messages to ensure timestamps are Date objects
    const processedMessages = data.messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));

    return {
      messages: processedMessages
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
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
    
    const response = await fetch(`${API_BASE_URL}/conversation?${queryParams}`, {
      headers: {
        'X-CSRF-Token': token
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to get conversations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
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
    const response = await fetch(`${API_BASE_URL}/conversation/${conversationId}`, {
      headers: {
        'X-CSRF-Token': token
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to get conversation');
    }

    const data = await response.json();
    
    // Process messages to ensure timestamps are Date objects
    const processedMessages = data.messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));

    return {
      conversation: data.conversation,
      messages: processedMessages
    };
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
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
    const response = await fetch(`${API_BASE_URL}/conversation/${conversationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token
      },
      body: JSON.stringify({ title }),
      credentials: 'include'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update conversation title');
    }
  } catch (error) {
    console.error('Error updating conversation title:', error);
    throw error;
  }
}

/**
 * Archives a conversation
 */
export async function archiveConversation(conversationId: string): Promise<void> {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(`${API_BASE_URL}/conversation/${conversationId}/archive`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': token
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to archive conversation');
    }
  } catch (error) {
    console.error('Error archiving conversation:', error);
    throw error;
  }
}

/**
 * Unarchives a conversation
 */
export async function unarchiveConversation(conversationId: string): Promise<void> {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(`${API_BASE_URL}/conversation/${conversationId}/unarchive`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': token
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to unarchive conversation');
    }
  } catch (error) {
    console.error('Error unarchiving conversation:', error);
    throw error;
  }
}

/**
 * Deletes a conversation
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(`${API_BASE_URL}/conversation/${conversationId}`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-Token': token
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete conversation');
    }
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
} 