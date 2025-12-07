import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FavoritesService } from '../../../core/services';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  favoriteCount$: Observable<number>;
  isMenuOpen = false;

  constructor(
    private router: Router,
    private favoritesService: FavoritesService
  ) {
    this.favoriteCount$ = new Observable<number>(observer => {
      this.favoritesService.getFavorites().subscribe(favorites => {
        observer.next(favorites.length);
      });
    });
  }

  navigateToHome(): void {
    this.router.navigate(['/home']);
    this.closeMenu();
  }

  navigateToSearch(): void {
    this.router.navigate(['/search']);
    this.closeMenu();
  }

  navigateToFavorites(): void {
    this.router.navigate(['/favorites']);
    this.closeMenu();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
}
