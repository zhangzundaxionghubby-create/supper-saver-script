export interface PantryItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  category: string;
  perishability: 'fresh' | 'frozen' | 'pantry';
  bulk: boolean;
}

export interface RecipeIngredient {
  name: string;
  qty: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  macros: {
    protein: number;
    kcal: number;
  };
  tags: string[];
}

export interface StorePrice {
  id: string;
  store: 'Tesco' | 'Sainsburys' | 'Waitrose' | 'Co-op' | 'Aldi' | 'Lidl';
  item_name: string;
  unit: string;
  pack_qty: number;
  price_gbp: number;
}

export interface UserPreferences {
  weeklyMeals: number;
  servings: number;
  proteinTarget: number;
  stores: string[];
}

export interface MealPlan {
  meals: Recipe[];
  shoppingList: ShoppingItem[];
  macrosSummary: MacrosSummary;
}

export interface ShoppingItem {
  name: string;
  qty: number;
  unit: string;
  category: string;
  alreadyOwn: boolean;
}

export interface MacrosSummary {
  dailyProtein: number;
  dailyCalories: number;
  meetsTarget: boolean;
}

export interface CookedMeal {
  id: string;
  name: string;
  day: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  cookedAt: string;
}

export interface PriceComparison {
  store: string;
  total: number;
  items: { name: string; price: number }[];
}

export interface SwapSuggestion {
  original: string;
  replacement: string;
  priceDiff: number;
  proteinDiff: number;
}
