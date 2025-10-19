import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChefHat, Sparkles, ShoppingCart, Flame, Target, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      {/* Animated Gradient Orbs */}
      <div 
        className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"
        style={{
          top: '10%',
          left: '20%',
          animation: 'float 8s ease-in-out infinite',
        }}
      ></div>
      <div 
        className="absolute w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse"
        style={{
          bottom: '15%',
          right: '25%',
          animation: 'float 6s ease-in-out infinite reverse',
        }}
      ></div>

      {/* MouseFollower Effect */}
      <div
        className="absolute w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none transition-all duration-300"
        style={{
          left: mousePosition.x - 128,
          top: mousePosition.y - 128,
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-5xl mx-auto mb-16">
          {/* Logo/Icon */}
          <div className="mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mb-6 hover-scale">
              <ChefHat className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Main Heading */}
          <h1 
            className="text-6xl md:text-7xl font-bold text-foreground mb-6 animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            Your Kitchen,
            <br />
            <span className="text-muted-foreground">Simplified</span>
          </h1>

          {/* Subheading */}
          <p 
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            Plan meals, compare prices, and cook with confidence. Your personal culinary assistant.
          </p>

          {/* CTA Button */}
          <div 
            className="animate-fade-in flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            style={{ animationDelay: '0.6s' }}
          >
            <Button
              size="lg"
              className="group relative px-8 py-6 text-lg hover:scale-105 transition-all duration-300"
              onClick={() => navigate('/recipe')}
            >
              <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              Start Cooking
              <div className="absolute inset-0 rounded-md bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg transition-all duration-300"
              onClick={() => navigate('/recipe')}
            >
              Learn More
            </Button>
          </div>

          {/* Features Pills */}
          <div 
            className="flex flex-wrap gap-3 justify-center animate-fade-in"
            style={{ animationDelay: '0.8s' }}
          >
            {['AI-Powered Recipes', 'Price Comparison', 'Meal Planning', 'Calorie Tracking'].map((feature, index) => (
              <div
                key={index}
                className="px-4 py-2 rounded-full border border-border bg-card/50 backdrop-blur-sm text-foreground text-sm hover:bg-card transition-all duration-300 hover-scale"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Feature Cards */}
        <div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto animate-fade-in"
          style={{ animationDelay: '1s' }}
        >
          <Card className="hover-scale transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ChefHat className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Recipe Planning</CardTitle>
              <CardDescription>
                Generate AI recipes or add your own. Drag and drop into your weekly calendar.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-scale transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <TrendingDown className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Price Comparison</CardTitle>
              <CardDescription>
                Automatically compare prices across UK supermarkets and find the best deals.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-scale transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Smart Shopping</CardTitle>
              <CardDescription>
                Track ingredients, monitor quantities, and manage your basket efficiently.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-scale transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Flame className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Calorie Tracking</CardTitle>
              <CardDescription>
                Monitor nutrition, track cooked meals, and meet your health goals.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
          ></div>
        ))}
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </div>
  );
};

export default Index;
