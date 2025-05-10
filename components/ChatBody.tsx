"use client"

import React, { useEffect, useRef } from "react"
import { Message } from "./Message"
import { ChatMessage } from "@/lib/types/conversation"

interface ChatBodyProps {
  messages: ChatMessage[]
}

export function ChatBody({ messages }: ChatBodyProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])
  
  return (
    <div 
      className="flex-1 overflow-y-auto p-3 sm:p-4 scroll-smooth scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-muted-foreground/10 scrollbar-track-transparent"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <p>Send a message to start the conversation</p>
        </div>
      ) : (
        messages.map((message, index) => (
          <Message 
            key={`msg-${message.role}-${message.content.substring(0, 10)}-${index}`}
            {...message}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  )
} 