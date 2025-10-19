import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChefHat, Clock, Utensils } from 'lucide-react';
import { getPantry, getPreferences, getMealPlan, saveMealPlan } from '@/lib/storage';
import { generateMealPlan } from '@/lib/mealPlanner';
import { MealPlan } from '@/types';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';

const Planner = () => {
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const existing = getMealPlan();
    if (existing) {
      setMealPlan(existing);
    }
  }, []);

  const handleGenerate = () => {
    const pantry = getPantry();
    const prefs = getPreferences();

    if (!prefs) {
      toast.error('Please set your preferences first');
      navigate('/');
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      const plan = generateMealPlan(pantry, prefs);
      setMealPlan(plan);
      saveMealPlan(plan);
      setIsGenerating(false);
      toast.success('Meal plan generated!');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Meal Planner</h1>
            <p className="text-muted-foreground">
              Generate smart meal plans based on your pantry
            </p>
          </div>
          <Button onClick={handleGenerate} size="lg" disabled={isGenerating}>
            <ChefHat className="mr-2 h-5 w-5" />
            {isGenerating ? 'Generating...' : 'Generate Plan'}
          </Button>
        </div>

        {!mealPlan ? (
          <Card className="shadow-md">
            <CardContent className="py-16 text-center">
              <ChefHat className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No meal plan yet</h3>
              <p className="text-muted-foreground mb-6">
                Click "Generate Plan" to create a meal plan based on your pantry
              </p>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                Generate Your First Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mealPlan.meals.map((meal, idx) => (
              <Card key={meal.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-2">
                        Day {idx + 1}
                      </Badge>
                      <CardTitle className="text-xl">{meal.name}</CardTitle>
                    </div>
                    <Utensils className="h-8 w-8 text-primary" />
                  </div>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      20-30 min
                    </span>
                    <span className="font-medium text-primary">
                      {meal.macros.protein}g protein
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Ingredients:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {meal.ingredients.slice(0, 4).map((ing, i) => (
                          <li key={i}>
                            • {ing.qty} {ing.unit} {ing.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Calories</span>
                        <span className="font-medium">{meal.macros.kcal} kcal</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Planner;
