import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, Bot, User, Copy, Download, Code, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isCode?: boolean;
  language?: string;
}

interface ChatInterfaceProps {
  onCodeGenerate?: (code: string, language: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onCodeGenerate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI coding assistant. I can help you with:\n\n• **Code Generation**: Write functions, algorithms, and complete programs\n• **Code Explanation**: Break down complex code step by step\n• **Debugging**: Find and fix errors in your code\n• **Code Translation**: Convert between programming languages\n• **Best Practices**: Get advice on clean, efficient coding\n\nWhat would you like to work on today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const languages = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'sql', label: 'SQL' },
    { value: 'r', label: 'R' },
  ];

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Enhanced AI response generation with better patterns
    const message = userMessage.toLowerCase();
    
    // Code generation patterns
    if (message.includes('function') || message.includes('write') || message.includes('create')) {
      if (message.includes('sort') || message.includes('bubble sort')) {
        return selectedLanguage === 'python' 
          ? `Here's a bubble sort implementation in Python:

\`\`\`python
def bubble_sort(arr):
    """
    Bubble sort algorithm implementation
    Time complexity: O(n²)
    Space complexity: O(1)
    """
    n = len(arr)
    
    for i in range(n):
        # Flag to optimize for already sorted arrays
        swapped = False
        
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                # Swap elements
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        
        # If no swapping occurred, array is sorted
        if not swapped:
            break
    
    return arr

# Example usage:
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = bubble_sort(numbers.copy())
print(f"Original: {numbers}")
print(f"Sorted: {sorted_numbers}")
\`\`\``
          : `Here's a bubble sort implementation in JavaScript:

\`\`\`javascript
function bubbleSort(arr) {
    /*
     * Bubble sort algorithm implementation
     * Time complexity: O(n²)
     * Space complexity: O(1)
     */
    const n = arr.length;
    
    for (let i = 0; i < n; i++) {
        // Flag to optimize for already sorted arrays
        let swapped = false;
        
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap elements
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }
        
        // If no swapping occurred, array is sorted
        if (!swapped) break;
    }
    
    return arr;
}

// Example usage:
const numbers = [64, 34, 25, 12, 22, 11, 90];
const sortedNumbers = bubbleSort([...numbers]);
console.log('Original:', numbers);
console.log('Sorted:', sortedNumbers);
\`\`\``;
      }
      
      if (message.includes('api') || message.includes('rest')) {
        return selectedLanguage === 'python' 
          ? `Here's a REST API implementation using Flask:

\`\`\`python
from flask import Flask, jsonify, request
from flask_cors import CORS
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

# In-memory storage (use database in production)
users = []

@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users"""
    return jsonify({
        'users': users,
        'total': len(users)
    })

@app.route('/api/users', methods=['POST'])
def create_user():
    """Create a new user"""
    data = request.json
    
    # Validate required fields
    if not data or not data.get('name') or not data.get('email'):
        return jsonify({'error': 'Name and email are required'}), 400
    
    # Create new user
    user = {
        'id': str(uuid.uuid4()),
        'name': data['name'],
        'email': data['email'],
        'created_at': datetime.now().isoformat()
    }
    
    users.append(user)
    return jsonify({'user': user, 'message': 'User created successfully'}), 201

@app.route('/api/users/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get a specific user"""
    user = next((u for u in users if u['id'] == user_id), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user})

@app.route('/api/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    """Update a specific user"""
    user = next((u for u in users if u['id'] == user_id), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.json
    if data.get('name'):
        user['name'] = data['name']
    if data.get('email'):
        user['email'] = data['email']
    
    return jsonify({'user': user, 'message': 'User updated successfully'})

@app.route('/api/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete a specific user"""
    global users
    users = [u for u in users if u['id'] != user_id]
    return jsonify({'message': 'User deleted successfully'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
\`\`\``
          : `Here's a REST API implementation using Express.js:

\`\`\`javascript
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (use database in production)
let users = [];

// Get all users
app.get('/api/users', (req, res) => {
    res.json({
        users: users,
        total: users.length
    });
});

// Create a new user
app.post('/api/users', (req, res) => {
    const { name, email } = req.body;
    
    // Validate required fields
    if (!name || !email) {
        return res.status(400).json({
            error: 'Name and email are required'
        });
    }
    
    // Create new user
    const user = {
        id: uuidv4(),
        name,
        email,
        createdAt: new Date().toISOString()
    };
    
    users.push(user);
    res.status(201).json({
        user,
        message: 'User created successfully'
    });
});

// Get a specific user
app.get('/api/users/:id', (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
});

// Update a specific user
app.put('/api/users/:id', (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const { name, email } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    
    res.json({
        user,
        message: 'User updated successfully'
    });
});

// Delete a specific user
app.delete('/api/users/:id', (req, res) => {
    users = users.filter(u => u.id !== req.params.id);
    res.json({ message: 'User deleted successfully' });
});

app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
});
\`\`\``;
      }
    }
    
    // Code explanation patterns
    if (message.includes('explain') || message.includes('what does')) {
      return `I'd be happy to explain code! Here's how I can help:

**Code Explanation Services:**
• **Line-by-line breakdown** - Detailed explanation of each line
• **Algorithm analysis** - How the algorithm works and its complexity
• **Best practices** - Why certain approaches are used
• **Common patterns** - Identify design patterns and techniques

**To get the best explanation:**
1. Paste your code in the chat
2. Specify what part you want explained
3. Let me know your experience level

For example, try: "Explain this Python code: [paste your code here]"`;
    }
    
    // Debugging patterns
    if (message.includes('debug') || message.includes('error') || message.includes('fix')) {
      return `I can help debug your code! Here's my debugging process:

**Debugging Services:**
• **Syntax error detection** - Find and fix syntax issues
• **Logic error identification** - Spot logical mistakes
• **Performance optimization** - Improve code efficiency
• **Best practice suggestions** - Recommend better approaches

**To get help with debugging:**
1. Share your code
2. Describe the error or unexpected behavior
3. Include any error messages
4. Tell me what you expected to happen

Example: "Debug this Python code, I'm getting a TypeError: [paste code and error]"`;
    }
    
    // Translation patterns
    if (message.includes('translate') || message.includes('convert')) {
      return `I can translate code between different programming languages!

**Supported Languages:**
• Python ↔ JavaScript
• Java ↔ C++
• C ↔ C++
• Python ↔ Java
• JavaScript ↔ TypeScript
• And many more combinations!

**Translation Process:**
1. **Syntax conversion** - Adapt language-specific syntax
2. **Logic preservation** - Keep the same functionality
3. **Best practices** - Use target language conventions
4. **Comments update** - Translate comments and documentation

**To translate code:**
"Translate this [source language] code to [target language]: [paste code]"

Example: "Translate this Python code to JavaScript: def greet(name): return f'Hello, {name}!'"`;
    }
    
    // Default response
    return `I understand you want help with: "${userMessage}"

I can assist you with:
• **Code Generation** - Write functions, algorithms, and programs
• **Code Explanation** - Break down complex code
• **Debugging** - Find and fix errors
• **Code Translation** - Convert between languages
• **Best Practices** - Optimize your code

Could you be more specific about what you need? For example:
- "Write a Python function to..."
- "Explain this code..."
- "Debug this error..."
- "Translate this code from X to Y..."`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const aiResponse = await generateAIResponse(inputMessage);
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        isCode: aiResponse.includes('```'),
        language: selectedLanguage,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive",
      });
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const extractCode = (content: string) => {
    const codeMatch = content.match(/```[\s\S]*?```/g);
    return codeMatch ? codeMatch[0].replace(/```\w*\n?/g, '').replace(/```/g, '') : '';
  };

  const formatContent = (content: string) => {
    // Split content by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const code = part.replace(/```\w*\n?/g, '').replace(/```/g, '');
        const language = part.match(/```(\w+)/)?.[1] || 'text';
        
        return (
          <div key={index} className="my-4">
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
                <Badge variant="secondary" className="text-xs">
                  {language}
                </Badge>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(code)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  {onCodeGenerate && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onCodeGenerate(code, language)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Code className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
              <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
                <code>{code}</code>
              </pre>
            </div>
          </div>
        );
      }
      
      return (
        <div key={index} className="whitespace-pre-wrap">
          {part}
        </div>
      );
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          Developer Chat Assistant
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Language:</span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                }`}>
                  {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`flex-1 max-w-[80%] ${
                  message.type === 'user' ? 'text-right' : ''
                }`}>
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white ml-auto'
                      : 'bg-gray-50 dark:bg-gray-800'
                  }`}>
                    {message.type === 'assistant' ? (
                      <div className="prose dark:prose-invert max-w-none">
                        {formatContent(message.content)}
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-pulse text-purple-500" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
        
        <Separator />
        
        <div className="p-4">
          <div className="flex gap-2">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about code... (Press Enter to send, Shift+Enter for new line)"
              className="flex-1 min-h-[80px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;