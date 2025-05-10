import { getExampleMessages } from "@/lib/example-chat-data"
import Link from 'next/link';

export default function Home() {
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">MP Bot</h1>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Link 
          href="/chat" 
          className="p-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Chat</h2>
          <p>Test the chat service with OpenAI (frontend and backend)</p>
        </Link>

        <Link 
          href="/conversation-test" 
          className="p-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Conversation Test</h2>
          <p>Test the conversation service with OpenAI (backend only)</p>
        </Link>

        <Link 
          href="/connection-test" 
          className="p-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Connection Test</h2>
          <p>Test the connection to the OpenAI API</p>
        </Link>
        
        <Link 
          href="/input-demo" 
          className="p-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Input Demo</h2>
          <p>Demo of input functionality (frontend only)</p>
        </Link>
      </div>
    </main>
  )
}
