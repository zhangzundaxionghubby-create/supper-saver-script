import { useState, useEffect } from 'react';
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
import { Loader2, ChefHat, Sparkles, Calendar, ArrowRight, GripVertical, Trash2, Search, List, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignedRecipes, setAssignedRecipes] = useState<AssignedRecipe[]>([]);
  const [draggedRecipe, setDraggedRecipe] = useState<Recipe | null>(null);
  const [activeTab, setActiveTab] = useState('generate');

  const [manualRecipe, setManualRecipe] = useState({
    name: '',
    details: '',
  });

  const [isParsingRecipe, setIsParsingRecipe] = useState(false);

  const [aiParams, setAiParams] = useState({
    protein: '30',
    carbs: '40',
    calories: '500',
    dietaryRestrictions: 'none',
    numberOfRecipes: '7',
    numberOfPeople: '2',
  });

  // Load all recipes from database
  useEffect(() => {
    loadRecipes();
  }, []);

  // Filter recipes based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRecipes(allRecipes);
    } else {
      const filtered = allRecipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRecipes(filtered);
    }
  }, [searchQuery, allRecipes]);

  const loadRecipes = async () => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading recipes:', error);
      toast({
        title: 'Failed to Load Recipes',
        description: 'Could not load your recipe list.',
        variant: 'destructive',
      });
      return;
    }

    const recipes: Recipe[] = data.map(r => ({
      name: r.name,
      servings: r.servings,
      prepTime: r.prep_time || '',
      cookTime: r.cook_time || '',
      protein: r.protein,
      carbs: r.carbs,
      calories: r.calories,
      ingredients: r.ingredients as string[],
    }));

    setAllRecipes(recipes);
    setFilteredRecipes(recipes);
  };

  const saveRecipeToDatabase = async (recipe: Recipe) => {
    const { error } = await supabase
      .from('recipes')
      .insert({
        name: recipe.name,
        servings: recipe.servings,
        prep_time: recipe.prepTime,
        cook_time: recipe.cookTime,
        protein: recipe.protein,
        carbs: recipe.carbs,
        calories: recipe.calories,
        ingredients: recipe.ingredients,
      });

    if (error) {
      console.error('Error saving recipe:', error);
      throw error;
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsParsingRecipe(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-recipe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipeName: manualRecipe.name,
            recipeDetails: manualRecipe.details,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to parse recipe');
      }

      const parsedRecipe = await response.json();
      
      // Create a full recipe object
      const newRecipe: Recipe = {
        name: manualRecipe.name,
        servings: parsedRecipe.servings,
        prepTime: parsedRecipe.prepTime,
        cookTime: parsedRecipe.cookTime,
        protein: parsedRecipe.protein,
        carbs: parsedRecipe.carbs,
        calories: parsedRecipe.calories,
        ingredients: parsedRecipe.ingredients,
      };

      // Save to database
      await saveRecipeToDatabase(newRecipe);
      await loadRecipes();
      
      toast({
        title: 'Recipe Added!',
        description: `${manualRecipe.name} has been saved to your recipe list.`,
      });

      setManualRecipe({
        name: '',
        details: '',
      });
    } catch (error) {
      console.error('Error parsing recipe:', error);
      toast({
        title: 'Failed to Parse Recipe',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsParsingRecipe(false);
    }
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
      
      // Save all generated recipes to database
      for (const recipe of data.recipes) {
        await saveRecipeToDatabase(recipe);
      }
      
      await loadRecipes();
      setActiveTab('list');
      
      toast({
        title: 'Recipes Generated!',
        description: `Successfully created ${data.recipes.length} recipes and saved to your list!`,
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

  const handleClearMealPlan = () => {
    setAssignedRecipes([]);
    localStorage.removeItem('weeklyPlanRecipes');
    localStorage.removeItem('shoppingIngredients');
    toast({
      title: 'Meal Plan Cleared',
      description: 'Your weekly meal plan has been cleared.',
    });
  };

  const handleDeleteRecipe = async (recipeName: string) => {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('name', recipeName);

    if (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: 'Failed to Delete',
        description: 'Could not delete the recipe.',
        variant: 'destructive',
      });
      return;
    }

    await loadRecipes();
    toast({
      title: 'Recipe Deleted',
      description: 'Recipe removed from your list.',
    });
  };

  const handleLikeRecipe = async (recipeName: string) => {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('name', recipeName);

    if (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: 'Failed to Remove',
        description: 'Could not remove the recipe.',
        variant: 'destructive',
      });
      return;
    }

    await loadRecipes();
    toast({
      title: 'Recipe Liked!',
      description: `"${recipeName}" removed from list and ready for meal planning.`,
    });
  };

  const handleNextStep = () => {
    if (activeTab === 'generate') {
      setActiveTab('list');
    } else if (activeTab === 'list') {
      setActiveTab('plan');
    } else if (activeTab === 'plan') {
      handleProceedToShopping();
    }
  };

  const getNextStepLabel = () => {
    if (activeTab === 'generate') return 'Next: View Recipe List';
    if (activeTab === 'list') return 'Next: Plan Meals';
    return 'Next: Shopping List';
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
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Recipe Management</h1>
            <p className="text-muted-foreground">
              Generate recipes, manage your list, and plan your weekly meals
            </p>
          </div>
          <Button onClick={handleNextStep} size="lg" className="flex-shrink-0">
            {getNextStepLabel()}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="generate" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Recipes
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              Recipe List ({allRecipes.length})
            </TabsTrigger>
            <TabsTrigger value="plan" className="gap-2">
              <Calendar className="h-4 w-4" />
              Meal Planning
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Generate Recipes */}
          <TabsContent value="generate" className="space-y-6">
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
                    Just provide the recipe name and details - AI will extract all the information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleManualSubmit} className="space-y-6">
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
                      <Label htmlFor="recipeDetails">Recipe Details</Label>
                      <Textarea
                        id="recipeDetails"
                        placeholder="Describe your recipe... include ingredients, quantities, cooking methods, and any other details. The more detail you provide, the better the AI can extract the information."
                        rows={12}
                        value={manualRecipe.details}
                        onChange={(e) => setManualRecipe({ ...manualRecipe, details: e.target.value })}
                        required
                        className="min-h-[200px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Example: "A healthy chicken stir fry with 300g chicken breast, 2 cups of mixed vegetables, soy sauce, garlic, and ginger. Served with rice. Takes about 15 minutes to prep and 20 minutes to cook."
                      </p>
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={isParsingRecipe}>
                      {isParsingRecipe ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Parsing Recipe with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Add Recipe
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Tab 2: Recipe List */}
          <TabsContent value="list" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Recipe Collection</CardTitle>
                <CardDescription>
                  All your generated recipes in one place. Search and manage your collection.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search recipes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {filteredRecipes.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {searchQuery ? 'No recipes found matching your search.' : 'No recipes yet. Generate some recipes to get started!'}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredRecipes.map((recipe, index) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg line-clamp-2">{recipe.name}</CardTitle>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteRecipe(recipe.name)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <CardDescription>
                            {recipe.servings} servings • {recipe.prepTime || 'N/A'} prep • {recipe.cookTime || 'N/A'} cook
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Protein:</span>
                                <span className="font-medium">{recipe.protein}g</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Carbs:</span>
                                <span className="font-medium">{recipe.carbs}g</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Calories:</span>
                                <span className="font-medium">{recipe.calories}</span>
                              </div>
                              <div className="pt-1">
                                <p className="text-xs text-muted-foreground">
                                  {recipe.ingredients.length} ingredients
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleLikeRecipe(recipe.name)}
                              variant="default"
                              size="sm"
                              className="w-full gap-2"
                            >
                              <Heart className="h-4 w-4" />
                              I Like This
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Meal Planning */}
          <TabsContent value="plan" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Weekly Meal Planner</h2>
                <p className="text-muted-foreground">
                  Drag recipes from your list into the weekly calendar
                </p>
              </div>
              {assignedRecipes.length > 0 && (
                <Button onClick={handleClearMealPlan} variant="outline">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Meal Plan
                </Button>
              )}
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
                    <CardTitle className="text-lg">Your Recipe List</CardTitle>
                    <CardDescription>
                      Drag any recipe into your calendar ({allRecipes.length} total)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 h-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {filteredRecipes.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          {searchQuery ? 'No recipes found.' : 'Generate recipes to get started!'}
                        </p>
                      ) : (
                        filteredRecipes.map((recipe, index) => (
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
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Recipe;
