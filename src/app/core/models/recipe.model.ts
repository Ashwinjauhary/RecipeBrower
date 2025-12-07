export interface Recipe {
  id: string;
  name: string;
  category: string;
  area: string;
  instructions: string;
  image: string;
  tags?: string;
  youtube?: string;
  ingredients: Ingredient[];
  source?: string;
  isFavorite?: boolean;
}

export interface Ingredient {
  name: string;
  measure: string;
}

export interface RecipeCategory {
  name: string;
  image: string;
  description: string;
}

export interface SearchFilters {
  category?: string;
  area?: string;
  ingredient?: string;
}

export interface ApiResponse<T> {
  meals: T[];
}
