import moviesData from '../data/movies.json';
import movieQuotes from '../data/movieQuotes.json';
import characterPersonalities from '../data/characterPersonalities.json';
import conversationalPatterns from '../data/conversationalPatterns.json';
import Fuse from 'fuse.js';
import { pipeline } from '@huggingface/transformers';

export interface Movie {
  id: number;
  title: string;
  genre: string;
  rating: number;
  year: number;
  director: string;
  description: string;
}

export interface MovieEmbedding {
  movie: Movie;
  embedding?: number[];
}

export interface Quote {
  movie: string;
  character: string;
  quote: string;
  context: string;
}

export interface Character {
  name: string;
  personality: string;
  greeting: string;
  responseStyle: string;
  catchphrases: string[];
  moviePrefs: string[];
}

export class MovieService {
  private movies: Movie[] = moviesData;
  private quotes: Quote[] = movieQuotes;
  private characters: Record<string, Character> = characterPersonalities;
  private patterns = conversationalPatterns;
  private currentCharacter: string | null = null;
  private conversationHistory: string[] = [];
  private movieEmbeddings: MovieEmbedding[] = [];
  private fuse: Fuse<Movie>;
  private embedder: any = null;
  private isEmbedderLoading = false;

  constructor() {
    // Initialize Fuse.js for fuzzy search
    this.fuse = new Fuse(this.movies, {
      keys: [
        { name: 'title', weight: 0.7 },
        { name: 'director', weight: 0.2 },
        { name: 'description', weight: 0.1 }
      ],
      threshold: 0.4,
      includeScore: true
    });

    // Initialize movie embeddings structure
    this.movieEmbeddings = this.movies.map(movie => ({ movie }));
    
    // Initialize embedder
    this.initializeEmbedder();
  }

  private async initializeEmbedder() {
    if (this.isEmbedderLoading) return;
    
    try {
      this.isEmbedderLoading = true;
      // Use a smaller, browser-compatible model
      this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      
      // Pre-compute embeddings for all movies
      await this.computeMovieEmbeddings();
    } catch (error) {
      console.warn('Failed to initialize embedder:', error);
    } finally {
      this.isEmbedderLoading = false;
    }
  }

  private async computeMovieEmbeddings() {
    if (!this.embedder) return;

    for (let i = 0; i < this.movieEmbeddings.length; i++) {
      const movieData = this.movieEmbeddings[i];
      const text = `${movieData.movie.title} ${movieData.movie.genre} ${movieData.movie.description}`;
      
      try {
        const output = await this.embedder(text, { pooling: 'mean', normalize: true });
        movieData.embedding = Array.from(output.data);
      } catch (error) {
        console.warn(`Failed to compute embedding for ${movieData.movie.title}:`, error);
      }
    }
  }

  private async getQueryEmbedding(query: string): Promise<number[] | null> {
    if (!this.embedder) return null;
    
    try {
      const output = await this.embedder(query, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    } catch (error) {
      console.warn('Failed to compute query embedding:', error);
      return null;
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private async semanticSearch(query: string, topK: number = 5): Promise<Movie[]> {
    const queryEmbedding = await this.getQueryEmbedding(query);
    if (!queryEmbedding) return [];

    const similarities = this.movieEmbeddings
      .filter(item => item.embedding)
      .map(item => ({
        movie: item.movie,
        similarity: this.cosineSimilarity(queryEmbedding, item.embedding!)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    return similarities.map(item => item.movie);
  }

  // Enhanced fuzzy search
  private fuzzySearch(query: string): Movie[] {
    const results = this.fuse.search(query);
    return results.map(result => result.item);
  }

  // Enhanced sentiment analysis
  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['amazing', 'great', 'excellent', 'fantastic', 'awesome', 'love', 'best', 'incredible', 'outstanding'];
    const negativeWords = ['terrible', 'awful', 'bad', 'worst', 'hate', 'boring', 'disappointing', 'waste'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Enhanced movie rating with fuzzy search
  getMovieRating(title: string): string {
    // First try exact match
    let movie = this.movies.find(m => 
      m.title.toLowerCase() === title.toLowerCase()
    );
    
    // If no exact match, use fuzzy search
    if (!movie) {
      const fuzzyResults = this.fuzzySearch(title);
      if (fuzzyResults.length > 0) {
        movie = fuzzyResults[0];
      }
    }
    
    if (movie) {
      return `🎬 **"${movie.title}"** (${movie.year})\n\n` +
             `⭐ **Rating:** ${movie.rating}/10\n` +
             `🎭 **Genre:** ${movie.genre}\n` +
             `🎬 **Director:** ${movie.director}\n\n` +
             `📖 **Plot:** ${movie.description}`;
    }
    
    // Suggest similar movies if no match found
    const suggestions = this.fuzzySearch(title).slice(0, 3);
    if (suggestions.length > 0) {
      const suggestionText = suggestions.map(m => `"${m.title}"`).join(', ');
      return `❌ Sorry, I couldn't find "${title}". Did you mean: ${suggestionText}?`;
    }
    
    return `❌ Sorry, I couldn't find "${title}". Try searching for another movie or ask for recommendations!`;
  }

  // Enhanced recommendations with multiple strategies
  async getRecommendations(genre?: string, topN: number = 5, query?: string): Promise<string> {
    let recommendedMovies: Movie[] = [];
    
    // Strategy 1: Semantic search if query provided
    if (query && this.embedder) {
      try {
        const semanticResults = await this.semanticSearch(query, topN * 2);
        recommendedMovies = semanticResults;
      } catch (error) {
        console.warn('Semantic search failed:', error);
      }
    }
    
    // Strategy 2: Genre filtering
    if (genre) {
      const genreMovies = this.movies.filter(m => 
        m.genre.toLowerCase().includes(genre.toLowerCase())
      );
      
      if (genreMovies.length === 0) {
        // Try fuzzy search on genre
        const allGenres = this.getGenres();
        const genreFuse = new Fuse(allGenres, { threshold: 0.4 });
        const genreMatches = genreFuse.search(genre);
        
        if (genreMatches.length > 0) {
          const suggestedGenre = genreMatches[0].item;
          return `❌ No movies found for "${genre}". Did you mean "${suggestedGenre}"? Try: "Recommend ${suggestedGenre} movies"`;
        }
        
        return `❌ Sorry, I couldn't find any movies in the "${genre}" genre. Available genres: ${this.getGenres().join(', ')}`;
      }
      
      // If we have semantic results, filter by genre
      if (recommendedMovies.length > 0) {
        recommendedMovies = recommendedMovies.filter(m => 
          genreMovies.some(gm => gm.id === m.id)
        );
      } else {
        recommendedMovies = genreMovies;
      }
    }
    
    // Strategy 3: Default to highest rated if no other strategy worked
    if (recommendedMovies.length === 0) {
      recommendedMovies = this.movies;
    }
    
    // Sort by rating and take top N
    const topMovies = recommendedMovies
      .sort((a, b) => b.rating - a.rating)
      .slice(0, topN);
    
    // Generate response with enhanced formatting
    const genreText = genre ? ` ${genre}` : '';
    const searchMethod = query && this.embedder ? ' (AI-powered)' : '';
    let response = `🏆 Top${genreText} movies${searchMethod}:\n\n`;
    
    topMovies.forEach((movie, index) => {
      const stars = '⭐'.repeat(Math.floor(movie.rating / 2));
      response += `${index + 1}. **${movie.title}** (${movie.year}) ${stars}\n`;
      response += `   📊 Rating: ${movie.rating}/10 | 🎭 ${movie.genre}\n`;
      response += `   📖 ${movie.description.substring(0, 120)}...\n\n`;
    });
    
    // Add recommendation reason
    if (query && this.embedder) {
      response += `💡 *Recommendations based on semantic similarity to: "${query}"*`;
    } else if (genre) {
      response += `💡 *Showing top-rated ${genre} movies*`;
    } else {
      response += `💡 *Showing highest-rated movies across all genres*`;
    }
    
    return response;
  }

  // Get all genres
  getGenres(): string[] {
    return [...new Set(this.movies.map(m => m.genre))];
  }

  // Enhanced query processing with conversational AI and character personalities
  async processQuery(input: string): Promise<string> {
    this.conversationHistory.push(input);
    const query = input.toLowerCase();
    const sentiment = this.analyzeSentiment(input);
    
    // Check for character mode activation
    const characterMatch = this.detectCharacterRequest(input);
    if (characterMatch) {
      this.currentCharacter = characterMatch;
      return this.getCharacterGreeting(characterMatch);
    }
    
    // Enhanced pattern recognition with natural conversation
    const patterns = {
      greeting: /(?:hello|hi|hey|what's up|howdy|good morning|good evening)/i,
      rating: /(?:rating|rate|score|how good|how is|what.*rating|what.*score)/i,
      recommendation: /(?:recommend|suggest|find|show|top|best|good|similar|what should i watch)/i,
      specific_movie: /(?:tell me about|what about|info|information|details|thoughts on)/i,
      genre_list: /(?:genre|category|type|kind|what.*genre|available)/i,
      comparison: /(?:better|worse|compare|vs|versus|or|which)/i,
      mood_based: /(?:feel like|mood|tonight|today|weekend|in the mood for)/i,
      quote_request: /(?:quote|famous line|memorable|iconic|dialogue)/i,
      personality_switch: /(?:talk like|be like|channel|roleplay|pretend)/i
    };
    
    // 1. Handle greetings with personality
    if (patterns.greeting.test(query) && this.conversationHistory.length <= 2) {
      return this.getRandomGreeting();
    }
    
    // 2. Quote requests
    if (patterns.quote_request.test(query)) {
      return this.getMovieQuote(input);
    }
    
    // 3. Character-specific responses
    if (this.currentCharacter) {
      return await this.getCharacterResponse(input);
    }
    
    // 4. Rating queries with conversational flair
    if (patterns.rating.test(query)) {
      const extractedTitle = this.extractMovieTitle(input);
      if (extractedTitle) {
        const rating = this.getMovieRating(extractedTitle);
        return this.addConversationalFlair(rating, 'rating');
      }
    }
    
    // 5. Recommendation queries with personality
    if (patterns.recommendation.test(query)) {
      const genre = this.extractGenre(input);
      const moodKeywords = this.extractMoodKeywords(input);
      
      let result;
      if (this.embedder && !genre) {
        result = await this.getRecommendations(undefined, 5, input);
      } else {
        result = await this.getRecommendations(genre, 5);
      }
      
      return this.addConversationalFlair(result, 'recommendation');
    }
    
    // 6. Mood-based recommendations with empathy
    if (patterns.mood_based.test(query)) {
      const mood = this.analyzeMood(input);
      const result = await this.getMoodBasedRecommendations(mood);
      return this.addEmotionalResponse(result, mood);
    }
    
    // 7. Movie comparisons with dramatic flair
    if (patterns.comparison.test(query)) {
      return this.handleMovieComparison(input);
    }
    
    // 8. Genre listing with enthusiasm
    if (patterns.genre_list.test(query)) {
      const genres = this.getGenres();
      const response = `🎭 **Available genres:** ${genres.join(', ')}\n\n` +
                      `🔥 **Popular choices:** Action, Drama, Comedy, Thriller\n\n` +
                      `Try: "Recommend action movies" or "What are the best dramas?"`;
      return this.addConversationalFlair(response, 'enthusiasm');
    }
    
    // 9. Fuzzy search with conversational response
    const fuzzyResults = this.fuzzySearch(input);
    if (fuzzyResults.length > 0) {
      const movie = fuzzyResults[0];
      const movieInfo = `🎬 **${movie.title}** (${movie.year})\n\n` +
                       `⭐ **Rating:** ${movie.rating}/10\n` +
                       `🎭 **Genre:** ${movie.genre}\n` +
                       `🎬 **Director:** ${movie.director}\n\n` +
                       `📖 **Description:** ${movie.description}`;
      return this.addConversationalFlair(movieInfo, 'discovery');
    }
    
    // 10. Default response with conversation starters
    return this.getEngagingDefaultResponse(sentiment);
  }

  private extractMovieTitle(input: string): string | null {
    // Remove common question words and extract movie title
    const cleanInput = input
      .replace(/(?:what's|what is|tell me about|rating of|how is|info about)/gi, '')
      .replace(/[?.,!]/g, '')
      .trim();
    
    // Try to find movie by fuzzy search
    const results = this.fuzzySearch(cleanInput);
    return results.length > 0 ? results[0].title : cleanInput;
  }

  private extractGenre(input: string): string | undefined {
    const genres = this.getGenres();
    return genres.find(genre => 
      input.toLowerCase().includes(genre.toLowerCase())
    );
  }

  private extractMoodKeywords(input: string): string[] {
    const moodKeywords = {
      happy: ['funny', 'comedy', 'laugh', 'cheerful', 'upbeat'],
      sad: ['emotional', 'cry', 'drama', 'touching', 'heartbreaking'],
      excited: ['action', 'adventure', 'thrilling', 'intense', 'exciting'],
      relaxed: ['calm', 'peaceful', 'light', 'easy', 'simple']
    };
    
    const found: string[] = [];
    const lowerInput = input.toLowerCase();
    
    Object.entries(moodKeywords).forEach(([mood, keywords]) => {
      if (keywords.some(keyword => lowerInput.includes(keyword))) {
        found.push(mood);
      }
    });
    
    return found;
  }

  private analyzeMood(input: string): string {
    const moodPatterns = {
      happy: /(?:happy|cheerful|upbeat|good mood|positive)/i,
      sad: /(?:sad|down|emotional|cry|depressed)/i,
      excited: /(?:excited|pumped|energetic|action|adventure)/i,
      relaxed: /(?:relaxed|calm|chill|peaceful|quiet)/i,
      romantic: /(?:romantic|love|date|couple)/i
    };
    
    for (const [mood, pattern] of Object.entries(moodPatterns)) {
      if (pattern.test(input)) return mood;
    }
    
    return 'neutral';
  }

  private async getMoodBasedRecommendations(mood: string): Promise<string> {
    const moodToGenre = {
      happy: 'Animation',
      sad: 'Drama', 
      excited: 'Action',
      relaxed: 'Romance',
      romantic: 'Romance',
      neutral: undefined
    };
    
    const genre = moodToGenre[mood as keyof typeof moodToGenre];
    const result = await this.getRecommendations(genre, 3);
    
    return `🎭 **Perfect for your ${mood} mood:**\n\n${result}`;
  }

  // New conversational methods
  private detectCharacterRequest(input: string): string | null {
    const lowerInput = input.toLowerCase();
    const characters = Object.keys(this.characters);
    
    for (const char of characters) {
      if (lowerInput.includes(char) || 
          lowerInput.includes(this.characters[char].name.toLowerCase()) ||
          (char === 'tony_stark' && (lowerInput.includes('iron man') || lowerInput.includes('stark')))) {
        return char;
      }
    }
    
    return null;
  }

  private getCharacterGreeting(characterKey: string): string {
    const character = this.characters[characterKey];
    return `🎭 **${character.name} Mode Activated!**\n\n` +
           `${character.greeting}\n\n` +
           `*${character.personality}*\n\n` +
           `${this.getRandomElement(character.catchphrases)}`;
  }

  private async getCharacterResponse(input: string): Promise<string> {
    if (!this.currentCharacter) return await this.processQuery(input);
    
    const character = this.characters[this.currentCharacter];
    const baseResponse = await this.processQuery(input);
    
    // Add character flavor to the response
    const characterFlavor = this.getRandomElement(character.catchphrases);
    const styledResponse = this.styleResponseForCharacter(baseResponse, character);
    
    return `🎭 **${character.name}:** ${styledResponse}\n\n*${characterFlavor}*`;
  }

  private styleResponseForCharacter(response: string, character: Character): string {
    switch (character.name) {
      case 'Master Yoda':
        return this.yodaSpeak(response);
      case 'Tony Stark':
        return this.tonyStarkSpeak(response);
      case 'Sherlock Holmes':
        return this.sherlockSpeak(response);
      default:
        return response;
    }
  }

  private yodaSpeak(text: string): string {
    // Simple Yoda speech pattern simulation
    return text.replace(/You should/g, 'Watch, you should')
             .replace(/I recommend/g, 'Recommend, I do')
             .replace(/This movie/g, 'Strong with the Force, this movie');
  }

  private tonyStarkSpeak(text: string): string {
    return text.replace(/🎬/g, '🔧')
             .replace(/Here's/g, "FRIDAY says")
             .replace(/I think/g, "My AI analysis indicates");
  }

  private sherlockSpeak(text: string): string {
    return text.replace(/I notice/g, 'I deduce')
             .replace(/It seems/g, 'Elementary, Watson - it appears')
             .replace(/probably/g, 'with 97.3% certainty');
  }

  private getMovieQuote(input: string): string {
    const movieTitle = this.extractMovieTitle(input);
    let relevantQuotes = this.quotes;
    
    if (movieTitle) {
      relevantQuotes = this.quotes.filter(q => 
        q.movie.toLowerCase().includes(movieTitle.toLowerCase())
      );
    }
    
    if (relevantQuotes.length === 0) {
      relevantQuotes = this.quotes;
    }
    
    const quote = this.getRandomElement(relevantQuotes);
    return `🎬 **"${quote.quote}"**\n\n` +
           `— ${quote.character}, *${quote.movie}*\n\n` +
           `${this.getRandomElement(this.patterns.movieReactions.high_rating)}`;
  }

  private addConversationalFlair(response: string, type: string): string {
    const transition = this.getRandomElement(this.patterns.transitions.enthusiasm);
    const filler = this.getRandomElement(this.patterns.conversationalFillers);
    
    return `${transition} ${filler}\n\n${response}`;
  }

  private addEmotionalResponse(response: string, mood: string): string {
    const emotionalResponse = this.getRandomElement(this.patterns.emotionalResponses.sympathy);
    return `${emotionalResponse}\n\n${response}`;
  }

  private handleMovieComparison(input: string): string {
    const movies = this.extractMultipleMovies(input);
    if (movies.length >= 2) {
      const movie1 = movies[0];
      const movie2 = movies[1];
      
      return `🥊 **Epic Movie Battle!**\n\n` +
             `🎬 **${movie1.title}** (${movie1.rating}/10) vs **${movie2.title}** (${movie2.rating}/10)\n\n` +
             `**Winner:** ${movie1.rating > movie2.rating ? movie1.title : movie2.title}!\n\n` +
             `${this.getRandomElement(this.patterns.movieReactions.high_rating)}`;
    }
    
    return "Tell me which movies you'd like me to compare, and I'll give you the ultimate showdown! 🥊";
  }

  private extractMultipleMovies(input: string): Movie[] {
    const words = input.toLowerCase().split(/\s+/);
    const foundMovies: Movie[] = [];
    
    for (const movie of this.movies) {
      if (words.some(word => movie.title.toLowerCase().includes(word))) {
        foundMovies.push(movie);
      }
    }
    
    return foundMovies.slice(0, 2);
  }

  private getRandomGreeting(): string {
    return this.getRandomElement(this.patterns.greetings);
  }

  private getEngagingDefaultResponse(sentiment: string): string {
    const greeting = this.getRandomElement(this.patterns.greetings);
    const emotionalResponse = this.getRandomElement(this.patterns.emotionalResponses.excitement);
    
    return `${greeting}\n\n${emotionalResponse}\n\n` +
           `🎯 **I'm your conversational Movie AI!** I can:\n` +
           `• 🗣️ **Chat naturally** about any movie\n` +
           `• 🎭 **Channel characters** like Yoda, Tony Stark, or Sherlock\n` +
           `• 💬 **Share iconic quotes** and memorable lines\n` +
           `• 🎪 **Make recommendations** with personality and flair\n` +
           `• 😊 **Match your mood** and energy level\n\n` +
           `💡 **Try saying:** "Talk like Yoda" or "Give me a quote from The Dark Knight"!`;
  }

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Enhanced AI response with multiple intelligence layers
  async generateAIResponse(query: string, context: string): Promise<string> {
    const response = await this.processQuery(query);
    
    // Add contextual intelligence
    if (response.includes('Sorry') || response.includes('❌')) {
      const suggestions = await this.getSmartSuggestions(query);
      return response + `\n\n${suggestions}`;
    }
    
    // Add follow-up suggestions for successful responses
    if (response.includes('Rating:') || response.includes('🎬')) {
      const followUp = await this.generateFollowUpSuggestions(query);
      return response + `\n\n${followUp}`;
    }
    
    return response;
  }

  private async getSmartSuggestions(failedQuery: string): Promise<string> {
    // Use semantic search to find similar content
    if (this.embedder) {
      try {
        const similarMovies = await this.semanticSearch(failedQuery, 3);
        if (similarMovies.length > 0) {
          const suggestions = similarMovies.map(m => `"${m.title}"`).join(', ');
          return `💡 **You might be interested in:** ${suggestions}`;
        }
      } catch (error) {
        console.warn('Semantic suggestions failed:', error);
      }
    }
    
    // Fallback to high-rated movies
    const topMovies = this.movies
      .filter(m => m.rating >= 8.5)
      .slice(0, 3)
      .map(m => `"${m.title}" (${m.rating}/10)`);
      
    return `🌟 **Highly recommended instead:** ${topMovies.join(', ')}`;
  }

  private async generateFollowUpSuggestions(query: string): Promise<string> {
    const suggestions = [
      "💬 Ask me: \"Recommend movies like this one\"",
      "🎭 Try: \"What other movies are in this genre?\"", 
      "⭐ Or: \"Show me more highly-rated movies\"",
      "🎬 Ask: \"Tell me about the director's other work\""
    ];
    
    return `**What's next?**\n${suggestions.slice(0, 2).join('\n')}`;
  }
}