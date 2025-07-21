"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { ChatMessage } from "@/lib/types/conversation"
import { Loader2, CheckCircle2, XCircle, Wrench } from "lucide-react"

export function Message(props: ChatMessage) {
  const { content, role, status, timestamp } = props
  const isUser = role === "user"
  const isTool = role === "tool"

  // If the message is empty, don't render it
  if (!content) {
    return null
  }
  
  // Icon for tool messages based on status - all in grayscale
  const getToolIcon = () => {
    switch (status) {
      case "pending":
        return <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
      case "success":
        return <CheckCircle2 className="h-3 w-3 text-gray-500" />
      default:
        return <XCircle className="h-3 w-3 text-gray-500" />
    }
  }
  
  return (
    <div 
      className={cn(
        "flex w-full mb-4",
        "animate-in fade-in slide-in-from-bottom-5 duration-300",
        {
          "justify-end": isUser,
          "justify-start": !isUser,
        }
      )}
    >
      <div className={cn(
        "flex flex-col max-w-[85%] sm:max-w-[75%]",
        isUser ? "items-end" : "items-start"
      )}>
        <Card 
          className={cn(
            "w-full px-4 py-3 shadow-sm text-sm sm:text-base break-words whitespace-pre-wrap overflow-hidden",
            {
              "bg-primary text-primary-foreground rounded-tr-none": isUser,
              "bg-muted rounded-tl-none": !isUser,
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
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </time>
          
          {status !== "success" && !isTool && (
            <div className="ml-2">
              {status === "pending" && (
                <span className="animate-pulse">●</span>
              )}
              {status === "error" && (
                <span className="text-destructive">!</span>
              )}
            </div>
          )}
          {isTool && (
            <>
              <div className="ml-2">
                {<Wrench className="h-3 w-3 text-gray-500" />}
              </div>
              <div className="ml-2">
                {getToolIcon()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 