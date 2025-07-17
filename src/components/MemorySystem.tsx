import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Database, Clock, Search, Plus, Trash2 } from 'lucide-react';

interface MemoryItem {
  id: string;
  content: string;
  embedding: number[];
  timestamp: Date;
  relevanceScore: number;
  type: 'conversation' | 'knowledge' | 'context';
}

interface ConversationTurn {
  id: string;
  user: string;
  assistant: string;
  timestamp: Date;
  tokens: number;
}

const MemorySystem: React.FC = () => {
  const [shortTermMemory, setShortTermMemory] = useState<ConversationTurn[]>([]);
  const [longTermMemory, setLongTermMemory] = useState<MemoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MemoryItem[]>([]);
  const [newMemoryContent, setNewMemoryContent] = useState('');
  const [memoryStats, setMemoryStats] = useState({
    totalMemories: 0,
    avgRelevance: 0,
    totalTokens: 0,
    memoryEfficiency: 0,
  });

  // Simulated embedding function (in real system, use sentence-transformers)
  const generateEmbedding = (text: string): number[] => {
    return Array.from({ length: 384 }, () => Math.random() * 2 - 1);
  };

  // Cosine similarity for vector search
  const calculateSimilarity = (vec1: number[], vec2: number[]): number => {
    if (vec1.length !== vec2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  };

  // Add new conversation to short-term memory
  const addConversation = (user: string, assistant: string) => {
    const newTurn: ConversationTurn = {
      id: Date.now().toString(),
      user,
      assistant,
      timestamp: new Date(),
      tokens: user.length + assistant.length,
    };
    
    setShortTermMemory(prev => [...prev.slice(-4), newTurn]); // Keep last 5 turns
    
    // Convert to long-term memory if important
    if (user.length > 50 || assistant.length > 100) {
      const memoryItem: MemoryItem = {
        id: Date.now().toString(),
        content: `User: ${user}\nAssistant: ${assistant}`,
        embedding: generateEmbedding(user + ' ' + assistant),
        timestamp: new Date(),
        relevanceScore: Math.random() * 0.3 + 0.7, // High relevance for long conversations
        type: 'conversation',
      };
      setLongTermMemory(prev => [...prev, memoryItem]);
    }
  };

  // Add knowledge to long-term memory
  const addKnowledge = (content: string, type: 'knowledge' | 'context' = 'knowledge') => {
    const memoryItem: MemoryItem = {
      id: Date.now().toString(),
      content,
      embedding: generateEmbedding(content),
      timestamp: new Date(),
      relevanceScore: Math.random() * 0.4 + 0.6,
      type,
    };
    setLongTermMemory(prev => [...prev, memoryItem]);
  };

  // Search through long-term memory
  const searchMemory = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const queryEmbedding = generateEmbedding(query);
    const results = longTermMemory
      .map(item => ({
        ...item,
        similarity: calculateSimilarity(queryEmbedding, item.embedding),
      }))
      .filter(item => item.similarity > 0.5)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);
    
    setSearchResults(results);
  };

  // Calculate memory statistics
  useEffect(() => {
    const totalMemories = longTermMemory.length;
    const avgRelevance = totalMemories > 0 
      ? longTermMemory.reduce((sum, item) => sum + item.relevanceScore, 0) / totalMemories
      : 0;
    const totalTokens = shortTermMemory.reduce((sum, turn) => sum + turn.tokens, 0);
    const memoryEfficiency = totalMemories > 0 ? (avgRelevance * 100) : 0;
    
    setMemoryStats({
      totalMemories,
      avgRelevance,
      totalTokens,
      memoryEfficiency,
    });
  }, [longTermMemory, shortTermMemory]);

  // Simulate some initial data
  useEffect(() => {
    addConversation(
      "What is the difference between supervised and unsupervised learning?",
      "Supervised learning uses labeled data to train models (like classification), while unsupervised learning finds patterns in unlabeled data (like clustering)."
    );
    addConversation(
      "How do transformers work?",
      "Transformers use self-attention mechanisms to process sequences in parallel, making them very efficient for language tasks."
    );
    addKnowledge("Python is a high-level programming language known for its simplicity and readability.", "knowledge");
    addKnowledge("Machine learning models require proper validation to avoid overfitting.", "knowledge");
  }, []);

  const clearShortTermMemory = () => setShortTermMemory([]);
  const clearLongTermMemory = () => setLongTermMemory([]);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-green-600" />
            Memory System Architecture
          </CardTitle>
          <CardDescription>
            Short-term and long-term memory management for contextual understanding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Total Memories</span>
              </div>
              <div className="text-2xl font-bold">{memoryStats.totalMemories}</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-green-600" />
                <span className="font-medium">Avg Relevance</span>
              </div>
              <div className="text-2xl font-bold">{memoryStats.avgRelevance.toFixed(3)}</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="font-medium">Total Tokens</span>
              </div>
              <div className="text-2xl font-bold">{memoryStats.totalTokens}</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-purple-600" />
                <span className="font-medium">Efficiency</span>
              </div>
              <div className="text-2xl font-bold">{memoryStats.memoryEfficiency.toFixed(1)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Short-Term Memory
            </CardTitle>
            <CardDescription>
              Recent conversation history (last 5 turns)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shortTermMemory.map((turn) => (
                <div key={turn.id} className="border rounded-lg p-3">
                  <div className="mb-2">
                    <Badge variant="outline" className="text-xs">
                      {turn.timestamp.toLocaleTimeString()}
                    </Badge>
                    <Badge variant="outline" className="text-xs ml-2">
                      {turn.tokens} tokens
                    </Badge>
                  </div>
                  <div className="text-sm mb-1">
                    <strong>User:</strong> {turn.user}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <strong>Assistant:</strong> {turn.assistant}
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={clearShortTermMemory}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Short-Term Memory
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Long-Term Memory
            </CardTitle>
            <CardDescription>
              Persistent knowledge and context storage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search memory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchMemory(searchQuery)}
                />
                <Button onClick={() => searchMemory(searchQuery)}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(searchResults.length > 0 ? searchResults : longTermMemory.slice(-10)).map((item) => (
                  <div key={item.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={item.type === 'conversation' ? 'default' : 'secondary'}>
                        {item.type}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.relevanceScore.toFixed(3)}
                        </Badge>
                        {searchResults.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {((item as any).similarity * 100).toFixed(1)}% match
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm">{item.content}</div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <Textarea
                  placeholder="Add new knowledge..."
                  value={newMemoryContent}
                  onChange={(e) => setNewMemoryContent(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      addKnowledge(newMemoryContent, 'knowledge');
                      setNewMemoryContent('');
                    }}
                    disabled={!newMemoryContent.trim()}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Knowledge
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearLongTermMemory}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemorySystem;