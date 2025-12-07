import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Recipe } from '../../core/models';
import { RecipeService, FavoritesService } from '../../core/services';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit {
  recipe$!: Observable<Recipe | null>;
  recipe: Recipe | null = null;
  isLoading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService,
    private favoritesService: FavoritesService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadRecipe();
  }

  private loadRecipe(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = true;
      this.isLoading = false;
      return;
    }

    this.recipe$ = this.recipeService.getRecipeById(id);
    this.recipe$.subscribe(recipe => {
      this.recipe = recipe;
      this.isLoading = false;
      if (!recipe) {
        this.error = true;
      }
    });
  }

  toggleFavorite(): void {
    if (this.recipe) {
      this.favoritesService.toggleFavorite(this.recipe);
    }
  }

  isFavorite(): boolean {
    return this.recipe ? this.favoritesService.isFavorite(this.recipe.id) : false;
  }

  goBack(): void {
    this.router.navigate(['/search']);
  }

  shareRecipe(): void {
    if (this.recipe && navigator.share) {
      navigator.share({
        title: this.recipe.name,
        text: `Check out this ${this.recipe.category} recipe: ${this.recipe.name}`,
        url: window.location.href
      }).catch(err => console.log('Error sharing:', err));
    } else if (this.recipe) {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        // Show toast or notification
        console.log('Recipe link copied to clipboard!');
      });
    }
  }

  getYoutubeEmbedUrl(): SafeResourceUrl | null {
    if (!this.recipe?.youtube) return null;
    
    const url = this.recipe.youtube;
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (!videoId) return null;
    
    const embedUrl = `https://www.youtube.com/embed/${videoId[1]}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  formatInstructions(): string[] {
    if (!this.recipe?.instructions) return [];
    
    return this.recipe.instructions
      .split('.')
      .map(step => step.trim())
      .filter(step => step.length > 0);
  }

  printRecipe(): void {
    window.print();
  }
}
