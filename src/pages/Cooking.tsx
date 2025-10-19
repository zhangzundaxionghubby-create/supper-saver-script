import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChefHat, Loader2, Clock, Users, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Recipe {
  name: string;
  day: string;
  mealType: string;
  servings: number;
  prepTime: string;
  cookTime: string;
  protein: number;
  carbs: number;
  calories: number;
  ingredients: string[];
}

interface CookingSteps {
  instructions: string[];
  cookingTips: string[];
}

const Cooking = () => {
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [cookingSteps, setCookingSteps] = useState<CookingSteps | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedSteps, setSavedSteps] = useState<{ [key: string]: CookingSteps }>({});

  useEffect(() => {
    const storedRecipes = localStorage.getItem('weeklyPlanRecipes');
    if (storedRecipes) {
      setRecipes(JSON.parse(storedRecipes));
    }

    const storedSteps = localStorage.getItem('savedCookingSteps');
    if (storedSteps) {
      setSavedSteps(JSON.parse(storedSteps));
    }
  }, []);

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    
    // Check if we already have saved steps for this recipe
    const savedKey = `${recipe.name}-${recipe.day}-${recipe.mealType}`;
    if (savedSteps[savedKey]) {
      setCookingSteps(savedSteps[savedKey]);
    } else {
      setCookingSteps(null);
    }
  };

  const handleGenerateSteps = async () => {
    if (!selectedRecipe) return;

    setIsGenerating(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-cooking-steps`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipeName: selectedRecipe.name,
            ingredients: selectedRecipe.ingredients,
            servings: selectedRecipe.servings,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate cooking steps');
      }

      const data = await response.json();
      setCookingSteps(data);

      // Save to localStorage
      const savedKey = `${selectedRecipe.name}-${selectedRecipe.day}-${selectedRecipe.mealType}`;
      const newSavedSteps = {
        ...savedSteps,
        [savedKey]: data,
      };
      setSavedSteps(newSavedSteps);
      localStorage.setItem('savedCookingSteps', JSON.stringify(newSavedSteps));

      toast({
        title: 'Cooking Steps Generated!',
        description: 'Your detailed cooking instructions are ready.',
      });
    } catch (error) {
      console.error('Error generating cooking steps:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate steps. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const groupedRecipes = recipes.reduce((acc, recipe) => {
    if (!acc[recipe.day]) {
      acc[recipe.day] = [];
    }
    acc[recipe.day].push(recipe);
    return acc;
  }, {} as { [key: string]: Recipe[] });

  if (recipes.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>No Recipes in Your Plan</CardTitle>
              <CardDescription>
                You haven't created a weekly meal plan yet. Go to Recipe page to get started.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <ChefHat className="h-10 w-10" />
            Cooking
          </h1>
          <p className="text-muted-foreground">
            Select a recipe to generate detailed cooking instructions
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Recipe List */}
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Weekly Recipes</CardTitle>
                <CardDescription>
                  Click to view cooking instructions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.keys(groupedRecipes).map(day => (
                  <div key={day}>
                    <h3 className="font-semibold text-sm mb-2">{day}</h3>
                    <div className="space-y-2">
                      {groupedRecipes[day].map((recipe, index) => {
                        const savedKey = `${recipe.name}-${recipe.day}-${recipe.mealType}`;
                        const hasSavedSteps = !!savedSteps[savedKey];
                        const isSelected = selectedRecipe?.name === recipe.name && 
                                         selectedRecipe?.day === recipe.day && 
                                         selectedRecipe?.mealType === recipe.mealType;

                        return (
                          <Card
                            key={index}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              isSelected ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => handleSelectRecipe(recipe)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{recipe.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {recipe.mealType}
                                  </p>
                                </div>
                                {hasSavedSteps && (
                                  <Badge variant="secondary" className="text-xs">
                                    Saved
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recipe Details & Cooking Steps */}
          <div className="lg:col-span-8">
            {selectedRecipe ? (
              <div className="space-y-6">
                {/* Recipe Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">{selectedRecipe.name}</CardTitle>
                        <CardDescription>
                          {selectedRecipe.day} - {selectedRecipe.mealType}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        {selectedRecipe.calories} cal
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Prep: {selectedRecipe.prepTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-muted-foreground" />
                        <span>Cook: {selectedRecipe.cookTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedRecipe.servings} servings</span>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold mb-2">Nutrition per Serving</h3>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Protein:</span>{' '}
                          <span className="font-medium">{selectedRecipe.protein}g</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Carbs:</span>{' '}
                          <span className="font-medium">{selectedRecipe.carbs}g</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold mb-3">Ingredients</h3>
                      <ul className="grid gap-2">
                        {selectedRecipe.ingredients.map((ingredient, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-primary mt-1">•</span>
                            <span>{ingredient}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Cooking Instructions */}
                {!cookingSteps ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <ChefHat className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Ready to Cook?</h3>
                      <p className="text-muted-foreground mb-6">
                        Generate detailed step-by-step cooking instructions
                      </p>
                      <Button onClick={handleGenerateSteps} size="lg" disabled={isGenerating}>
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Instructions...
                          </>
                        ) : (
                          <>
                            <ChefHat className="mr-2 h-4 w-4" />
                            Generate Cooking Steps
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Cooking Instructions</CardTitle>
                        <CardDescription>
                          Follow these steps to prepare your meal
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ol className="space-y-4">
                          {cookingSteps.instructions.map((step, index) => (
                            <li key={index} className="flex gap-4">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                                {index + 1}
                              </div>
                              <p className="text-sm pt-1">{step}</p>
                            </li>
                          ))}
                        </ol>
                      </CardContent>
                    </Card>

                    {cookingSteps.cookingTips && cookingSteps.cookingTips.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Cooking Tips</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {cookingSteps.cookingTips.map((tip, index) => (
                              <li key={index} className="flex gap-3 text-sm">
                                <span className="text-primary">💡</span>
                                <p>{tip}</p>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="py-24 text-center">
                  <ChefHat className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Select a Recipe</h3>
                  <p className="text-muted-foreground">
                    Choose a recipe from your weekly plan to view cooking instructions
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cooking;
