import { StorePrice } from '@/types';

export const mockStorePrices: StorePrice[] = [
  // Chicken breast
  { id: '1', store: 'Tesco', item_name: 'chicken breast', unit: 'g', pack_qty: 500, price_gbp: 4.5 },
  { id: '2', store: 'Lidl', item_name: 'chicken breast', unit: 'g', pack_qty: 500, price_gbp: 3.99 },
  { id: '3', store: 'Asda', item_name: 'chicken breast', unit: 'g', pack_qty: 500, price_gbp: 4.25 },
  { id: '4', store: 'Sainsburys', item_name: 'chicken breast', unit: 'g', pack_qty: 500, price_gbp: 4.75 },

  // Rice
  { id: '5', store: 'Tesco', item_name: 'rice', unit: 'g', pack_qty: 1000, price_gbp: 1.2 },
  { id: '6', store: 'Lidl', item_name: 'rice', unit: 'g', pack_qty: 1000, price_gbp: 0.99 },
  { id: '7', store: 'Asda', item_name: 'rice', unit: 'g', pack_qty: 1000, price_gbp: 1.1 },
  { id: '8', store: 'Sainsburys', item_name: 'rice', unit: 'g', pack_qty: 1000, price_gbp: 1.3 },

  // Pasta
  { id: '9', store: 'Tesco', item_name: 'pasta', unit: 'g', pack_qty: 500, price_gbp: 0.75 },
  { id: '10', store: 'Lidl', item_name: 'pasta', unit: 'g', pack_qty: 500, price_gbp: 0.59 },
  { id: '11', store: 'Asda', item_name: 'pasta', unit: 'g', pack_qty: 500, price_gbp: 0.7 },
  { id: '12', store: 'Sainsburys', item_name: 'pasta', unit: 'g', pack_qty: 500, price_gbp: 0.8 },

  // Eggs
  { id: '13', store: 'Tesco', item_name: 'eggs', unit: 'whole', pack_qty: 12, price_gbp: 2.5 },
  { id: '14', store: 'Lidl', item_name: 'eggs', unit: 'whole', pack_qty: 12, price_gbp: 1.99 },
  { id: '15', store: 'Asda', item_name: 'eggs', unit: 'whole', pack_qty: 12, price_gbp: 2.3 },
  { id: '16', store: 'Sainsburys', item_name: 'eggs', unit: 'whole', pack_qty: 12, price_gbp: 2.6 },

  // Tomatoes
  { id: '17', store: 'Tesco', item_name: 'tomatoes', unit: 'g', pack_qty: 400, price_gbp: 0.45 },
  { id: '18', store: 'Lidl', item_name: 'tomatoes', unit: 'g', pack_qty: 400, price_gbp: 0.35 },
  { id: '19', store: 'Asda', item_name: 'tomatoes', unit: 'g', pack_qty: 400, price_gbp: 0.4 },
  { id: '20', store: 'Sainsburys', item_name: 'tomatoes', unit: 'g', pack_qty: 400, price_gbp: 0.5 },

  // Onions
  { id: '21', store: 'Tesco', item_name: 'onion', unit: 'whole', pack_qty: 3, price_gbp: 0.85 },
  { id: '22', store: 'Lidl', item_name: 'onion', unit: 'whole', pack_qty: 3, price_gbp: 0.69 },
  { id: '23', store: 'Asda', item_name: 'onion', unit: 'whole', pack_qty: 3, price_gbp: 0.75 },
  { id: '24', store: 'Sainsburys', item_name: 'onion', unit: 'whole', pack_qty: 3, price_gbp: 0.9 },

  // Broccoli
  { id: '25', store: 'Tesco', item_name: 'broccoli', unit: 'g', pack_qty: 300, price_gbp: 0.9 },
  { id: '26', store: 'Lidl', item_name: 'broccoli', unit: 'g', pack_qty: 300, price_gbp: 0.69 },
  { id: '27', store: 'Asda', item_name: 'broccoli', unit: 'g', pack_qty: 300, price_gbp: 0.8 },
  { id: '28', store: 'Sainsburys', item_name: 'broccoli', unit: 'g', pack_qty: 300, price_gbp: 0.95 },

  // Tuna
  { id: '29', store: 'Tesco', item_name: 'tuna', unit: 'tin', pack_qty: 1, price_gbp: 0.95 },
  { id: '30', store: 'Lidl', item_name: 'tuna', unit: 'tin', pack_qty: 1, price_gbp: 0.75 },
  { id: '31', store: 'Asda', item_name: 'tuna', unit: 'tin', pack_qty: 1, price_gbp: 0.85 },
  { id: '32', store: 'Sainsburys', item_name: 'tuna', unit: 'tin', pack_qty: 1, price_gbp: 1.0 },

  // Greek yogurt
  { id: '33', store: 'Tesco', item_name: 'greek yogurt', unit: 'g', pack_qty: 500, price_gbp: 1.5 },
  { id: '34', store: 'Lidl', item_name: 'greek yogurt', unit: 'g', pack_qty: 500, price_gbp: 1.19 },
  { id: '35', store: 'Asda', item_name: 'greek yogurt', unit: 'g', pack_qty: 500, price_gbp: 1.3 },
  { id: '36', store: 'Sainsburys', item_name: 'greek yogurt', unit: 'g', pack_qty: 500, price_gbp: 1.6 },

  // Mince beef
  { id: '37', store: 'Tesco', item_name: 'mince beef', unit: 'g', pack_qty: 500, price_gbp: 3.5 },
  { id: '38', store: 'Lidl', item_name: 'mince beef', unit: 'g', pack_qty: 500, price_gbp: 2.99 },
  { id: '39', store: 'Asda', item_name: 'mince beef', unit: 'g', pack_qty: 500, price_gbp: 3.25 },
  { id: '40', store: 'Sainsburys', item_name: 'mince beef', unit: 'g', pack_qty: 500, price_gbp: 3.75 },

  // Additional items
  { id: '41', store: 'Tesco', item_name: 'banana', unit: 'whole', pack_qty: 5, price_gbp: 0.95 },
  { id: '42', store: 'Lidl', item_name: 'banana', unit: 'whole', pack_qty: 5, price_gbp: 0.69 },
  { id: '43', store: 'Asda', item_name: 'banana', unit: 'whole', pack_qty: 5, price_gbp: 0.85 },
  { id: '44', store: 'Sainsburys', item_name: 'banana', unit: 'whole', pack_qty: 5, price_gbp: 1.0 },

  { id: '45', store: 'Tesco', item_name: 'mixed veg', unit: 'g', pack_qty: 500, price_gbp: 1.2 },
  { id: '46', store: 'Lidl', item_name: 'mixed veg', unit: 'g', pack_qty: 500, price_gbp: 0.89 },
  { id: '47', store: 'Asda', item_name: 'mixed veg', unit: 'g', pack_qty: 500, price_gbp: 1.1 },
  { id: '48', store: 'Sainsburys', item_name: 'mixed veg', unit: 'g', pack_qty: 500, price_gbp: 1.3 },

  { id: '49', store: 'Tesco', item_name: 'potatoes', unit: 'g', pack_qty: 2000, price_gbp: 1.8 },
  { id: '50', store: 'Lidl', item_name: 'potatoes', unit: 'g', pack_qty: 2000, price_gbp: 1.49 },
  { id: '51', store: 'Asda', item_name: 'potatoes', unit: 'g', pack_qty: 2000, price_gbp: 1.6 },
  { id: '52', store: 'Sainsburys', item_name: 'potatoes', unit: 'g', pack_qty: 2000, price_gbp: 1.95 },
];
