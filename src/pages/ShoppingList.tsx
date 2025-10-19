import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ShoppingCart, ArrowLeft, Download, Plus, Sparkles, Loader2, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockStorePrices } from '@/data/mockPrices';
import { Badge } from '@/components/ui/badge';

interface AssignedRecipe {
  name: string;
  day: string;
  mealType: string;
  ingredients: string[];
}

interface GroceryItem {
  name: string;
  quantity: string;
  bestPrice: number;
  bestStore: string;
  allPrices: { store: string; price: number }[];
}

const ShoppingList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<AssignedRecipe[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [newItem, setNewItem] = useState('');
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [animatingItem, setAnimatingItem] = useState<number | null>(null);
  const [totalCost, setTotalCost] = useState(0);

  // Helper function to convert ingredients to grocery items with prices
  const convertToGroceryItems = (ingredientsList: string[]): GroceryItem[] => {
    return ingredientsList.map(ingredient => {
      const lowerIngredient = ingredient.toLowerCase();
      
      // Find matching price data
      const matchingPrices = mockStorePrices.filter(price => 
        lowerIngredient.includes(price.item_name.toLowerCase())
      );

      if (matchingPrices.length > 0) {
        // Group by store and get prices
        const storeGroups = matchingPrices.reduce((acc, price) => {
          if (!acc[price.store]) {
            acc[price.store] = price;
          }
          return acc;
        }, {} as Record<string, typeof matchingPrices[0]>);

        const allPrices = Object.values(storeGroups).map(price => ({
          store: price.store,
          price: price.price_gbp
        }));

        // Find best price
        const bestPriceData = allPrices.reduce((min, curr) => 
          curr.price < min.price ? curr : min
        );

        const priceData = storeGroups[bestPriceData.store];
        const quantity = `${priceData.pack_qty}${priceData.unit === 'g' ? 'g' : priceData.unit === 'ml' ? 'ml' : priceData.unit === 'kg' ? 'kg' : priceData.unit === 'pack' ? ' pack' : priceData.unit === 'tin' ? ' tin' : priceData.unit === 'loaf' ? ' loaf' : priceData.unit === 'pint' ? ' pint' : ''}`;

        return {
          name: priceData.item_name,
          quantity,
          bestPrice: bestPriceData.price,
          bestStore: bestPriceData.store,
          allPrices
        };
      }

      // Fallback for items without price data
      return {
        name: ingredient,
        quantity: '1 unit',
        bestPrice: 2.50,
        bestStore: 'Aldi',
        allPrices: []
      };
    });
  };

  useEffect(() => {
    const storedRecipes = localStorage.getItem('weeklyPlanRecipes');
    const storedIngredients = localStorage.getItem('shoppingIngredients');

    if (storedRecipes) {
      setRecipes(JSON.parse(storedRecipes));
    }

    if (storedIngredients) {
      const allIngredients = JSON.parse(storedIngredients) as string[];
      const uniqueIngredients = Array.from(new Set(allIngredients));
      const items = convertToGroceryItems(uniqueIngredients);
      setGroceryItems(items);
      
      // Calculate total cost
      const total = items.reduce((sum, item) => sum + item.bestPrice, 0);
      setTotalCost(total);
    }

    // Load basket items
    const storedBasket = localStorage.getItem('basketItems');
    if (storedBasket) {
      const basketIndices = JSON.parse(storedBasket) as number[];
      setCheckedItems(new Set(basketIndices));
    }
  }, []);

  const toggleItem = (index: number) => {
    const newChecked = new Set(checkedItems);
    
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      // Animate item going to basket
      setAnimatingItem(index);
      setTimeout(() => setAnimatingItem(null), 600);
      newChecked.add(index);
      
      toast({
        title: 'Added to Basket!',
        description: `${groceryItems[index].name} is now in your basket.`,
      });
    }
    
    setCheckedItems(newChecked);
    
    // Save to localStorage for basket page
    localStorage.setItem('basketItems', JSON.stringify(Array.from(newChecked)));
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      const newGroceryItem: GroceryItem = {
        name: newItem.trim(),
        quantity: '1 unit',
        bestPrice: 2.50,
        bestStore: 'Aldi',
        allPrices: []
      };
      setGroceryItems([...groceryItems, newGroceryItem]);
      setTotalCost(prev => prev + newGroceryItem.bestPrice);
      setNewItem('');
      toast({
        title: 'Item Added',
        description: 'New item added to your shopping list.',
      });
    }
  };

  const handleGetSuggestions = async () => {
    setIsLoadingSuggestions(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopping-suggestions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            existingItems: groceryItems.map(item => item.name),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
      
      toast({
        title: 'Suggestions Ready!',
        description: `Got ${data.suggestions?.length || 0} suggestions for you.`,
      });
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast({
        title: 'Failed to Get Suggestions',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleAddSuggestion = (suggestion: string) => {
    const newGroceryItem: GroceryItem = {
      name: suggestion,
      quantity: '1 unit',
      bestPrice: 2.50,
      bestStore: 'Aldi',
      allPrices: []
    };
    setGroceryItems([...groceryItems, newGroceryItem]);
    setTotalCost(prev => prev + newGroceryItem.bestPrice);
    setSuggestions(suggestions.filter(s => s !== suggestion));
    toast({
      title: 'Suggestion Added',
      description: `${suggestion} added to your list.`,
    });
  };

  const handleDownloadList = () => {
    const text = groceryItems.map((item, i) => 
      `${i + 1}. ${item.name} - ${item.quantity} - £${item.bestPrice.toFixed(2)} (${item.bestStore})`
    ).join('\n') + `\n\nTotal: £${totalCost.toFixed(2)}`;
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

  if (recipes.length === 0 && groceryItems.length === 0) {
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
              Check items off as you shop - they'll go into your basket
            </p>
            <div className="flex items-center gap-2 mt-2">
              <TrendingDown className="h-5 w-5 text-green-500" />
              <span className="text-lg font-semibold">Total: £{totalCost.toFixed(2)}</span>
              <Badge variant="secondary" className="ml-2">Best prices automatically selected</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/recipe')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recipes
            </Button>
            <Button onClick={() => navigate('/basket')} variant="outline">
              View Basket ({checkedItems.size})
            </Button>
            <Button onClick={handleDownloadList}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Shopping List */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Your Shopping List
                </CardTitle>
                <CardDescription>
                  {groceryItems.length} items total | {checkedItems.size} in basket
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Item Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add item manually..."
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                  />
                  <Button onClick={handleAddItem} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  {groceryItems.map((item, index) => (
                    <div
                      key={index}
                      className={`relative flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-all ${
                        animatingItem === index ? 'animate-bounce' : ''
                      }`}
                    >
                      <Checkbox
                        checked={checkedItems.has(index)}
                        onCheckedChange={() => toggleItem(index)}
                      />
                      <div className={`flex-1 ${checkedItems.has(index) ? 'line-through text-muted-foreground' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium capitalize">{item.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">({item.quantity})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {item.bestStore}
                            </Badge>
                            <span className="font-semibold text-lg">£{item.bestPrice.toFixed(2)}</span>
                          </div>
                        </div>
                        {item.allPrices.length > 1 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Other prices: {item.allPrices
                              .filter(p => p.store !== item.bestStore)
                              .map(p => `${p.store} £${p.price.toFixed(2)}`)
                              .join(' • ')}
                          </div>
                        )}
                      </div>
                      {animatingItem === index && (
                        <span className="absolute right-4 text-2xl animate-ping">🛒</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Suggestions
                </CardTitle>
                <CardDescription>
                  Get personalized suggestions for household items
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleGetSuggestions} 
                  className="w-full"
                  disabled={isLoadingSuggestions}
                >
                  {isLoadingSuggestions ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting Suggestions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Get AI Suggestions
                    </>
                  )}
                </Button>

                {suggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Suggested items:</p>
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                      >
                        <span className="text-sm">{suggestion}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAddSuggestion(suggestion)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
                {recipes.length > 0 ? (
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
                ) : (
                  <p className="text-sm text-muted-foreground">No recipes added yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;
