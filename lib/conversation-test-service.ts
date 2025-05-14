import { fetchCsrfToken } from './auth-service';

// Backend API URL - Change this to match your actual backend URL
const API_URL = 'http://localhost:3001/api';

/**
 * Interface for a message in a conversation
 */
export interface Message {
  role: string;
  content: string;
}

/**
 * Sends a single chat message
 */
export async function sendChatMessage(message: string, systemPrompt: string) {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(`${API_URL}/prompt-demo/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token
      },
      body: JSON.stringify({
        message,
        systemPrompt,
      }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

/**
 * Sends a message as part of a conversation
 */
export async function sendConversationMessage({
  message,
  systemPrompt,
  conversationId,
  userId,
  history
}: {
  message: string;
  systemPrompt: string;
  conversationId: string | null;
  userId: string | null;
  history: Message[];
}) {
  if (!userId) {
    throw new Error('User ID is required for conversation');
  }
  
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(`${API_URL}/prompt-demo/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token
      },
      body: JSON.stringify({
        message,
        systemPrompt,
        conversationId,
        userId,
        history,
      }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Conversation request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending conversation message:', error);
    throw error;
  }
} 