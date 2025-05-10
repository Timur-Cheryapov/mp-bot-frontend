"use client"

import React from "react"
import { cn } from "@/lib/utils/tailwind-cn"
import { Card } from "@/components/ui/card"
import { ChatMessage } from "@/lib/types/conversation"

export function Message(props: ChatMessage) {
  const { content, role, status, timestamp } = props
  const isUser = role === "user"
  
  return (
    <div 
      className={cn(
        "flex w-full mb-4",
        "animate-in fade-in slide-in-from-bottom-5 duration-300",
        {
          "justify-end": isUser,
          "justify-start": !isUser,
          "opacity-50": status === "pending",
        }
      )}
    >
      <div className={cn(
        "flex flex-col max-w-[85%] sm:max-w-[75%]",
        isUser ? "items-end" : "items-start"
      )}>
        <Card 
          className={cn(
            "px-4 py-3 shadow-sm text-sm sm:text-base break-words",
            {
              "bg-primary text-primary-foreground rounded-tr-none": isUser,
              "bg-muted rounded-tl-none": !isUser && role === "assistant",
              "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100": role === "system"
            }
          )}
        >
          {content}
        </Card>
        
        <div className={cn(
          "flex items-center text-xs text-muted-foreground mt-1",
          isUser ? "justify-end" : "justify-start"
        )}>
          <time className="text-[10px] sm:text-xs">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </time>
          
          {status !== "success" && (
            <div className="ml-2">
              {status === "pending" && (
                <span className="animate-pulse">●</span>
              )}
              {status === "error" && (
                <span className="text-destructive">!</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 