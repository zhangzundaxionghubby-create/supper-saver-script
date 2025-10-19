import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Calculator } from 'lucide-react';
import { getMealPlan, getPreferences } from '@/lib/storage';
import { MealPlan } from '@/types';
import Navigation from '@/components/Navigation';

const Macros = () => {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);

  useEffect(() => {
    const plan = getMealPlan();
    if (plan) {
      setMealPlan(plan);
    }
  }, []);

  if (!mealPlan) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="shadow-md">
            <CardContent className="py-16 text-center">
              <Calculator className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No macros to display</h3>
              <p className="text-muted-foreground">
                Generate a meal plan first to see your macro breakdown
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const prefs = getPreferences();
  const proteinProgress = prefs ? (mealPlan.macrosSummary.dailyProtein / prefs.proteinTarget) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Macros Summary</h1>
          <p className="text-muted-foreground">
            Track your daily nutrition targets
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Target className="h-8 w-8 text-primary" />
                {mealPlan.macrosSummary.meetsTarget ? (
                  <Badge className="bg-primary">On Target</Badge>
                ) : (
                  <Badge variant="secondary">Below Target</Badge>
                )}
              </div>
              <CardTitle className="text-3xl mt-4">
                {mealPlan.macrosSummary.dailyProtein}g
              </CardTitle>
              <CardDescription>Daily Protein</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Target</span>
                  <span className="font-medium">{prefs?.proteinTarget}g</span>
                </div>
                <Progress value={proteinProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-secondary" />
              <CardTitle className="text-3xl mt-4">
                {mealPlan.macrosSummary.dailyCalories}
              </CardTitle>
              <CardDescription>Daily Calories</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Average across all planned meals
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <Calculator className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl mt-4">
                {mealPlan.meals.length}
              </CardTitle>
              <CardDescription>Meals Planned</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                For this week's meal plan
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Meal Breakdown</CardTitle>
            <CardDescription>Protein and calorie content per meal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mealPlan.meals.map((meal, idx) => (
                <div key={meal.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium">{meal.name}</p>
                    <p className="text-sm text-muted-foreground">Day {idx + 1}</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{meal.macros.protein}g</p>
                      <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{meal.macros.kcal}</p>
                      <p className="text-xs text-muted-foreground">Calories</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Macros;
