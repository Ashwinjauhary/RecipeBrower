import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, delay, shareReplay, tap } from 'rxjs/operators';
import { Recipe, Ingredient, ApiResponse, RecipeCategory } from '../models';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly API_BASE = 'https://www.themealdb.com/api/json/v1/1';
  private readonly STORAGE_KEY = 'recipe_cache';
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private cacheSubject = new BehaviorSubject<Recipe[]>([]);
  private cache$ = this.cacheSubject.asObservable().pipe(shareReplay(1));

  constructor(private http: HttpClient) {
    this.loadInitialCache();
  }

  private loadInitialCache(): void {
    const cached = this.getCachedRecipes();
    if (cached.length > 0) {
      this.cacheSubject.next(cached);
    } else {
      this.fetchAndCacheRecipes();
    }
  }

  private fetchAndCacheRecipes(): void {
    this.http.get<ApiResponse<any>>(`${this.API_BASE}/search.php?s=`).pipe(
      map(response => this.transformApiRecipes(response.meals || [])),
      tap(recipes => {
        this.cacheRecipes(recipes);
        this.cacheSubject.next(recipes);
      }),
      catchError(error => {
        console.error('Error fetching recipes:', error);
        const fallback = this.getFallbackRecipes();
        this.cacheSubject.next(fallback);
        return of(fallback);
      })
    ).subscribe();
  }

  getAllRecipes(): Observable<Recipe[]> {
    return this.cache$;
  }

  searchRecipes(query: string): Observable<Recipe[]> {
    if (!query.trim()) {
      return this.cache$;
    }

    // For better performance, filter from cache first
    const cached = this.cacheSubject.value;
    const filtered = cached.filter(recipe => 
      recipe.name.toLowerCase().includes(query.toLowerCase()) ||
      recipe.category.toLowerCase().includes(query.toLowerCase()) ||
      recipe.area.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length > 0) {
      return of(filtered).pipe(delay(100)); // Small delay for UX
    }

    // If no results in cache, make API call
    return this.http.get<ApiResponse<any>>(`${this.API_BASE}/search.php?s=${query}`).pipe(
      map(response => this.transformApiRecipes(response.meals || [])),
      catchError(error => {
        console.error('Error searching recipes:', error);
        return of([]);
      })
    );
  }

  getRecipeById(id: string): Observable<Recipe | null> {
    return this.http.get<ApiResponse<any>>(`${this.API_BASE}/lookup.php?i=${id}`).pipe(
      map(response => {
        const meals = response.meals || [];
        return meals.length > 0 ? this.transformApiRecipe(meals[0]) : null;
      }),
      catchError(error => {
        console.error('Error fetching recipe details:', error);
        const fallback = this.getFallbackRecipes().find(r => r.id === id);
        return of(fallback || null);
      })
    );
  }

  getCategories(): Observable<RecipeCategory[]> {
    return this.http.get<any>(`${this.API_BASE}/categories.php`).pipe(
      map(response => {
        return (response.categories || []).map((cat: any) => ({
          name: cat.strCategory,
          image: `https://www.themealdb.com/images/category/${cat.strCategory}.png`,
          description: cat.strCategoryDescription
        }));
      }),
      catchError(error => {
        console.error('Error fetching categories:', error);
        return of(this.getFallbackCategories());
      })
    );
  }

  getRecipesByCategory(category: string): Observable<Recipe[]> {
    return this.http.get<ApiResponse<any>>(`${this.API_BASE}/filter.php?c=${category}`).pipe(
      map(response => {
        const basicRecipes = response.meals || [];
        return basicRecipes.map(meal => ({
          id: meal.idMeal,
          name: meal.strMeal,
          category: category,
          area: 'Unknown',
          instructions: '',
          image: meal.strMealThumb,
          ingredients: [],
          tags: '',
          youtube: ''
        }));
      }),
      catchError(error => {
        console.error('Error fetching recipes by category:', error);
        return of(this.getFallbackRecipes().filter(r => r.category === category));
      })
    );
  }

  private transformApiRecipes(meals: any[]): Recipe[] {
    return meals.map(meal => this.transformApiRecipe(meal));
  }

  private transformApiRecipe(meal: any): Recipe {
    const ingredients: Ingredient[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          name: ingredient,
          measure: measure || 'to taste'
        });
      }
    }

    return {
      id: meal.idMeal,
      name: meal.strMeal,
      category: meal.strCategory || 'Unknown',
      area: meal.strArea || 'Unknown',
      instructions: meal.strInstructions || '',
      image: meal.strMealThumb || '',
      tags: meal.strTags,
      youtube: meal.strYoutube,
      ingredients,
      source: meal.strSource
    };
  }

  private cacheRecipes(recipes: Recipe[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recipes));
    } catch (error) {
      console.error('Error caching recipes:', error);
    }
  }

  private getCachedRecipes(): Recipe[] {
    try {
      const cached = localStorage.getItem(this.STORAGE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error reading cached recipes:', error);
      return [];
    }
  }

  private getFallbackRecipes(): Recipe[] {
    return [
      {
        id: '1',
        name: 'Spaghetti Carbonara',
        category: 'Italian',
        area: 'Italy',
        instructions: 'Cook pasta according to package directions. Meanwhile, cook bacon until crisp. Remove bacon and drain on paper towels. In a large bowl, whisk eggs and cheese. Add hot pasta to egg mixture and toss quickly. Add bacon and season with pepper.',
        image: 'https://www.themealdb.com/images/media/meals/utxwpy1511385814.jpg',
        ingredients: [
          { name: 'Spaghetti', measure: '400g' },
          { name: 'Bacon', measure: '200g' },
          { name: 'Eggs', measure: '4' },
          { name: 'Parmesan Cheese', measure: '100g' },
          { name: 'Black Pepper', measure: 'to taste' }
        ],
        tags: 'Pasta,Italian',
        youtube: 'https://www.youtube.com/watch?v=3AqK8-8yH7k'
      },
      {
        id: '2',
        name: 'Chicken Tikka Masala',
        category: 'Indian',
        area: 'India',
        instructions: 'Marinate chicken in yogurt and spices for 2 hours. Grill or pan-fry until cooked. Make sauce with tomatoes, cream, and spices. Add chicken and simmer for 15 minutes. Serve with rice or naan.',
        image: 'https://www.themealdb.com/images/media/meals/x0lk9i1583459407.jpg',
        ingredients: [
          { name: 'Chicken Breast', measure: '500g' },
          { name: 'Yogurt', measure: '200ml' },
          { name: 'Tomatoes', measure: '400g' },
          { name: 'Heavy Cream', measure: '200ml' },
          { name: 'Garam Masala', measure: '2 tbsp' }
        ],
        tags: 'Curry,Indian,Chicken',
        youtube: 'https://www.youtube.com/watch?v=QK2_kUIH-i8'
      },
      {
        id: '3',
        name: 'Chocolate Lava Cake',
        category: 'Dessert',
        area: 'French',
        instructions: 'Melt chocolate and butter. Whisk eggs and sugar. Combine all ingredients. Pour into greased ramekins. Bake at 425°F for 12-14 minutes. Serve immediately with ice cream.',
        image: 'https://www.themealdb.com/images/media/meals/tqtyx1468307752.jpg',
        ingredients: [
          { name: 'Dark Chocolate', measure: '200g' },
          { name: 'Butter', measure: '200g' },
          { name: 'Eggs', measure: '4' },
          { name: 'Sugar', measure: '100g' },
          { name: 'Flour', measure: '50g' }
        ],
        tags: 'Dessert,Chocolate,French',
        youtube: 'https://www.youtube.com/watch?v=VvVH_3Z2Q9M'
      }
    ];
  }

  private getFallbackCategories(): RecipeCategory[] {
    return [
      {
        name: 'Italian',
        image: 'https://www.themealdb.com/images/category/italian.png',
        description: 'Italian cuisine features simple, fresh ingredients with emphasis on quality over quantity.'
      },
      {
        name: 'Indian',
        image: 'https://www.themealdb.com/images/category/indian.png',
        description: 'Indian cuisine is known for its diverse flavors, spices, and regional variations.'
      },
      {
        name: 'Dessert',
        image: 'https://www.themealdb.com/images/category/dessert.png',
        description: 'Sweet treats to satisfy your cravings after a delicious meal.'
      }
    ];
  }
}
