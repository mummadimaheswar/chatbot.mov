import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  MessageSquare, 
  Code, 
  Upload, 
  Settings, 
  Brain, 
  Zap, 
  FileText,
  Sparkles,
  Bot,
  Terminal
} from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { CodeEditor } from './CodeEditor';
import { AIService } from '../services/AIService';
import { toast } from 'sonner';

export const DeveloperChatbot: React.FC = () => {
  const [aiService] = useState(() => new AIService());
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    // Initialize the application
    toast.success('AI Developer Assistant is ready!', {
      description: 'Choose a tab to get started with coding assistance.'
    });
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'AI Code Generation',
      description: 'Generate code from natural language descriptions',
      color: 'bg-blue-500/10 text-blue-600 border-blue-200'
    },
    {
      icon: FileText,
      title: 'Code Explanation',
      description: 'Get detailed explanations of complex code',
      color: 'bg-green-500/10 text-green-600 border-green-200'
    },
    {
      icon: Zap,
      title: 'Debug Assistant',
      description: 'Find and fix bugs in your code quickly',
      color: 'bg-orange-500/10 text-orange-600 border-orange-200'
    },
    {
      icon: Sparkles,
      title: 'Code Translation',
      description: 'Convert code between different programming languages',
      color: 'bg-purple-500/10 text-purple-600 border-purple-200'
    }
  ];

  const supportedLanguages = [
    'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C', 
    'HTML/CSS', 'SQL', 'R', 'React', 'Node.js', 'Flask', 'Django'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Bot className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Developer Assistant
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your intelligent coding companion powered by advanced AI. Generate, explain, debug, and translate code effortlessly.
          </p>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 mb-8">
            {features.map((feature, index) => (
              <Card key={index} className={`text-center hover:shadow-lg transition-shadow ${feature.color} border`}>
                <CardContent className="p-4">
                  <feature.icon className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Supported Languages */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">Supported Languages & Frameworks:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {supportedLanguages.map((lang) => (
                <Badge key={lang} variant="secondary" className="text-xs">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <Card className="max-w-7xl mx-auto shadow-2xl border-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b bg-muted/30 px-6 pt-4">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                <TabsTrigger value="chat" className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>AI Chat</span>
                </TabsTrigger>
                <TabsTrigger value="editor" className="flex items-center space-x-2">
                  <Terminal className="h-4 w-4" />
                  <span>Code Editor</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="m-0 border-0 p-0">
              <div className="h-[700px]">
                <ChatInterface aiService={aiService} />
              </div>
            </TabsContent>

            <TabsContent value="editor" className="m-0 border-0 p-0">
              <div className="h-[700px]">
                <CodeEditor aiService={aiService} />
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Quick Actions */}
        <div className="max-w-7xl mx-auto mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => {
                  setActiveTab('chat');
                  // Could trigger a specific prompt
                }}
              >
                <div className="text-left">
                  <div className="font-medium">Generate Algorithm</div>
                  <div className="text-sm text-muted-foreground">Create sorting, searching algorithms</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => {
                  setActiveTab('editor');
                }}
              >
                <div className="text-left">
                  <div className="font-medium">Debug Code</div>
                  <div className="text-sm text-muted-foreground">Find and fix code issues</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => {
                  setActiveTab('chat');
                }}
              >
                <div className="text-left">
                  <div className="font-medium">Explain Concepts</div>
                  <div className="text-sm text-muted-foreground">Learn programming fundamentals</div>
                </div>
              </Button>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            Powered by AI • Supporting 13+ Programming Languages • 
            <span className="font-semibold text-primary"> Built with ❤️ for Developers</span>
          </p>
        </div>
      </div>
    </div>
  );
};