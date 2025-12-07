import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent implements OnInit {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'info' | 'warning' = 'info';
  @Input() duration: number = 3000;
  
  isVisible = false;
  isClosing = false;

  ngOnInit(): void {
    // Trigger entrance animation
    setTimeout(() => {
      this.isVisible = true;
    }, 100);

    // Auto close after duration
    if (this.duration > 0) {
      setTimeout(() => {
        this.close();
      }, this.duration);
    }
  }

  close(): void {
    this.isClosing = true;
    setTimeout(() => {
      this.isVisible = false;
    }, 300);
  }

  getIconClass(): string {
    const icons = {
      success: 'text-green-500',
      error: 'text-red-500',
      warning: 'text-yellow-500',
      info: 'text-blue-500'
    };
    return icons[this.type] || icons.info;
  }

  getBgClass(): string {
    const backgrounds = {
      success: 'bg-green-50 border-green-200',
      error: 'bg-red-50 border-red-200',
      warning: 'bg-yellow-50 border-yellow-200',
      info: 'bg-blue-50 border-blue-200'
    };
    return backgrounds[this.type] || backgrounds.info;
  }
}
