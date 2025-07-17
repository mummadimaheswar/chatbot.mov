import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Code, Camera, Settings, Zap, Brain, Target } from 'lucide-react';

import ChatInterface from './ChatInterface';
import CodeEditor from './CodeEditor';
import ImageUpload from './ImageUpload';

const DeveloperChatbot: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [editorCode, setEditorCode] = useState('');
  const [editorLanguage, setEditorLanguage] = useState('python');

  const handleCodeFromChat = (code: string, language: string) => {
    setEditorCode(code);
    setEditorLanguage(language);
    setActiveTab('editor');
  };

  const handleCodeFromImage = (code: string, language: string) => {
    setEditorCode(code);
    setEditorLanguage(language);
    setActiveTab('editor');
  };

  const handleExplainCode = (code: string, language: string) => {
    // Switch to chat and ask for explanation
    setActiveTab('chat');
    // In a real implementation, you'd trigger the chat with the explanation request
  };

  const handleDebugCode = (code: string, language: string) => {
    // Switch to chat and ask for debugging
    setActiveTab('chat');
    // In a real implementation, you'd trigger the chat with the debug request
  };

  const handleTranslateCode = (code: string, fromLang: string, toLang: string) => {
    // Switch to chat and ask for translation
    setActiveTab('chat');
    // In a real implementation, you'd trigger the chat with the translation request
  };

  const systemStats = {
    totalQueries: 1247,
    codeGenerated: 892,
    bugsFixed: 156,
    languagesSupported: 12,
    accuracy: 94.2,
    responseTime: 1.8
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Developer AI Assistant
              </h1>
              <p className="text-muted-foreground">
                Your intelligent coding companion for generation, debugging, and learning
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-600">{systemStats.totalQueries}</div>
              <div className="text-xs text-muted-foreground">Total Queries</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-green-600">{systemStats.codeGenerated}</div>
              <div className="text-xs text-muted-foreground">Code Generated</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-red-600">{systemStats.bugsFixed}</div>
              <div className="text-xs text-muted-foreground">Bugs Fixed</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-purple-600">{systemStats.languagesSupported}</div>
              <div className="text-xs text-muted-foreground">Languages</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-orange-600">{systemStats.accuracy}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-teal-600">{systemStats.responseTime}s</div>
              <div className="text-xs text-muted-foreground">Response Time</div>
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Code Editor
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Image-to-Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-0">
            <div className="h-[calc(100vh-300px)]">
              <ChatInterface onCodeGenerate={handleCodeFromChat} />
            </div>
          </TabsContent>

          <TabsContent value="editor" className="space-y-0">
            <div className="h-[calc(100vh-300px)]">
              <CodeEditor
                initialCode={editorCode}
                initialLanguage={editorLanguage}
                onExplain={handleExplainCode}
                onDebug={handleDebugCode}
                onTranslate={handleTranslateCode}
              />
            </div>
          </TabsContent>

          <TabsContent value="image" className="space-y-0">
            <div className="h-[calc(100vh-300px)]">
              <ImageUpload onCodeExtracted={handleCodeFromImage} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeveloperChatbot;