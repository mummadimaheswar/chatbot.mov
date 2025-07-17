import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TestTube, Zap, Target, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

interface TestCase {
  id: string;
  name: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
  executionTime?: number;
  accuracy?: number;
  category: 'code_generation' | 'explanation' | 'debugging' | 'translation';
}

interface BenchmarkResult {
  category: string;
  accuracy: number;
  avgTime: number;
  passRate: number;
  testCount: number;
}

const PerformanceTesting: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [newTestName, setNewTestName] = useState('');
  const [newTestInput, setNewTestInput] = useState('');
  const [newTestExpected, setNewTestExpected] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TestCase['category']>('code_generation');

  // Predefined test cases
  const defaultTestCases: TestCase[] = [
    {
      id: '1',
      name: 'Python Function - Add Two Numbers',
      input: 'Write a Python function to add two numbers',
      expectedOutput: 'def add(a, b):\n    return a + b',
      category: 'code_generation',
    },
    {
      id: '2',
      name: 'JavaScript Array Sort',
      input: 'Create a JavaScript function to sort an array',
      expectedOutput: 'function sortArray(arr) {\n    return arr.sort();\n}',
      category: 'code_generation',
    },
    {
      id: '3',
      name: 'Explain Recursion',
      input: 'Explain what recursion is in programming',
      expectedOutput: 'Recursion is when a function calls itself to solve a smaller version of the same problem',
      category: 'explanation',
    },
    {
      id: '4',
      name: 'Debug Syntax Error',
      input: 'Fix this Python code: def hello(\n    print("Hello")',
      expectedOutput: 'def hello():\n    print("Hello")',
      category: 'debugging',
    },
    {
      id: '5',
      name: 'Python to JavaScript Translation',
      input: 'Translate this Python code to JavaScript: def greet(name):\n    return f"Hello, {name}!"',
      expectedOutput: 'function greet(name) {\n    return `Hello, ${name}!`;\n}',
      category: 'translation',
    },
  ];

  // Initialize test cases
  useEffect(() => {
    setTestCases(defaultTestCases);
  }, []);

  // Simulate LLM response (in real system, this would call your actual LLM)
  const simulateLLMResponse = async (input: string, category: string): Promise<string> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    // Simulate different response qualities based on category
    const responses = {
      code_generation: {
        'Write a Python function to add two numbers': 'def add(a, b):\n    return a + b',
        'Create a JavaScript function to sort an array': 'function sortArray(arr) {\n    return arr.sort();\n}',
      },
      explanation: {
        'Explain what recursion is in programming': 'Recursion is a programming technique where a function calls itself to solve smaller instances of the same problem.',
      },
      debugging: {
        'Fix this Python code: def hello(\n    print("Hello")': 'def hello():\n    print("Hello")',
      },
      translation: {
        'Translate this Python code to JavaScript: def greet(name):\n    return f"Hello, {name}!"': 'function greet(name) {\n    return `Hello, ${name}!`;\n}',
      },
    };
    
    return responses[category as keyof typeof responses]?.[input] || 'Generated response for: ' + input;
  };

  // Calculate text similarity (simplified BLEU-like score)
  const calculateAccuracy = (expected: string, actual: string): number => {
    const expectedWords = expected.toLowerCase().split(/\s+/);
    const actualWords = actual.toLowerCase().split(/\s+/);
    
    const intersection = expectedWords.filter(word => actualWords.includes(word));
    const union = [...new Set([...expectedWords, ...actualWords])];
    
    return intersection.length / union.length;
  };

  // Run all tests
  const runTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const updatedTestCases: TestCase[] = [];
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      setCurrentTest(testCase.name);
      setProgress((i / testCases.length) * 100);
      
      const startTime = performance.now();
      const actualOutput = await simulateLLMResponse(testCase.input, testCase.category);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;
      const accuracy = calculateAccuracy(testCase.expectedOutput, actualOutput);
      const passed = accuracy > 0.7; // 70% threshold
      
      updatedTestCases.push({
        ...testCase,
        actualOutput,
        passed,
        executionTime,
        accuracy,
      });
    }
    
    setTestCases(updatedTestCases);
    setProgress(100);
    setIsRunning(false);
    setCurrentTest('');
    
    // Calculate benchmark results
    const categories = ['code_generation', 'explanation', 'debugging', 'translation'];
    const results: BenchmarkResult[] = categories.map(category => {
      const categoryTests = updatedTestCases.filter(test => test.category === category);
      const passedTests = categoryTests.filter(test => test.passed);
      
      return {
        category,
        accuracy: categoryTests.reduce((sum, test) => sum + (test.accuracy || 0), 0) / categoryTests.length || 0,
        avgTime: categoryTests.reduce((sum, test) => sum + (test.executionTime || 0), 0) / categoryTests.length || 0,
        passRate: passedTests.length / categoryTests.length || 0,
        testCount: categoryTests.length,
      };
    });
    
    setBenchmarkResults(results);
  };

  // Add new test case
  const addTestCase = () => {
    if (!newTestName.trim() || !newTestInput.trim() || !newTestExpected.trim()) return;
    
    const newTest: TestCase = {
      id: Date.now().toString(),
      name: newTestName,
      input: newTestInput,
      expectedOutput: newTestExpected,
      category: selectedCategory,
    };
    
    setTestCases(prev => [...prev, newTest]);
    setNewTestName('');
    setNewTestInput('');
    setNewTestExpected('');
  };

  // Performance metrics for chart
  const performanceData = benchmarkResults.map(result => ({
    category: result.category.replace('_', ' '),
    accuracy: result.accuracy * 100,
    speed: 1000 / result.avgTime, // Convert to requests per second
    passRate: result.passRate * 100,
  }));

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-6 h-6 text-red-600" />
            LLM Performance Testing Framework
          </CardTitle>
          <CardDescription>
            Comprehensive testing and benchmarking for code generation accuracy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={runTests}
              disabled={isRunning}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            <div className="flex-1">
              {isRunning && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium">Current: {currentTest}</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="manage">Manage Tests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="results">
          <div className="space-y-4">
            {testCases.map((testCase) => (
              <Card key={testCase.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{testCase.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={testCase.category === 'code_generation' ? 'default' : 'secondary'}>
                        {testCase.category.replace('_', ' ')}
                      </Badge>
                      {testCase.passed !== undefined && (
                        <Badge variant={testCase.passed ? 'default' : 'destructive'}>
                          {testCase.passed ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {testCase.passed ? 'Passed' : 'Failed'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Input:</h4>
                      <p className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        {testCase.input}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Expected Output:</h4>
                      <pre className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                        {testCase.expectedOutput}
                      </pre>
                    </div>
                    {testCase.actualOutput && (
                      <div>
                        <h4 className="font-medium mb-2">Actual Output:</h4>
                        <pre className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                          {testCase.actualOutput}
                        </pre>
                      </div>
                    )}
                    {testCase.accuracy !== undefined && (
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          <span>Accuracy: {(testCase.accuracy * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Time: {testCase.executionTime?.toFixed(0)}ms</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="benchmarks">
          <Card>
            <CardHeader>
              <CardTitle>Performance Benchmarks</CardTitle>
              <CardDescription>
                Overall performance metrics across different categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {benchmarkResults.map((result) => (
                  <div key={result.category} className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2 capitalize">
                      {result.category.replace('_', ' ')}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Accuracy:</span>
                        <span className="font-medium">{(result.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pass Rate:</span>
                        <span className="font-medium">{(result.passRate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Time:</span>
                        <span className="font-medium">{result.avgTime.toFixed(0)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tests:</span>
                        <span className="font-medium">{result.testCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Visual analysis of LLM performance across categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy %" />
                    <Bar dataKey="passRate" fill="#10b981" name="Pass Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Manage Test Cases</CardTitle>
              <CardDescription>
                Add new test cases to evaluate LLM performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Test Name</label>
                  <Input
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                    placeholder="e.g., Python List Comprehension"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Input Prompt</label>
                  <Input
                    value={newTestInput}
                    onChange={(e) => setNewTestInput(e.target.value)}
                    placeholder="e.g., Write Python code to filter even numbers from a list"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Expected Output</label>
                  <Input
                    value={newTestExpected}
                    onChange={(e) => setNewTestExpected(e.target.value)}
                    placeholder="e.g., [x for x in numbers if x % 2 == 0]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as TestCase['category'])}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="code_generation">Code Generation</option>
                    <option value="explanation">Explanation</option>
                    <option value="debugging">Debugging</option>
                    <option value="translation">Translation</option>
                  </select>
                </div>
                <Button
                  onClick={addTestCase}
                  disabled={!newTestName.trim() || !newTestInput.trim() || !newTestExpected.trim()}
                >
                  Add Test Case
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceTesting;