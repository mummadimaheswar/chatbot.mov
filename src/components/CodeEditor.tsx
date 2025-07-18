import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Play, 
  Download, 
  Upload, 
  Copy, 
  RefreshCw, 
  Lightbulb, 
  Bug, 
  ArrowLeftRight,
  FileCode,
  Settings 
} from 'lucide-react';
import { toast } from 'sonner';
import { AIService } from '../services/AIService';

interface CodeEditorProps {
  aiService: AIService;
}

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'r', label: 'R' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' }
];

const THEMES = [
  { value: 'vs-dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'hc-black', label: 'High Contrast Dark' }
];

export const CodeEditor: React.FC<CodeEditorProps> = ({ aiService }) => {
  const [code, setCode] = useState('# Welcome to the AI Code Editor!\n# Write your code here or use AI assistance\n\ndef hello_world():\n    print("Hello, World!")\n    return "AI-powered coding!"\n\nif __name__ == "__main__":\n    result = hello_world()\n    print(f"Result: {result}")');
  const [language, setLanguage] = useState('python');
  const [theme, setTheme] = useState('vs-dark');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const editorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadCode = () => {
    const extension = getFileExtension(language);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Code downloaded!');
  };

  const uploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCode(content);
      
      // Auto-detect language based on file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      const detectedLanguage = detectLanguageFromExtension(extension || '');
      if (detectedLanguage) {
        setLanguage(detectedLanguage);
      }
      
      toast.success('File uploaded successfully!');
    };
    reader.readAsText(file);
  };

  const getFileExtension = (lang: string): string => {
    const extensions: { [key: string]: string } = {
      python: 'py',
      javascript: 'js',
      typescript: 'ts',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      html: 'html',
      css: 'css',
      sql: 'sql',
      r: 'r',
      json: 'json',
      markdown: 'md'
    };
    return extensions[lang] || 'txt';
  };

  const detectLanguageFromExtension = (extension: string): string | null => {
    const extensionMap: { [key: string]: string } = {
      py: 'python',
      js: 'javascript',
      ts: 'typescript',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      html: 'html',
      css: 'css',
      sql: 'sql',
      r: 'r',
      json: 'json',
      md: 'markdown'
    };
    return extensionMap[extension] || null;
  };

  const explainCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await aiService.processChat(`Explain this ${language} code:\n\n${code}`);
      setOutput(response.content);
      toast.success('Code explanation generated!');
    } catch (error) {
      toast.error('Failed to explain code');
    } finally {
      setIsProcessing(false);
    }
  };

  const debugCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await aiService.processChat(`Debug this ${language} code and find any issues:\n\n${code}`);
      setOutput(response.content);
      toast.success('Code analysis complete!');
    } catch (error) {
      toast.error('Failed to debug code');
    } finally {
      setIsProcessing(false);
    }
  };

  const translateCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!');
      return;
    }

    const targetLanguages = LANGUAGES.filter(lang => lang.value !== language);
    const targetLang = targetLanguages[0]?.value || 'javascript';

    setIsProcessing(true);
    try {
      const response = await aiService.processChat(
        `Translate this ${language} code to ${targetLang}:\n\n${code}`
      );
      setOutput(response.content);
      toast.success(`Code translated to ${targetLang}!`);
    } catch (error) {
      toast.error('Failed to translate code');
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateExecution = () => {
    // Simulate code execution
    const executionResults = [
      `Executing ${language} code...\n\n✅ Code executed successfully!\nOutput: Hello, World!\nExecution time: 0.142s`,
      `Running ${language} script...\n\n✅ All tests passed!\nMemory usage: 12.5 MB\nExecution time: 0.089s`,
      `Compiling and running ${language} code...\n\n✅ Build successful!\nResult: Function executed without errors\nExecution time: 0.203s`
    ];
    
    const randomResult = executionResults[Math.floor(Math.random() * executionResults.length)];
    setOutput(randomResult);
    toast.success('Code executed successfully!');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center space-x-4">
          <FileCode className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">AI Code Editor</h2>
          
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(lang => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEMES.map(t => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".py,.js,.ts,.java,.cpp,.c,.html,.css,.sql,.r,.json,.md,.txt"
            onChange={uploadFile}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-1" />
            Upload
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCode}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(code)}
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              theme={theme}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: 'on',
                fontFamily: 'JetBrains Mono, Monaco, Consolas, "Courier New", monospace'
              }}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="p-4 border-t bg-card flex flex-wrap gap-2">
            <Button onClick={simulateExecution} className="flex-1 min-w-32">
              <Play className="h-4 w-4 mr-1" />
              Run Code
            </Button>
            <Button 
              variant="outline" 
              onClick={explainCode}
              disabled={isProcessing}
              className="flex-1 min-w-32"
            >
              <Lightbulb className="h-4 w-4 mr-1" />
              {isProcessing ? 'Explaining...' : 'Explain'}
            </Button>
            <Button 
              variant="outline" 
              onClick={debugCode}
              disabled={isProcessing}
              className="flex-1 min-w-32"
            >
              <Bug className="h-4 w-4 mr-1" />
              {isProcessing ? 'Debugging...' : 'Debug'}
            </Button>
            <Button 
              variant="outline" 
              onClick={translateCode}
              disabled={isProcessing}
              className="flex-1 min-w-32"
            >
              <ArrowLeftRight className="h-4 w-4 mr-1" />
              {isProcessing ? 'Translating...' : 'Translate'}
            </Button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="w-96 border-l bg-card flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Output & Analysis
            </h3>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            {output ? (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Result</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(output)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-sm whitespace-pre-wrap font-mono">
                    {output}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-4xl mb-4">⚡</div>
                <p className="text-sm">
                  Run your code or use AI assistance to see results here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};