"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { ChatMessage } from "@/lib/types/conversation"
import { Loader2, Settings, CheckCircle2, XCircle } from "lucide-react"

export function Message(props: ChatMessage) {
  const { content, role, status, timestamp } = props
  const isUser = role === "user"
  const isTool = role === "tool"
  
  // Icon for tool messages based on status - all in grayscale
  const getToolIcon = () => {
    switch (status) {
      case "pending":
        return <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
      case "success":
        return <CheckCircle2 className="h-3 w-3 text-gray-500" />
      case "error":
        return <XCircle className="h-3 w-3 text-gray-500" />
      default:
        return <Settings className="h-3 w-3 text-gray-500" />
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
            "px-4 py-3 shadow-sm text-sm sm:text-base break-words whitespace-pre-wrap",
            {
              "bg-primary text-primary-foreground rounded-tr-none": isUser,
              "bg-muted rounded-tl-none": !isUser,
            }
          )}
        >
          {isTool ? (
            <div className="flex items-center gap-2">
              {getToolIcon()}
              <span className="text-xs font-medium text-gray-500">
                {status === "pending" ? "Executing" : status === "success" ? "Completed" : "Failed"}
              </span>
              <span className="text-sm sm:text-base">{content}</span>
            </div>
          ) : (
            content
          )}
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
        </div>
      </div>
    </div>
  )
} 