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
    conversationId: string
  ) => void;
  onError: (error: Error) => void;
  onToolExecution?: (message: string, toolCalls: string[]) => void;
  onToolComplete?: (message: string) => void;
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
        errorMessage = errorData.error || errorData.message || errorMessage;
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
              try {
                // The content is now JSON-encoded to preserve newlines
                const decodedContent = JSON.parse(eventData);
                callbacks.onChunk(decodedContent);
              } catch (e) {
                console.error('Error parsing chunk:', e);
                callbacks.onChunk(eventData);
              }
              break;
              
            case 'tool_execution':
              try {
                const toolData = JSON.parse(eventData);
                if (callbacks.onToolExecution) {
                  callbacks.onToolExecution(toolData.message, toolData.toolCalls);
                }
              } catch (e) {
                console.error('Error parsing tool_execution event:', e);
              }
              break;
              
            case 'tool_complete':
              try {
                const processData = JSON.parse(eventData);
                if (callbacks.onToolComplete) {
                  callbacks.onToolComplete(processData.message);
                }
              } catch (e) {
                console.error('Error parsing tool_complete event:', e);
              }
              break;
              
            case 'error':
              try {
                const errorData = JSON.parse(eventData);
                callbacks.onError(new Error(errorData.error));
                return; // Stop processing on error
              } catch (e) {
                console.error('Error parsing error event:', e);
                callbacks.onError(new Error('Unknown error occurred'));
                return;
              }
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

      try {
        // Callback for completion
        callbacks.onComplete(conversationId || '');
      } catch (saveError) {
        callbacks.onError(saveError instanceof Error ? saveError : new Error(String(saveError)));
        return;
      }
      
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
        errorMessage = errorData.error || errorData.message || errorMessage;
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
              try {
                // The content is now JSON-encoded to preserve newlines
                const decodedContent = JSON.parse(eventData);
                callbacks.onChunk(decodedContent);
              } catch (e) {
                console.error('Error parsing chunk:', e);
                callbacks.onChunk(eventData);
              }
              break;
              
            case 'tool_execution':
              try {
                const toolData = JSON.parse(eventData);
                if (callbacks.onToolExecution) {
                  callbacks.onToolExecution(toolData.message, toolData.toolCalls);
                }
              } catch (e) {
                console.error('Error parsing tool_execution event:', e);
              }
              break;
              
            case 'tool_complete':
              try {
                const processData = JSON.parse(eventData);
                if (callbacks.onToolComplete) {
                  callbacks.onToolComplete(processData.message);
                }
              } catch (e) {
                console.error('Error parsing tool_complete event:', e);
              }
              break;
              
            case 'error':
              try {
                const errorData = JSON.parse(eventData);
                callbacks.onError(new Error(errorData.error));
                return; // Stop processing on error
              } catch (e) {
                console.error('Error parsing error event:', e);
                callbacks.onError(new Error('Unknown error occurred'));
                return;
              }
              break;
              
            case 'end':
              // Stream has ended
              break;
          }
        }
      }

      try {
        // Callback for completion
        callbacks.onComplete(conversationId);
      } catch (saveError) {
        callbacks.onError(saveError instanceof Error ? saveError : new Error(String(saveError)));
        return;
      }
      
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