import { MessageStatus } from '../types/conversation';

// Types for streaming
export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onComplete: (conversationId: string) => void;
  onError: (error: Error) => void;
  onToolExecution?: (messages: ToolExecutionEvent[]) => void;
  onToolComplete?: (message: ToolCompleteEvent) => void;
}

export type ToolExecutionEvent = {
  message: string;
  toolName: string;
}

export type ToolCompleteEvent = {
  message: string;
  toolName: string;
  status: MessageStatus;
}

// Custom error class for API errors
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Parses SSE event from raw event string
 */
export function parseSSEEvent(event: string): { eventType: string; eventData: string } {
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
  
  return { eventType, eventData };
}

/**
 * Handles a single SSE event
 */
export function handleSSEEvent(
  eventType: string,
  eventData: string,
  callbacks: StreamCallbacks,
  conversationId: { current: string | null }
): boolean {
  switch (eventType) {
    case 'conversationId':
      conversationId.current = eventData;
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
        const toolData: ToolExecutionEvent[] = JSON.parse(eventData);
        if (callbacks.onToolExecution) {
          callbacks.onToolExecution(toolData);
        }
      } catch (e) {
        console.error('Error parsing tool_execution event:', e);
      }
      break;
      
    case 'tool_complete':
      try {
        const processData: ToolCompleteEvent = JSON.parse(eventData);
        if (callbacks.onToolComplete) {
          callbacks.onToolComplete(processData);
        }
      } catch (e) {
        console.error('Error parsing tool_complete event:', e);
      }
      break;
      
    case 'error':
      try {
        const errorData = JSON.parse(eventData);
        callbacks.onError(new Error(errorData.error));
        return true; // Stop processing on error
      } catch (e) {
        console.error('Error parsing error event:', e);
        callbacks.onError(new Error('Unknown error occurred'));
        return true;
      }
      
    case 'end':
      // Stream has ended
      break;
  }
  
  return false; // Continue processing
}

/**
 * Processes a stream response and handles all SSE events
 */
export async function processStream(
  response: Response,
  callbacks: StreamCallbacks
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new ApiError('Stream reader not available', 500);
  }

  const decoder = new TextDecoder();
  const conversationId = { current: null as string | null };

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
        const { eventType, eventData } = parseSSEEvent(event);
        const shouldStop = handleSSEEvent(eventType, eventData, callbacks, conversationId);
        
        if (shouldStop) {
          return conversationId.current || '';
        }
      }
    }

    if (!conversationId.current) {
      throw new ApiError('No conversation ID returned', 500);
    }

    try {
      // Callback for completion
      callbacks.onComplete(conversationId.current);
    } catch (saveError) {
      callbacks.onError(saveError instanceof Error ? saveError : new Error(String(saveError)));
      return conversationId.current;
    }
    
    return conversationId.current;
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Creates request headers with CSRF token
 */
export async function createRequestHeaders(csrfToken: string): Promise<HeadersInit> {
  return {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  };
}

/**
 * Handles API response errors
 */
export async function handleApiResponse(response: Response, defaultErrorMessage: string): Promise<void> {
  if (!response.ok) {
    let errorMessage = defaultErrorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
      errorMessage = response.statusText || errorMessage;
    }
    throw new ApiError(errorMessage, response.status);
  }
} 