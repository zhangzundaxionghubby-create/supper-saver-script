import { PantryItem, Recipe, ShoppingItem, MealPlan, UserPreferences } from '@/types';
import { mockRecipes } from '@/data/mockRecipes';

export const generateMealPlan = (
  pantry: PantryItem[],
  prefs: UserPreferences
): MealPlan => {
  // Select meals based on weekly meals setting (aim for variety)
  const selectedMeals: Recipe[] = [];
  const mealCount = Math.min(prefs.weeklyMeals, 7);
  
  // Prioritize recipes that use pantry items
  const recipesWithPantryScore = mockRecipes.map(recipe => {
    const pantryItemsUsed = recipe.ingredients.filter(ing =>
      pantry.some(p => p.name.toLowerCase().includes(ing.name.toLowerCase()))
    ).length;
    return { recipe, score: pantryItemsUsed };
  });

  recipesWithPantryScore.sort((a, b) => b.score - a.score);

  // Select top recipes with some variety
  for (let i = 0; i < mealCount && i < recipesWithPantryScore.length; i++) {
    selectedMeals.push(recipesWithPantryScore[i].recipe);
  }

  // Generate shopping list (consolidate and dedupe)
  const shoppingMap = new Map<string, ShoppingItem>();

  selectedMeals.forEach(meal => {
    meal.ingredients.forEach(ing => {
      const inPantry = pantry.some(p => 
        p.name.toLowerCase() === ing.name.toLowerCase() && p.qty >= ing.qty
      );

      if (!inPantry) {
        const existing = shoppingMap.get(ing.name.toLowerCase());
        if (existing) {
          existing.qty += ing.qty;
        } else {
          shoppingMap.set(ing.name.toLowerCase(), {
            name: ing.name,
            qty: ing.qty,
            unit: ing.unit,
            category: getCategoryForItem(ing.name),
            alreadyOwn: false,
          });
        }
      }
    });
  });

  const shoppingList = Array.from(shoppingMap.values());

  // Calculate macros summary
  const totalProtein = selectedMeals.reduce((sum, m) => sum + m.macros.protein, 0);
  const totalCalories = selectedMeals.reduce((sum, m) => sum + m.macros.kcal, 0);
  const dailyProtein = totalProtein / mealCount;
  const dailyCalories = totalCalories / mealCount;
  const meetsTarget = dailyProtein >= prefs.proteinTarget * 0.9;

  return {
    meals: selectedMeals,
    shoppingList,
    macrosSummary: {
      dailyProtein: Math.round(dailyProtein),
      dailyCalories: Math.round(dailyCalories),
      meetsTarget,
    },
  };
};

const getCategoryForItem = (itemName: string): string => {
  const name = itemName.toLowerCase();
  if (name.includes('chicken') || name.includes('beef') || name.includes('salmon') || name.includes('tuna')) {
    return 'Meat & Fish';
  }
  if (name.includes('rice') || name.includes('pasta') || name.includes('bread') || name.includes('noodles')) {
    return 'Carbs & Grains';
  }
  if (name.includes('broccoli') || name.includes('carrot') || name.includes('pepper') || name.includes('onion') || name.includes('tomato') || name.includes('lettuce') || name.includes('veg')) {
    return 'Vegetables';
  }
  if (name.includes('egg') || name.includes('milk') || name.includes('cheese') || name.includes('yogurt')) {
    return 'Dairy & Eggs';
  }
  return 'Pantry';
};
