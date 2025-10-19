import { PantryItem, UserPreferences, MealPlan } from '@/types';

const STORAGE_KEYS = {
  PANTRY: 'mealplanner_pantry',
  PREFERENCES: 'mealplanner_preferences',
  MEAL_PLAN: 'mealplanner_plan',
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
