import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingDown, TrendingUp, Info } from 'lucide-react';
import { getMealPlan } from '@/lib/storage';
import { calculatePrices, generateSwapSuggestions } from '@/lib/priceComparison';
import { MealPlan } from '@/types';
import Navigation from '@/components/Navigation';

const Prices = () => {
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
              <TrendingDown className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No prices to compare</h3>
              <p className="text-muted-foreground">
                Generate a meal plan first to see price comparisons
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const prices = calculatePrices(mealPlan.shoppingList);
  const cheapest = prices.reduce((min, p) => p.total < min.total ? p : min);
  const suggestions = generateSwapSuggestions(mealPlan.shoppingList);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Price Comparison</h1>
          <p className="text-muted-foreground">
            Compare basket totals across UK supermarkets
          </p>
        </div>

        <Alert className="mb-6 border-primary/50 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>{cheapest.store}</strong> is the cheapest option at £{cheapest.total.toFixed(2)}
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {prices.map((price) => {
            const isCheapest = price.store === cheapest.store;
            
            return (
              <Card key={price.store} className={`shadow-md ${isCheapest ? 'border-primary border-2' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{price.store}</CardTitle>
                    {isCheapest && (
                      <Badge className="bg-primary">Cheapest</Badge>
                    )}
                  </div>
                  <CardDescription className="text-2xl font-bold text-foreground">
                    £{price.total.toFixed(2)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {price.items.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className="font-medium">£{item.price.toFixed(2)}</span>
                      </div>
                    ))}
                    {price.items.length > 5 && (
                      <p className="text-muted-foreground italic pt-2">
                        +{price.items.length - 5} more items
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {suggestions.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-primary" />
                Money-Saving Swaps
              </CardTitle>
              <CardDescription>
                Save more while keeping your protein target
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestions.map((swap, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">
                          Replace {swap.original} with {swap.replacement}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Protein difference: {swap.proteinDiff > 0 ? '+' : ''}{swap.proteinDiff}g
                        </p>
                      </div>
                      <Badge variant={swap.priceDiff < 0 ? 'default' : 'secondary'}>
                        {swap.priceDiff < 0 ? '−' : '+'}£{Math.abs(swap.priceDiff).toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Prices;
