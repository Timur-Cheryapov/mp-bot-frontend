'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { checkAuthStatus } from '@/lib/auth-service';
import { fetchMetrics, resetMetrics } from '@/lib/metrics-service';
import { sendChatMessage, sendConversationMessage, Message } from '@/lib/conversation-test-service';
import { AlertCircle, XCircle, RefreshCw, UserCircle, MessageCircle, Send } from 'lucide-react';

export default function ConversationTestPage() {
  // Chat state
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  
  // Conversation state
  const [conversationMessage, setConversationMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [conversationError, setConversationError] = useState<string | null>(null);
  
  // Metrics state
  const [metrics, setMetrics] = useState<any>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  
  // User state
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // System prompt
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.');
  
  // Load user auth status and metrics on page load
  useEffect(() => {
    checkUserAuthStatus();
    fetchMetricsData();
  }, []);
  
  // Check user authentication status
  const checkUserAuthStatus = async () => {
    try {
      const { isAuthenticated, user } = await checkAuthStatus();
      setIsAuthenticated(isAuthenticated);
      
      if (isAuthenticated && user) {
        setUserId(user.id);
      } else {
        setUserId(null);
        setMetricsError('Not authenticated. Some features may be limited.');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setMetricsError('Failed to verify authentication status.');
      setUserId(null);
      setIsAuthenticated(false);
    }
  };
  
  // Fetch metrics from the backend
  const fetchMetricsData = async () => {
    try {
      setMetricsLoading(true);
      setMetricsError(null);
      const data = await fetchMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setMetricsError(error instanceof Error ? error.message : 'Failed to fetch metrics');
    } finally {
      setMetricsLoading(false);
    }
  };
  
  // Reset metrics
  const handleResetMetrics = async () => {
    try {
      setMetricsLoading(true);
      setMetricsError(null);
      await resetMetrics();
      await fetchMetricsData(); // Refresh metrics after reset
    } catch (error) {
      console.error('Error resetting metrics:', error);
      setMetricsError(error instanceof Error ? error.message : 'Failed to reset metrics');
    } finally {
      setMetricsLoading(false);
    }
  };
  
  // Send a single chat message
  const handleSendChatMessage = async () => {
    if (!chatMessage.trim()) return;
    
    try {
      setChatLoading(true);
      setChatError(null);
      const data = await sendChatMessage(chatMessage, systemPrompt);
      setChatResponse(data.response);
      
      // Refresh metrics after chat
      await fetchMetricsData();
    } catch (error) {
      console.error('Error sending chat message:', error);
      setChatError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setChatLoading(false);
    }
  };
  
  // Send a conversation message
  const handleSendConversationMessage = async () => {
    if (!conversationMessage.trim()) return;
    
    try {
      setConversationLoading(true);
      setConversationError(null);
      
      const data = await sendConversationMessage({
        message: conversationMessage,
        systemPrompt,
        conversationId,
        userId,
        history: conversationHistory
      });
      
      setConversationHistory(data.history);
      setConversationId(data.conversationId);
      
      // Refresh metrics after conversation
      await fetchMetricsData();
      
      // Clear the message input
      setConversationMessage('');
    } catch (error) {
      console.error('Error sending conversation message:', error);
      setConversationError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setConversationLoading(false);
    }
  };
  
  // Clear conversation history
  const clearConversation = () => {
    setConversationHistory([]);
    setConversationId(null);
    setConversationError(null);
  };
  
  // Clear error messages
  const clearError = (type: 'chat' | 'conversation' | 'metrics') => {
    if (type === 'chat') setChatError(null);
    else if (type === 'conversation') setConversationError(null);
    else if (type === 'metrics') setMetricsError(null);
  };
  
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex flex-col gap-6">
        {/* Header with User Info */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">API Testing Dashboard</h1>
            <p className="text-muted-foreground mt-1">Test and monitor API interactions</p>
          </div>
          
          <Card className="w-full md:w-[400px] bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
            <CardContent className="p-4 flex items-center gap-3 justify-between">
              <div className="bg-white p-2 rounded-full shadow-sm">
                <UserCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </p>
                <p className="text-xs text-muted-foreground max-w-[300px]">
                  {isAuthenticated ? userId : 'Please sign in'}
                </p>
              </div>
              {!isAuthenticated && (
                <Button size="sm" variant="outline" onClick={checkUserAuthStatus}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Retry
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {(metricsError || chatError || conversationError) && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  {metricsError && (
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-red-600 dark:text-red-400">{metricsError}</p>
                      <Button size="sm" variant="ghost" onClick={() => clearError('metrics')} className="h-6 w-6 p-0">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {chatError && (
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-red-600 dark:text-red-400">{chatError}</p>
                      <Button size="sm" variant="ghost" onClick={() => clearError('chat')} className="h-6 w-6 p-0">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {conversationError && (
                    <div className="flex justify-between items-center">
                      <p className="text-red-600 dark:text-red-400">{conversationError}</p>
                      <Button size="sm" variant="ghost" onClick={() => clearError('conversation')} className="h-6 w-6 p-0">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Metrics + System Prompt */}
          <div className="lg:col-span-4 space-y-6">
            {/* Metrics Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>Metrics</span>
                  <Badge variant={metricsLoading ? "outline" : "secondary"} className="ml-2">
                    {metricsLoading ? "Loading..." : "Live"}
                  </Badge>
                </CardTitle>
                <CardDescription>Token usage and cost stats</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-md p-3">
                    <h3 className="text-xs font-semibold text-muted-foreground mb-1">Input Tokens</h3>
                    <p className="text-xl font-bold">
                      {metrics ? metrics.inputTokens.toLocaleString() : "0"}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-md p-3">
                    <h3 className="text-xs font-semibold text-muted-foreground mb-1">Output Tokens</h3>
                    <p className="text-xl font-bold">
                      {metrics ? metrics.outputTokens.toLocaleString() : "0"}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-md p-3">
                    <h3 className="text-xs font-semibold text-muted-foreground mb-1">Total Tokens</h3>
                    <p className="text-xl font-bold">
                      {metrics 
                        ? (metrics.inputTokens + metrics.outputTokens).toLocaleString() 
                        : "0"}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-md p-3">
                    <h3 className="text-xs font-semibold text-muted-foreground mb-1">Estimated Cost</h3>
                    <p className="text-xl font-bold">
                      ${metrics ? metrics.estimatedCost.toFixed(6) : "0.000000"}
                    </p>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground mt-4">
                  Last updated: {metrics ? new Date(metrics.timestamp).toLocaleTimeString() : "-"}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 pt-0">
                <Button 
                  className="flex-1" 
                  variant="outline" 
                  size="sm"
                  onClick={fetchMetricsData}
                  disabled={metricsLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${metricsLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button 
                  className="flex-1" 
                  variant="destructive" 
                  size="sm"
                  onClick={handleResetMetrics}
                  disabled={metricsLoading}
                >
                  Reset
                </Button>
              </CardFooter>
            </Card>
            
            {/* System Prompt */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>System Prompt</CardTitle>
                <CardDescription>Configure the AI system message</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter system prompt..."
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Chat Interfaces */}
          <div className="lg:col-span-8">
            <Card className="h-full">
              <CardHeader className="pb-0">
                <Tabs defaultValue="conversation" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="chat">Simple Chat</TabsTrigger>
                    <TabsTrigger value="conversation">Conversation</TabsTrigger>
                  </TabsList>
                  
                  {/* Simple Chat Tab */}
                  <TabsContent value="chat" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div>
                        <Textarea
                          placeholder="Type your message..."
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                      <Button 
                        onClick={handleSendChatMessage} 
                        className="w-full"
                        disabled={!chatMessage.trim() || chatLoading}
                      >
                        {chatLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                      
                      {chatResponse && (
                        <div className="mt-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary">Response</Badge>
                          </div>
                          <Card className="border-slate-200 bg-slate-50">
                            <CardContent className="p-4">
                              <p className="whitespace-pre-wrap">{chatResponse}</p>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  {/* Conversation Tab */}
                  <TabsContent value="conversation" className="mt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="text-sm font-medium whitespace-nowrap">Conversation ID:</div>
                      <Input
                        value={conversationId || 'new'}
                        onChange={(e) => setConversationId(e.target.value)}
                        className="max-w-[300px] h-8 text-sm"
                      />
                    </div>
                    
                    <ScrollArea className="h-[300px] rounded-md border p-4 mb-4 bg-slate-50">
                      {conversationHistory.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <div className="text-center">
                            <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                            <p>No messages yet. Start a conversation!</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {conversationHistory.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] rounded-lg p-3 ${
                                msg.role === 'user' 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-white border border-slate-200 shadow-sm'
                              }`}>
                                <div className="flex items-center mb-1">
                                  <Badge variant={msg.role === 'user' ? "default" : "outline"} className="text-xs px-2 py-0">
                                    {msg.role === 'user' ? 'You' : 'AI Assistant'}
                                  </Badge>
                                </div>
                                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                    
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Type your message..."
                        value={conversationMessage}
                        onChange={(e) => setConversationMessage(e.target.value)}
                        className="min-h-[100px]"
                      />
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSendConversationMessage} 
                          className="flex-1"
                          disabled={!conversationMessage.trim() || conversationLoading}
                        >
                          {conversationLoading ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={clearConversation}
                          disabled={conversationHistory.length === 0}
                        >
                          Clear Conversation
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardHeader>
              <CardContent>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 