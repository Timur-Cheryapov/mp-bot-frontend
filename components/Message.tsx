"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { ChatMessage } from "@/lib/types/conversation"
import { Loader2, CheckCircle2, XCircle, Wrench, ChevronDown, ChevronUp } from "lucide-react"
import { MarkdownContent } from "@/components/MarkdownContent"

export function Message(props: ChatMessage) {
  const { content, role, status, timestamp } = props
  const isUser = role === "user"
  const isTool = role === "tool"
  const [isExpanded, setIsExpanded] = useState(false)

  // If the message is empty, don't render it
  if (!content) {
    return null
  }

  // Parse tool metadata from JSON content
  const getToolMetadata = () => {
    if (!isTool) return null
    try {
      const parsed = JSON.parse(content)
      return {
        endpoint: parsed.metadata?.endpoint || "unknown_tool",
        fullJson: parsed
      }
    } catch {
      return {
        endpoint: "Calling tool...",
        fullJson: content
      }
    }
  }

  const toolMetadata = getToolMetadata()
  
  // Icon for tool messages based on status - all in grayscale
  const getToolIcon = () => {
    switch (status) {
      case "pending":
        return <Loader2 className="h-3 w-3 animate-spin" />
      case "success":
        return <CheckCircle2 className="h-3 w-3" />
      default:
        return <XCircle className="h-3 w-3" />
    }
  }

  // Format JSON content for display
  const formatJsonContent = (jsonData: any) => {
    try {
      return JSON.stringify(jsonData, null, 2)
    } catch {
      return jsonData
    }
  }

  // Render tool message with collapsible functionality
  if (isTool) {
    return (
      <div className="flex w-full mb-4 animate-in fade-in slide-in-from-bottom-5 duration-300 justify-start">
        <div className="flex flex-col max-w-[85%] sm:max-w-[75%] items-start">
          <Card className="w-full shadow-sm text-sm sm:text-base break-words overflow-hidden p-0 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 gap-0">
            {/* Tool Header - Always Visible */}
            <div 
              className="flex items-center justify-between w-full min-h-[40px] px-4 py-4 bg-gray-200 dark:bg-gray-800 rounded-t-md cursor-pointer transition-colors gap-1"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex items-center space-x-2 flex-1">
                <Wrench className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                  {toolMetadata?.endpoint}
                </span>
                {getToolIcon()}
              </div>
              <div className="flex items-center">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </div>
            </div>
            
            {/* Expandable Content */}
            {isExpanded && (
              <div className="border-t border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-b-md">
                <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap overflow-x-auto">
                  {formatJsonContent(toolMetadata?.fullJson)}
                </pre>
              </div>
            )}
          </Card>
          
          <div className="flex items-center text-xs text-muted-foreground mt-1 justify-start">
            <time className="text-[10px] sm:text-xs">
              {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </time>
          </div>
        </div>
      </div>
    )
  }
  
  // Regular message rendering for user/assistant messages
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
            "w-full px-4 py-3 shadow-sm text-sm sm:text-base break-words overflow-hidden",
            {
              "bg-primary text-primary-foreground rounded-tr-none": isUser,
              "bg-muted rounded-tl-none": !isUser,
            }
          )}
        >
          <MarkdownContent content={content} />
        </Card>
        
        <div className={cn(
          "flex items-center text-xs text-muted-foreground mt-1",
          isUser ? "justify-end" : "justify-start"
        )}>
          <time className="text-[10px] sm:text-xs">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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