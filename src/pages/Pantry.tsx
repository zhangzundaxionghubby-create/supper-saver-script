import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Package } from 'lucide-react';
import { getPantry, savePantry } from '@/lib/storage';
import { PantryItem } from '@/types';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';

const quickAddItems = [
  'chicken breast',
  'eggs',
  'rice',
  'pasta',
  'onions',
  'tomatoes',
  'frozen veg',
  'potatoes',
];

const Pantry = () => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [newItem, setNewItem] = useState({
    name: '',
    qty: 1,
    unit: 'g',
    category: 'Pantry',
    perishability: 'pantry' as const,
    bulk: false,
  });

  useEffect(() => {
    setItems(getPantry());
  }, []);

  const handleAdd = () => {
    if (!newItem.name.trim()) {
      toast.error('Please enter an item name');
      return;
    }

    const item: PantryItem = {
      id: Date.now().toString(),
      ...newItem,
    };

    const updated = [...items, item];
    setItems(updated);
    savePantry(updated);
    
    setNewItem({
      name: '',
      qty: 1,
      unit: 'g',
      category: 'Pantry',
      perishability: 'pantry',
      bulk: false,
    });

    toast.success('Item added to pantry');
  };

  const handleQuickAdd = (itemName: string) => {
    const item: PantryItem = {
      id: Date.now().toString(),
      name: itemName,
      qty: 1,
      unit: 'pack',
      category: 'Pantry',
      perishability: 'pantry',
      bulk: false,
    };

    const updated = [...items, item];
    setItems(updated);
    savePantry(updated);
    toast.success(`${itemName} added`);
  };

  const handleDelete = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    savePantry(updated);
    toast.success('Item removed');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Pantry</h1>
          <p className="text-muted-foreground">
            Keep track of what you have to generate smarter meal plans
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card className="shadow-md sticky top-24">
              <CardHeader>
                <CardTitle>Add Item</CardTitle>
                <CardDescription>Add items to your pantry</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item name</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="e.g. Chicken breast"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qty">Quantity</Label>
                    <Input
                      id="qty"
                      type="number"
                      min="0"
                      step="0.1"
                      value={newItem.qty}
                      onChange={(e) => setNewItem({ ...newItem, qty: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={newItem.unit} onValueChange={(v) => setNewItem({ ...newItem, unit: v })}>
                      <SelectTrigger id="unit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="whole">whole</SelectItem>
                        <SelectItem value="pack">pack</SelectItem>
                        <SelectItem value="tin">tin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="perishability">Storage</Label>
                  <Select value={newItem.perishability} onValueChange={(v: any) => setNewItem({ ...newItem, perishability: v })}>
                    <SelectTrigger id="perishability">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fresh">Fresh</SelectItem>
                      <SelectItem value="frozen">Frozen</SelectItem>
                      <SelectItem value="pantry">Pantry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bulk"
                    checked={newItem.bulk}
                    onCheckedChange={(checked) => setNewItem({ ...newItem, bulk: !!checked })}
                  />
                  <Label htmlFor="bulk" className="cursor-pointer font-normal">
                    Bulk buy item
                  </Label>
                </div>

                <Button onClick={handleAdd} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-3">Quick Add</p>
                  <div className="flex flex-wrap gap-2">
                    {quickAddItems.map((item) => (
                      <Button
                        key={item}
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAdd(item)}
                      >
                        {item}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Pantry Items ({items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Your pantry is empty. Add items to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.qty} {item.unit} • {item.perishability}
                            {item.bulk && ' • Bulk'}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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
    </div>
  );
};

export default Pantry;
