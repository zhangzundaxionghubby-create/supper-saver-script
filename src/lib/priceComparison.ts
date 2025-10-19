import { ShoppingItem, PriceComparison, SwapSuggestion } from '@/types';
import { mockStorePrices } from '@/data/mockPrices';

export const calculatePrices = (shoppingList: ShoppingItem[]): PriceComparison[] => {
  const stores = ['Tesco', 'Sainsburys', 'Waitrose', 'Co-op', 'Aldi', 'Lidl'];
  
  return stores.map(store => {
    const items = shoppingList
      .filter(item => !item.alreadyOwn)
      .map(item => {
        const priceData = mockStorePrices.find(
          p => p.store === store && p.item_name.toLowerCase() === item.name.toLowerCase()
        );

        if (priceData) {
          // Calculate price based on quantity needed
          const packsNeeded = Math.ceil(item.qty / priceData.pack_qty);
          const price = packsNeeded * priceData.price_gbp;
          return { name: item.name, price };
        }

        // Fallback estimation if not found
        return { name: item.name, price: 2.0 };
      });

    const total = items.reduce((sum, item) => sum + item.price, 0);

    return { store, total: parseFloat(total.toFixed(2)), items };
  });
};

export const generateSwapSuggestions = (
  shoppingList: ShoppingItem[]
): SwapSuggestion[] => {
  const suggestions: SwapSuggestion[] = [];

  // Example swap: chicken breast -> chicken thighs (cheaper)
  if (shoppingList.some(i => i.name.toLowerCase().includes('chicken breast'))) {
    suggestions.push({
      original: 'chicken breast',
      replacement: 'chicken thighs',
      priceDiff: -0.8,
      proteinDiff: -2,
    });
  }

  // Example swap: branded rice -> value rice
  if (shoppingList.some(i => i.name.toLowerCase().includes('rice'))) {
    suggestions.push({
      original: 'branded rice',
      replacement: 'value rice',
      priceDiff: -0.3,
      proteinDiff: 0,
    });
  }

  // Example swap: fresh veg -> frozen veg
  if (shoppingList.some(i => i.name.toLowerCase().includes('broccoli') || i.name.toLowerCase().includes('mixed veg'))) {
    suggestions.push({
      original: 'fresh vegetables',
      replacement: 'frozen vegetables',
      priceDiff: -0.5,
      proteinDiff: 0,
    });
  }

  return suggestions;
};
