import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Layers, Zap, Database, ArrowRight } from 'lucide-react';

interface AttentionHead {
  id: string;
  query: number[];
  key: number[];
  value: number[];
  attention: number[][];
}

interface TransformerLayer {
  id: string;
  multiHeadAttention: AttentionHead[];
  feedforward: number[][];
  layerNorm: boolean;
  residualConnection: boolean;
}

const TransformerArchitecture: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulated transformer layers (6 layers like GPT)
  const transformerLayers: TransformerLayer[] = Array.from({ length: 6 }, (_, i) => ({
    id: `layer-${i}`,
    multiHeadAttention: Array.from({ length: 8 }, (_, j) => ({
      id: `head-${j}`,
      query: Array.from({ length: 64 }, () => Math.random()),
      key: Array.from({ length: 64 }, () => Math.random()),
      value: Array.from({ length: 64 }, () => Math.random()),
      attention: Array.from({ length: 32 }, () => Array.from({ length: 32 }, () => Math.random())),
    })),
    feedforward: Array.from({ length: 2048 }, () => Array.from({ length: 512 }, () => Math.random())),
    layerNorm: true,
    residualConnection: true,
  }));

  const processSequence = async () => {
    setIsProcessing(true);
    
    // Simulate processing through each layer
    for (let i = 0; i < transformerLayers.length; i++) {
      setActiveLayer(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            Transformer Architecture Deep Dive
          </CardTitle>
          <CardDescription>
            Understanding how LLMs process information through attention mechanisms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Core Components</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <Layers className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Multi-Head Attention</div>
                    <div className="text-sm text-muted-foreground">
                      8 parallel attention heads capturing different aspects
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <Zap className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="font-medium">Feed-Forward Network</div>
                    <div className="text-sm text-muted-foreground">
                      2048 → 512 dimensions with ReLU activation
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <Database className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium">Layer Normalization</div>
                    <div className="text-sm text-muted-foreground">
                      Stabilizes training and improves convergence
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Processing Flow</h3>
              <div className="space-y-2">
                {transformerLayers.map((layer, index) => (
                  <div
                    key={layer.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                      activeLayer === index && isProcessing
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-400'
                        : 'bg-gray-50 dark:bg-gray-800/30'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Layer {index + 1}</div>
                      <div className="text-sm text-muted-foreground">
                        {layer.multiHeadAttention.length} attention heads
                      </div>
                    </div>
                    {activeLayer === index && isProcessing && (
                      <div className="animate-pulse">
                        <ArrowRight className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button
              onClick={processSequence}
              disabled={isProcessing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isProcessing ? 'Processing...' : 'Simulate Token Processing'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attention Mechanism Visualization</CardTitle>
          <CardDescription>
            How tokens attend to each other in the current layer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-1 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {transformerLayers[activeLayer]?.multiHeadAttention[0]?.attention.slice(0, 8).map((row, i) => (
              row.slice(0, 8).map((attention, j) => (
                <div
                  key={`${i}-${j}`}
                  className="w-8 h-8 rounded-sm"
                  style={{
                    backgroundColor: `rgba(59, 130, 246, ${attention})`,
                  }}
                  title={`Attention: ${attention.toFixed(3)}`}
                />
              ))
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <Badge variant="outline">Current Layer: {activeLayer + 1}</Badge>
            <Badge variant="outline">
              Attention Heads: {transformerLayers[activeLayer]?.multiHeadAttention.length || 0}
            </Badge>
            <Badge variant="outline">
              Parameters: ~{((transformerLayers[activeLayer]?.feedforward.length || 0) * 1000).toLocaleString()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransformerArchitecture;