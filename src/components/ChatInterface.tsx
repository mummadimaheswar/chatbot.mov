import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, X, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { AIService, ChatMessage } from '../services/AIService';
import { toast } from 'sonner';

interface ChatInterfaceProps {
  aiService: AIService;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ aiService }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await aiService.processChat(inputValue);
      setMessages(prev => [...prev, ...aiService.getConversationHistory().slice(-2)]);
      setInputValue('');
    } catch (error) {
      toast.error('Failed to process message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsLoading(true);
    try {
      const extractedCode = await aiService.processImage(file);
      
      // Add user message about image upload
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'user',
        content: `📷 Uploaded image: ${file.name}`,
        timestamp: new Date()
      };
      
      // Add extracted code response
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: `Here's the code I extracted from your image:\n\n${extractedCode}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage, assistantMessage]);
      toast.success('Image processed successfully!');
    } catch (error) {
      toast.error('Failed to process image');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const formatMessage = (content: string) => {
    // Simple code block detection and formatting
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)\n?```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index)
        });
      }
      
      // Add code block
      parts.push({
        type: 'code',
        language: match[1] || 'text',
        content: match[2].trim()
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex)
      });
    }
    
    return parts.length > 0 ? parts : [{ type: 'text', content }];
  };

  const renderCodeBlock = (code: string, language: string, messageId: string) => (
    <div className="relative bg-muted rounded-lg border my-2">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50 rounded-t-lg">
        <span className="text-sm font-medium text-muted-foreground">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(code, messageId)}
          className="h-8 w-8 p-0"
        >
          {copiedId === messageId ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto">
        <code className="language-python">{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div>
          <h2 className="text-lg font-semibold">AI Coding Assistant</h2>
          <p className="text-sm text-muted-foreground">
            Ask questions, generate code, debug issues, and more!
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setMessages([]);
            aiService.clearConversation();
            toast.success('Conversation cleared');
          }}
        >
          Clear Chat
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">Welcome to AI Coding Assistant!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              I can help you with code generation, debugging, explanations, and more. 
              Try asking me to write a function or explain some code!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
              <Button 
                variant="outline" 
                onClick={() => setInputValue("Write a Python function to sort a list using bubble sort")}
                className="text-left justify-start"
              >
                📝 Generate bubble sort
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setInputValue("Explain how recursion works in programming")}
                className="text-left justify-start"
              >
                🧠 Explain recursion
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setInputValue("Build a Flask REST API with authentication")}
                className="text-left justify-start"
              >
                🔧 Build Flask API
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setInputValue("Debug my JavaScript code")}
                className="text-left justify-start"
              >
                🐛 Debug code
              </Button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-lg ${
                message.type === 'user'
                  ? 'bg-primary text-primary-foreground ml-4'
                  : 'bg-card border mr-4'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium">
                  {message.type === 'user' ? 'You' : 'AI Assistant'}
                </span>
                <span className="text-xs opacity-70 ml-2">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              
              {message.type === 'assistant' ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {formatMessage(message.content).map((part, index) => (
                    <div key={index}>
                      {part.type === 'code' ? (
                        renderCodeBlock(part.content, part.language, `${message.id}-${index}`)
                      ) : (
                        <div className="whitespace-pre-wrap">{part.content}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-4 rounded-lg bg-card border mr-4">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-muted-foreground">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about coding... (Shift+Enter for new line)"
              className="min-h-[60px] pr-20 resize-none"
              disabled={isLoading}
            />
            <div className="absolute right-2 bottom-2 flex space-x-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          💡 Try: "Write a Python function", "Explain this code", "Debug my error", or upload an image of code
        </p>
      </div>
    </div>
  );
};