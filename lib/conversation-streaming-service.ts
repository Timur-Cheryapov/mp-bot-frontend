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

interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onComplete: (
    fullContent: string,
    conversationId: string
  ) => void;
  onError: (error: Error) => void;
}

/**
 * Creates a new conversation with streaming response
 */
export async function createStreamingConversation(
  initialUserMessage: string,
  systemPrompt: string,
  callbacks: StreamCallbacks
): Promise<void> {
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
        title: 'New Conversation',
        stream: true // Enable streaming
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create conversation';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new ApiError(errorMessage, response.status);
    }

    // Process the stream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new ApiError('Stream reader not available', 500);
    }

    const decoder = new TextDecoder();
    let fullContent = '';
    let conversationId: string | null = null;

    // Process the stream chunks
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        
        // Split into SSE events
        const events = chunk.split('\n\n').filter(e => e.trim());
        
        for (const event of events) {
          // Parse event type and data
          const eventLines = event.split('\n');
          let eventType = '';
          let eventData = '';
          
          for (const line of eventLines) {
            if (line.startsWith('event: ')) {
              eventType = line.substring(7);
            } else if (line.startsWith('data: ')) {
              eventData = line.substring(6);
            }
          }
          
          // Handle different event types
          switch (eventType) {
            case 'conversationId':
              conversationId = eventData;
              break;
              
            case 'chunk':
              // The content is directly in the data field now
              fullContent += eventData;
              callbacks.onChunk(eventData);
              break;
              
            case 'end':
              // Stream has ended
              break;
          }
        }
      }

      if (!conversationId) {
        throw new ApiError('No conversation ID returned', 500);
      }

      await saveStreamResponse(conversationId, fullContent);
      
      // Callback for completion
      callbacks.onComplete(fullContent, conversationId || '');
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to create streaming conversation', 500);
  }
}

/**
 * Sends a message to an existing conversation with streaming response
 */
export async function sendStreamingMessage(
  conversationId: string,
  content: string,
  callbacks: StreamCallbacks
): Promise<void> {
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
        stream: true // Enable streaming
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      let errorMessage = 'Failed to send message';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new ApiError(errorMessage, response.status);
    }

    // Process the stream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new ApiError('Stream reader not available', 500);
    }

    const decoder = new TextDecoder();
    let fullContent = '';

    // Process the stream chunks
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        
        // Split into SSE events
        const events = chunk.split('\n\n').filter(e => e.trim());
        
        for (const event of events) {
          // Parse event type and data
          const eventLines = event.split('\n');
          let eventType = '';
          let eventData = '';
          
          for (const line of eventLines) {
            if (line.startsWith('event: ')) {
              eventType = line.substring(7);
            } else if (line.startsWith('data: ')) {
              eventData = line.substring(6);
            }
          }
          
          // Handle different event types
          switch (eventType) {
            case 'conversationId':
              conversationId = eventData;
              break;
              
            case 'chunk':
              // The content is directly in the data field now
              fullContent += eventData;
              callbacks.onChunk(eventData);
              break;
              
            case 'end':
              // Stream has ended
              break;
          }
        }
      }

      await saveStreamResponse(conversationId, fullContent);
      
      // Callback for completion
      callbacks.onComplete(fullContent, conversationId);
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to send streaming message', 500);
  }
}

/**
 * Saves the completed conversation after streaming ends
 */
export async function saveStreamResponse(
  conversationId: string,
  content: string
): Promise<void> {
  try {
    const token = await fetchCsrfToken();
    const response = await fetch(`${API_BASE_URL}/${conversationId}/save-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token
      },
      body: JSON.stringify({ content }),
      credentials: 'include'
    });

    if (!response.ok) {
      let errorMessage = 'Failed to save streamed response';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new ApiError(errorMessage, response.status);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to save streamed response', 500);
  }
}