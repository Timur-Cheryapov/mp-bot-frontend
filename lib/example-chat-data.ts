import { ChatMessage, MessageRole, MessageStatus } from "@/lib/types/conversation"

export function getExampleMessages(): ChatMessage[] {
  return [
    {
      role: "assistant" as MessageRole,
      content: "Hello! How can I help you today?",
      status: "success" as MessageStatus,
      timestamp: new Date(Date.now() - 60000 * 5), // 5 minutes ago
    },
    {
      role: "user" as MessageRole,
      content: "I'm looking for information about your services. Can you tell me more? (this message should show an error)",
      status: "error" as MessageStatus,
      timestamp: new Date(Date.now() - 60000 * 4), // 4 minutes ago
    },
    {
      role: "assistant" as MessageRole,
      content: "Of course! We specialize in AI-powered chat solutions for businesses. Our platform offers seamless integration, customizable interfaces, and advanced analytics.",
      status: "success" as MessageStatus,
      timestamp: new Date(Date.now() - 60000 * 3), // 3 minutes ago
    },
    {
      role: "user" as MessageRole,
      content: "That sounds interesting. How much does it cost?",
      status: "success" as MessageStatus,
      timestamp: new Date(Date.now() - 60000 * 2), // 2 minutes ago
    },
    {
      role: "assistant" as MessageRole,
      content: "We have several pricing tiers starting at $29/month for basic features. Would you like me to send you our full pricing information?",
      status: "success" as MessageStatus,
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
    }
  ]
} 