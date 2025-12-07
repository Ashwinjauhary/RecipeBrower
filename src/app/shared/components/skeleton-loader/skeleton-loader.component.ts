import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.component.html',
  styleUrl: './skeleton-loader.component.scss'
})
export class SkeletonLoaderComponent {
  @Input() type: 'card' | 'text' | 'avatar' | 'recipe' = 'text';
  @Input() count = 1;
  @Input() width?: string;
  @Input() height?: string;

  trackByIndex(index: number): number {
    return index;
  }
}
