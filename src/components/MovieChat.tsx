import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Send, Bot, User, Copy, Star, Sparkles, Zap, Heart } from 'lucide-react';
import { MovieService } from '../services/MovieService';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'quote' | 'character' | 'recommendation' | 'normal';
  mood?: 'excited' | 'dramatic' | 'wise' | 'funny';
}

export const MovieChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '🎬 Welcome to the most entertaining Movie AI ever created! I\'m not just here to give you ratings - I can chat like your favorite movie characters, share iconic quotes, and have real conversations about cinema! Ready for some movie magic? ✨',
      isUser: false,
      timestamp: new Date(),
      type: 'character',
      mood: 'excited'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const movieService = new MovieService();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
      type: 'normal'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    // Enhanced AI processing with typing simulation
    setTimeout(async () => {
      try {
        const aiResponse = await movieService.generateAIResponse(inputValue, '');
        
        // Determine message type and mood based on content
        let messageType: 'quote' | 'character' | 'recommendation' | 'normal' = 'normal';
        let mood: 'excited' | 'dramatic' | 'wise' | 'funny' = 'excited';
        
        if (aiResponse.includes('🎭') || aiResponse.includes('Mode Activated')) {
          messageType = 'character';
          mood = 'dramatic';
        } else if (aiResponse.includes('"') && aiResponse.includes('—')) {
          messageType = 'quote';
          mood = 'wise';
        } else if (aiResponse.includes('🏆') || aiResponse.includes('Top')) {
          messageType = 'recommendation';
          mood = 'excited';
        }
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          isUser: false,
          timestamp: new Date(),
          type: messageType,
          mood: mood
        };

        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('AI response error:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: '❌ Oops! Something went wrong in my movie database. Let me try that again! 🎬',
          isUser: false,
          timestamp: new Date(),
          type: 'normal'
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
    }, 2000); // Longer delay for more realistic conversation
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard!');
  };

  const formatMessage = (content: string) => {
    // Enhanced markdown-like formatting with emoji preservation
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  const getMessageIcon = (message: Message) => {
    if (message.isUser) return <User className="h-4 w-4" />;
    
    switch (message.type) {
      case 'character':
        return <Sparkles className="h-4 w-4" />;
      case 'quote':
        return <Zap className="h-4 w-4" />;
      case 'recommendation':
        return <Heart className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getMessageStyle = (message: Message) => {
    if (message.isUser) return 'bg-primary text-primary-foreground';
    
    switch (message.mood) {
      case 'excited':
        return 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200';
      case 'dramatic':
        return 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-200';
      case 'wise':
        return 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-200';
      case 'funny':
        return 'bg-gradient-to-r from-green-500/10 to-yellow-500/10 border-green-200';
      default:
        return 'bg-card border-border/50';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
      {/* Chat Header */}
      <div className="flex-shrink-0 border-b bg-card/50 backdrop-blur-sm p-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
            <Star className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Movie Rating AI</h2>
            <p className="text-sm text-muted-foreground">Your personal movie expert</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 animate-fade-in ${
                message.isUser ? 'flex-row-reverse space-x-reverse' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                message.isUser 
                  ? 'bg-primary text-primary-foreground hover:scale-110' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-110 animate-glow'
              }`}>
                {getMessageIcon(message)}
              </div>
              
              <Card className={`max-w-[80%] transition-all duration-300 hover:shadow-lg ${getMessageStyle(message)}`}>
                <CardContent className="p-3">
                  <div 
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                  />
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-50 hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(message.content)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
          
          {(isLoading || isTyping) && (
            <div className="flex items-start space-x-3 animate-fade-in">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center animate-bounce-gentle">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <Card className="bg-card border-border/50">
                <CardContent className="p-3">
                  {isTyping ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Thinking cinematically</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t bg-card/50 backdrop-blur-sm p-4">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about movie ratings, get recommendations..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Enhanced conversational quick suggestions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            "Talk like Yoda about Star Wars",
            "Give me a quote from The Dark Knight", 
            "Channel Tony Stark and recommend sci-fi",
            "I'm feeling sad tonight",
            "Compare Inception vs Interstellar",
            "Be Sherlock and analyze Pulp Fiction"
          ].map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              className="text-xs h-8 px-3 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 transition-all duration-300 hover:scale-105"
              onClick={() => setInputValue(suggestion)}
              disabled={isLoading}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};