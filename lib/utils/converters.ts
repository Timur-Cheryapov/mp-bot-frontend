import { ChatMessage, MessageRole, MessageStatus } from "../types/conversation";

/**
 * Creates a UI-friendly message suitable for components
 * @param content The message content
 * @param role The message role
 * @param status The message status
 * @returns A message object suitable for UI components
 */
export function createUiMessage(
  content: string,
  role: MessageRole = 'user',
  status: MessageStatus = 'success'
): ChatMessage {
  // Return a simpler ChatMessage with just what's needed for UI
  return {
    role,
    content,
    status,
    timestamp: new Date()
  };
}