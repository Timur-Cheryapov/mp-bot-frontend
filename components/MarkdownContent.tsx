"use client"

import React, { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TableIcon, Maximize2, ChevronDown } from "lucide-react"

interface MarkdownContentProps {
  content: string
}

// Smart Cell Content Component
function SmartCellContent({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const textContent = React.Children.toArray(children).join('')
  const isLongContent = textContent.length > 100
  
  if (!isLongContent) {
    return <div className="break-words">{children}</div>
  }
  
  return (
    <div className="break-words">
      <div className={isExpanded ? "" : "line-clamp-3"}>
        {children}
      </div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-1 px-2 py-1 mt-1 text-xs border rounded-md bg-background hover:bg-muted transition-colors"
        aria-label={isExpanded ? 'Show less' : 'Show more'}
      >
        <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        {isExpanded ? 'Less' : 'More'}
      </button>
    </div>
  )
}

// Simplified Table Preview Component
function TablePreview({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="my-4">
      <div className="border rounded-lg bg-slate-100">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <TableIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Table Data</span>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <Maximize2 className="h-3 w-3 mr-1" />
                View Table
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] max-h-[90vh] w-auto h-auto">
              <DialogHeader>
                <DialogTitle>Table View</DialogTitle>
              </DialogHeader>
              <div className="overflow-auto max-h-[70vh]">
                <table className="w-full border-collapse">
                  {children}
                </table>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h3>,
          h4: ({ children }) => <h4 className="text-sm font-bold mb-1 mt-2 first:mt-0">{children}</h4>,
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-sm">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children }) => (
            <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="bg-muted p-3 rounded-md overflow-x-auto text-xs font-mono mb-2">{children}</pre>
          ),
          table: ({ children }) => <TablePreview>{children}</TablePreview>,
          thead: ({ children }) => (
            <thead className="bg-muted sticky top-0">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b hover:bg-muted/50">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="text-left px-3 py-2 font-semibold border-r last:border-r-0 text-sm">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-r last:border-r-0 text-sm align-top">
              <div className="max-w-xs">
                <SmartCellContent>{children}</SmartCellContent>
              </div>
            </td>
          ),
          a: ({ children, href }) => (
            <a 
              href={href} 
              className="text-primary hover:underline" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
} 