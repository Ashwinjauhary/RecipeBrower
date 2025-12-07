import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Recipe } from '../../core/models';
import { FavoritesService } from '../../core/services';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss'
})
export class FavoritesComponent implements OnInit {
  favorites$!: Observable<Recipe[]>;
  favoriteCount = 0;
  isLoading = true;

  constructor(
    private router: Router,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  private loadFavorites(): void {
    this.favorites$ = this.favoritesService.getFavorites();
    this.favorites$.subscribe(favorites => {
      this.favoriteCount = favorites.length;
      this.isLoading = false;
    });
  }

  navigateToRecipe(recipe: Recipe): void {
    this.router.navigate(['/recipe', recipe.id]);
  }

  removeFromFavorites(recipe: Recipe): void {
    this.favoritesService.removeFromFavorites(recipe.id);
  }

  clearAllFavorites(): void {
    if (confirm('Are you sure you want to remove all favorite recipes?')) {
      this.favoritesService.clearFavorites();
    }
  }

  trackByRecipeId(index: number, recipe: Recipe): string {
    return recipe.id;
  }

  navigateToSearch(): void {
    this.router.navigate(['/search']);
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
  }
}
