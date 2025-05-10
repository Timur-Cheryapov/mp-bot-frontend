import { Chat } from "@/components/Chat"

export default function ChatPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 md:p-8">
      <Chat 
        title="AI Chat Assistant"
        systemPrompt="You are a friendly AI assistant. Answer shortly."
      />
    </div>
  )
} 