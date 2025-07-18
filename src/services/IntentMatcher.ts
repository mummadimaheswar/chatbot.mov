import intentsData from '../data/intents.json';

interface Intent {
  tag: string;
  patterns: string[];
  responses: string[];
}

export class IntentMatcher {
  private intents: Intent[] = intentsData.intents;

  // Simple pattern matching using keyword similarity
  private calculateSimilarity(input: string, pattern: string): number {
    const inputWords = input.toLowerCase().split(/\s+/);
    const patternWords = pattern.toLowerCase().split(/\s+/);
    
    let matches = 0;
    for (const word of inputWords) {
      if (patternWords.some(p => p.includes(word) || word.includes(p))) {
        matches++;
      }
    }
    
    return matches / Math.max(inputWords.length, patternWords.length);
  }

  // Find the best matching intent
  public matchIntent(userInput: string): { intent: Intent; confidence: number } | null {
    let bestMatch: Intent | null = null;
    let bestScore = 0;

    for (const intent of this.intents) {
      for (const pattern of intent.patterns) {
        const score = this.calculateSimilarity(userInput, pattern);
        if (score > bestScore && score > 0.3) { // Minimum confidence threshold
          bestScore = score;
          bestMatch = intent;
        }
      }
    }

    return bestMatch ? { intent: bestMatch, confidence: bestScore } : null;
  }

  // Get a random response from the matched intent
  public getResponse(intent: Intent, userInput?: string): string {
    const responses = intent.responses;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Replace placeholders if needed
    if (userInput && randomResponse.includes('{language}')) {
      const detectedLanguage = this.detectLanguage(userInput);
      return randomResponse.replace('{language}', detectedLanguage);
    }
    
    return randomResponse;
  }

  // Simple language detection based on keywords
  private detectLanguage(input: string): string {
    const languages = {
      'python': ['python', 'py', 'django', 'flask', 'pandas', 'numpy'],
      'javascript': ['javascript', 'js', 'node', 'react', 'vue', 'angular'],
      'java': ['java', 'spring', 'maven', 'gradle'],
      'c++': ['c++', 'cpp', 'iostream', 'vector'],
      'html': ['html', 'div', 'span', 'tag'],
      'css': ['css', 'style', 'class', 'selector'],
      'sql': ['sql', 'database', 'select', 'insert', 'update']
    };

    const inputLower = input.toLowerCase();
    for (const [lang, keywords] of Object.entries(languages)) {
      if (keywords.some(keyword => inputLower.includes(keyword))) {
        return lang;
      }
    }
    
    return 'programming';
  }
}