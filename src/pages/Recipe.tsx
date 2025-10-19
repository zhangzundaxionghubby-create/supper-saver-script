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
import { Loader2, ChefHat, Sparkles, Calendar, ArrowRight, GripVertical, Trash2 } from 'lucide-react';

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
  const [draggedRecipe, setDraggedRecipe] = useState<Recipe | null>(null);

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
    numberOfRecipes: '7',
    numberOfPeople: '2',
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
        description: `Successfully created ${data.recipes.length} recipes. Drag them into your weekly plan!`,
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

  const handleDragStart = (recipe: Recipe) => {
    setDraggedRecipe(recipe);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (day: string, mealType: string) => {
    if (!draggedRecipe) return;

    const existingIndex = assignedRecipes.findIndex(
      r => r.day === day && r.mealType === mealType
    );

    const newAssignment: AssignedRecipe = { ...draggedRecipe, day, mealType };

    if (existingIndex >= 0) {
      const updated = [...assignedRecipes];
      updated[existingIndex] = newAssignment;
      setAssignedRecipes(updated);
    } else {
      setAssignedRecipes([...assignedRecipes, newAssignment]);
    }

    toast({
      title: 'Recipe Assigned!',
      description: `${draggedRecipe.name} → ${day} ${mealType}`,
    });

    setDraggedRecipe(null);
  };

  const handleRemoveAssignment = (day: string, mealType: string) => {
    setAssignedRecipes(assignedRecipes.filter(r => !(r.day === day && r.mealType === mealType)));
    toast({
      title: 'Recipe Removed',
      description: 'Recipe removed from your weekly plan.',
    });
  };

  const handleClearAll = () => {
    setGeneratedRecipes([]);
    setAssignedRecipes([]);
    setShowAssignment(false);
    localStorage.removeItem('weeklyPlanRecipes');
    localStorage.removeItem('shoppingIngredients');
    toast({
      title: 'All Cleared',
      description: 'Your meal plan and recipes have been cleared.',
    });
  };

  const handleProceedToShopping = () => {
    if (assignedRecipes.length === 0) {
      toast({
        title: 'No Recipes Assigned',
        description: 'Please drag at least one recipe to your weekly plan.',
        variant: 'destructive',
      });
      return;
    }

    const allIngredients = assignedRecipes.flatMap(recipe => recipe.ingredients);
    localStorage.setItem('weeklyPlanRecipes', JSON.stringify(assignedRecipes));
    localStorage.setItem('shoppingIngredients', JSON.stringify(allIngredients));
    
    navigate('/shopping-list');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Weekly Recipe Planner</h1>
            <p className="text-muted-foreground">
              Generate recipes and drag them into your weekly calendar
            </p>
          </div>
          {(generatedRecipes.length > 0 || assignedRecipes.length > 0) && (
            <Button onClick={handleClearAll} variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
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
                    Generate as many or as few recipes as you want - even just 1 or 2!
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
                        <Label htmlFor="recipes">Number of Recipes</Label>
                        <Input
                          id="recipes"
                          type="number"
                          min="1"
                          max="50"
                          value={aiParams.numberOfRecipes}
                          onChange={(e) => setAiParams({ ...aiParams, numberOfRecipes: e.target.value })}
                          required
                        />
                        <p className="text-xs text-muted-foreground">Generate 1 or more recipes</p>
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
                <h2 className="text-2xl font-bold">Drag Recipes to Your Weekly Calendar</h2>
                <p className="text-muted-foreground">
                  Drag and drop recipes into any day and meal slot
                </p>
              </div>
              <Button onClick={() => setShowAssignment(false)} variant="outline">
                Generate More Recipes
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
              {/* Weekly Calendar - Takes more space */}
              <div className="lg:col-span-8">
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
                    <div className="space-y-1">
                      {/* Header Row */}
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        <div className="font-semibold text-sm"></div>
                        {MEAL_TYPES.map(mealType => (
                          <div key={mealType} className="font-semibold text-sm text-center">
                            {mealType}
                          </div>
                        ))}
                      </div>

                      {/* Day Rows */}
                      {DAYS.map(day => (
                        <div key={day} className="grid grid-cols-4 gap-2">
                          <div className="font-medium text-sm py-2">{day.slice(0, 3)}</div>
                          {MEAL_TYPES.map(mealType => {
                            const assigned = assignedRecipes.find(
                              r => r.day === day && r.mealType === mealType
                            );
                            return (
                              <div
                                key={mealType}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(day, mealType)}
                                className={`min-h-[80px] p-2 rounded-lg border-2 border-dashed transition-all ${
                                  assigned 
                                    ? 'bg-primary/10 border-primary' 
                                    : 'bg-muted/30 border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50'
                                }`}
                              >
                                {assigned ? (
                                  <div className="relative group">
                                    <p className="text-xs font-medium line-clamp-2">{assigned.name}</p>
                                    <p className="text-xs text-muted-foreground">{assigned.calories} cal</p>
                                    <button
                                      onClick={() => handleRemoveAssignment(day, mealType)}
                                      className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-xs text-destructive"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <p className="text-xs italic text-muted-foreground text-center pt-4">
                                    Drop here
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Available Recipes - Sidebar */}
              <div className="lg:col-span-4">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Available Recipes</CardTitle>
                    <CardDescription>
                      Drag these into your calendar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {generatedRecipes.map((recipe, index) => (
                        <div
                          key={index}
                          draggable
                          onDragStart={() => handleDragStart(recipe)}
                          className="p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-grab active:cursor-grabbing transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm line-clamp-2">{recipe.name}</p>
                              <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                                <span>{recipe.protein}g protein</span>
                                <span>•</span>
                                <span>{recipe.calories} cal</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
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
