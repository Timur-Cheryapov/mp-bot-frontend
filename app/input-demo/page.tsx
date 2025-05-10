import { Chat } from "@/components/Chat"
import { ChatMessage} from "@/lib/types/conversation"
import { getExampleMessages } from "@/lib/example-chat-data"

export default function InputDemo() {
  // Server component code
  const initialMessages: ChatMessage[] = getExampleMessages()
  const systemPrompt = "You are a helpful AI assistant that provides concise, accurate responses."
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4 md:p-8">
      <Chat 
        initialMessages={initialMessages}
        title="Message Input Demo"
        systemPrompt={systemPrompt}
        demoMode={true}
      />
    </div>
  )
} 