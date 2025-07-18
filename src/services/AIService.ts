import { IntentMatcher } from './IntentMatcher';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  language?: string;
}

export interface CodeGenerationRequest {
  prompt: string;
  language?: string;
  context?: string;
}

export class AIService {
  private intentMatcher: IntentMatcher;
  private conversationHistory: ChatMessage[] = [];

  constructor() {
    this.intentMatcher = new IntentMatcher();
  }

  // Main chat processing method (simulates LangChain pipeline)
  async processChat(userInput: string): Promise<ChatMessage> {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content: userInput,
      timestamp: new Date()
    };

    this.conversationHistory.push(userMessage);

    // Try intent matching first
    const intentMatch = this.intentMatcher.matchIntent(userInput);
    
    let response: string;
    
    if (intentMatch && intentMatch.confidence > 0.7) {
      // High confidence intent match - use predefined response
      response = this.intentMatcher.getResponse(intentMatch.intent, userInput);
    } else {
      // Low confidence or no match - use AI generation
      response = await this.generateAIResponse(userInput);
    }

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'assistant',
      content: response,
      timestamp: new Date()
    };

    this.conversationHistory.push(assistantMessage);
    return assistantMessage;
  }

  // Simulates the LangChain + LLM pipeline
  private async generateAIResponse(userInput: string): Promise<string> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Code generation patterns
    if (this.isCodeGenerationRequest(userInput)) {
      return this.generateCode(userInput);
    }

    // Code explanation patterns
    if (this.isCodeExplanationRequest(userInput)) {
      return this.explainCode(userInput);
    }

    // Debugging patterns
    if (this.isDebuggingRequest(userInput)) {
      return this.debugCode(userInput);
    }

    // Default conversational response
    return this.generateConversationalResponse(userInput);
  }

  private isCodeGenerationRequest(input: string): boolean {
    const codeGenKeywords = ['write', 'create', 'generate', 'make', 'build', 'implement', 'function', 'class', 'algorithm'];
    return codeGenKeywords.some(keyword => input.toLowerCase().includes(keyword));
  }

  private isCodeExplanationRequest(input: string): boolean {
    const explainKeywords = ['explain', 'what does', 'how does', 'breakdown', 'walk through'];
    return explainKeywords.some(keyword => input.toLowerCase().includes(keyword));
  }

  private isDebuggingRequest(input: string): boolean {
    const debugKeywords = ['debug', 'error', 'fix', 'bug', 'not working', 'issue'];
    return debugKeywords.some(keyword => input.toLowerCase().includes(keyword));
  }

  private generateCode(request: string): string {
    const language = this.detectLanguage(request);
    
    if (request.toLowerCase().includes('bubble sort')) {
      return this.getBubbleSortCode(language);
    }
    
    if (request.toLowerCase().includes('flask') && request.toLowerCase().includes('api')) {
      return this.getFlaskAPICode();
    }
    
    if (request.toLowerCase().includes('function')) {
      return this.getGenericFunctionCode(language, request);
    }

    return `Here's a ${language} code template based on your request:

\`\`\`${language}
# ${request}
# TODO: Implement the specific functionality you described

def your_function():
    """
    ${request}
    """
    pass

# Example usage
if __name__ == "__main__":
    your_function()
\`\`\`

Would you like me to elaborate on any specific part of this implementation?`;
  }

  private getBubbleSortCode(language: string): string {
    if (language === 'python') {
      return `Here's a Python implementation of bubble sort:

\`\`\`python
def bubble_sort(arr):
    """
    Sorts an array using the bubble sort algorithm.
    Time Complexity: O(n²)
    Space Complexity: O(1)
    """
    n = len(arr)
    
    # Traverse through all array elements
    for i in range(n):
        # Flag to optimize - if no swapping occurs, array is sorted
        swapped = False
        
        # Last i elements are already in place
        for j in range(0, n - i - 1):
            # Swap if the element found is greater than the next element
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        
        # If no swapping occurred, array is sorted
        if not swapped:
            break
    
    return arr

# Example usage
numbers = [64, 34, 25, 12, 22, 11, 90]
print("Original array:", numbers)
sorted_numbers = bubble_sort(numbers.copy())
print("Sorted array:", sorted_numbers)
\`\`\`

This implementation includes optimization to stop early if the array becomes sorted before all passes are complete.`;
    }
    
    return `Here's a ${language} implementation of bubble sort:

\`\`\`${language}
// Bubble sort implementation
// Add your ${language} code here
\`\`\``;
  }

  private getFlaskAPICode(): string {
    return `Here's a Flask REST API with authentication:

\`\`\`python
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this!
jwt = JWTManager(app)

# Mock user database
users = {
    'admin': {
        'password': generate_password_hash('password123'),
        'role': 'admin'
    }
}

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if username in users and check_password_hash(users[username]['password'], password):
        access_token = create_access_token(
            identity=username,
            expires_delta=datetime.timedelta(hours=24)
        )
        return jsonify({
            'access_token': access_token,
            'user': {
                'username': username,
                'role': users[username]['role']
            }
        })
    
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({
        'message': f'Hello {current_user}!',
        'data': 'This is protected data'
    })

@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    current_user = get_jwt_identity()
    return jsonify({
        'users': list(users.keys()),
        'requested_by': current_user
    })

if __name__ == '__main__':
    app.run(debug=True)
\`\`\`

Don't forget to install the required packages:
\`\`\`bash
pip install flask flask-jwt-extended
\`\`\``;
  }

  private getGenericFunctionCode(language: string, request: string): string {
    return `Here's a ${language} function template:

\`\`\`${language}
def process_data(input_data):
    """
    ${request}
    
    Args:
        input_data: The input data to process
        
    Returns:
        Processed result
    """
    # Implementation based on: ${request}
    result = input_data
    
    # Add your logic here
    
    return result

# Example usage
sample_input = "example"
output = process_data(sample_input)
print(f"Result: {output}")
\`\`\`

Would you like me to customize this further based on your specific requirements?`;
  }

  private explainCode(request: string): string {
    return `I'd be happy to explain that code! However, I don't see any code in your message. 

Please paste the code you'd like me to explain, and I'll provide:

📝 **Line-by-line breakdown**
🔍 **Key concepts explanation**
💡 **Best practices and improvements**
🎯 **Use cases and examples**

You can paste code in any of these languages:
- Python, JavaScript, Java, C++, HTML/CSS, SQL, R
- Framework-specific code (React, Flask, Django, etc.)
- Algorithms and data structures

Just share your code and I'll walk through it step by step!`;
  }

  private debugCode(request: string): string {
    return `I'm here to help debug your code! 🐛

To provide the best debugging assistance, please share:

1. **Your code** - Paste the problematic code
2. **Error message** - The exact error you're seeing
3. **Expected vs actual behavior** - What should happen vs what's happening
4. **Context** - What you're trying to accomplish

Common debugging approaches I can help with:

🔍 **Syntax Errors**: Missing brackets, semicolons, indentation
⚡ **Logic Errors**: Incorrect algorithms or flow
🔧 **Runtime Errors**: Null pointers, index out of bounds
🎯 **Performance Issues**: Optimization suggestions

Paste your code and I'll identify the issue and provide a fix!`;
  }

  private generateConversationalResponse(input: string): string {
    const responses = [
      "That's an interesting question! Could you provide more details so I can give you a more specific answer?",
      "I'd be happy to help! Can you elaborate on what you're trying to accomplish?",
      "Great question! Let me know if you need help with any specific programming concepts or code implementation.",
      "I'm here to assist with your coding needs. What programming challenge are you working on?",
      "Feel free to ask me about code generation, debugging, explanations, or any programming concepts!"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private detectLanguage(input: string): string {
    const inputLower = input.toLowerCase();
    
    if (inputLower.includes('python') || inputLower.includes('django') || inputLower.includes('flask')) return 'python';
    if (inputLower.includes('javascript') || inputLower.includes('js') || inputLower.includes('react')) return 'javascript';
    if (inputLower.includes('java') && !inputLower.includes('javascript')) return 'java';
    if (inputLower.includes('c++') || inputLower.includes('cpp')) return 'cpp';
    if (inputLower.includes('html')) return 'html';
    if (inputLower.includes('css')) return 'css';
    if (inputLower.includes('sql')) return 'sql';
    if (inputLower.includes('r ') || inputLower.includes(' r')) return 'r';
    
    return 'python'; // Default to Python
  }

  // Get conversation history
  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  // Clear conversation
  clearConversation(): void {
    this.conversationHistory = [];
  }

  // Process image (OCR simulation)
  async processImage(file: File): Promise<string> {
    // Simulate OCR processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return `# Extracted code from image (simulated)
def example_function():
    """
    This is simulated OCR text extraction.
    In a real implementation, this would use:
    - Tesseract.js for client-side OCR
    - Or a server-side OCR service
    """
    print("Hello, World!")
    return "OCR simulation complete"

# The actual image processing would extract real code
# For now, this is a placeholder showing OCR capability`;
  }
}