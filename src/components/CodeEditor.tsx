import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Save, 
  Download, 
  Upload, 
  Copy, 
  Trash2, 
  Settings,
  FileText,
  Bug,
  RefreshCw,
  Languages,
  Palette
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeEditorProps {
  initialCode?: string;
  initialLanguage?: string;
  onCodeChange?: (code: string, language: string) => void;
  onExplain?: (code: string, language: string) => void;
  onDebug?: (code: string, language: string) => void;
  onTranslate?: (code: string, fromLang: string, toLang: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = '',
  initialLanguage = 'python',
  onCodeChange,
  onExplain,
  onDebug,
  onTranslate
}) => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [theme, setTheme] = useState<'dark' | 'light' | 'high-contrast'>('dark');
  const [fontSize, setFontSize] = useState(14);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [translateToLang, setTranslateToLang] = useState('javascript');
  const editorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const languages = [
    { value: 'python', label: 'Python', extension: '.py' },
    { value: 'javascript', label: 'JavaScript', extension: '.js' },
    { value: 'typescript', label: 'TypeScript', extension: '.ts' },
    { value: 'java', label: 'Java', extension: '.java' },
    { value: 'cpp', label: 'C++', extension: '.cpp' },
    { value: 'c', label: 'C', extension: '.c' },
    { value: 'html', label: 'HTML', extension: '.html' },
    { value: 'css', label: 'CSS', extension: '.css' },
    { value: 'sql', label: 'SQL', extension: '.sql' },
    { value: 'r', label: 'R', extension: '.r' },
    { value: 'go', label: 'Go', extension: '.go' },
    { value: 'rust', label: 'Rust', extension: '.rs' },
    { value: 'php', label: 'PHP', extension: '.php' },
    { value: 'json', label: 'JSON', extension: '.json' },
    { value: 'yaml', label: 'YAML', extension: '.yaml' },
  ];

  const themes = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
    { value: 'high-contrast', label: 'High Contrast' },
  ];

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    onCodeChange?.(newCode, language);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    onCodeChange?.(code, newLanguage);
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast({
        title: "No code to run",
        description: "Please enter some code first",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setOutput('');

    try {
      // Simulate code execution
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Mock output based on language and code
      let mockOutput = '';
      if (language === 'python') {
        if (code.includes('print')) {
          mockOutput = 'Hello, World!\n';
        } else if (code.includes('def')) {
          mockOutput = 'Function defined successfully\n';
        } else {
          mockOutput = 'Code executed successfully\n';
        }
      } else if (language === 'javascript') {
        if (code.includes('console.log')) {
          mockOutput = 'Hello, World!\n';
        } else if (code.includes('function')) {
          mockOutput = 'Function defined successfully\n';
        } else {
          mockOutput = 'Code executed successfully\n';
        }
      } else {
        mockOutput = `${languages.find(l => l.value === language)?.label} code executed successfully\n`;
      }

      setOutput(mockOutput);
      toast({
        title: "Code executed",
        description: "Your code ran successfully",
      });
    } catch (error) {
      setOutput(`Error: ${error}`);
      toast({
        title: "Execution error",
        description: "There was an error running your code",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveCode = () => {
    const langInfo = languages.find(l => l.value === language);
    const filename = `code${langInfo?.extension || '.txt'}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Code saved",
      description: `File saved as ${filename}`,
    });
  };

  const handleLoadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
        
        // Try to detect language from file extension
        const extension = file.name.split('.').pop()?.toLowerCase();
        const detectedLang = languages.find(l => l.extension === `.${extension}`)?.value;
        if (detectedLang) {
          setLanguage(detectedLang);
        }
        
        toast({
          title: "File loaded",
          description: `${file.name} loaded successfully`,
        });
      };
      reader.readAsText(file);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copied",
      description: "Code copied to clipboard",
    });
  };

  const handleClearCode = () => {
    setCode('');
    setOutput('');
    toast({
      title: "Code cleared",
      description: "Editor cleared successfully",
    });
  };

  const handleExplainCode = () => {
    if (!code.trim()) {
      toast({
        title: "No code to explain",
        description: "Please enter some code first",
        variant: "destructive",
      });
      return;
    }
    onExplain?.(code, language);
  };

  const handleDebugCode = () => {
    if (!code.trim()) {
      toast({
        title: "No code to debug",
        description: "Please enter some code first",
        variant: "destructive",
      });
      return;
    }
    onDebug?.(code, language);
  };

  const handleTranslateCode = () => {
    if (!code.trim()) {
      toast({
        title: "No code to translate",
        description: "Please enter some code first",
        variant: "destructive",
      });
      return;
    }
    onTranslate?.(code, language, translateToLang);
  };

  const getCurrentLanguageInfo = () => {
    return languages.find(l => l.value === language);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Code Editor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {getCurrentLanguageInfo()?.label || 'Unknown'}
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {theme === 'high-contrast' ? 'High Contrast' : theme === 'dark' ? 'Dark' : 'Light'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs defaultValue="editor" className="flex-1 flex flex-col">
          <div className="border-b">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="editor" className="flex-1 flex flex-col m-0">
            <div className="border-b p-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-3 h-3 mr-1" />
                  {isRunning ? 'Running...' : 'Run'}
                </Button>
                
                <Separator orientation="vertical" className="h-6" />
                
                <Button size="sm" variant="outline" onClick={handleCopyCode}>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                
                <Button size="sm" variant="outline" onClick={handleSaveCode}>
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
                
                <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-3 h-3 mr-1" />
                  Load
                </Button>
                
                <Button size="sm" variant="outline" onClick={handleClearCode}>
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear
                </Button>
                
                <Separator orientation="vertical" className="h-6" />
                
                <Button size="sm" variant="outline" onClick={handleExplainCode}>
                  <FileText className="w-3 h-3 mr-1" />
                  Explain
                </Button>
                
                <Button size="sm" variant="outline" onClick={handleDebugCode}>
                  <Bug className="w-3 h-3 mr-1" />
                  Debug
                </Button>
                
                <select
                  value={translateToLang}
                  onChange={(e) => setTranslateToLang(e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  {languages.filter(l => l.value !== language).map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                
                <Button size="sm" variant="outline" onClick={handleTranslateCode}>
                  <Languages className="w-3 h-3 mr-1" />
                  Translate
                </Button>
              </div>
            </div>

            <div className="flex-1">
              <Editor
                height="100%"
                language={language}
                value={code}
                theme={theme === 'dark' ? 'vs-dark' : theme === 'light' ? 'vs-light' : 'hc-black'}
                onChange={handleEditorChange}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
                options={{
                  fontSize: fontSize,
                  minimap: { enabled: false },
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  bracketPairColorization: { enabled: true },
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: true,
                  parameterHints: { enabled: true },
                  formatOnType: true,
                  formatOnPaste: true,
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="output" className="flex-1 m-0">
            <div className="p-4 h-full">
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg h-full overflow-auto font-mono text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400">Output:</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setOutput('')}
                    className="text-gray-400 hover:text-white"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap">
                  {output || 'No output yet. Run your code to see results.'}
                </pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 m-0">
            <div className="p-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Languages className="w-4 h-4 inline mr-1" />
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {languages.map(lang => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Palette className="w-4 h-4 inline mr-1" />
                    Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'dark' | 'light' | 'high-contrast')}
                    className="w-full p-2 border rounded-md"
                  >
                    {themes.map(t => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Settings className="w-4 h-4 inline mr-1" />
                    Font Size
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    {fontSize}px
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Code Statistics
                  </label>
                  <div className="space-y-1 text-sm">
                    <div>Lines: {code.split('\n').length}</div>
                    <div>Characters: {code.length}</div>
                    <div>Words: {code.split(/\s+/).filter(w => w.length > 0).length}</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Keyboard Shortcuts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><kbd className="bg-gray-200 px-1 rounded">Ctrl+S</kbd> - Save file</div>
                  <div><kbd className="bg-gray-200 px-1 rounded">Ctrl+D</kbd> - Duplicate line</div>
                  <div><kbd className="bg-gray-200 px-1 rounded">Ctrl+/</kbd> - Toggle comment</div>
                  <div><kbd className="bg-gray-200 px-1 rounded">Ctrl+F</kbd> - Find</div>
                  <div><kbd className="bg-gray-200 px-1 rounded">Ctrl+H</kbd> - Replace</div>
                  <div><kbd className="bg-gray-200 px-1 rounded">F11</kbd> - Fullscreen</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLoadFile}
        style={{ display: 'none' }}
        accept=".py,.js,.ts,.java,.cpp,.c,.html,.css,.sql,.r,.go,.rs,.php,.json,.yaml,.yml,.txt"
      />
    </Card>
  );
};

export default CodeEditor;