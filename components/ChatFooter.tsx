"use client"

import React, { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/tailwind-cn"

// Maximum character limit for messages
const MAX_CHARS = 2000

interface ChatFooterProps {
  onSendMessage?: (message: string) => void
  disabled?: boolean
  className?: string
}

export function ChatFooter({ 
  onSendMessage, 
  disabled = false,
  className 
}: ChatFooterProps) {
  const [message, setMessage] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage?.(message.trim())
      setMessage("")
      // Focus back on input after sending
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  // Handle key press for Enter submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (message.trim()) {
        handleSubmit(e)
      }
    }
  }

  // Character count color based on limit
  const getCharCountColor = () => {
    const percent = (message.length / MAX_CHARS) * 100
    if (percent < 75) return "text-muted-foreground" 
    if (percent < 90) return "text-amber-500 dark:text-amber-400"
    return "text-red-500 dark:text-red-400"
  }

  return (
    <Card 
      className={cn(
        "border-t border-border/50 rounded-t-none p-3 sm:p-4 bg-muted/30",
        className
      )}
      role="contentinfo"
    >
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => {
                // Enforce character limit
                if (e.target.value.length <= MAX_CHARS) {
                  setMessage(e.target.value)
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full pr-16 focus-visible:ring-1 focus-visible:ring-offset-0"
              aria-label="Message input"
              autoComplete="off"
              disabled={disabled}
            />
            
            {/* Character counter */}
            {message.length > 0 && (
              <div 
                className={cn(
                  "absolute right-3 bottom-1/2 translate-y-1/2 text-xs font-mono", 
                  getCharCountColor()
                )}
              >
                {message.length}/{MAX_CHARS}
              </div>
            )}
          </div>

          {/* Send button */}
          <Button 
            type="submit"
            size="sm"
            className="px-4 h-10 flex-shrink-0"
            disabled={!message.trim() || message.length > MAX_CHARS || disabled}
          >
            Send
          </Button>
        </div>
      </form>
    </Card>
  )
} 