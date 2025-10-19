import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, Flame, TrendingUp, X, Trash2 } from 'lucide-react';
import { getCookedMeals, removeCookedMeal } from '@/lib/storage';
import { CookedMeal } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Calorie = () => {
  const { toast } = useToast();
  const [cookedMeals, setCookedMeals] = useState<CookedMeal[]>([]);

  useEffect(() => {
    setCookedMeals(getCookedMeals());
  }, []);

  const handleRemoveMeal = (mealId: string) => {
    removeCookedMeal(mealId);
    setCookedMeals(getCookedMeals());
    toast({
      title: 'Meal Removed',
      description: 'The meal has been removed from your calorie tracker.',
    });
  };

  const handleClearAll = () => {
    cookedMeals.forEach(meal => removeCookedMeal(meal.id));
    setCookedMeals([]);
    localStorage.removeItem('usedIngredients');
    toast({
      title: 'All Cleared',
      description: 'All tracked meals have been cleared.',
    });
  };

  const totalCalories = cookedMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = cookedMeals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = cookedMeals.reduce((sum, meal) => sum + meal.carbs, 0);

  const groupedByDay = cookedMeals.reduce((acc, meal) => {
    if (!acc[meal.day]) {
      acc[meal.day] = [];
    }
    acc[meal.day].push(meal);
    return acc;
  }, {} as { [key: string]: CookedMeal[] });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Flame className="h-10 w-10" />
              Calorie Tracker
            </h1>
            <p className="text-muted-foreground">
              Track the meals you've cooked and monitor your nutrition
            </p>
          </div>
          {cookedMeals.length > 0 && (
            <Button onClick={handleClearAll} variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Calories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCalories}</div>
              <p className="text-xs text-muted-foreground mt-1">
                from {cookedMeals.length} meal{cookedMeals.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Protein
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalProtein}g</div>
              <p className="text-xs text-muted-foreground mt-1">
                across all cooked meals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Carbs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCarbs}g</div>
              <p className="text-xs text-muted-foreground mt-1">
                across all cooked meals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Meals List */}
        {cookedMeals.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Meals Tracked Yet</h3>
              <p className="text-muted-foreground">
                Go to the Cooking page and mark meals as cooked to track your calories
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedByDay).map(day => (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {day}
                  </CardTitle>
                  <CardDescription>
                    {groupedByDay[day].reduce((sum, meal) => sum + meal.calories, 0)} calories total
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {groupedByDay[day].map((meal, index) => (
                      <div key={index}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{meal.name}</h3>
                              <Badge variant="outline">{meal.mealType}</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Calories:</span>{' '}
                                <span className="font-medium">{meal.calories}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Protein:</span>{' '}
                                <span className="font-medium">{meal.protein}g</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Carbs:</span>{' '}
                                <span className="font-medium">{meal.carbs}g</span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Cooked on {new Date(meal.cookedAt).toLocaleDateString()} at{' '}
                              {new Date(meal.cookedAt).toLocaleTimeString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMeal(meal.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {index < groupedByDay[day].length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calorie;
