'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";

export default function OpenAITestPage() {
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Change api route to use the new conversation endpoint
      const response = await fetch('/api/openai/test');
      const data = await response.json();
      
      setTestResult(data);
    } catch (err: any) {
      setError(`Error testing connection: ${err.message || 'An error occurred while testing the connection'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">OpenAI API Connection Test</h1>
      
      <div className="mb-8">
        <p className="mb-4">
          This page tests the connection to OpenAI API using your configured API key.
          Click the button below to test the connection.
        </p>
        
        <Button 
          onClick={testConnection} 
          disabled={isLoading}
        >
          {isLoading ? 'Testing...' : 'Test OpenAI Connection'}
        </Button>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-6">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {testResult && (
        <div className={`p-4 ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-md`}>
          <h3 className={`text-lg font-semibold mb-2 ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
            {testResult.success ? 'Success!' : 'Connection Failed'}
          </h3>
          <p className={testResult.success ? 'text-green-600' : 'text-red-600'}>
            {testResult.message}
          </p>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Setup Instructions</h3>
        <p className="mb-2">To configure the OpenAI API:</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Create a <code className="bg-gray-100 px-1 rounded">.env.local</code> file in the project root</li>
          <li>Add your OpenAI API key: <code className="bg-gray-100 px-1 rounded">OPENAI_API_KEY=your_key_here</code></li>
          <li>Optionally add your organization ID: <code className="bg-gray-100 px-1 rounded">OPENAI_ORG_ID=your_org_id</code></li>
          <li>Restart the development server</li>
        </ol>
      </div>
    </div>
  );
} 