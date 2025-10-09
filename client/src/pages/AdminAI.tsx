import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bot,
  Send,
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  Loader2
} from "lucide-react";

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIResponse {
  success: boolean;
  message?: string;
  response?: string;
  error?: string;
}

export default function AdminAI() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [contentTopic, setContentTopic] = useState("");
  const [contentType, setContentType] = useState("blog-post");
  const [contentLength, setContentLength] = useState("medium");
  const [autoFallback, setAutoFallback] = useState(false);
  const [priorityModelsRaw, setPriorityModelsRaw] = useState('');

  useEffect(() => {
    fetchAvailableModels();
    fetchAiSettings();
  }, []);

  const fetchAiSettings = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch('/api/admin/ai/settings/settings', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setAutoFallback(!!(data.AGENT_AUTO_FALLBACK || data.agentAutoFallback));
        setPriorityModelsRaw(data.GEMINI_PRIORITY_MODELS || data.geminiPriorityModels || '');
      }
    } catch (e) {}
  };

  const saveAiSettings = async () => {
    const token = getAuthToken();
    if (!token) return alert('login as admin');
    const payload = {
      AGENT_AUTO_FALLBACK: autoFallback,
      GEMINI_PRIORITY_MODELS: priorityModelsRaw,
    };
    const res = await fetch('/api/admin/ai/settings/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
    if (res.ok) alert('Settings saved'); else alert('Failed to save settings');
  };

  const getAuthToken = () => {
    return localStorage.getItem('admin_token') || localStorage.getItem('token');
  };

  const fetchAvailableModels = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch('/api/admin/ai/models', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableModels(data.models || []);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const token = getAuthToken();
    if (!token) {
      alert('Please login as admin first');
      return;
    }

    setLoading(true);
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");

    try {
      const response = await fetch('/api/admin/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: currentInput }]
        })
      });

      const data: AIResponse = await response.json();

      if (data.success && data.response) {
        const aiMessage: AIMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage: AIMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${data.error || data.message || 'Unknown error occurred'}`,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async () => {
    if (!contentTopic.trim()) return;

    const token = getAuthToken();
    if (!token) {
      alert('Please login as admin first');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: `Generate a ${contentLength} ${contentType} about: ${contentTopic}. Make it engaging and well-structured.`
        })
      });

      const data: AIResponse = await response.json();

      if (data.success && data.response) {
        const generatedMessage: AIMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `**Generated ${contentType} on "${contentTopic}"**\n\n${data.response}`,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, generatedMessage]);
        setContentTopic("");
      } else {
        alert(`Error: ${data.error || data.message || 'Failed to generate content'}`);
      }
    } catch (error) {
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="h-8 w-8 text-blue-600" />
            AI Assistant Dashboard
          </h1>
          <p className="mt-2 text-gray-600">Interact with AI agents and generate content</p>
        </div>

        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList>
            <TabsTrigger value="chat">AI Chat</TabsTrigger>
            <TabsTrigger value="generate">Content Generator</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  AI Chat Assistant
                </CardTitle>
                <CardDescription>
                  Chat with AI for admin assistance, content ideas, and blog management help
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Model Selection */}
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium">AI Model:</label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.length > 0 ? (
                          availableModels.map(model => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                            <SelectItem value="gemini-pro-vision">Gemini Pro Vision</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Chat Messages */}
                  <div className="h-96 border rounded-lg p-4 overflow-y-auto bg-white">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-16">
                        <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Start a conversation with the AI assistant</p>
                        <p className="text-sm mt-2">Ask for help with blog management, content ideas, or admin tasks</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 ${
                              message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <div className="whitespace-pre-wrap">{message.content}</div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs opacity-70">
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => copyToClipboard(message.content, message.id)}
                                >
                                  {copied === message.id ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask the AI assistant anything..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={loading}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={loading || !input.trim()}>
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Content Generator
                </CardTitle>
                <CardDescription>
                  Generate blog posts, articles, and content using AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Topic</label>
                      <Input
                        value={contentTopic}
                        onChange={(e) => setContentTopic(e.target.value)}
                        placeholder="Enter topic or subject..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Content Type</label>
                      <Select value={contentType} onValueChange={setContentType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blog-post">Blog Post</SelectItem>
                          <SelectItem value="tutorial">Tutorial</SelectItem>
                          <SelectItem value="guide">Guide</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="news">News Article</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Length</label>
                      <Select value={contentLength} onValueChange={setContentLength}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short (300-500 words)</SelectItem>
                          <SelectItem value="medium">Medium (800-1200 words)</SelectItem>
                          <SelectItem value="long">Long (1500+ words)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">AI Model</label>
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableModels.length > 0 ? (
                            availableModels.map(model => (
                              <SelectItem key={model} value={model}>{model}</SelectItem>
                            ))
                          ) : (
                            <>
                              <SelectItem value="gpt-4">GPT-4</SelectItem>
                              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={generateContent}
                    disabled={loading || !contentTopic.trim()}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Generating Content...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Content
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Settings</CardTitle>
                <CardDescription>Configure AI integration settings</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    AI settings are configured in your environment variables.
                    Contact your system administrator to modify AI provider settings.
                  </AlertDescription>
                </Alert>

                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Current AI Provider</label>
                      <p className="text-sm text-gray-600">Google Gemini</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Available Models</label>
                      <p className="text-sm text-gray-600">
                        {availableModels.length > 0 ? availableModels.join(', ') : 'Loading...'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-medium">Auto fallback to mock on failure</label>
                    <div className="flex items-center gap-3 mt-2">
                      <input type="checkbox" checked={autoFallback} onChange={(e) => setAutoFallback(e.target.checked)} />
                      <p className="text-sm text-gray-600">When enabled, the agent will insert mock articles if the AI call fails.</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-medium">Priority model mapping (JSON or CSV)</label>
                    <Textarea value={priorityModelsRaw} onChange={(e) => setPriorityModelsRaw(e.target.value)} placeholder='e.g. {"entrance":"gemini-2.5-pro","default":"gemini-1.5-flash"}' />
                    <p className="text-sm text-gray-500 mt-2">You can provide JSON mapping or CSV key:model pairs like "entrance:gemini-2.5-pro,default:gemini-1.5-flash"</p>
                  </div>

                  <div className="mt-4">
                    <Button onClick={saveAiSettings}>Save AI Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}