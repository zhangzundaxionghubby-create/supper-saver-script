import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Copy, Check } from 'lucide-react';
import { getMealPlan, saveMealPlan } from '@/lib/storage';
import { MealPlan } from '@/types';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';

const Shopping = () => {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const plan = getMealPlan();
    if (plan) {
      setMealPlan(plan);
    }
  }, []);

  const toggleOwn = (itemName: string) => {
    if (!mealPlan) return;

    const updated = {
      ...mealPlan,
      shoppingList: mealPlan.shoppingList.map(item =>
        item.name === itemName ? { ...item, alreadyOwn: !item.alreadyOwn } : item
      ),
    };

    setMealPlan(updated);
    saveMealPlan(updated);
  };

  const handleCopy = () => {
    if (!mealPlan) return;

    const text = mealPlan.shoppingList
      .filter(i => !i.alreadyOwn)
      .map(item => `${item.qty} ${item.unit} ${item.name}`)
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Shopping list copied!');
    
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mealPlan) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="shadow-md">
            <CardContent className="py-16 text-center">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No shopping list yet</h3>
              <p className="text-muted-foreground">
                Generate a meal plan first to create your shopping list
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const categories = Array.from(new Set(mealPlan.shoppingList.map(i => i.category)));
  const itemsToBuy = mealPlan.shoppingList.filter(i => !i.alreadyOwn);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Shopping List</h1>
            <p className="text-muted-foreground">
              {itemsToBuy.length} items to buy
            </p>
          </div>
          <Button onClick={handleCopy} variant="outline">
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy List
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {categories.map((category) => {
            const categoryItems = mealPlan.shoppingList.filter(i => i.category === category);
            
            return (
              <Card key={category} className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {category}
                    <Badge variant="secondary">
                      {categoryItems.filter(i => !i.alreadyOwn).length} items
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryItems.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={item.name}
                          checked={item.alreadyOwn}
                          onCheckedChange={() => toggleOwn(item.name)}
                        />
                        <label
                          htmlFor={item.name}
                          className={`flex-1 cursor-pointer text-sm ${
                            item.alreadyOwn ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          <span className="font-medium">
                            {item.qty} {item.unit}
                          </span>{' '}
                          {item.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Shopping;
