import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ShoppingCart, ArrowLeft, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AssignedRecipe {
  name: string;
  day: string;
  mealType: string;
  ingredients: string[];
}

const ShoppingList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<AssignedRecipe[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const storedRecipes = localStorage.getItem('weeklyPlanRecipes');
    const storedIngredients = localStorage.getItem('shoppingIngredients');

    if (storedRecipes) {
      setRecipes(JSON.parse(storedRecipes));
    }

    if (storedIngredients) {
      const allIngredients = JSON.parse(storedIngredients) as string[];
      // Remove duplicates while preserving order
      const uniqueIngredients = Array.from(new Set(allIngredients));
      setIngredients(uniqueIngredients);
    }
  }, []);

  const toggleItem = (index: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
  };

  const handleDownloadList = () => {
    const text = ingredients.map((item, i) => `${i + 1}. ${item}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopping-list.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Shopping List Downloaded',
      description: 'Your shopping list has been saved as a text file.',
    });
  };

  if (recipes.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>No Recipes Selected</CardTitle>
              <CardDescription>
                You haven't selected any recipes yet. Go back to create your weekly meal plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/recipe')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Recipe Planner
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Shopping List</h1>
            <p className="text-muted-foreground">
              Everything you need for your weekly meal plan - {recipes.length} recipes
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/recipe')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recipes
            </Button>
            <Button onClick={handleDownloadList}>
              <Download className="mr-2 h-4 w-4" />
              Download List
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Shopping List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Your Shopping List
                </CardTitle>
                <CardDescription>
                  {ingredients.length} items total | {checkedItems.size} checked off
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={checkedItems.has(index)}
                        onCheckedChange={() => toggleItem(index)}
                      />
                      <span
                        className={`flex-1 ${
                          checkedItems.has(index) ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {ingredient}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recipe Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Weekly Plan Summary</CardTitle>
                <CardDescription>
                  Recipes in your meal plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recipes.map((recipe, index) => (
                    <div key={index} className="p-3 rounded-lg border bg-muted/30">
                      <p className="font-medium">{recipe.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {recipe.day} - {recipe.mealType}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;
