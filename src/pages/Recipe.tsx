import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChefHat, Sparkles } from 'lucide-react';

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
  day?: string;
  mealType?: string;
}

const Recipe = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);

  // Manual recipe form state
  const [manualRecipe, setManualRecipe] = useState({
    name: '',
    servings: '',
    prepTime: '',
    cookTime: '',
    ingredients: '',
    instructions: '',
  });

  // AI generation form state
  const [aiParams, setAiParams] = useState({
    protein: '',
    carbs: '',
    calories: '',
    dietaryRestrictions: '',
    numberOfRecipes: '7',
    numberOfPeople: '2',
    mealsPerDay: '3',
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Recipe Saved!',
      description: `${manualRecipe.name} has been added to your collection.`,
    });
    // Reset form
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
      
      toast({
        title: 'Recipes Generated!',
        description: `Successfully created ${data.recipes.length} recipes for your weekly meal plan.`,
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Weekly Recipe Planner</h1>
          <p className="text-muted-foreground">
            Create your perfect weekly meal plan with manual recipes or AI-powered generation
          </p>
        </div>

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

          {/* AI Generation Tab */}
          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Recipe Generator</CardTitle>
                <CardDescription>
                  Set your nutritional goals and preferences to generate a personalized weekly meal plan
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
                      <Label htmlFor="mealsPerDay">Meals per Day</Label>
                      <Select
                        value={aiParams.mealsPerDay}
                        onValueChange={(value) => setAiParams({ ...aiParams, mealsPerDay: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Meal</SelectItem>
                          <SelectItem value="2">2 Meals</SelectItem>
                          <SelectItem value="3">3 Meals</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recipes">Total Recipes for Week</Label>
                      <Input
                        id="recipes"
                        type="number"
                        min="1"
                        max="21"
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
                        Generating Your Meal Plan...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Weekly Meal Plan
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Generated Recipes Display */}
            {generatedRecipes.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Your Weekly Meal Plan</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {generatedRecipes.map((recipe, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {recipe.name}
                          <span className="text-sm font-normal text-muted-foreground">
                            {recipe.day} - {recipe.mealType}
                          </span>
                        </CardTitle>
                        <CardDescription>
                          Servings: {recipe.servings} | Prep: {recipe.prepTime} | Cook: {recipe.cookTime}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-4 text-sm">
                          <div>
                            <span className="font-semibold">Protein:</span> {recipe.protein}g
                          </div>
                          <div>
                            <span className="font-semibold">Carbs:</span> {recipe.carbs}g
                          </div>
                          <div>
                            <span className="font-semibold">Calories:</span> {recipe.calories}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Ingredients:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {recipe.ingredients.map((ing, i) => (
                              <li key={i}>{ing}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Instructions:</h4>
                          <ol className="list-decimal list-inside space-y-1 text-sm">
                            {recipe.instructions.map((inst, i) => (
                              <li key={i}>{inst}</li>
                            ))}
                          </ol>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Manual Input Tab */}
          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>Add Your Own Recipe</CardTitle>
                <CardDescription>
                  Manually create and save your favorite recipes to your collection
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
                      placeholder="Enter each ingredient on a new line&#10;e.g.,&#10;2 chicken breasts&#10;1 cup rice&#10;2 tablespoons soy sauce"
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
                      placeholder="Enter each step on a new line&#10;e.g.,&#10;1. Preheat oven to 350°F&#10;2. Season chicken with salt and pepper&#10;3. Bake for 25 minutes"
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
      </div>
    </div>
  );
};

export default Recipe;
