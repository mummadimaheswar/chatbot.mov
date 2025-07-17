import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Server, TestTube, Database, Zap, Code, Cpu, Target } from 'lucide-react';

import TransformerArchitecture from './TransformerArchitecture';
import MemorySystem from './MemorySystem';
import PerformanceTesting from './PerformanceTesting';
import LLMBackend from './LLMBackend';

const LLMSystemApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const systemStats = {
    modelAccuracy: 92.3,
    responseTime: 1.2,
    memoryEfficiency: 87.5,
    apiUptime: 99.9,
    totalRequests: 15420,
    successRate: 94.8,
  };

  const features = [
    {
      icon: Brain,
      title: 'Transformer Architecture',
      description: 'Deep understanding of how LLMs process information through attention mechanisms',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Database,
      title: 'Memory Management',
      description: 'Advanced short-term and long-term memory systems for contextual understanding',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      icon: TestTube,
      title: 'Performance Testing',
      description: 'Comprehensive testing framework for accuracy and performance evaluation',
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      icon: Server,
      title: 'Backend Integration',
      description: 'Production-ready backend with open-source LLM model integration',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LLM Intelligence System
              </h1>
              <p className="text-muted-foreground">
                Advanced AI backend with transformer architecture, memory management, and performance optimization
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Accuracy</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{systemStats.modelAccuracy}%</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Response</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{systemStats.responseTime}s</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Memory</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{systemStats.memoryEfficiency}%</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Server className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Uptime</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{systemStats.apiUptime}%</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium">Requests</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{systemStats.totalRequests.toLocaleString()}</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium">Success</span>
              </div>
              <div className="text-2xl font-bold text-indigo-600">{systemStats.successRate}%</div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="backend">Backend</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Overview</CardTitle>
                  <CardDescription>
                    Comprehensive LLM system architecture with advanced features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map((feature, index) => (
                      <div key={index} className={`p-6 rounded-lg ${feature.bgColor}`}>
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg bg-white/50 dark:bg-gray-800/50`}>
                            <feature.icon className={`w-6 h-6 ${feature.color}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Technologies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Transformer Models</span>
                        <Badge>StarCoder2, WizardCoder, DeepSeek</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Memory Systems</span>
                        <Badge>Vector Database, Context Window</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Backend Framework</span>
                        <Badge>FastAPI, HuggingFace Transformers</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Performance Testing</span>
                        <Badge>BLEU Score, Response Time</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Model Capabilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Code Generation</span>
                        <Badge variant="outline">Python, JS, Java, C++</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Code Explanation</span>
                        <Badge variant="outline">Natural Language</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Debugging</span>
                        <Badge variant="outline">Error Detection & Fix</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Translation</span>
                        <Badge variant="outline">Cross-Language</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Jump to specific system components
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Button
                      onClick={() => setActiveTab('architecture')}
                      className="flex items-center gap-2 h-auto p-4 justify-start"
                    >
                      <Brain className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">Architecture</div>
                        <div className="text-xs opacity-70">Transformer Details</div>
                      </div>
                    </Button>
                    <Button
                      onClick={() => setActiveTab('memory')}
                      className="flex items-center gap-2 h-auto p-4 justify-start"
                    >
                      <Database className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">Memory</div>
                        <div className="text-xs opacity-70">Context Management</div>
                      </div>
                    </Button>
                    <Button
                      onClick={() => setActiveTab('testing')}
                      className="flex items-center gap-2 h-auto p-4 justify-start"
                    >
                      <TestTube className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">Testing</div>
                        <div className="text-xs opacity-70">Performance Metrics</div>
                      </div>
                    </Button>
                    <Button
                      onClick={() => setActiveTab('backend')}
                      className="flex items-center gap-2 h-auto p-4 justify-start"
                    >
                      <Server className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">Backend</div>
                        <div className="text-xs opacity-70">API Integration</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="architecture">
            <TransformerArchitecture />
          </TabsContent>

          <TabsContent value="memory">
            <MemorySystem />
          </TabsContent>

          <TabsContent value="testing">
            <PerformanceTesting />
          </TabsContent>

          <TabsContent value="backend">
            <LLMBackend />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LLMSystemApp;