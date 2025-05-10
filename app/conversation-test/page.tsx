'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Conversation } from '@/lib/types/conversation';

export default function ConversationTestPage() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [userMessage, setUserMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');

  // Create a new conversation
  const createNewConversation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Creating new conversation with system prompt:', systemPrompt);
      // TODO: Change api route to use the new conversation endpoint
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initialSystemPrompt: systemPrompt,
          initialUserMessage: userMessage,
          userId: '00000000-0000-0000-0000-000000000000',
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create conversation');
      }
      
      setConversation(data.conversation);
      setUserMessage('');
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the conversation');
    } finally {
      setIsLoading(false);
    }
  };

  // Send a message to an existing conversation
  const sendMessage = async () => {
    if (!conversation) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Sending message "${userMessage}" to conversation: ${conversation.id}`);
      // TODO: Change api route to use the new conversation id endpoint
      const response = await fetch(`/api/conversation/${conversation.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: userMessage,
          userId: '00000000-0000-0000-0000-000000000000',
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }
      
      setConversation(data.conversation);
      setUserMessage('');
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending the message');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userMessage.trim()) return;
    
    if (conversation) {
      sendMessage();
    } else {
      createNewConversation();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Conversation Test</h1>
      
      {/* System prompt input (only shown when no conversation exists) */}
      {!conversation && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">System Prompt:</label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md h-24"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            disabled={isLoading}
          />
        </div>
      )}
      
      {/* Message form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <label className="block text-sm font-medium mb-2">
          {conversation ? 'Your message:' : 'Start a conversation:'}
        </label>
        <div className="flex gap-2">
          <textarea
            className="flex-1 p-2 border border-gray-300 rounded-md"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            disabled={isLoading}
            rows={3}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !userMessage.trim()}
            className="self-end"
          >
            {isLoading ? 'Sending...' : conversation ? 'Send' : 'Start'}
          </Button>
        </div>
      </form>
      
      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-6">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {/* Conversation display */}
      {conversation && (
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="bg-gray-100 p-3 border-b border-gray-200">
            <h2 className="font-semibold">{conversation.metadata.title}</h2>
            <p className="text-xs text-gray-500">
              {new Date(conversation.metadata.updatedAt).toLocaleString()} · 
              {conversation.metadata.messageCount} messages
            </p>
          </div>
          
          <div className="divide-y divide-gray-100">
            {conversation.messages.map((message, index) => (
              <div 
                key={`msg-${index}`} 
                className={`p-4 ${
                  message.role === 'user' ? 'bg-blue-50' : 
                  message.role === 'system' ? 'bg-gray-50' : 'bg-green-50'
                }`}
              >
                <div className="flex justify-between mb-2">
                  <span className="font-medium">
                    {message.role === 'user' ? 'You' : 
                     message.role === 'system' ? 'System' : 'Assistant'}
                  </span>
                  {message.timestamp && (
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 