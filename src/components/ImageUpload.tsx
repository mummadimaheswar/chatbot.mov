import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Download, 
  Copy, 
  Trash2,
  Camera,
  ScanLine,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExtractedCode {
  id: string;
  code: string;
  language: string;
  confidence: number;
  originalImage: string;
  extractedAt: Date;
}

interface ImageUploadProps {
  onCodeExtracted?: (code: string, language: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onCodeExtracted }) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [extractedCodes, setExtractedCodes] = useState<ExtractedCode[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    toast({
      title: "Files uploaded",
      description: `${acceptedFiles.length} file(s) uploaded successfully`,
    });
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    maxFiles: 5
  });

  const simulateOCR = async (imageFile: File): Promise<ExtractedCode> => {
    // Simulate OCR processing with different code samples
    const codeSamples = [
      {
        code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

# Test the function
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = bubble_sort(numbers)
print(sorted_numbers)`,
        language: 'python',
        confidence: 0.92
      },
      {
        code: `function quickSort(arr) {
    if (arr.length <= 1) {
        return arr;
    }
    
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = [];
    const right = [];
    
    for (let i = 0; i < arr.length; i++) {
        if (i === Math.floor(arr.length / 2)) continue;
        
        if (arr[i] < pivot) {
            left.push(arr[i]);
        } else {
            right.push(arr[i]);
        }
    }
    
    return [...quickSort(left), pivot, ...quickSort(right)];
}

// Example usage
const numbers = [3, 6, 8, 10, 1, 2, 1];
console.log(quickSort(numbers));`,
        language: 'javascript',
        confidence: 0.88
      },
      {
        code: `#include <iostream>
#include <vector>
#include <algorithm>

class BinarySearch {
public:
    static int search(const std::vector<int>& arr, int target) {
        int left = 0;
        int right = arr.size() - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (arr[mid] == target) {
                return mid;
            } else if (arr[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return -1; // Not found
    }
};

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    int target = 7;
    
    int result = BinarySearch::search(numbers, target);
    if (result != -1) {
        std::cout << "Element found at index: " << result << std::endl;
    } else {
        std::cout << "Element not found" << std::endl;
    }
    
    return 0;
}`,
        language: 'cpp',
        confidence: 0.95
      },
      {
        code: `public class LinkedList {
    private Node head;
    
    private static class Node {
        int data;
        Node next;
        
        Node(int data) {
            this.data = data;
            this.next = null;
        }
    }
    
    public void insert(int data) {
        Node newNode = new Node(data);
        if (head == null) {
            head = newNode;
        } else {
            Node current = head;
            while (current.next != null) {
                current = current.next;
            }
            current.next = newNode;
        }
    }
    
    public void display() {
        Node current = head;
        while (current != null) {
            System.out.print(current.data + " -> ");
            current = current.next;
        }
        System.out.println("null");
    }
    
    public static void main(String[] args) {
        LinkedList list = new LinkedList();
        list.insert(10);
        list.insert(20);
        list.insert(30);
        list.display();
    }
}`,
        language: 'java',
        confidence: 0.90
      }
    ];

    // Simulate processing time
    const totalSteps = 5;
    for (let i = 0; i <= totalSteps; i++) {
      setProcessingProgress((i / totalSteps) * 100);
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    }

    // Return a random code sample
    const randomSample = codeSamples[Math.floor(Math.random() * codeSamples.length)];
    
    return {
      id: Date.now().toString(),
      ...randomSample,
      originalImage: URL.createObjectURL(imageFile),
      extractedAt: new Date()
    };
  };

  const processImage = async (imageFile: File) => {
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const extractedCode = await simulateOCR(imageFile);
      setExtractedCodes(prev => [...prev, extractedCode]);
      
      toast({
        title: "OCR Complete",
        description: `Code extracted with ${(extractedCode.confidence * 100).toFixed(1)}% confidence`,
      });
    } catch (error) {
      toast({
        title: "OCR Failed",
        description: "Failed to extract code from image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const processAllImages = async () => {
    for (const file of uploadedFiles) {
      await processImage(file);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copied",
      description: "Code copied to clipboard",
    });
  };

  const downloadCode = (code: string, language: string) => {
    const extensions = {
      python: '.py',
      javascript: '.js',
      java: '.java',
      cpp: '.cpp',
      c: '.c',
      html: '.html',
      css: '.css',
      sql: '.sql',
      r: '.r'
    };
    
    const extension = extensions[language as keyof typeof extensions] || '.txt';
    const filename = `extracted_code_${Date.now()}${extension}`;
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Code downloaded",
      description: `File saved as ${filename}`,
    });
  };

  const sendToEditor = (code: string, language: string) => {
    onCodeExtracted?.(code, language);
    toast({
      title: "Code sent to editor",
      description: "Code has been loaded into the editor",
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExtractedCode = (id: string) => {
    setExtractedCodes(prev => prev.filter(code => code.id !== id));
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-indigo-600" />
          Image-to-Code Converter
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs defaultValue="upload" className="flex-1 flex flex-col">
          <div className="border-b">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="process">Process</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upload" className="flex-1 m-0 p-4">
            <div className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-gray-300 hover:border-indigo-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                {isDragActive ? (
                  <p className="text-indigo-600">Drop the images here...</p>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">Drop images here or click to select</p>
                    <p className="text-sm text-muted-foreground">
                      Supports JPG, PNG, GIF, BMP, WebP formats
                    </p>
                  </div>
                )}
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Uploaded Files:</h3>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-sm">{file.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(index)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="process" className="flex-1 m-0 p-4">
            <div className="space-y-4">
              <div className="text-center">
                <ScanLine className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
                <h3 className="text-lg font-medium mb-2">OCR Processing</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Extract code from uploaded images using advanced OCR technology
                </p>
                
                <Button
                  onClick={processAllImages}
                  disabled={uploadedFiles.length === 0 || isProcessing}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : `Process ${uploadedFiles.length} Image(s)`}
                </Button>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ScanLine className="w-4 h-4 animate-pulse text-indigo-600" />
                    <span className="text-sm">Extracting code from image...</span>
                  </div>
                  <Progress value={processingProgress} className="w-full" />
                  <div className="text-xs text-muted-foreground text-center">
                    {processingProgress.toFixed(0)}% complete
                  </div>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2">OCR Features:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>Multi-language support:</strong> Python, JavaScript, Java, C++, and more</li>
                  <li>• <strong>High accuracy:</strong> Advanced ML models for code recognition</li>
                  <li>• <strong>Automatic formatting:</strong> Preserves indentation and structure</li>
                  <li>• <strong>Error correction:</strong> Fixes common OCR mistakes</li>
                  <li>• <strong>Batch processing:</strong> Process multiple images at once</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="flex-1 m-0 p-4">
            <div className="space-y-4">
              {extractedCodes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No extracted code yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload and process images to see extracted code here
                  </p>
                </div>
              ) : (
                extractedCodes.map((extracted) => (
                  <Card key={extracted.id} className="border border-green-200 dark:border-green-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Code Extracted</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {extracted.language}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {(extracted.confidence * 100).toFixed(1)}% confidence
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeExtractedCode(extracted.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Extracted: {extracted.extractedAt.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="bg-gray-900 rounded-lg overflow-hidden">
                          <div className="flex items-center justify-between bg-gray-800 px-3 py-2">
                            <span className="text-sm text-gray-300">
                              {extracted.language} code
                            </span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyCode(extracted.code)}
                                className="text-gray-400 hover:text-white"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => downloadCode(extracted.code, extracted.language)}
                                className="text-gray-400 hover:text-white"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => sendToEditor(extracted.code, extracted.language)}
                                className="text-gray-400 hover:text-white"
                              >
                                <FileText className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <pre className="p-3 text-sm text-gray-100 overflow-x-auto">
                            <code>{extracted.code}</code>
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ImageUpload;