import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { ChefHat, Loader2, Clock, Users, Flame, CheckCircle2, Trash2, ShoppingBasket, AlertCircle, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveCookedMeal, getCookedMeals } from '@/lib/storage';
import { CookedMeal } from '@/types';

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
  const [cookedMeals, setCookedMeals] = useState<CookedMeal[]>([]);
  const [basketItems, setBasketItems] = useState<string[]>([]);
  const [hasAllIngredients, setHasAllIngredients] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isAmending, setIsAmending] = useState(false);

  useEffect(() => {
    const storedRecipes = localStorage.getItem('weeklyPlanRecipes');
    if (storedRecipes) {
      setRecipes(JSON.parse(storedRecipes));
    }

    const storedSteps = localStorage.getItem('savedCookingSteps');
    if (storedSteps) {
      setSavedSteps(JSON.parse(storedSteps));
    }

    setCookedMeals(getCookedMeals());
    loadBasketItems();
  }, []);

  const loadBasketItems = () => {
    const storedIngredients = localStorage.getItem('shoppingIngredients');
    const storedBasketIndices = localStorage.getItem('basketItems');

    if (storedIngredients && storedBasketIndices) {
      const allIngredients = JSON.parse(storedIngredients) as string[];
      const basketIndices = JSON.parse(storedBasketIndices) as number[];
      const items = basketIndices.map(index => allIngredients[index]).filter(Boolean);
      setBasketItems(items);
    }
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setHasAllIngredients(false);
    
    // Check if we already have saved steps for this recipe
    const savedKey = `${recipe.name}-${recipe.day}-${recipe.mealType}`;
    if (savedSteps[savedKey]) {
      setCookingSteps(savedSteps[savedKey]);
    } else {
      setCookingSteps(null);
    }
  };

  const getMissingIngredients = (recipe: Recipe): string[] => {
    if (!recipe) return [];
    
    const missing: string[] = [];
    recipe.ingredients.forEach(ingredient => {
      const ingredientName = ingredient.toLowerCase();
      const hasIngredient = basketItems.some(item => 
        item.toLowerCase().includes(ingredientName.split(' ').slice(-1)[0]) ||
        ingredientName.includes(item.toLowerCase().split(' ').slice(-1)[0])
      );
      
      if (!hasIngredient) {
        missing.push(ingredient);
      }
    });
    
    return missing;
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

  const handleMarkAsCooked = () => {
    if (!selectedRecipe) return;

    const mealKey = `${selectedRecipe.name}-${selectedRecipe.day}-${selectedRecipe.mealType}`;
    const isAlreadyCooked = cookedMeals.some(meal => 
      meal.name === selectedRecipe.name && 
      meal.day === selectedRecipe.day && 
      meal.mealType === selectedRecipe.mealType
    );

    if (isAlreadyCooked) {
      toast({
        title: 'Already Marked',
        description: 'This meal has already been marked as cooked.',
        variant: 'destructive',
      });
      return;
    }

    // Remove ingredients from basket
    const basketItems = localStorage.getItem('basketItems');
    const shoppingIngredients = localStorage.getItem('shoppingIngredients');
    
    if (basketItems && shoppingIngredients) {
      const basketIndices = JSON.parse(basketItems) as number[];
      const allIngredients = JSON.parse(shoppingIngredients) as string[];
      
      // Find indices of recipe ingredients in the shopping list
      const indicesToRemove = new Set<number>();
      selectedRecipe.ingredients.forEach(recipeIngredient => {
        const index = allIngredients.findIndex((item, idx) => 
          basketIndices.includes(idx) && 
          item.toLowerCase().includes(recipeIngredient.toLowerCase().split(' ').slice(-1)[0]) // Match by last word (ingredient name)
        );
        if (index !== -1) {
          indicesToRemove.add(index);
        }
      });

      // Update basket by removing used ingredients
      const updatedBasketIndices = basketIndices.filter(idx => !indicesToRemove.has(idx));
      localStorage.setItem('basketItems', JSON.stringify(updatedBasketIndices));
    }

    const cookedMeal: CookedMeal = {
      id: mealKey,
      name: selectedRecipe.name,
      day: selectedRecipe.day,
      mealType: selectedRecipe.mealType,
      calories: selectedRecipe.calories,
      protein: selectedRecipe.protein,
      carbs: selectedRecipe.carbs,
      // Placeholder estimates for additional nutrients
      salt: Math.round(selectedRecipe.calories * 0.002 * 10) / 10, // ~0.2% of calories as salt
      saturatedFat: Math.round(selectedRecipe.calories * 0.05 * 10) / 10, // ~5% of calories as sat fat
      unsaturatedFat: Math.round(selectedRecipe.calories * 0.08 * 10) / 10, // ~8% of calories as unsat fat
      fibre: Math.round(selectedRecipe.carbs * 0.15 * 10) / 10, // ~15% of carbs as fibre
      vitamins: {
        vitaminA: Math.round(Math.random() * 500 + 200),
        vitaminC: Math.round(Math.random() * 50 + 20),
        vitaminD: Math.round(Math.random() * 10 + 2),
        vitaminE: Math.round(Math.random() * 8 + 3),
        vitaminK: Math.round(Math.random() * 80 + 20),
        vitaminB1: Math.round(Math.random() * 1.5 * 10) / 10,
        vitaminB2: Math.round(Math.random() * 1.5 * 10) / 10,
        vitaminB3: Math.round(Math.random() * 15 * 10) / 10,
        vitaminB6: Math.round(Math.random() * 2 * 10) / 10,
        vitaminB12: Math.round(Math.random() * 3 * 10) / 10,
        folate: Math.round(Math.random() * 200 + 100),
      },
      cookedAt: new Date().toISOString(),
    };

    saveCookedMeal(cookedMeal);
    setCookedMeals(getCookedMeals());

    toast({
      title: 'Meal Marked as Cooked! 🎉',
      description: `${selectedRecipe.name} has been added to your nutrient tracker and ingredients removed from basket.`,
    });
  };

  const handleClearAll = () => {
    setCookingSteps(null);
    setSavedSteps({});
    localStorage.removeItem('savedCookingSteps');
    toast({
      title: 'All Cleared',
      description: 'All saved cooking steps have been cleared.',
    });
  };

  const isMealCooked = (recipe: Recipe) => {
    return cookedMeals.some(meal => 
      meal.name === recipe.name && 
      meal.day === recipe.day && 
      meal.mealType === recipe.mealType
    );
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please enter your feedback before submitting.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedRecipe || !cookingSteps) {
      toast({
        title: 'Error',
        description: 'No cooking instructions to amend.',
        variant: 'destructive',
      });
      return;
    }

    setIsAmending(true);
    console.log('Feedback submitted:', feedbackMessage);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/amend-cooking-steps`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipeName: selectedRecipe.name,
            ingredients: selectedRecipe.ingredients,
            servings: selectedRecipe.servings,
            currentInstructions: cookingSteps.instructions,
            feedback: feedbackMessage,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to amend cooking steps');
      }

      const data = await response.json();
      setCookingSteps(data);

      // Update saved steps
      const savedKey = `${selectedRecipe.name}-${selectedRecipe.day}-${selectedRecipe.mealType}`;
      const newSavedSteps = {
        ...savedSteps,
        [savedKey]: data,
      };
      setSavedSteps(newSavedSteps);
      localStorage.setItem('savedCookingSteps', JSON.stringify(newSavedSteps));

      toast({
        title: 'Instructions Updated! ✨',
        description: 'The cooking steps have been amended based on your feedback.',
      });

      setFeedbackMessage('');
    } catch (error) {
      console.error('Error amending cooking steps:', error);
      toast({
        title: 'Failed to Update',
        description: error instanceof Error ? error.message : 'Failed to amend instructions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAmending(false);
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <ChefHat className="h-10 w-10" />
              Cooking
            </h1>
            <p className="text-muted-foreground">
              Select a recipe to generate detailed cooking instructions
            </p>
          </div>
          {Object.keys(savedSteps).length > 0 && (
            <Button onClick={handleClearAll} variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
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
                        const isCooked = isMealCooked(recipe);

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
                                <div className="flex gap-1">
                                  {hasSavedSteps && (
                                    <Badge variant="secondary" className="text-xs">
                                      Saved
                                    </Badge>
                                  )}
                                  {isCooked && (
                                    <Badge variant="default" className="text-xs">
                                      Cooked
                                    </Badge>
                                  )}
                                </div>
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
                        {selectedRecipe.ingredients.map((ingredient, index) => {
                          const isInBasket = basketItems.some(item => 
                            item.toLowerCase().includes(ingredient.toLowerCase().split(' ').slice(-1)[0]) ||
                            ingredient.toLowerCase().includes(item.toLowerCase().split(' ').slice(-1)[0])
                          );
                          return (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <span className={`mt-1 ${isInBasket ? 'text-green-500' : 'text-red-500'}`}>
                                {isInBasket ? '✓' : '✗'}
                              </span>
                              <span className={!isInBasket ? 'text-red-500 font-medium' : ''}>{ingredient}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Missing Ingredients Check */}
                {(() => {
                  const missingIngredients = getMissingIngredients(selectedRecipe);
                  return missingIngredients.length > 0 ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <p className="font-semibold mb-2">Missing Ingredients:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {missingIngredients.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="border-green-500 bg-green-50">
                      <ShoppingBasket className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700 font-medium">
                        All ingredients are in your basket!
                      </AlertDescription>
                    </Alert>
                  );
                })()}

                {/* Confirmation Card */}
                <Card className="border-primary/20">
                  <CardContent className="py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          id="has-all-ingredients"
                          checked={hasAllIngredients}
                          onCheckedChange={(checked) => setHasAllIngredients(checked as boolean)}
                        />
                        <label 
                          htmlFor="has-all-ingredients"
                          className="text-sm font-medium cursor-pointer select-none"
                        >
                          I have all the ingredients and I'm ready to start cooking
                        </label>
                      </div>
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
                      <Button 
                        onClick={handleGenerateSteps} 
                        size="lg" 
                        disabled={isGenerating || !hasAllIngredients}
                      >
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
                      {!hasAllIngredients && (
                        <p className="text-xs text-muted-foreground mt-3">
                          Please confirm you have all ingredients first
                        </p>
                      )}
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

                    <Card className="border-muted">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          Don't like how it's being cooked? Let us fix it
                        </CardTitle>
                        <CardDescription>
                          Tell us what you'd like to change and we'll regenerate the cooking instructions
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Textarea
                          placeholder="Example: Use less cheese, make it spicier, add more detailed timing, etc..."
                          value={feedbackMessage}
                          onChange={(e) => setFeedbackMessage(e.target.value)}
                          className="min-h-[100px]"
                          disabled={isAmending}
                        />
                        <Button 
                          onClick={handleSubmitFeedback} 
                          className="w-full"
                          disabled={isAmending || !feedbackMessage.trim()}
                        >
                          {isAmending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Regenerating Instructions...
                            </>
                          ) : (
                            <>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Amend Instructions
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-primary/20">
                      <CardContent className="py-8 text-center">
                        <h3 className="text-lg font-semibold mb-2">Did you cook this meal?</h3>
                        <p className="text-muted-foreground mb-6">
                          Mark it as cooked to track your calories
                        </p>
                        <Button 
                          onClick={handleMarkAsCooked} 
                          size="lg"
                          disabled={isMealCooked(selectedRecipe)}
                        >
                          {isMealCooked(selectedRecipe) ? (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Marked as Cooked
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Mark as Cooked
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
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
