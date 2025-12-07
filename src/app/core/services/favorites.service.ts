import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Recipe } from '../models';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'favorite_recipes';
  private favoritesSubject = new BehaviorSubject<Recipe[]>([]);

  constructor() {
    this.loadFavorites();
  }

  getFavorites(): Observable<Recipe[]> {
    return this.favoritesSubject.asObservable();
  }

  addToFavorites(recipe: Recipe): void {
    const currentFavorites = this.favoritesSubject.value;
    const isAlreadyFavorite = currentFavorites.some(fav => fav.id === recipe.id);
    
    if (!isAlreadyFavorite) {
      const updatedFavorites = [...currentFavorites, { ...recipe, isFavorite: true }];
      this.updateFavorites(updatedFavorites);
    }
  }

  removeFromFavorites(recipeId: string): void {
    const currentFavorites = this.favoritesSubject.value;
    const updatedFavorites = currentFavorites.filter(recipe => recipe.id !== recipeId);
    this.updateFavorites(updatedFavorites);
  }

  toggleFavorite(recipe: Recipe): void {
    const currentFavorites = this.favoritesSubject.value;
    const isFavorite = currentFavorites.some(fav => fav.id === recipe.id);
    
    if (isFavorite) {
      this.removeFromFavorites(recipe.id);
    } else {
      this.addToFavorites(recipe);
    }
  }

  isFavorite(recipeId: string): boolean {
    return this.favoritesSubject.value.some(recipe => recipe.id === recipeId);
  }

  getFavoriteCount(): number {
    return this.favoritesSubject.value.length;
  }

  clearFavorites(): void {
    this.updateFavorites([]);
  }

  private loadFavorites(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const favorites = stored ? JSON.parse(stored) : [];
      this.favoritesSubject.next(favorites);
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
      this.favoritesSubject.next([]);
    }
  }

  private updateFavorites(favorites: Recipe[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
      this.favoritesSubject.next(favorites);
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }
}
