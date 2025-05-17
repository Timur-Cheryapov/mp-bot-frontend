"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatHeaderProps {
  title?: string
  className?: string
  onClear?: () => void
}

export function ChatHeader({ 
  title = "Chat", 
  className,
  onClear
}: ChatHeaderProps) {
  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-2 border-b", 
      className
    )}>
      <h2 className="text-lg font-medium truncate">{title}</h2>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClear}
          title="Clear conversation"
          aria-label="Clear conversation"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 