import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Star, 
  Film, 
  Award, 
  Sparkles,
  Bot,
  TrendingUp,
  Search,
  Heart
} from 'lucide-react';
import { MovieChat } from './MovieChat';
import { MovieService } from '../services/MovieService';
import { toast } from 'sonner';

export const MovieChatbot: React.FC = () => {
  const [movieService] = useState(() => new MovieService());

  useEffect(() => {
    toast.success('Movie Rating AI is ready!', {
      description: 'Ask me about any movie rating or get personalized recommendations.'
    });
  }, []);

  const features = [
    {
      icon: Search,
      title: 'Movie Ratings',
      description: 'Get accurate ratings for any movie',
      color: 'bg-blue-500/10 text-blue-600 border-blue-200'
    },
    {
      icon: TrendingUp,
      title: 'Smart Recommendations',
      description: 'Discover movies based on genre and ratings',
      color: 'bg-green-500/10 text-green-600 border-green-200'
    },
    {
      icon: Film,
      title: 'Movie Details',
      description: 'Comprehensive info about directors and plots',
      color: 'bg-orange-500/10 text-orange-600 border-orange-200'
    },
    {
      icon: Heart,
      title: 'Personalized Experience',
      description: 'AI-powered suggestions tailored for you',
      color: 'bg-purple-500/10 text-purple-600 border-purple-200'
    }
  ];

  const supportedGenres = movieService.getGenres();

  const topMovies = [
    { title: 'Spirited Away', rating: 9.3 },
    { title: 'The Shawshank Redemption', rating: 9.3 },
    { title: 'The Godfather', rating: 9.2 },
    { title: 'The Dark Knight', rating: 9.0 },
    { title: 'Pulp Fiction', rating: 8.9 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mr-3">
              <Star className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Movie Rating AI
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your intelligent movie companion. Get ratings, discover hidden gems, and find your next favorite film with AI-powered recommendations.
          </p>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 mb-8">
            {features.map((feature, index) => (
              <Card key={index} className={`text-center hover:shadow-lg transition-shadow ${feature.color} border`}>
                <CardContent className="p-4">
                  <feature.icon className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">20+</div>
                <div className="text-sm text-muted-foreground">Movies in Database</div>
              </CardContent>
            </Card>
            <Card className="text-center bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{supportedGenres.length}</div>
                <div className="text-sm text-muted-foreground">Genres Available</div>
              </CardContent>
            </Card>
            <Card className="text-center bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">AI-Powered</div>
                <div className="text-sm text-muted-foreground">Smart Recommendations</div>
              </CardContent>
            </Card>
          </div>

          {/* Top Movies Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center justify-center">
              <Award className="h-5 w-5 mr-2" />
              Top Rated Movies
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {topMovies.map((movie) => (
                <Badge key={movie.title} variant="secondary" className="text-xs px-3 py-1">
                  {movie.title} ({movie.rating}/10)
                </Badge>
              ))}
            </div>
          </div>

          {/* Supported Genres */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">Available Genres:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {supportedGenres.map((genre) => (
                <Badge key={genre} variant="outline" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Interface */}
        <Card className="max-w-6xl mx-auto shadow-2xl border-2">
          <CardHeader className="border-b bg-muted/30 text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>Chat with Movie AI</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[700px]">
              <MovieChat />
            </div>
          </CardContent>
        </Card>

        {/* Quick Examples */}
        <div className="max-w-6xl mx-auto mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              Try These Examples
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="font-medium text-sm mb-1">Get Movie Rating</div>
                <div className="text-xs text-muted-foreground">"What's the rating of Inception?"</div>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="font-medium text-sm mb-1">Genre Recommendations</div>
                <div className="text-xs text-muted-foreground">"Recommend top action movies"</div>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="font-medium text-sm mb-1">Movie Details</div>
                <div className="text-xs text-muted-foreground">"Tell me about The Dark Knight"</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            Powered by AI • {supportedGenres.length} Genres • {topMovies.length} Top Movies • 
            <span className="font-semibold text-purple-600"> Built with ❤️ for Movie Lovers</span>
          </p>
        </div>
      </div>
    </div>
  );
};