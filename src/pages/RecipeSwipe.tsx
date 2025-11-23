import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, ArrowLeft, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const RecipeSwipe = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const recipes = (location.state?.recipes || []) as Recipe[];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedRecipes, setLikedRecipes] = useState<Recipe[]>([]);

  const currentRecipe = recipes[currentIndex];

  const handleSwipe = (liked: boolean) => {
    if (liked && currentRecipe) {
      const updatedLiked = [...likedRecipes, currentRecipe];
      setLikedRecipes(updatedLiked);
      
      // Save to localStorage
      localStorage.setItem('likedRecipes', JSON.stringify(updatedLiked));
      
      toast({
        title: 'Recipe Liked!',
        description: `${currentRecipe.name} added to your liked recipes. Go to Meal Planning to add it to your calendar.`,
      });
    }
    goToNext();
  };

  const goToNext = () => {
    if (currentIndex < recipes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All recipes reviewed, save liked recipes and navigate
      localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes));
      toast({
        title: 'All done!',
        description: `You liked ${likedRecipes.length} recipe${likedRecipes.length !== 1 ? 's' : ''}. Go to Meal Planning to schedule them!`,
      });
      navigate('/recipe', { state: { activeTab: 'plan' } });
    }
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

    </div>
  );
};

export default RecipeSwipe;
