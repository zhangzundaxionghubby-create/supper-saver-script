import { PantryItem, UserPreferences, MealPlan, CookedMeal } from '@/types';

const STORAGE_KEYS = {
  PANTRY: 'mealplanner_pantry',
  PREFERENCES: 'mealplanner_preferences',
  MEAL_PLAN: 'mealplanner_plan',
  COOKED_MEALS: 'mealplanner_cooked_meals',
} as const;

// Pantry operations
export const getPantry = (): PantryItem[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.PANTRY);
  return stored ? JSON.parse(stored) : [];
};

export const savePantry = (items: PantryItem[]): void => {
  localStorage.setItem(STORAGE_KEYS.PANTRY, JSON.stringify(items));
};

// Preferences operations
export const getPreferences = (): UserPreferences | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
  return stored ? JSON.parse(stored) : null;
};

export const savePreferences = (prefs: UserPreferences): void => {
  localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
};

// Meal plan operations
export const getMealPlan = (): MealPlan | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.MEAL_PLAN);
  return stored ? JSON.parse(stored) : null;
};

export const saveMealPlan = (plan: MealPlan): void => {
  localStorage.setItem(STORAGE_KEYS.MEAL_PLAN, JSON.stringify(plan));
};

// Cooked meals operations
export const getCookedMeals = (): CookedMeal[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.COOKED_MEALS);
  return stored ? JSON.parse(stored) : [];
};

export const saveCookedMeal = (meal: CookedMeal): void => {
  const meals = getCookedMeals();
  meals.push(meal);
  localStorage.setItem(STORAGE_KEYS.COOKED_MEALS, JSON.stringify(meals));
};

export const removeCookedMeal = (id: string): void => {
  const meals = getCookedMeals().filter(meal => meal.id !== id);
  localStorage.setItem(STORAGE_KEYS.COOKED_MEALS, JSON.stringify(meals));
};
