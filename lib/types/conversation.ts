/**
 * Type definitions for the conversation service
 * Defines all types used for conversation management
 */
export type MessageStatus = 'pending' | 'success' | 'error';

/**
 * Simple message object for UI and API communication
 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
  status: MessageStatus;
  timestamp: Date;  // Add timestamp directly to ChatMessage
}

/**
 * The role of a participant in a conversation
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * Unique identifier for a conversation
 */
export type ConversationId = string;

/**
 * Status of a conversation
 */
export type ConversationStatus = 'active' | 'archived' | 'deleted';

/**
 * Model settings for a conversation
 */
export interface ConversationModelSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
}

/**
 * Metadata for a conversation
 */
export interface ConversationMetadata {
  createdAt: Date;
  updatedAt: Date;
  title?: string;
  description?: string;
  tags?: string[];
  userId: string;  // Required
  tokenCount: number;
  messageCount: number;
}

/**
 * A conversation between a user and the AI
 */
export interface Conversation {
  id: ConversationId;
  messages: ChatMessage[];
  status: ConversationStatus;
  modelSettings: ConversationModelSettings;
  metadata: ConversationMetadata;
}

/**
 * Parameters for creating a new conversation
 */
export interface CreateConversationParams {
  initialSystemPrompt?: string;
  initialUserMessage?: string;
  title?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  userId: string;  // Required
  tags?: string[];
}

/**
 * Parameters for adding a message to a conversation
 */
export interface AddMessageParams {
  conversationId: ConversationId;
  content: string;
  role: MessageRole;
  userId: string;  // Required
}

/**
 * Options for retrieving conversations
 */
export interface GetConversationsOptions {
  userId?: string;
  status?: ConversationStatus;
  tags?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Response when retrieving conversations
 */
export interface GetConversationsResponse {
  conversations: Conversation[];
  total: number;
  hasMore: boolean;
} 