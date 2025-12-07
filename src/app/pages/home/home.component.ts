import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Recipe, RecipeCategory } from '../../core/models';
import { RecipeService } from '../../core/services';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  recipes$!: Observable<Recipe[]>;
  categories$!: Observable<RecipeCategory[]>;
  featuredRecipes: Recipe[] = [];
  isLoading = true;

  constructor(
    private router: Router,
    private recipeService: RecipeService
  ) {}

  ngOnInit(): void {
    this.loadRecipes();
    this.loadCategories();
  }

  private loadRecipes(): void {
    this.recipes$ = this.recipeService.getAllRecipes();
    
    // Subscribe to get featured recipes
    this.recipes$.subscribe(recipes => {
      this.featuredRecipes = recipes.slice(0, 6); // Get first 6 recipes
      this.isLoading = false;
    });
  }

  private loadCategories(): void {
    this.categories$ = this.recipeService.getCategories();
  }

  navigateToRecipe(recipe: Recipe): void {
    this.router.navigate(['/recipe', recipe.id]);
  }

  navigateToSearch(): void {
    this.router.navigate(['/search']);
  }

  navigateToCategory(category: string): void {
    this.router.navigate(['/search'], { queryParams: { category } });
  }

  trackByRecipeId(index: number, recipe: Recipe): string {
    return recipe.id;
  }

  trackByCategoryId(index: number, category: RecipeCategory): string {
    return category.name;
  }
}
