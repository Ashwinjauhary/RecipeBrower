import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Recipe } from '../../../core/models';
import { FavoritesService } from '../../../core/services';
import { LazyImageDirective } from '../../directives/lazy-image.directive';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, LazyImageDirective],
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.scss']
})
export class RecipeCardComponent {
  @Input() recipe!: Recipe;
  @Input() showFavoriteButton = true;
  @Output() recipeClick = new EventEmitter<Recipe>();
  @Output() favoriteToggle = new EventEmitter<Recipe>();

  constructor(private favoritesService: FavoritesService) {}

  onRecipeClick(): void {
    this.recipeClick.emit(this.recipe);
  }

  onFavoriteClick(event: Event): void {
    event.stopPropagation();
    this.favoritesService.toggleFavorite(this.recipe);
    this.favoriteToggle.emit(this.recipe);
  }

  isFavorite(): boolean {
    return this.favoritesService.isFavorite(this.recipe.id);
  }

  getCategoryColor(): string {
    const colors: { [key: string]: string } = {
      'Italian': 'category-green',
      'Indian': 'category-orange',
      'Chinese': 'category-red',
      'Mexican': 'category-yellow',
      'Japanese': 'category-pink',
      'Thai': 'category-purple',
      'French': 'category-blue',
      'Dessert': 'category-pink',
      'American': 'category-indigo'
    };
    return colors[this.recipe.category] || 'category-gray';
  }

  getPreparationTime(): string {
    const times: { [key: string]: string } = {
      'Italian': '30-45 min',
      'Indian': '45-60 min',
      'Chinese': '20-30 min',
      'Mexican': '25-35 min',
      'Japanese': '35-50 min',
      'Thai': '30-40 min',
      'French': '40-55 min',
      'Dessert': '20-30 min',
      'American': '25-40 min'
    };
    return times[this.recipe.category] || '30 min';
  }
}
