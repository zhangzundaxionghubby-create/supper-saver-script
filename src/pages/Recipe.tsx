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
import { Loader2, ChefHat, Sparkles, Calendar as CalendarIcon, ArrowRight, GripVertical, Trash2, Search, List, Heart, X, Plus, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
  
  // Meal Planning State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [mealPlanData, setMealPlanData] = useState<MealPlanData>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: '',
    mealType: 'breakfast',
    calories: '',
    protein: '',
    carbs: '',
  });

  // Weekly nutrient targets (recommended daily intake * 7)
  const weeklyTargets = {
    calories: 14000, // 2000 per day * 7
    protein: 350,    // 50g per day * 7
    carbs: 1750,     // 250g per day * 7
  };

  const [manualRecipe, setManualRecipe] = useState({
    name: '',
    details: '',
    dietaryRestrictions: 'none',
  });

  const [manualAllergies, setManualAllergies] = useState('');
  const [manualAllergiesTags, setManualAllergiesTags] = useState<string[]>([]);

  const [isParsingRecipe, setIsParsingRecipe] = useState(false);

  const [aiParams, setAiParams] = useState({
    protein: '30',
    carbs: '40',
    calories: '500',
    dietaryRestrictions: 'none',
    numberOfRecipes: '7',
    numberOfPeople: '2',
  });

  const [allergiesInput, setAllergiesInput] = useState('');
  const [allergiesTags, setAllergiesTags] = useState<string[]>([]);

  // Load all recipes from database
  useEffect(() => {
    loadRecipes();
    loadMealPlans();
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
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to save recipes');
    }

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
        user_id: user.id,
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
        dietaryRestrictions: 'none',
      });
      setManualAllergiesTags([]);
      
      // Switch to list tab to see the added recipe
      setActiveTab('list');
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

  const handleAddAllergy = () => {
    const trimmed = allergiesInput.trim();
    if (trimmed && !allergiesTags.includes(trimmed)) {
      setAllergiesTags([...allergiesTags, trimmed]);
      setAllergiesInput('');
    }
  };

  const handleRemoveAllergy = (allergyToRemove: string) => {
    setAllergiesTags(allergiesTags.filter(tag => tag !== allergyToRemove));
  };

  const handleAllergiesKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAllergy();
    }
  };

  const handleAddManualAllergy = () => {
    const trimmed = manualAllergies.trim();
    if (trimmed && !manualAllergiesTags.includes(trimmed)) {
      setManualAllergiesTags([...manualAllergiesTags, trimmed]);
      setManualAllergies('');
    }
  };

  const handleRemoveManualAllergy = (allergyToRemove: string) => {
    setManualAllergiesTags(manualAllergiesTags.filter(tag => tag !== allergyToRemove));
  };

  const handleManualAllergiesKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddManualAllergy();
    }
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      console.log('Starting recipe generation...');
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
            allergiesConditions: allergiesTags,
          }),
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Edge function error:', error);
        throw new Error(error.error || 'Failed to generate recipes');
      }

      const data = await response.json();
      console.log('Generated recipes:', data);
      
      // Add generated recipes to the current list (no database saving)
      setAllRecipes(prev => [...data.recipes, ...prev]);
      setFilteredRecipes(prev => [...data.recipes, ...prev]);
      setActiveTab('list');
      
      toast({
        title: 'Recipes Generated!',
        description: `Successfully created ${data.recipes.length} recipes!`,
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

  const handleDragStart = (recipe: Recipe, fromSlot?: { day: string; mealType: string }) => {
    setDraggedRecipe(recipe);
    
    // If dragging from a slot, remove it from that slot
    if (fromSlot) {
      setAssignedRecipes(assignedRecipes.filter(
        r => !(r.day === fromSlot.day && r.mealType === fromSlot.mealType)
      ));
    }
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

  const handleLikeRecipe = (recipeName: string) => {
    // Find the recipe
    const recipe = allRecipes.find(r => r.name === recipeName);
    if (!recipe) return;

    // Find the first available meal slot (going through days and meal types)
    let assigned = false;
    for (const day of DAYS) {
      for (const mealType of MEAL_TYPES) {
        const existingAssignment = assignedRecipes.find(
          r => r.day === day && r.mealType === mealType
        );
        
        if (!existingAssignment) {
          // Found an empty slot, assign the recipe here
          const newAssignment: AssignedRecipe = { ...recipe, day, mealType };
          setAssignedRecipes([...assignedRecipes, newAssignment]);
          
          toast({
            title: 'Recipe Added to Meal Plan!',
            description: `${recipeName} added to ${day} ${mealType}. View it in the Meal Planning tab.`,
          });
          
          assigned = true;
          break;
        }
      }
      if (assigned) break;
    }

    if (!assigned) {
      toast({
        title: 'Meal Plan Full',
        description: 'All meal slots are filled. Go to Meal Planning to make space or replace a recipe.',
        variant: 'destructive',
      });
    }
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

  // Meal Planning Functions
  const loadMealPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .order('week_start', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mergedData: MealPlanData = {};
        data.forEach(plan => {
          const planData = plan.meal_data as unknown as MealPlanData;
          if (planData && typeof planData === 'object') {
            Object.keys(planData).forEach(date => {
              if (!mergedData[date]) {
                mergedData[date] = [];
              }
              mergedData[date] = [...mergedData[date], ...planData[date]];
            });
          }
        });
        setMealPlanData(mergedData);
      }
    } catch (error) {
      console.error('Error loading meal plans:', error);
    }
  };

  const saveMealPlans = async (updatedData: MealPlanData) => {
    try {
      if (!selectedDate) return;

      const weekStart = format(selectedDate, 'yyyy-MM-dd');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: existingPlan } = await supabase
        .from('meal_plans')
        .select('id')
        .eq('week_start', weekStart)
        .eq('user_id', user.id)
        .single();

      if (existingPlan) {
        const { error } = await supabase
          .from('meal_plans')
          .update({ meal_data: updatedData as any })
          .eq('week_start', weekStart)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('meal_plans')
          .insert({
            user_id: user.id,
            week_start: weekStart,
            meal_data: updatedData as any,
          });

        if (error) throw error;
      }

      toast({
        title: 'Meal plan saved',
        description: 'Your meal plan has been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving meal plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to save meal plan. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const addMeal = () => {
    if (!selectedDate || !newMeal.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a meal name.',
        variant: 'destructive',
      });
      return;
    }

    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const meal: DayMeal = {
      id: `${Date.now()}-${Math.random()}`,
      name: newMeal.name,
      mealType: newMeal.mealType,
      calories: newMeal.calories ? parseInt(newMeal.calories) : undefined,
      protein: newMeal.protein ? parseInt(newMeal.protein) : undefined,
      carbs: newMeal.carbs ? parseInt(newMeal.carbs) : undefined,
    };

    const updatedData = {
      ...mealPlanData,
      [dateKey]: [...(mealPlanData[dateKey] || []), meal],
    };

    setMealPlanData(updatedData);
    saveMealPlans(updatedData);

    setNewMeal({
      name: '',
      mealType: 'breakfast',
      calories: '',
      protein: '',
      carbs: '',
    });
    setIsDialogOpen(false);

    toast({
      title: 'Meal added',
      description: `${meal.name} added to ${format(selectedDate, 'MMMM d, yyyy')}`,
    });
  };

  const deleteMeal = (mealId: string) => {
    if (!selectedDate) return;

    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const updatedData = {
      ...mealPlanData,
      [dateKey]: (mealPlanData[dateKey] || []).filter(m => m.id !== mealId),
    };

    setMealPlanData(updatedData);
    saveMealPlans(updatedData);

    toast({
      title: 'Meal removed',
      description: 'Meal has been removed from your plan.',
    });
  };

  const getMealsForSelectedDate = (): DayMeal[] => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return mealPlanData[dateKey] || [];
  };

  const getDaysWithMeals = () => {
    return Object.keys(mealPlanData).map(dateStr => new Date(dateStr));
  };

  const getWeeklyNutrients = () => {
    if (!selectedDate) return { calories: 0, protein: 0, carbs: 0 };

    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;

    Object.keys(mealPlanData).forEach(dateStr => {
      const date = new Date(dateStr);
      if (date >= weekStart && date <= weekEnd) {
        mealPlanData[dateStr].forEach(meal => {
          totalCalories += meal.calories || 0;
          totalProtein += meal.protein || 0;
          totalCarbs += meal.carbs || 0;
        });
      }
    });

    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
    };
  };

  const weeklyNutrients = getWeeklyNutrients();
  const mealsForDay = getMealsForSelectedDate();
  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
  ];

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
              <CalendarIcon className="h-4 w-4" />
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

                      <div className="space-y-2 md:col-span-2 lg:col-span-3">
                        <Label htmlFor="allergies">Allergies / Conditions</Label>
                        <div className="flex gap-2">
                          <Input
                            id="allergies"
                            placeholder="Type and press Enter to add (e.g., peanuts, shellfish, diabetes)"
                            value={allergiesInput}
                            onChange={(e) => setAllergiesInput(e.target.value)}
                            onKeyDown={handleAllergiesKeyDown}
                          />
                          <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={handleAddAllergy}
                            disabled={!allergiesInput.trim()}
                          >
                            Add
                          </Button>
                        </div>
                        {allergiesTags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {allergiesTags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="gap-1 px-3 py-1">
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAllergy(tag)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Add any allergies or medical conditions to consider
                        </p>
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
                      <Label htmlFor="manualDietary">Dietary Restrictions</Label>
                      <Select
                        value={manualRecipe.dietaryRestrictions}
                        onValueChange={(value) => setManualRecipe({ ...manualRecipe, dietaryRestrictions: value })}
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
                      <Label htmlFor="manualAllergies">Allergies / Conditions</Label>
                      <div className="flex gap-2">
                        <Input
                          id="manualAllergies"
                          placeholder="Type and press Enter to add"
                          value={manualAllergies}
                          onChange={(e) => setManualAllergies(e.target.value)}
                          onKeyDown={handleManualAllergiesKeyDown}
                        />
                        <Button 
                          type="button" 
                          variant="secondary" 
                          onClick={handleAddManualAllergy}
                          disabled={!manualAllergies.trim()}
                        >
                          Add
                        </Button>
                      </div>
                      {manualAllergiesTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {manualAllergiesTags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="gap-1 px-3 py-1">
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveManualAllergy(tag)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Add any allergies or medical conditions to consider
                      </p>
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
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Calendar Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Date</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border pointer-events-auto"
                    modifiers={{
                      hasMeals: getDaysWithMeals(),
                    }}
                    modifiersClassNames={{
                      hasMeals: 'bg-primary/20 font-bold',
                    }}
                  />
                </CardContent>
              </Card>

              {/* Meals for Selected Date */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>
                      {selectedDate
                        ? format(selectedDate, 'MMMM d, yyyy')
                        : 'Select a date'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {mealsForDay.length} meal{mealsForDay.length !== 1 ? 's' : ''} planned
                    </p>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" disabled={!selectedDate}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Meal
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Meal</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label htmlFor="meal-name">Meal Name</Label>
                          <Input
                            id="meal-name"
                            placeholder="e.g., Grilled Chicken Salad"
                            value={newMeal.name}
                            onChange={(e) =>
                              setNewMeal({ ...newMeal, name: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="meal-type">Meal Type</Label>
                          <Select
                            value={newMeal.mealType}
                            onValueChange={(value) =>
                              setNewMeal({ ...newMeal, mealType: value })
                            }
                          >
                            <SelectTrigger id="meal-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {mealTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="calories">Calories</Label>
                            <Input
                              id="calories"
                              type="number"
                              placeholder="500"
                              value={newMeal.calories}
                              onChange={(e) =>
                                setNewMeal({ ...newMeal, calories: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="protein">Protein (g)</Label>
                            <Input
                              id="protein"
                              type="number"
                              placeholder="30"
                              value={newMeal.protein}
                              onChange={(e) =>
                                setNewMeal({ ...newMeal, protein: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="carbs">Carbs (g)</Label>
                            <Input
                              id="carbs"
                              type="number"
                              placeholder="50"
                              value={newMeal.carbs}
                              onChange={(e) =>
                                setNewMeal({ ...newMeal, carbs: e.target.value })
                              }
                            />
                          </div>
                        </div>

                        <Button onClick={addMeal} className="w-full">
                          Add Meal
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {!selectedDate ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <ChefHat className="h-16 w-16 mb-4 opacity-50" />
                      <p>Select a date to view and add meals</p>
                    </div>
                  ) : mealsForDay.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <ChefHat className="h-16 w-16 mb-4 opacity-50" />
                      <p>No meals planned for this day</p>
                      <p className="text-sm">Click "Add Meal" to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mealsForDay.map((meal) => (
                        <div
                          key={meal.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground">
                                {meal.name}
                              </h3>
                              <Badge variant="secondary" className="text-xs">
                                {meal.mealType}
                              </Badge>
                            </div>
                            {(meal.calories || meal.protein || meal.carbs) && (
                              <div className="flex gap-3 text-sm text-muted-foreground">
                                {meal.calories && <span>{meal.calories} cal</span>}
                                {meal.protein && <span>{meal.protein}g protein</span>}
                                {meal.carbs && <span>{meal.carbs}g carbs</span>}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMeal(meal.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Recipe;
