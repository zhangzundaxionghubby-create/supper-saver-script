import { StorePrice } from '@/types';

export const mockStorePrices: StorePrice[] = [
  // Chicken breast (600g pack)
  { id: '1', store: 'Tesco', item_name: 'chicken breast', unit: 'g', pack_qty: 600, price_gbp: 5.50 },
  { id: '2', store: 'Sainsburys', item_name: 'chicken breast', unit: 'g', pack_qty: 600, price_gbp: 6.20 },
  { id: '3', store: 'Waitrose', item_name: 'chicken breast', unit: 'g', pack_qty: 600, price_gbp: 6.80 },
  { id: '4', store: 'Co-op', item_name: 'chicken breast', unit: 'g', pack_qty: 600, price_gbp: 5.90 },
  { id: '5', store: 'Aldi', item_name: 'chicken breast', unit: 'g', pack_qty: 600, price_gbp: 4.99 },
  { id: '6', store: 'Lidl', item_name: 'chicken breast', unit: 'g', pack_qty: 600, price_gbp: 4.85 },

  // Rice (1kg bag)
  { id: '7', store: 'Tesco', item_name: 'rice', unit: 'g', pack_qty: 1000, price_gbp: 1.20 },
  { id: '8', store: 'Sainsburys', item_name: 'rice', unit: 'g', pack_qty: 1000, price_gbp: 1.35 },
  { id: '9', store: 'Waitrose', item_name: 'rice', unit: 'g', pack_qty: 1000, price_gbp: 1.60 },
  { id: '10', store: 'Co-op', item_name: 'rice', unit: 'g', pack_qty: 1000, price_gbp: 1.45 },
  { id: '11', store: 'Aldi', item_name: 'rice', unit: 'g', pack_qty: 1000, price_gbp: 0.89 },
  { id: '12', store: 'Lidl', item_name: 'rice', unit: 'g', pack_qty: 1000, price_gbp: 0.85 },

  // Pasta (500g pack)
  { id: '13', store: 'Tesco', item_name: 'pasta', unit: 'g', pack_qty: 500, price_gbp: 0.75 },
  { id: '14', store: 'Sainsburys', item_name: 'pasta', unit: 'g', pack_qty: 500, price_gbp: 0.85 },
  { id: '15', store: 'Waitrose', item_name: 'pasta', unit: 'g', pack_qty: 500, price_gbp: 1.10 },
  { id: '16', store: 'Co-op', item_name: 'pasta', unit: 'g', pack_qty: 500, price_gbp: 0.90 },
  { id: '17', store: 'Aldi', item_name: 'pasta', unit: 'g', pack_qty: 500, price_gbp: 0.55 },
  { id: '18', store: 'Lidl', item_name: 'pasta', unit: 'g', pack_qty: 500, price_gbp: 0.52 },

  // Eggs (12 pack)
  { id: '19', store: 'Tesco', item_name: 'eggs', unit: 'pack', pack_qty: 12, price_gbp: 2.50 },
  { id: '20', store: 'Sainsburys', item_name: 'eggs', unit: 'pack', pack_qty: 12, price_gbp: 2.70 },
  { id: '21', store: 'Waitrose', item_name: 'eggs', unit: 'pack', pack_qty: 12, price_gbp: 3.20 },
  { id: '22', store: 'Co-op', item_name: 'eggs', unit: 'pack', pack_qty: 12, price_gbp: 2.80 },
  { id: '23', store: 'Aldi', item_name: 'eggs', unit: 'pack', pack_qty: 12, price_gbp: 1.95 },
  { id: '24', store: 'Lidl', item_name: 'eggs', unit: 'pack', pack_qty: 12, price_gbp: 1.89 },

  // Tomatoes (400g tin)
  { id: '25', store: 'Tesco', item_name: 'tomatoes', unit: 'tin', pack_qty: 400, price_gbp: 0.45 },
  { id: '26', store: 'Sainsburys', item_name: 'tomatoes', unit: 'tin', pack_qty: 400, price_gbp: 0.55 },
  { id: '27', store: 'Waitrose', item_name: 'tomatoes', unit: 'tin', pack_qty: 400, price_gbp: 0.70 },
  { id: '28', store: 'Co-op', item_name: 'tomatoes', unit: 'tin', pack_qty: 400, price_gbp: 0.60 },
  { id: '29', store: 'Aldi', item_name: 'tomatoes', unit: 'tin', pack_qty: 400, price_gbp: 0.35 },
  { id: '30', store: 'Lidl', item_name: 'tomatoes', unit: 'tin', pack_qty: 400, price_gbp: 0.33 },

  // Onions (1kg bag)
  { id: '31', store: 'Tesco', item_name: 'onion', unit: 'kg', pack_qty: 1, price_gbp: 0.90 },
  { id: '32', store: 'Sainsburys', item_name: 'onion', unit: 'kg', pack_qty: 1, price_gbp: 1.05 },
  { id: '33', store: 'Waitrose', item_name: 'onion', unit: 'kg', pack_qty: 1, price_gbp: 1.30 },
  { id: '34', store: 'Co-op', item_name: 'onion', unit: 'kg', pack_qty: 1, price_gbp: 1.10 },
  { id: '35', store: 'Aldi', item_name: 'onion', unit: 'kg', pack_qty: 1, price_gbp: 0.69 },
  { id: '36', store: 'Lidl', item_name: 'onion', unit: 'kg', pack_qty: 1, price_gbp: 0.65 },

  // Broccoli (350g pack)
  { id: '37', store: 'Tesco', item_name: 'broccoli', unit: 'g', pack_qty: 350, price_gbp: 0.95 },
  { id: '38', store: 'Sainsburys', item_name: 'broccoli', unit: 'g', pack_qty: 350, price_gbp: 1.10 },
  { id: '39', store: 'Waitrose', item_name: 'broccoli', unit: 'g', pack_qty: 350, price_gbp: 1.40 },
  { id: '40', store: 'Co-op', item_name: 'broccoli', unit: 'g', pack_qty: 350, price_gbp: 1.15 },
  { id: '41', store: 'Aldi', item_name: 'broccoli', unit: 'g', pack_qty: 350, price_gbp: 0.69 },
  { id: '42', store: 'Lidl', item_name: 'broccoli', unit: 'g', pack_qty: 350, price_gbp: 0.65 },

  // Tuna (tin)
  { id: '43', store: 'Tesco', item_name: 'tuna', unit: 'tin', pack_qty: 1, price_gbp: 0.95 },
  { id: '44', store: 'Sainsburys', item_name: 'tuna', unit: 'tin', pack_qty: 1, price_gbp: 1.10 },
  { id: '45', store: 'Waitrose', item_name: 'tuna', unit: 'tin', pack_qty: 1, price_gbp: 1.35 },
  { id: '46', store: 'Co-op', item_name: 'tuna', unit: 'tin', pack_qty: 1, price_gbp: 1.15 },
  { id: '47', store: 'Aldi', item_name: 'tuna', unit: 'tin', pack_qty: 1, price_gbp: 0.75 },
  { id: '48', store: 'Lidl', item_name: 'tuna', unit: 'tin', pack_qty: 1, price_gbp: 0.72 },

  // Greek yogurt (500g pot)
  { id: '49', store: 'Tesco', item_name: 'greek yogurt', unit: 'g', pack_qty: 500, price_gbp: 1.50 },
  { id: '50', store: 'Sainsburys', item_name: 'greek yogurt', unit: 'g', pack_qty: 500, price_gbp: 1.70 },
  { id: '51', store: 'Waitrose', item_name: 'greek yogurt', unit: 'g', pack_qty: 500, price_gbp: 2.10 },
  { id: '52', store: 'Co-op', item_name: 'greek yogurt', unit: 'g', pack_qty: 500, price_gbp: 1.80 },
  { id: '53', store: 'Aldi', item_name: 'greek yogurt', unit: 'g', pack_qty: 500, price_gbp: 1.19 },
  { id: '54', store: 'Lidl', item_name: 'greek yogurt', unit: 'g', pack_qty: 500, price_gbp: 1.15 },

  // Mince beef (500g pack)
  { id: '55', store: 'Tesco', item_name: 'mince beef', unit: 'g', pack_qty: 500, price_gbp: 3.50 },
  { id: '56', store: 'Sainsburys', item_name: 'mince beef', unit: 'g', pack_qty: 500, price_gbp: 3.95 },
  { id: '57', store: 'Waitrose', item_name: 'mince beef', unit: 'g', pack_qty: 500, price_gbp: 4.50 },
  { id: '58', store: 'Co-op', item_name: 'mince beef', unit: 'g', pack_qty: 500, price_gbp: 3.80 },
  { id: '59', store: 'Aldi', item_name: 'mince beef', unit: 'g', pack_qty: 500, price_gbp: 2.99 },
  { id: '60', store: 'Lidl', item_name: 'mince beef', unit: 'g', pack_qty: 500, price_gbp: 2.89 },

  // Banana (5 pack)
  { id: '61', store: 'Tesco', item_name: 'banana', unit: 'pack', pack_qty: 5, price_gbp: 0.95 },
  { id: '62', store: 'Sainsburys', item_name: 'banana', unit: 'pack', pack_qty: 5, price_gbp: 1.10 },
  { id: '63', store: 'Waitrose', item_name: 'banana', unit: 'pack', pack_qty: 5, price_gbp: 1.35 },
  { id: '64', store: 'Co-op', item_name: 'banana', unit: 'pack', pack_qty: 5, price_gbp: 1.15 },
  { id: '65', store: 'Aldi', item_name: 'banana', unit: 'pack', pack_qty: 5, price_gbp: 0.69 },
  { id: '66', store: 'Lidl', item_name: 'banana', unit: 'pack', pack_qty: 5, price_gbp: 0.65 },

  // Mixed vegetables (500g frozen bag)
  { id: '67', store: 'Tesco', item_name: 'mixed veg', unit: 'g', pack_qty: 500, price_gbp: 1.20 },
  { id: '68', store: 'Sainsburys', item_name: 'mixed veg', unit: 'g', pack_qty: 500, price_gbp: 1.40 },
  { id: '69', store: 'Waitrose', item_name: 'mixed veg', unit: 'g', pack_qty: 500, price_gbp: 1.75 },
  { id: '70', store: 'Co-op', item_name: 'mixed veg', unit: 'g', pack_qty: 500, price_gbp: 1.50 },
  { id: '71', store: 'Aldi', item_name: 'mixed veg', unit: 'g', pack_qty: 500, price_gbp: 0.89 },
  { id: '72', store: 'Lidl', item_name: 'mixed veg', unit: 'g', pack_qty: 500, price_gbp: 0.85 },

  // Potatoes (2.5kg bag)
  { id: '73', store: 'Tesco', item_name: 'potatoes', unit: 'kg', pack_qty: 2.5, price_gbp: 1.80 },
  { id: '74', store: 'Sainsburys', item_name: 'potatoes', unit: 'kg', pack_qty: 2.5, price_gbp: 2.10 },
  { id: '75', store: 'Waitrose', item_name: 'potatoes', unit: 'kg', pack_qty: 2.5, price_gbp: 2.60 },
  { id: '76', store: 'Co-op', item_name: 'potatoes', unit: 'kg', pack_qty: 2.5, price_gbp: 2.20 },
  { id: '77', store: 'Aldi', item_name: 'potatoes', unit: 'kg', pack_qty: 2.5, price_gbp: 1.49 },
  { id: '78', store: 'Lidl', item_name: 'potatoes', unit: 'kg', pack_qty: 2.5, price_gbp: 1.45 },

  // Olive oil (500ml bottle)
  { id: '79', store: 'Tesco', item_name: 'olive oil', unit: 'ml', pack_qty: 500, price_gbp: 3.50 },
  { id: '80', store: 'Sainsburys', item_name: 'olive oil', unit: 'ml', pack_qty: 500, price_gbp: 3.85 },
  { id: '81', store: 'Waitrose', item_name: 'olive oil', unit: 'ml', pack_qty: 500, price_gbp: 4.50 },
  { id: '82', store: 'Co-op', item_name: 'olive oil', unit: 'ml', pack_qty: 500, price_gbp: 4.00 },
  { id: '83', store: 'Aldi', item_name: 'olive oil', unit: 'ml', pack_qty: 500, price_gbp: 2.99 },
  { id: '84', store: 'Lidl', item_name: 'olive oil', unit: 'ml', pack_qty: 500, price_gbp: 2.85 },

  // Milk (2 pint / 1.136L)
  { id: '85', store: 'Tesco', item_name: 'milk', unit: 'pint', pack_qty: 2, price_gbp: 1.35 },
  { id: '86', store: 'Sainsburys', item_name: 'milk', unit: 'pint', pack_qty: 2, price_gbp: 1.45 },
  { id: '87', store: 'Waitrose', item_name: 'milk', unit: 'pint', pack_qty: 2, price_gbp: 1.70 },
  { id: '88', store: 'Co-op', item_name: 'milk', unit: 'pint', pack_qty: 2, price_gbp: 1.50 },
  { id: '89', store: 'Aldi', item_name: 'milk', unit: 'pint', pack_qty: 2, price_gbp: 1.09 },
  { id: '90', store: 'Lidl', item_name: 'milk', unit: 'pint', pack_qty: 2, price_gbp: 1.05 },

  // Cheese (400g block)
  { id: '91', store: 'Tesco', item_name: 'cheese', unit: 'g', pack_qty: 400, price_gbp: 2.80 },
  { id: '92', store: 'Sainsburys', item_name: 'cheese', unit: 'g', pack_qty: 400, price_gbp: 3.10 },
  { id: '93', store: 'Waitrose', item_name: 'cheese', unit: 'g', pack_qty: 400, price_gbp: 3.75 },
  { id: '94', store: 'Co-op', item_name: 'cheese', unit: 'g', pack_qty: 400, price_gbp: 3.25 },
  { id: '95', store: 'Aldi', item_name: 'cheese', unit: 'g', pack_qty: 400, price_gbp: 2.29 },
  { id: '96', store: 'Lidl', item_name: 'cheese', unit: 'g', pack_qty: 400, price_gbp: 2.19 },

  // Bread (800g loaf)
  { id: '97', store: 'Tesco', item_name: 'bread', unit: 'loaf', pack_qty: 1, price_gbp: 1.10 },
  { id: '98', store: 'Sainsburys', item_name: 'bread', unit: 'loaf', pack_qty: 1, price_gbp: 1.25 },
  { id: '99', store: 'Waitrose', item_name: 'bread', unit: 'loaf', pack_qty: 1, price_gbp: 1.60 },
  { id: '100', store: 'Co-op', item_name: 'bread', unit: 'loaf', pack_qty: 1, price_gbp: 1.35 },
  { id: '101', store: 'Aldi', item_name: 'bread', unit: 'loaf', pack_qty: 1, price_gbp: 0.75 },
  { id: '102', store: 'Lidl', item_name: 'bread', unit: 'loaf', pack_qty: 1, price_gbp: 0.72 },
];
