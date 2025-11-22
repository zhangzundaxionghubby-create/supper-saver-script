import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChefHat, TrendingUp, Activity } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

const MealPlanning = () => {
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
  const { toast } = useToast();
  const navigate = useNavigate();

  // Weekly nutrient targets (recommended daily intake * 7)
  const weeklyTargets = {
    calories: 14000, // 2000 per day * 7
    protein: 350,    // 50g per day * 7
    carbs: 1750,     // 250g per day * 7
  };

  // Load meal plans from database
  useEffect(() => {
    loadMealPlans();
  }, []);

  const loadMealPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .order('week_start', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Merge all meal plan data
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

      // First check if a plan exists for this week
      const { data: existingPlan } = await supabase
        .from('meal_plans')
        .select('id')
        .eq('week_start', weekStart)
        .eq('user_id', user.id)
        .single();

      if (existingPlan) {
        // Update existing plan
        const { error } = await supabase
          .from('meal_plans')
          .update({ meal_data: updatedData as any })
          .eq('week_start', weekStart)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert new plan
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

    // Reset form
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

  // Calculate weekly nutrients from current week's meal plan
  const getWeeklyNutrients = () => {
    if (!selectedDate) return { calories: 0, protein: 0, carbs: 0 };

    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
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

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
  ];

  const mealsForDay = getMealsForSelectedDate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Meal Planning</h1>
              <p className="text-muted-foreground">
                Select a date and plan your meals for each day
              </p>
            </div>
            <Button onClick={() => navigate('/nutrients')} variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              View Nutrients
            </Button>
          </div>
        </div>

        {/* Weekly Nutrient Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Nutrient Summary
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Week of {selectedDate && format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d')} - {selectedDate && format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Calories */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Calories</span>
                  <span className="text-muted-foreground">
                    {weeklyNutrients.calories} / {weeklyTargets.calories}
                  </span>
                </div>
                <Progress 
                  value={(weeklyNutrients.calories / weeklyTargets.calories) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {Math.round((weeklyNutrients.calories / weeklyTargets.calories) * 100)}% of target
                </p>
              </div>

              {/* Protein */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Protein (g)</span>
                  <span className="text-muted-foreground">
                    {weeklyNutrients.protein} / {weeklyTargets.protein}
                  </span>
                </div>
                <Progress 
                  value={(weeklyNutrients.protein / weeklyTargets.protein) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {Math.round((weeklyNutrients.protein / weeklyTargets.protein) * 100)}% of target
                </p>
              </div>

              {/* Carbs */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Carbs (g)</span>
                  <span className="text-muted-foreground">
                    {weeklyNutrients.carbs} / {weeklyTargets.carbs}
                  </span>
                </div>
                <Progress 
                  value={(weeklyNutrients.carbs / weeklyTargets.carbs) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {Math.round((weeklyNutrients.carbs / weeklyTargets.carbs) * 100)}% of target
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {mealTypes.find(t => t.value === meal.mealType)?.label}
                          </span>
                        </div>
                        {(meal.calories || meal.protein || meal.carbs) && (
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            {meal.calories && (
                              <span>{meal.calories} cal</span>
                            )}
                            {meal.protein && (
                              <span>{meal.protein}g protein</span>
                            )}
                            {meal.carbs && (
                              <span>{meal.carbs}g carbs</span>
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMeal(meal.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
      </div>
    </div>
  );
};

export default MealPlanning;
