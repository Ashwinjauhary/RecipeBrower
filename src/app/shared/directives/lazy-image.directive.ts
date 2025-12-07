import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: 'img[appLazyImage]',
  standalone: true
})
export class LazyImageDirective implements OnInit {
  @Input() appLazyImage: string = '';
  @Input() placeholder: string = 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Loading...';

  constructor(private el: ElementRef<HTMLImageElement>) {}

  ngOnInit(): void {
    const img = this.el.nativeElement;
    
    // Set placeholder initially
    img.src = this.placeholder;
    
    // Use Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage();
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px' // Start loading 50px before image comes into view
      });
      
      observer.observe(img);
    } else {
      // Fallback for older browsers
      this.loadImage();
    }
  }

  private loadImage(): void {
    const img = this.el.nativeElement;
    const tempImg = new Image();
    
    tempImg.onload = () => {
      img.src = this.appLazyImage;
      img.classList.add('loaded');
    };
    
    tempImg.onerror = () => {
      img.src = 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=No+Image';
    };
    
    tempImg.src = this.appLazyImage;
  }
}
