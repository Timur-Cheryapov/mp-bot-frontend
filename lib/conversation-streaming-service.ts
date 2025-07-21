import { fetchCsrfToken } from './auth-service';
import {
  StreamCallbacks,
  ToolExecutionEvent,
  ToolCompleteEvent,
  ApiError,
  processStream,
  createRequestHeaders,
  handleApiResponse
} from './utils/streaming-helpers';

// Define the base API URL for conversation service
const API_BASE_URL = 'http://localhost:3001/api/conversation';

/**
 * Creates request body for streaming operations
 */
function createRequestBody(
  message: string,
  systemPrompt?: string,
  isNewConversation: boolean = false
): object {
  const baseBody = {
    message,
    stream: true
  };

  if (isNewConversation) {
    return {
      ...baseBody,
      systemPrompt,
      title: 'New Conversation'
    };
  }

  return baseBody;
}

/**
 * Unified function to handle streaming messages (both new conversations and existing ones)
 */
async function streamMessage(
  endpoint: string,
  message: string,
  callbacks: StreamCallbacks,
  systemPrompt?: string,
  isNewConversation: boolean = false,
  abortController?: AbortController
): Promise<void> {
  try {
    const token = await fetchCsrfToken();
    const headers = await createRequestHeaders(token);
    const body = createRequestBody(message, systemPrompt, isNewConversation);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
      signal: abortController?.signal
    });

    const defaultErrorMessage = isNewConversation 
      ? 'Failed to create conversation' 
      : 'Failed to send message';
    
    await handleApiResponse(response, defaultErrorMessage);
    await processStream(response, callbacks, abortController);
    
  } catch (error) {
    // Handle abort gracefully - don't throw error for user-initiated stops
    if (error instanceof Error && error.name === 'AbortError') {
      return; // Silent return on abort
    }
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    const defaultErrorMessage = isNewConversation
      ? 'Failed to create streaming conversation'
      : 'Failed to send streaming message';
    
    throw new ApiError(defaultErrorMessage, 500);
  }
}

/**
 * Sends a message with streaming response
 * If conversationId is provided, sends to existing conversation
 * If conversationId is null/undefined, creates a new conversation
 */
export async function sendStreamingMessage(
  message: string,
  callbacks: StreamCallbacks,
  conversationId?: string | null,
  systemPrompt?: string,
  abortController?: AbortController
): Promise<void> {
  const isNewConversation = !conversationId;
  const endpoint = isNewConversation 
    ? `${API_BASE_URL}/`
    : `${API_BASE_URL}/${conversationId}`;
  
  await streamMessage(endpoint, message, callbacks, systemPrompt, isNewConversation, abortController);
}