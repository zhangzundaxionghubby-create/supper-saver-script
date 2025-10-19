import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChefHat, Sparkles, Calendar, ArrowRight } from 'lucide-react';

interface Recipe {
  name: string;
  servings: number;
  prepTime: string;
  cookTime: string;
  protein: number;
  carbs: number;
  calories: number;
  ingredients: string[];
  instructions: string[];
}

interface AssignedRecipe extends Recipe {
  day: string;
  mealType: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];

const Recipe = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);
  const [assignedRecipes, setAssignedRecipes] = useState<AssignedRecipe[]>([]);
  const [showAssignment, setShowAssignment] = useState(false);

  const [manualRecipe, setManualRecipe] = useState({
    name: '',
    servings: '',
    prepTime: '',
    cookTime: '',
    ingredients: '',
    instructions: '',
  });

  const [aiParams, setAiParams] = useState({
    protein: '',
    carbs: '',
    calories: '',
    dietaryRestrictions: '',
    numberOfRecipes: '21',
    numberOfPeople: '2',
    mealsPerDay: '3',
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Recipe Saved!',
      description: `${manualRecipe.name} has been added to your collection.`,
    });
    setManualRecipe({
      name: '',
      servings: '',
      prepTime: '',
      cookTime: '',
      ingredients: '',
      instructions: '',
    });
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-recipes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            protein: parseInt(aiParams.protein),
            carbs: parseInt(aiParams.carbs),
            calories: parseInt(aiParams.calories),
            dietaryRestrictions: aiParams.dietaryRestrictions,
            numberOfRecipes: parseInt(aiParams.numberOfRecipes),
            numberOfPeople: parseInt(aiParams.numberOfPeople),
            mealsPerDay: parseInt(aiParams.mealsPerDay),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate recipes');
      }

      const data = await response.json();
      setGeneratedRecipes(data.recipes);
      setShowAssignment(true);
      
      toast({
        title: 'Recipes Generated!',
        description: `Successfully created ${data.recipes.length} recipes. Now assign them to your weekly plan.`,
      });
    } catch (error) {
      console.error('Error generating recipes:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate recipes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAssignRecipe = (recipe: Recipe, day: string, mealType: string) => {
    const existingIndex = assignedRecipes.findIndex(
      r => r.day === day && r.mealType === mealType
    );

    const newAssignment: AssignedRecipe = { ...recipe, day, mealType };

    if (existingIndex >= 0) {
      const updated = [...assignedRecipes];
      updated[existingIndex] = newAssignment;
      setAssignedRecipes(updated);
    } else {
      setAssignedRecipes([...assignedRecipes, newAssignment]);
    }

    toast({
      title: 'Recipe Assigned',
      description: `${recipe.name} assigned to ${day} ${mealType}`,
    });
  };

  const handleProceedToShopping = () => {
    if (assignedRecipes.length === 0) {
      toast({
        title: 'No Recipes Assigned',
        description: 'Please assign at least one recipe to your weekly plan.',
        variant: 'destructive',
      });
      return;
    }

    // Collect all ingredients from assigned recipes
    const allIngredients = assignedRecipes.flatMap(recipe => recipe.ingredients);
    
    // Store in localStorage to pass to shopping list page
    localStorage.setItem('weeklyPlanRecipes', JSON.stringify(assignedRecipes));
    localStorage.setItem('shoppingIngredients', JSON.stringify(allIngredients));
    
    navigate('/shopping-list');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Weekly Recipe Planner</h1>
          <p className="text-muted-foreground">
            Generate recipes with AI, assign them to your weekly plan, then create your shopping list
          </p>
        </div>

        {!showAssignment ? (
          <Tabs defaultValue="ai" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="ai" className="gap-2">
                <Sparkles className="h-4 w-4" />
                AI Generate
              </TabsTrigger>
              <TabsTrigger value="manual" className="gap-2">
                <ChefHat className="h-4 w-4" />
                Manual Input
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Recipe Generator</CardTitle>
                  <CardDescription>
                    Set your nutritional goals and we'll generate a variety of recipes for you to choose from
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAIGenerate} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="protein">Protein per Serving (g)</Label>
                        <Input
                          id="protein"
                          type="number"
                          placeholder="e.g., 30"
                          value={aiParams.protein}
                          onChange={(e) => setAiParams({ ...aiParams, protein: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="carbs">Carbohydrates per Serving (g)</Label>
                        <Input
                          id="carbs"
                          type="number"
                          placeholder="e.g., 40"
                          value={aiParams.carbs}
                          onChange={(e) => setAiParams({ ...aiParams, carbs: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="calories">Calories per Serving</Label>
                        <Input
                          id="calories"
                          type="number"
                          placeholder="e.g., 500"
                          value={aiParams.calories}
                          onChange={(e) => setAiParams({ ...aiParams, calories: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dietary">Dietary Restrictions</Label>
                        <Select
                          value={aiParams.dietaryRestrictions}
                          onValueChange={(value) => setAiParams({ ...aiParams, dietaryRestrictions: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select restrictions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="halal">Halal</SelectItem>
                            <SelectItem value="kosher">Kosher</SelectItem>
                            <SelectItem value="vegetarian">Vegetarian</SelectItem>
                            <SelectItem value="vegan">Vegan</SelectItem>
                            <SelectItem value="gluten-free">Gluten-Free</SelectItem>
                            <SelectItem value="dairy-free">Dairy-Free</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="people">Number of People</Label>
                        <Input
                          id="people"
                          type="number"
                          min="1"
                          max="10"
                          value={aiParams.numberOfPeople}
                          onChange={(e) => setAiParams({ ...aiParams, numberOfPeople: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="recipes">Number of Recipes to Generate</Label>
                        <Input
                          id="recipes"
                          type="number"
                          min="7"
                          max="50"
                          value={aiParams.numberOfRecipes}
                          onChange={(e) => setAiParams({ ...aiParams, numberOfRecipes: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={isGenerating}>
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Recipes...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Recipes
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manual">
              <Card>
                <CardHeader>
                  <CardTitle>Add Your Own Recipe</CardTitle>
                  <CardDescription>
                    Manually create and save your favorite recipes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleManualSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="recipeName">Recipe Name</Label>
                        <Input
                          id="recipeName"
                          placeholder="e.g., Chicken Stir Fry"
                          value={manualRecipe.name}
                          onChange={(e) => setManualRecipe({ ...manualRecipe, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="servings">Servings</Label>
                        <Input
                          id="servings"
                          type="number"
                          placeholder="e.g., 4"
                          value={manualRecipe.servings}
                          onChange={(e) => setManualRecipe({ ...manualRecipe, servings: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prepTime">Prep Time</Label>
                        <Input
                          id="prepTime"
                          placeholder="e.g., 15 minutes"
                          value={manualRecipe.prepTime}
                          onChange={(e) => setManualRecipe({ ...manualRecipe, prepTime: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cookTime">Cook Time</Label>
                        <Input
                          id="cookTime"
                          placeholder="e.g., 30 minutes"
                          value={manualRecipe.cookTime}
                          onChange={(e) => setManualRecipe({ ...manualRecipe, cookTime: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ingredients">Ingredients</Label>
                      <Textarea
                        id="ingredients"
                        placeholder="Enter each ingredient on a new line"
                        rows={6}
                        value={manualRecipe.ingredients}
                        onChange={(e) => setManualRecipe({ ...manualRecipe, ingredients: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instructions">Instructions</Label>
                      <Textarea
                        id="instructions"
                        placeholder="Enter each step on a new line"
                        rows={8}
                        value={manualRecipe.instructions}
                        onChange={(e) => setManualRecipe({ ...manualRecipe, instructions: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full">
                      <ChefHat className="mr-2 h-4 w-4" />
                      Save Recipe
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Assign Recipes to Your Weekly Plan</h2>
                <p className="text-muted-foreground">
                  Click on a recipe card to assign it to a specific day and meal
                </p>
              </div>
              <Button onClick={() => setShowAssignment(false)} variant="outline">
                Generate More Recipes
              </Button>
            </div>

            {/* Weekly Plan Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Your Weekly Plan
                </CardTitle>
                <CardDescription>
                  {assignedRecipes.length} of 21 slots filled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {DAYS.map(day => (
                    <div key={day} className="border-b pb-4 last:border-0">
                      <h3 className="font-semibold mb-2">{day}</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {MEAL_TYPES.map(mealType => {
                          const assigned = assignedRecipes.find(
                            r => r.day === day && r.mealType === mealType
                          );
                          return (
                            <div
                              key={mealType}
                              className="p-3 rounded-lg border bg-muted/30 min-h-[80px]"
                            >
                              <p className="text-xs text-muted-foreground mb-1">{mealType}</p>
                              {assigned ? (
                                <p className="text-sm font-medium">{assigned.name}</p>
                              ) : (
                                <p className="text-xs italic text-muted-foreground">Not assigned</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Available Recipes */}
            <div>
              <h3 className="text-xl font-bold mb-4">Available Recipes</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {generatedRecipes.map((recipe, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{recipe.name}</CardTitle>
                      <CardDescription>
                        Servings: {recipe.servings} | {recipe.prepTime} prep
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-3 text-sm">
                        <div><span className="font-semibold">Protein:</span> {recipe.protein}g</div>
                        <div><span className="font-semibold">Carbs:</span> {recipe.carbs}g</div>
                        <div><span className="font-semibold">Cal:</span> {recipe.calories}</div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Assign to:</Label>
                        <div className="flex gap-2">
                          <Select onValueChange={(day) => {
                            const mealType = MEAL_TYPES[0];
                            handleAssignRecipe(recipe, day, mealType);
                          }}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Day" />
                            </SelectTrigger>
                            <SelectContent>
                              {DAYS.map(day => (
                                <SelectItem key={day} value={day}>{day}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select onValueChange={(mealType) => {
                            const day = DAYS[0];
                            handleAssignRecipe(recipe, day, mealType);
                          }}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Meal" />
                            </SelectTrigger>
                            <SelectContent>
                              {MEAL_TYPES.map(meal => (
                                <SelectItem key={meal} value={meal}>{meal}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <details className="text-xs">
                        <summary className="cursor-pointer font-medium mb-2">View Details</summary>
                        <div className="space-y-2 mt-2">
                          <div>
                            <p className="font-semibold">Ingredients:</p>
                            <ul className="list-disc list-inside">
                              {recipe.ingredients.slice(0, 5).map((ing, i) => (
                                <li key={i}>{ing}</li>
                              ))}
                              {recipe.ingredients.length > 5 && <li>...</li>}
                            </ul>
                          </div>
                        </div>
                      </details>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Next Button */}
            <div className="flex justify-end pt-6">
              <Button onClick={handleProceedToShopping} size="lg">
                Next: Create Shopping List
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipe;
