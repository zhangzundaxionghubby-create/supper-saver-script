import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, ArrowLeft, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Recipe {
  name: string;
  servings: number;
  prepTime: string;
  cookTime: string;
  protein: number;
  carbs: number;
  calories: number;
  ingredients: string[];
}

interface DayMeal {
  id: string;
  name: string;
  mealType: string;
  calories?: number;
  protein?: number;
  carbs?: number;
}

interface MealPlanData {
  [date: string]: DayMeal[];
}

const RecipeSwipe = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const recipes = (location.state?.recipes || []) as Recipe[];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedRecipes, setLikedRecipes] = useState<Recipe[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMealType, setSelectedMealType] = useState('breakfast');

  const currentRecipe = recipes[currentIndex];

  const handleSwipe = (liked: boolean) => {
    if (liked && currentRecipe) {
      setLikedRecipes([...likedRecipes, currentRecipe]);
      setSelectedRecipe(currentRecipe);
      setIsDialogOpen(true);
    } else {
      goToNext();
    }
  };

  const goToNext = () => {
    if (currentIndex < recipes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All recipes reviewed
      toast({
        title: 'All done!',
        description: `You liked ${likedRecipes.length} recipe${likedRecipes.length !== 1 ? 's' : ''}`,
      });
      navigate('/recipe');
    }
  };

  const addToMealPlan = () => {
    if (!selectedRecipe) return;

    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const existingData = localStorage.getItem('mealPlans');
    const mealPlanData: MealPlanData = existingData ? JSON.parse(existingData) : {};

    const meal: DayMeal = {
      id: `${Date.now()}-${Math.random()}`,
      name: selectedRecipe.name,
      mealType: selectedMealType,
      calories: selectedRecipe.calories,
      protein: selectedRecipe.protein,
      carbs: selectedRecipe.carbs,
    };

    const updatedData = {
      ...mealPlanData,
      [dateKey]: [...(mealPlanData[dateKey] || []), meal],
    };

    localStorage.setItem('mealPlans', JSON.stringify(updatedData));

    toast({
      title: 'Added to meal plan!',
      description: `${selectedRecipe.name} added to ${format(selectedDate, 'MMMM d, yyyy')}`,
    });

    setIsDialogOpen(false);
    goToNext();
  };

  if (!recipes || recipes.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Recipes Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No recipes were generated. Please go back and try again.
            </p>
            <Button onClick={() => navigate('/recipe')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recipe Generator
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentRecipe) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button onClick={() => navigate('/recipe')} variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {recipes.length}
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardTitle className="text-3xl">{currentRecipe.name}</CardTitle>
              <div className="flex gap-2 flex-wrap mt-4">
                <Badge variant="secondary">
                  <Clock className="mr-1 h-3 w-3" />
                  Prep: {currentRecipe.prepTime}
                </Badge>
                <Badge variant="secondary">
                  <Clock className="mr-1 h-3 w-3" />
                  Cook: {currentRecipe.cookTime}
                </Badge>
                <Badge>
                  {currentRecipe.servings} servings
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 rounded-lg bg-muted">
                  <div className="text-2xl font-bold text-primary">{currentRecipe.calories}</div>
                  <div className="text-sm text-muted-foreground">Calories</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <div className="text-2xl font-bold text-primary">{currentRecipe.protein}g</div>
                  <div className="text-sm text-muted-foreground">Protein</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <div className="text-2xl font-bold text-primary">{currentRecipe.carbs}g</div>
                  <div className="text-sm text-muted-foreground">Carbs</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-lg">Ingredients</h3>
                <ul className="space-y-2">
                  {currentRecipe.ingredients.map((ingredient, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4 justify-center pt-6 border-t">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 h-16 border-2 hover:bg-destructive/10 hover:border-destructive"
                  onClick={() => handleSwipe(false)}
                >
                  <X className="h-8 w-8 text-destructive" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 h-16 border-2 hover:bg-green-500/10 hover:border-green-500"
                  onClick={() => handleSwipe(true)}
                >
                  <Heart className="h-8 w-8 text-green-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Meal Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Meal Type</Label>
              <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={addToMealPlan} className="flex-1">
                Add to Plan
              </Button>
              <Button onClick={() => {
                setIsDialogOpen(false);
                goToNext();
              }} variant="outline">
                Skip
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecipeSwipe;
