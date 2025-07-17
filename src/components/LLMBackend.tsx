import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Server, Cpu, Zap, Settings, Send, Download } from 'lucide-react';

interface ModelConfig {
  name: string;
  size: string;
  parameters: string;
  description: string;
  strengths: string[];
  status: 'available' | 'loading' | 'offline';
  accuracy: number;
  speed: number;
}

interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  parameters: string[];
  example: string;
}

const LLMBackend: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('starcoder2-15b');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful coding assistant. Generate clean, efficient, and well-commented code.');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(512);
  const [topP, setTopP] = useState(0.9);

  const models: ModelConfig[] = [
    {
      name: 'StarCoder2-15B',
      size: '15B',
      parameters: '15 billion',
      description: 'Trained on 600+ programming languages from The Stack v2',
      strengths: ['Code generation', 'Multi-language support', 'Code completion'],
      status: 'available',
      accuracy: 0.92,
      speed: 0.85,
    },
    {
      name: 'WizardCoder-13B',
      size: '13B',
      parameters: '13 billion',
      description: 'Instruction-tuned CodeLLaMA for enhanced code generation',
      strengths: ['Instruction following', 'Code explanation', 'Debugging'],
      status: 'available',
      accuracy: 0.89,
      speed: 0.90,
    },
    {
      name: 'DeepSeek-Coder-6.7B',
      size: '6.7B',
      parameters: '6.7 billion',
      description: 'Trained on 2T tokens with multilingual code support',
      strengths: ['Python/JS/C++', 'Fast inference', 'Multilingual'],
      status: 'available',
      accuracy: 0.86,
      speed: 0.95,
    },
    {
      name: 'CodeLlama-34B',
      size: '34B',
      parameters: '34 billion',
      description: 'Meta\'s specialized code generation model',
      strengths: ['Large context', 'Code infilling', 'Chat format'],
      status: 'loading',
      accuracy: 0.94,
      speed: 0.70,
    },
  ];

  const apiEndpoints: APIEndpoint[] = [
    {
      path: '/api/generate',
      method: 'POST',
      description: 'Generate code from natural language description',
      parameters: ['prompt', 'temperature', 'max_tokens', 'top_p'],
      example: '{\n  "prompt": "Write a Python function to sort a list",\n  "temperature": 0.7,\n  "max_tokens": 256\n}',
    },
    {
      path: '/api/explain',
      method: 'POST',
      description: 'Explain code functionality and logic',
      parameters: ['code', 'language', 'detail_level'],
      example: '{\n  "code": "def bubble_sort(arr):\\n    n = len(arr)\\n    for i in range(n):\\n        for j in range(0, n-i-1):\\n            if arr[j] > arr[j+1]:\\n                arr[j], arr[j+1] = arr[j+1], arr[j]\\n    return arr",\n  "language": "python"\n}',
    },
    {
      path: '/api/debug',
      method: 'POST',
      description: 'Debug and fix code errors',
      parameters: ['code', 'error_message', 'language'],
      example: '{\n  "code": "def hello(\\n    print(\\"Hello\\")",\n  "error_message": "SyntaxError: invalid syntax",\n  "language": "python"\n}',
    },
    {
      path: '/api/translate',
      method: 'POST',
      description: 'Translate code between programming languages',
      parameters: ['code', 'source_lang', 'target_lang'],
      example: '{\n  "code": "def greet(name):\\n    return f\\"Hello, {name}!\\"",\n  "source_lang": "python",\n  "target_lang": "javascript"\n}',
    },
  ];

  // Simulate model loading
  const loadModel = async (modelName: string) => {
    setIsLoading(true);
    setLoadingProgress(0);
    
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          return 100;
        }
        return prev + Math.random() * 20;
      });
    }, 500);
  };

  // Simulate code generation
  const generateCode = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setResponse('');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate response based on prompt
    const responses = {
      'bubble sort': 'def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr',
      'rest api': 'from flask import Flask, jsonify, request\n\napp = Flask(__name__)\n\n@app.route("/api/users", methods=["GET"])\ndef get_users():\n    return jsonify({"users": []})\n\n@app.route("/api/users", methods=["POST"])\ndef create_user():\n    data = request.json\n    return jsonify({"message": "User created", "data": data})\n\nif __name__ == "__main__":\n    app.run(debug=True)',
      'sorting algorithm': 'def quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    \n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    \n    return quick_sort(left) + middle + quick_sort(right)',
    };
    
    const matchedResponse = Object.entries(responses).find(([key]) => 
      prompt.toLowerCase().includes(key)
    );
    
    const generatedResponse = matchedResponse 
      ? matchedResponse[1] 
      : `# Generated code for: ${prompt}\n\ndef your_function():\n    # TODO: Implement your logic here\n    pass`;
    
    setResponse(generatedResponse);
    setIsLoading(false);
  };

  // Generate deployment script
  const generateDeploymentScript = () => {
    const dockerFile = `FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`;

    const requirements = `fastapi==0.104.1
uvicorn==0.24.0
transformers==4.35.2
torch==2.1.0
accelerate==0.24.1
sentence-transformers==2.2.2
redis==5.0.1
python-multipart==0.0.6`;

    const mainPy = `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

app = FastAPI()

# Model configuration
MODEL_ID = "${selectedModel}"
device = "cuda" if torch.cuda.is_available() else "cpu"

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    trust_remote_code=True,
    torch_dtype=torch.float16 if device == "cuda" else torch.float32
).to(device)

class GenerateRequest(BaseModel):
    prompt: str
    temperature: float = ${temperature}
    max_tokens: int = ${maxTokens}
    top_p: float = ${topP}

@app.post("/api/generate")
async def generate_code(request: GenerateRequest):
    try:
        system_prompt = "${systemPrompt}"
        full_prompt = f"{system_prompt}\\n\\nUser: {request.prompt}\\n\\nAssistant:"
        
        inputs = tokenizer(full_prompt, return_tensors="pt").to(device)
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=request.max_tokens,
                temperature=request.temperature,
                top_p=request.top_p,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        generated_text = response.split("Assistant:")[-1].strip()
        
        return {"code": generated_text}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models")
async def get_models():
    return {"current_model": MODEL_ID, "status": "loaded"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)`;

    const deploymentFiles = {
      'Dockerfile': dockerFile,
      'requirements.txt': requirements,
      'main.py': mainPy,
    };

    return deploymentFiles;
  };

  const selectedModelConfig = models.find(m => m.name.toLowerCase().includes(selectedModel));

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-6 h-6 text-purple-600" />
            LLM Backend Integration
          </CardTitle>
          <CardDescription>
            Production-ready backend with open-source LLM models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Active Model</span>
              </div>
              <div className="text-lg font-bold">{selectedModelConfig?.name}</div>
              <div className="text-sm text-muted-foreground">{selectedModelConfig?.parameters}</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-green-600" />
                <span className="font-medium">Accuracy</span>
              </div>
              <div className="text-lg font-bold">{((selectedModelConfig?.accuracy || 0) * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4 text-orange-600" />
                <span className="font-medium">Speed</span>
              </div>
              <div className="text-lg font-bold">{((selectedModelConfig?.speed || 0) * 100).toFixed(1)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="models" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="playground">Playground</TabsTrigger>
          <TabsTrigger value="api">API Docs</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
        </TabsList>

        <TabsContent value="models">
          <div className="space-y-4">
            {models.map((model) => (
              <Card key={model.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={model.status === 'available' ? 'default' : 'secondary'}>
                        {model.status}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedModel(model.name.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                          if (model.status === 'offline') {
                            loadModel(model.name);
                          }
                        }}
                        disabled={model.status === 'loading'}
                      >
                        {model.status === 'available' ? 'Select' : 'Load'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{model.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {model.strengths.map((strength) => (
                        <Badge key={strength} variant="outline">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Accuracy:</span>{' '}
                        <span className="text-green-600">{(model.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="font-medium">Speed:</span>{' '}
                        <span className="text-blue-600">{(model.speed * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    {model.status === 'loading' && (
                      <Progress value={loadingProgress} className="w-full" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="playground">
          <Card>
            <CardHeader>
              <CardTitle>Code Generation Playground</CardTitle>
              <CardDescription>
                Test your LLM model with custom prompts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">System Prompt</label>
                  <Textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    rows={3}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">User Prompt</label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Write a Python function to implement binary search"
                    rows={4}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={generateCode}
                    disabled={isLoading || !prompt.trim()}
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {isLoading ? 'Generating...' : 'Generate Code'}
                  </Button>
                </div>
                {response && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Generated Code</label>
                    <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
                      {response}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <div className="space-y-4">
            {apiEndpoints.map((endpoint) => (
              <Card key={endpoint.path}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{endpoint.path}</CardTitle>
                    <Badge variant={endpoint.method === 'POST' ? 'default' : 'secondary'}>
                      {endpoint.method}
                    </Badge>
                  </div>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Parameters:</h4>
                      <div className="flex flex-wrap gap-2">
                        {endpoint.parameters.map((param) => (
                          <Badge key={param} variant="outline">
                            {param}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Example Request:</h4>
                      <pre className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm overflow-x-auto">
                        {endpoint.example}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Model Configuration</CardTitle>
              <CardDescription>
                Adjust model parameters for optimal performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Temperature: {temperature}</label>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Controls randomness. Lower = more focused, Higher = more creative
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Tokens: {maxTokens}</label>
                  <input
                    type="range"
                    min="64"
                    max="2048"
                    step="64"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum length of generated response
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Top P: {topP}</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={topP}
                    onChange={(e) => setTopP(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Nucleus sampling. Lower = more focused vocabulary
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deploy">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Scripts</CardTitle>
              <CardDescription>
                Ready-to-use deployment configuration for your backend
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={() => {
                    const files = generateDeploymentScript();
                    Object.entries(files).forEach(([filename, content]) => {
                      const blob = new Blob([content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = filename;
                      a.click();
                      URL.revokeObjectURL(url);
                    });
                  }}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Deployment Files
                </Button>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Quick Start Commands:</h4>
                    <pre className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm overflow-x-auto">
{`# Build and run with Docker
docker build -t llm-backend .
docker run -p 8000:8000 llm-backend

# Or run directly with Python
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000`}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">API Base URL:</h4>
                    <code className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm">
                      http://localhost:8000
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LLMBackend;