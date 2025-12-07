import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Recipe } from '../../core/models';
import { RecipeService } from '../../core/services';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  recipes$!: Observable<Recipe[]>;
  searchQuery = '';
  isLoading = false;
  noResults = false;
  private searchSubject = new Subject<string>();

  // Advanced search features
  searchHistory: string[] = [];
  selectedCategory = '';
  selectedArea = '';
  sortBy = 'relevance';
  showFilters = false;

  // Available options for filters
  categories = ['All', 'Italian', 'Indian', 'Chinese', 'Mexican', 'Japanese', 'Thai', 'French', 'American'];
  areas = ['All', 'Italian', 'Indian', 'Chinese', 'Mexican', 'Japanese', 'Thai', 'French', 'American'];
  sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'category', label: 'Category' },
    { value: 'area', label: 'Cuisine' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private recipeService: RecipeService
  ) {
    // Load search history from localStorage
    this.loadSearchHistory();
  }

  ngOnInit(): void {
    // Check for query params from navigation
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery = params['q'];
        this.performSearch(this.searchQuery);
      }
    });

    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(query => {
        this.isLoading = true;
        this.noResults = false;
        if (query.trim()) {
          this.addToSearchHistory(query);
        }
      }),
      switchMap(query => {
        if (!query.trim()) {
          return of([]);
        }
        return this.recipeService.searchRecipes(query);
      })
    ).subscribe(recipes => {
      this.recipes$ = of(recipes);
      this.isLoading = false;
      this.noResults = recipes.length === 0 && !!this.searchQuery.trim();
    });

    // Initial load
    if (!this.searchQuery) {
      this.recipes$ = this.recipeService.getAllRecipes();
    }
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.searchSubject.next(this.searchQuery);
  }

  performSearch(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  navigateToRecipe(recipe: Recipe): void {
    this.router.navigate(['/recipe', recipe.id]);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchSubject.next('');
    this.recipes$ = this.recipeService.getAllRecipes();
    this.noResults = false;
  }

  trackByRecipeId(index: number, recipe: Recipe): string {
    return recipe.id;
  }

  // Advanced search methods
  loadSearchHistory(): void {
    const history = localStorage.getItem('search_history');
    if (history) {
      this.searchHistory = JSON.parse(history).slice(0, 5); // Keep only last 5 searches
    }
  }

  addToSearchHistory(query: string): void {
    const trimmedQuery = query.trim();
    if (trimmedQuery && !this.searchHistory.includes(trimmedQuery)) {
      this.searchHistory.unshift(trimmedQuery);
      this.searchHistory = this.searchHistory.slice(0, 5);
      localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
    }
  }

  clearSearchHistory(): void {
    this.searchHistory = [];
    localStorage.removeItem('search_history');
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilters(): void {
    // Apply filters and search
    this.performSearch(this.searchQuery);
    this.showFilters = false;
  }

  resetFilters(): void {
    this.selectedCategory = '';
    this.selectedArea = '';
    this.sortBy = 'relevance';
    this.performSearch(this.searchQuery);
  }

  onPopularSearchClick(term: string): void {
    this.performSearch(term);
  }

  getSkeletonArray(): number[] {
    return new Array(6).fill(0);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
