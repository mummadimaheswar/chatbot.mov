import moviesData from '../data/movies.json';

export interface Movie {
  id: number;
  title: string;
  genre: string;
  rating: number;
  year: number;
  director: string;
  description: string;
}

export class MovieService {
  private movies: Movie[] = moviesData;

  // Get movie rating by title
  getMovieRating(title: string): string {
    const movie = this.movies.find(m => 
      m.title.toLowerCase().includes(title.toLowerCase())
    );
    
    if (movie) {
      return `🎬 "${movie.title}" (${movie.year}) has a rating of ${movie.rating}/10. Directed by ${movie.director}.`;
    }
    
    return `Sorry, I couldn't find a movie matching "${title}". Try searching for another movie!`;
  }

  // Get recommendations by genre
  getRecommendations(genre?: string, topN: number = 5): string {
    let filteredMovies = this.movies;
    
    if (genre) {
      filteredMovies = this.movies.filter(m => 
        m.genre.toLowerCase().includes(genre.toLowerCase())
      );
      
      if (filteredMovies.length === 0) {
        return `Sorry, I couldn't find any movies in the "${genre}" genre.`;
      }
    }
    
    const topMovies = filteredMovies
      .sort((a, b) => b.rating - a.rating)
      .slice(0, topN);
    
    const genreText = genre ? ` ${genre}` : '';
    let response = `🏆 Top${genreText} movies:\n\n`;
    
    topMovies.forEach((movie, index) => {
      response += `${index + 1}. **${movie.title}** (${movie.year}) - ${movie.rating}/10\n`;
      response += `   *${movie.description.substring(0, 100)}...*\n\n`;
    });
    
    return response;
  }

  // Get all genres
  getGenres(): string[] {
    return [...new Set(this.movies.map(m => m.genre))];
  }

  // Process chat input and return appropriate response
  processQuery(input: string): string {
    const query = input.toLowerCase();
    
    // Check for rating queries
    if (query.includes('rating') || query.includes('rate') || query.includes('what is') || query.includes("what's")) {
      // Extract movie title from query
      const words = input.split(' ');
      const possibleTitle = words.slice(1).join(' ').replace(/[?.,!]/g, '');
      
      if (possibleTitle.length > 2) {
        return this.getMovieRating(possibleTitle);
      }
    }
    
    // Check for recommendation queries
    if (query.includes('recommend') || query.includes('suggest') || query.includes('top')) {
      const genres = this.getGenres();
      const foundGenre = genres.find(genre => 
        query.includes(genre.toLowerCase())
      );
      
      return this.getRecommendations(foundGenre);
    }
    
    // Check for genre listing
    if (query.includes('genre') || query.includes('category')) {
      const genres = this.getGenres();
      return `🎭 Available genres: ${genres.join(', ')}. Ask me for recommendations in any of these genres!`;
    }
    
    // Check for specific movie search
    const movie = this.movies.find(m => 
      query.includes(m.title.toLowerCase())
    );
    
    if (movie) {
      return `🎬 **${movie.title}** (${movie.year})\n\n` +
             `**Rating:** ${movie.rating}/10\n` +
             `**Genre:** ${movie.genre}\n` +
             `**Director:** ${movie.director}\n\n` +
             `**Description:** ${movie.description}`;
    }
    
    // Default response with examples
    return `🤖 I'm your Movie Rating AI! I can help you with:\n\n` +
           `• **Get ratings**: "What's the rating of The Dark Knight?"\n` +
           `• **Get recommendations**: "Recommend top action movies"\n` +
           `• **Movie details**: "Tell me about Inception"\n` +
           `• **Browse genres**: "What genres do you have?"\n\n` +
           `Try asking me about any movie!`;
  }

  // Enhanced AI response using context
  generateAIResponse(query: string, context: string): string {
    const response = this.processQuery(query);
    
    // Add some AI-like enhancements
    if (response.includes('Sorry')) {
      const suggestions = this.movies
        .filter(m => m.rating >= 8.5)
        .slice(0, 3)
        .map(m => m.title);
        
      return response + `\n\n💡 However, you might enjoy these highly-rated movies: ${suggestions.join(', ')}`;
    }
    
    return response;
  }
}