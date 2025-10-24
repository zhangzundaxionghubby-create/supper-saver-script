import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar, Activity, TrendingUp, X, Trash2, ChevronDown } from 'lucide-react';
import { getCookedMeals, removeCookedMeal } from '@/lib/storage';
import { CookedMeal } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Nutrients = () => {
  const { toast } = useToast();
  const [cookedMeals, setCookedMeals] = useState<CookedMeal[]>([]);
  const [expandedVitamins, setExpandedVitamins] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    setCookedMeals(getCookedMeals());
  }, []);

  const handleRemoveMeal = (mealId: string) => {
    removeCookedMeal(mealId);
    setCookedMeals(getCookedMeals());
    toast({
      title: 'Meal Removed',
      description: 'The meal has been removed from your nutrient tracker.',
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
  const totalSalt = cookedMeals.reduce((sum, meal) => sum + (meal.salt || 0), 0);
  const totalSaturatedFat = cookedMeals.reduce((sum, meal) => sum + (meal.saturatedFat || 0), 0);
  const totalUnsaturatedFat = cookedMeals.reduce((sum, meal) => sum + (meal.unsaturatedFat || 0), 0);
  const totalFibre = cookedMeals.reduce((sum, meal) => sum + (meal.fibre || 0), 0);

  const groupedByDay = cookedMeals.reduce((acc, meal) => {
    if (!acc[meal.day]) {
      acc[meal.day] = [];
    }
    acc[meal.day].push(meal);
    return acc;
  }, {} as { [key: string]: CookedMeal[] });

  const toggleVitamins = (mealId: string) => {
    setExpandedVitamins(prev => ({
      ...prev,
      [mealId]: !prev[mealId]
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Activity className="h-10 w-10" />
              Nutrient Tracker
            </h1>
            <p className="text-muted-foreground">
              Track the meals you've cooked and monitor your complete nutrition profile
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
                across all meals
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
                across all meals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Fibre
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalFibre.toFixed(1)}g</div>
              <p className="text-xs text-muted-foreground mt-1">
                across all meals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Nutrients Summary */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saturated Fat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSaturatedFat.toFixed(1)}g</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Unsaturated Fat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUnsaturatedFat.toFixed(1)}g</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Salt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSalt.toFixed(1)}g</div>
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
                Go to the Cooking page and mark meals as cooked to track your nutrients
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
                            <div className="flex items-center gap-2 mb-3">
                              <h3 className="font-semibold">{meal.name}</h3>
                              <Badge variant="outline">{meal.mealType}</Badge>
                            </div>
                            
                            {/* Macronutrients */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
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
                              <div>
                                <span className="text-muted-foreground">Fibre:</span>{' '}
                                <span className="font-medium">{meal.fibre?.toFixed(1) || '0'}g</span>
                              </div>
                            </div>

                            {/* Fats and Salt */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-3">
                              <div>
                                <span className="text-muted-foreground">Saturated Fat:</span>{' '}
                                <span className="font-medium">{meal.saturatedFat?.toFixed(1) || '0'}g</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Unsaturated Fat:</span>{' '}
                                <span className="font-medium">{meal.unsaturatedFat?.toFixed(1) || '0'}g</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Salt:</span>{' '}
                                <span className="font-medium">{meal.salt?.toFixed(1) || '0'}g</span>
                              </div>
                            </div>

                            {/* Vitamins Collapsible */}
                            {meal.vitamins && Object.keys(meal.vitamins).length > 0 && (
                              <Collapsible
                                open={expandedVitamins[meal.id]}
                                onOpenChange={() => toggleVitamins(meal.id)}
                              >
                                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:underline">
                                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedVitamins[meal.id] ? 'rotate-180' : ''}`} />
                                  View Vitamins
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-2">
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm bg-muted/30 rounded-md p-3">
                                    {meal.vitamins.vitaminA && (
                                      <div>
                                        <span className="text-muted-foreground">Vitamin A:</span>{' '}
                                        <span className="font-medium">{meal.vitamins.vitaminA}μg</span>
                                      </div>
                                    )}
                                    {meal.vitamins.vitaminB1 && (
                                      <div>
                                        <span className="text-muted-foreground">Vitamin B1:</span>{' '}
                                        <span className="font-medium">{meal.vitamins.vitaminB1}mg</span>
                                      </div>
                                    )}
                                    {meal.vitamins.vitaminB2 && (
                                      <div>
                                        <span className="text-muted-foreground">Vitamin B2:</span>{' '}
                                        <span className="font-medium">{meal.vitamins.vitaminB2}mg</span>
                                      </div>
                                    )}
                                    {meal.vitamins.vitaminB3 && (
                                      <div>
                                        <span className="text-muted-foreground">Vitamin B3:</span>{' '}
                                        <span className="font-medium">{meal.vitamins.vitaminB3}mg</span>
                                      </div>
                                    )}
                                    {meal.vitamins.vitaminB6 && (
                                      <div>
                                        <span className="text-muted-foreground">Vitamin B6:</span>{' '}
                                        <span className="font-medium">{meal.vitamins.vitaminB6}mg</span>
                                      </div>
                                    )}
                                    {meal.vitamins.vitaminB12 && (
                                      <div>
                                        <span className="text-muted-foreground">Vitamin B12:</span>{' '}
                                        <span className="font-medium">{meal.vitamins.vitaminB12}μg</span>
                                      </div>
                                    )}
                                    {meal.vitamins.vitaminC && (
                                      <div>
                                        <span className="text-muted-foreground">Vitamin C:</span>{' '}
                                        <span className="font-medium">{meal.vitamins.vitaminC}mg</span>
                                      </div>
                                    )}
                                    {meal.vitamins.vitaminD && (
                                      <div>
                                        <span className="text-muted-foreground">Vitamin D:</span>{' '}
                                        <span className="font-medium">{meal.vitamins.vitaminD}μg</span>
                                      </div>
                                    )}
                                    {meal.vitamins.vitaminE && (
                                      <div>
                                        <span className="text-muted-foreground">Vitamin E:</span>{' '}
                                        <span className="font-medium">{meal.vitamins.vitaminE}mg</span>
                                      </div>
                                    )}
                                    {meal.vitamins.vitaminK && (
                                      <div>
                                        <span className="text-muted-foreground">Vitamin K:</span>{' '}
                                        <span className="font-medium">{meal.vitamins.vitaminK}μg</span>
                                      </div>
                                    )}
                                    {meal.vitamins.folate && (
                                      <div>
                                        <span className="text-muted-foreground">Folate:</span>{' '}
                                        <span className="font-medium">{meal.vitamins.folate}μg</span>
                                      </div>
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            )}

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

export default Nutrients;
