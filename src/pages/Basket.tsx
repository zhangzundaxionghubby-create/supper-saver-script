import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBasket, ArrowLeft, Trash2, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VolumeIndicator from '@/components/VolumeIndicator';
import { mockStorePrices } from '@/data/mockPrices';

interface BasketItemWithQuantity {
  name: string;
  quantity: string;
  percentage: number;
}

const Basket = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [basketItems, setBasketItems] = useState<BasketItemWithQuantity[]>([]);

  useEffect(() => {
    loadBasketItems();
  }, []);

  const loadBasketItems = () => {
    const storedIngredients = localStorage.getItem('shoppingIngredients');
    const storedBasketIndices = localStorage.getItem('basketItems');

    if (storedIngredients && storedBasketIndices) {
      const allIngredients = JSON.parse(storedIngredients) as string[];
      const basketIndices = JSON.parse(storedBasketIndices) as number[];
      
      // Get used quantities from cooked meals
      const usedQuantities = JSON.parse(localStorage.getItem('usedIngredients') || '{}') as Record<string, number>;
      
      const items = basketIndices.map(index => {
        const ingredient = allIngredients[index];
        if (!ingredient) return null;
        
        const lowerIngredient = ingredient.toLowerCase();
        const priceData = mockStorePrices.find(p => 
          lowerIngredient.includes(p.item_name.toLowerCase())
        );
        
        let quantity = '1 unit';
        let percentage = 100;
        
        if (priceData) {
          quantity = `${priceData.pack_qty}${priceData.unit === 'g' ? 'g' : priceData.unit === 'ml' ? 'ml' : priceData.unit === 'kg' ? 'kg' : priceData.unit === 'pack' ? ' pack' : priceData.unit === 'tin' ? ' tin' : priceData.unit === 'loaf' ? ' loaf' : priceData.unit === 'pint' ? ' pint' : ''}`;
          
          // Calculate percentage based on usage
          const used = usedQuantities[ingredient] || 0;
          percentage = Math.max(0, 100 - (used * 100 / priceData.pack_qty));
        }
        
        return {
          name: ingredient,
          quantity,
          percentage: Math.round(percentage)
        };
      }).filter(Boolean) as BasketItemWithQuantity[];
      
      setBasketItems(items);
    }
  };

  const handleRemoveItem = (index: number) => {
    const newBasketItems = basketItems.filter((_, i) => i !== index);
    setBasketItems(newBasketItems);

    // Update localStorage
    const storedIngredients = localStorage.getItem('shoppingIngredients');
    if (storedIngredients) {
      const allIngredients = JSON.parse(storedIngredients) as string[];
      const newIndices = newBasketItems
        .map(item => allIngredients.indexOf(item.name))
        .filter(i => i !== -1);
      localStorage.setItem('basketItems', JSON.stringify(newIndices));
    }

    toast({
      title: 'Item Removed',
      description: 'Item removed from your basket.',
    });
  };

  const handleClearBasket = () => {
    setBasketItems([]);
    localStorage.setItem('basketItems', JSON.stringify([]));
    toast({
      title: 'Basket Cleared',
      description: 'All items removed from your basket.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <ShoppingBasket className="h-10 w-10" />
              Your Basket
            </h1>
            <p className="text-muted-foreground">
              Items you've added from your shopping list
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/shopping-list')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shopping List
            </Button>
            {basketItems.length > 0 && (
              <Button onClick={handleClearBasket} variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Basket
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Basket Contents</CardTitle>
              <CardDescription>
                {basketItems.length} {basketItems.length === 1 ? 'item' : 'items'} in your basket
              </CardDescription>
            </CardHeader>
            <CardContent>
              {basketItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBasket className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Your basket is empty</p>
                  <p className="text-muted-foreground mb-4">
                    Check off items in your shopping list to add them here
                  </p>
                  <Button onClick={() => navigate('/shopping-list')}>
                    Go to Shopping List
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {basketItems.map((item, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-lg border bg-muted/30 hover:bg-muted/40 transition-all animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <span className="font-semibold capitalize text-lg">{item.name}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <VolumeIndicator 
                        ingredient={item.name}
                        quantity={item.quantity}
                        percentage={item.percentage}
                      />
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

export default Basket;
