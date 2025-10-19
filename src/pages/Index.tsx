import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChefHat, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    <div className="relative min-h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      {/* Animated Gradient Orbs */}
      <div 
        className="absolute w-96 h-96 bg-cream/20 rounded-full blur-3xl animate-pulse"
        style={{
          top: '10%',
          left: '20%',
          animation: 'float 8s ease-in-out infinite',
        }}
      ></div>
      <div 
        className="absolute w-80 h-80 bg-cream/10 rounded-full blur-3xl animate-pulse"
        style={{
          bottom: '15%',
          right: '25%',
          animation: 'float 6s ease-in-out infinite reverse',
        }}
      ></div>

      {/* MouseFollower Effect */}
      <div
        className="absolute w-64 h-64 bg-cream/5 rounded-full blur-3xl pointer-events-none transition-all duration-300"
        style={{
          left: mousePosition.x - 128,
          top: mousePosition.y - 128,
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Logo/Icon */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-cream/10 backdrop-blur-sm border border-cream/20 mb-6 hover-scale">
            <ChefHat className="w-12 h-12 text-cream" />
          </div>
        </div>

        {/* Main Heading */}
        <h1 
          className="text-7xl md:text-8xl font-bold text-cream mb-6 animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          Your Kitchen,
          <br />
          <span className="text-cream/70">Simplified</span>
        </h1>

        {/* Subheading */}
        <p 
          className="text-xl md:text-2xl text-cream/60 mb-12 max-w-2xl mx-auto animate-fade-in"
          style={{ animationDelay: '0.4s' }}
        >
          Plan meals, compare prices, and cook with confidence. Your personal culinary assistant.
        </p>

        {/* CTA Button */}
        <div 
          className="animate-fade-in flex flex-col sm:flex-row gap-4 justify-center items-center"
          style={{ animationDelay: '0.6s' }}
        >
          <Button
            size="lg"
            className="group relative px-8 py-6 text-lg bg-cream text-black hover:bg-cream/90 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cream/20"
            onClick={() => navigate('/recipe')}
          >
            <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
            Start Cooking
            <div className="absolute inset-0 rounded-md bg-cream/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-6 text-lg border-cream/30 text-cream hover:bg-cream/10 hover:border-cream/50 transition-all duration-300"
            onClick={() => navigate('/recipe')}
          >
            Learn More
          </Button>
        </div>

        {/* Features Pills */}
        <div 
          className="mt-16 flex flex-wrap gap-3 justify-center animate-fade-in"
          style={{ animationDelay: '0.8s' }}
        >
          {['AI-Powered Recipes', 'Price Comparison', 'Meal Planning', 'Calorie Tracking'].map((feature, index) => (
            <div
              key={index}
              className="px-4 py-2 rounded-full border border-cream/20 text-cream/70 text-sm backdrop-blur-sm bg-cream/5 hover:bg-cream/10 hover:border-cream/30 transition-all duration-300 hover-scale"
            >
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cream rounded-full animate-float"
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
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
    </div>
  );
};

export default Index;
