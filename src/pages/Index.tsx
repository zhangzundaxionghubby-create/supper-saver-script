import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ChefHat, ShoppingCart, TrendingDown, Target } from 'lucide-react';
import { getPreferences, savePreferences } from '@/lib/storage';
import { UserPreferences } from '@/types';
import heroImage from '@/assets/hero-groceries.jpg';

const Index = () => {
  const navigate = useNavigate();
  const [hasPreferences, setHasPreferences] = useState(false);

  const [formData, setFormData] = useState<UserPreferences>({
    weeklyMeals: 7,
    servings: 2,
    proteinTarget: 100,
    stores: ['Tesco', 'Lidl', 'Asda', 'Sainsburys'],
  });

  useEffect(() => {
    const prefs = getPreferences();
    if (prefs) {
      setHasPreferences(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    savePreferences(formData);
    navigate('/pantry');
  };

  const toggleStore = (store: string) => {
    setFormData(prev => ({
      ...prev,
      stores: prev.stores.includes(store)
        ? prev.stores.filter(s => s !== store)
        : [...prev.stores, store],
    }));
  };

  if (hasPreferences) {
    return (
      <div className="min-h-screen">
        <div 
          className="relative h-[60vh] bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
          <div className="relative container mx-auto px-4 flex h-full items-center">
            <div className="max-w-2xl text-white">
              <h1 className="mb-4 text-5xl font-bold leading-tight">
                Smart Meal Planning
                <br />
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>
              <p className="mb-8 text-xl text-gray-200">
                Plan your meals, manage your pantry, and save money with intelligent price comparison across UK supermarkets.
              </p>
              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/planner')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Generate Meal Plan
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate('/pantry')}
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                >
                  Manage Pantry
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="grid gap-8 md:grid-cols-4">
            <Card className="border-border/40 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <ChefHat className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Smart Planning</CardTitle>
                <CardDescription>
                  Generate meal plans using what you already have
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/40 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <ShoppingCart className="h-10 w-10 mb-2 text-secondary" />
                <CardTitle>Shopping Lists</CardTitle>
                <CardDescription>
                  Organized by aisle, deduped and ready to go
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/40 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingDown className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Price Compare</CardTitle>
                <CardDescription>
                  Find the cheapest store and save on every shop
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/40 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-10 w-10 mb-2 text-secondary" />
                <CardTitle>Hit Your Macros</CardTitle>
                <CardDescription>
                  Track protein and calories automatically
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to MealSmart</h1>
          <p className="text-muted-foreground text-lg">
            Let's set up your meal planning preferences
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Your Preferences</CardTitle>
            <CardDescription>
              Customize your meal planning experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="weeklyMeals">Meals per week</Label>
                <Input
                  id="weeklyMeals"
                  type="number"
                  min="5"
                  max="14"
                  value={formData.weeklyMeals}
                  onChange={(e) =>
                    setFormData({ ...formData, weeklyMeals: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="servings">Servings per meal</Label>
                <Input
                  id="servings"
                  type="number"
                  min="1"
                  max="6"
                  value={formData.servings}
                  onChange={(e) =>
                    setFormData({ ...formData, servings: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proteinTarget">Daily protein target (g)</Label>
                <Input
                  id="proteinTarget"
                  type="number"
                  min="50"
                  max="300"
                  value={formData.proteinTarget}
                  onChange={(e) =>
                    setFormData({ ...formData, proteinTarget: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-3">
                <Label>Stores to compare</Label>
                <div className="space-y-2">
                  {['Tesco', 'Lidl', 'Asda', 'Sainsburys'].map((store) => (
                    <div key={store} className="flex items-center space-x-2">
                      <Checkbox
                        id={store}
                        checked={formData.stores.includes(store)}
                        onCheckedChange={() => toggleStore(store)}
                      />
                      <Label htmlFor={store} className="cursor-pointer font-normal">
                        {store}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Get Started
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
