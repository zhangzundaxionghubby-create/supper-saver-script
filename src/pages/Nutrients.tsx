import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Activity, TrendingUp, X, Trash2, ChevronDown, Plus, Sparkles } from 'lucide-react';
import { getCookedMeals, removeCookedMeal, saveCookedMeal } from '@/lib/storage';
import { CookedMeal } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Nutrients = () => {
  const { toast } = useToast();
  const [cookedMeals, setCookedMeals] = useState<CookedMeal[]>([]);
  const [expandedVitamins, setExpandedVitamins] = useState<{ [key: string]: boolean }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [mealDescription, setMealDescription] = useState('');
  const [manualMeal, setManualMeal] = useState({
    name: '',
    mealType: '',
    calories: '',
    protein: '',
    carbs: '',
    salt: '',
    saturatedFat: '',
    unsaturatedFat: '',
    fibre: '',
    vitaminA: '',
    vitaminB1: '',
    vitaminB2: '',
    vitaminB3: '',
    vitaminB6: '',
    vitaminB12: '',
    vitaminC: '',
    vitaminD: '',
    vitaminE: '',
    vitaminK: '',
    folate: '',
  });

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

  const handleEstimateWithAI = async () => {
    if (!mealDescription.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please describe what you ate',
        variant: 'destructive',
      });
      return;
    }

    setIsEstimating(true);
    try {
      const { data, error } = await supabase.functions.invoke('estimate-nutrients', {
        body: { mealDescription }
      });

      if (error) throw error;

      setManualMeal({
        name: data.name || mealDescription,
        mealType: data.mealType || 'Snack',
        calories: data.calories?.toString() || '0',
        protein: data.protein?.toString() || '0',
        carbs: data.carbs?.toString() || '0',
        salt: data.salt?.toString() || '0',
        saturatedFat: data.saturatedFat?.toString() || '0',
        unsaturatedFat: data.unsaturatedFat?.toString() || '0',
        fibre: data.fibre?.toString() || '0',
        vitaminA: data.vitamins?.vitaminA?.toString() || '',
        vitaminB1: data.vitamins?.vitaminB1?.toString() || '',
        vitaminB2: data.vitamins?.vitaminB2?.toString() || '',
        vitaminB3: data.vitamins?.vitaminB3?.toString() || '',
        vitaminB6: data.vitamins?.vitaminB6?.toString() || '',
        vitaminB12: data.vitamins?.vitaminB12?.toString() || '',
        vitaminC: data.vitamins?.vitaminC?.toString() || '',
        vitaminD: data.vitamins?.vitaminD?.toString() || '',
        vitaminE: data.vitamins?.vitaminE?.toString() || '',
        vitaminK: data.vitamins?.vitaminK?.toString() || '',
        folate: data.vitamins?.folate?.toString() || '',
      });

      toast({
        title: 'Nutrients Estimated',
        description: 'AI has estimated the nutritional values. You can adjust them if needed.',
      });
    } catch (error) {
      console.error('Error estimating nutrients:', error);
      toast({
        title: 'Estimation Failed',
        description: 'Could not estimate nutrients. Please enter manually.',
        variant: 'destructive',
      });
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSaveMeal = () => {
    if (!manualMeal.name.trim() || !manualMeal.mealType.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in meal name and type',
        variant: 'destructive',
      });
      return;
    }

    const newMeal: CookedMeal = {
      id: crypto.randomUUID(),
      name: manualMeal.name,
      day: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      mealType: manualMeal.mealType,
      calories: parseInt(manualMeal.calories) || 0,
      protein: parseInt(manualMeal.protein) || 0,
      carbs: parseInt(manualMeal.carbs) || 0,
      salt: parseFloat(manualMeal.salt) || 0,
      saturatedFat: parseFloat(manualMeal.saturatedFat) || 0,
      unsaturatedFat: parseFloat(manualMeal.unsaturatedFat) || 0,
      fibre: parseFloat(manualMeal.fibre) || 0,
      vitamins: {
        vitaminA: parseFloat(manualMeal.vitaminA) || undefined,
        vitaminB1: parseFloat(manualMeal.vitaminB1) || undefined,
        vitaminB2: parseFloat(manualMeal.vitaminB2) || undefined,
        vitaminB3: parseFloat(manualMeal.vitaminB3) || undefined,
        vitaminB6: parseFloat(manualMeal.vitaminB6) || undefined,
        vitaminB12: parseFloat(manualMeal.vitaminB12) || undefined,
        vitaminC: parseFloat(manualMeal.vitaminC) || undefined,
        vitaminD: parseFloat(manualMeal.vitaminD) || undefined,
        vitaminE: parseFloat(manualMeal.vitaminE) || undefined,
        vitaminK: parseFloat(manualMeal.vitaminK) || undefined,
        folate: parseFloat(manualMeal.folate) || undefined,
      },
      cookedAt: new Date().toISOString(),
    };

    saveCookedMeal(newMeal);
    setCookedMeals(getCookedMeals());
    
    // Reset form
    setManualMeal({
      name: '', mealType: '', calories: '', protein: '', carbs: '', salt: '',
      saturatedFat: '', unsaturatedFat: '', fibre: '', vitaminA: '', vitaminB1: '',
      vitaminB2: '', vitaminB3: '', vitaminB6: '', vitaminB12: '', vitaminC: '',
      vitaminD: '', vitaminE: '', vitaminK: '', folate: '',
    });
    setMealDescription('');
    setIsDialogOpen(false);

    toast({
      title: 'Meal Added',
      description: 'Your meal has been added to the nutrient tracker.',
    });
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
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add a Meal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add a Meal</DialogTitle>
                  <DialogDescription>
                    Manually enter meal information or let AI estimate nutrients for you
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* AI Estimation Section */}
                  <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                    <Label>Let AI Estimate (Optional)</Label>
                    <Textarea
                      placeholder="Describe what you ate (e.g., 'grilled chicken breast with steamed broccoli and brown rice')"
                      value={mealDescription}
                      onChange={(e) => setMealDescription(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={handleEstimateWithAI} disabled={isEstimating} variant="secondary">
                      <Sparkles className="mr-2 h-4 w-4" />
                      {isEstimating ? 'Estimating...' : 'Estimate with AI'}
                    </Button>
                  </div>

                  {/* Manual Input Section */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Meal Name *</Label>
                        <Input
                          id="name"
                          value={manualMeal.name}
                          onChange={(e) => setManualMeal({ ...manualMeal, name: e.target.value })}
                          placeholder="e.g., Chicken & Broccoli"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mealType">Meal Type *</Label>
                        <Input
                          id="mealType"
                          value={manualMeal.mealType}
                          onChange={(e) => setManualMeal({ ...manualMeal, mealType: e.target.value })}
                          placeholder="e.g., Lunch"
                        />
                      </div>
                    </div>

                    <Separator />
                    <h4 className="font-semibold">Macronutrients</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="calories">Calories</Label>
                        <Input
                          id="calories"
                          type="number"
                          value={manualMeal.calories}
                          onChange={(e) => setManualMeal({ ...manualMeal, calories: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="protein">Protein (g)</Label>
                        <Input
                          id="protein"
                          type="number"
                          value={manualMeal.protein}
                          onChange={(e) => setManualMeal({ ...manualMeal, protein: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="carbs">Carbs (g)</Label>
                        <Input
                          id="carbs"
                          type="number"
                          value={manualMeal.carbs}
                          onChange={(e) => setManualMeal({ ...manualMeal, carbs: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fibre">Fibre (g)</Label>
                        <Input
                          id="fibre"
                          type="number"
                          step="0.1"
                          value={manualMeal.fibre}
                          onChange={(e) => setManualMeal({ ...manualMeal, fibre: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <Separator />
                    <h4 className="font-semibold">Fats & Salt</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="saturatedFat">Saturated Fat (g)</Label>
                        <Input
                          id="saturatedFat"
                          type="number"
                          step="0.1"
                          value={manualMeal.saturatedFat}
                          onChange={(e) => setManualMeal({ ...manualMeal, saturatedFat: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unsaturatedFat">Unsaturated Fat (g)</Label>
                        <Input
                          id="unsaturatedFat"
                          type="number"
                          step="0.1"
                          value={manualMeal.unsaturatedFat}
                          onChange={(e) => setManualMeal({ ...manualMeal, unsaturatedFat: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salt">Salt (g)</Label>
                        <Input
                          id="salt"
                          type="number"
                          step="0.1"
                          value={manualMeal.salt}
                          onChange={(e) => setManualMeal({ ...manualMeal, salt: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <Separator />
                    <h4 className="font-semibold">Vitamins (Optional)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vitaminA">Vitamin A (μg)</Label>
                        <Input
                          id="vitaminA"
                          type="number"
                          step="0.1"
                          value={manualMeal.vitaminA}
                          onChange={(e) => setManualMeal({ ...manualMeal, vitaminA: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vitaminB1">Vitamin B1 (mg)</Label>
                        <Input
                          id="vitaminB1"
                          type="number"
                          step="0.1"
                          value={manualMeal.vitaminB1}
                          onChange={(e) => setManualMeal({ ...manualMeal, vitaminB1: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vitaminB2">Vitamin B2 (mg)</Label>
                        <Input
                          id="vitaminB2"
                          type="number"
                          step="0.1"
                          value={manualMeal.vitaminB2}
                          onChange={(e) => setManualMeal({ ...manualMeal, vitaminB2: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vitaminB3">Vitamin B3 (mg)</Label>
                        <Input
                          id="vitaminB3"
                          type="number"
                          step="0.1"
                          value={manualMeal.vitaminB3}
                          onChange={(e) => setManualMeal({ ...manualMeal, vitaminB3: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vitaminB6">Vitamin B6 (mg)</Label>
                        <Input
                          id="vitaminB6"
                          type="number"
                          step="0.1"
                          value={manualMeal.vitaminB6}
                          onChange={(e) => setManualMeal({ ...manualMeal, vitaminB6: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vitaminB12">Vitamin B12 (μg)</Label>
                        <Input
                          id="vitaminB12"
                          type="number"
                          step="0.1"
                          value={manualMeal.vitaminB12}
                          onChange={(e) => setManualMeal({ ...manualMeal, vitaminB12: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vitaminC">Vitamin C (mg)</Label>
                        <Input
                          id="vitaminC"
                          type="number"
                          step="0.1"
                          value={manualMeal.vitaminC}
                          onChange={(e) => setManualMeal({ ...manualMeal, vitaminC: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vitaminD">Vitamin D (μg)</Label>
                        <Input
                          id="vitaminD"
                          type="number"
                          step="0.1"
                          value={manualMeal.vitaminD}
                          onChange={(e) => setManualMeal({ ...manualMeal, vitaminD: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vitaminE">Vitamin E (mg)</Label>
                        <Input
                          id="vitaminE"
                          type="number"
                          step="0.1"
                          value={manualMeal.vitaminE}
                          onChange={(e) => setManualMeal({ ...manualMeal, vitaminE: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vitaminK">Vitamin K (μg)</Label>
                        <Input
                          id="vitaminK"
                          type="number"
                          step="0.1"
                          value={manualMeal.vitaminK}
                          onChange={(e) => setManualMeal({ ...manualMeal, vitaminK: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="folate">Folate (μg)</Label>
                        <Input
                          id="folate"
                          type="number"
                          step="0.1"
                          value={manualMeal.folate}
                          onChange={(e) => setManualMeal({ ...manualMeal, folate: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveMeal}>
                      Save Meal
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            {cookedMeals.length > 0 && (
              <Button onClick={handleClearAll} variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
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
