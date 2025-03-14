import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { ToastData, ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toasts; let i = index"
        class="toast"
        [ngClass]="toast.type"
        [@toastAnimation]="toast.state"
      >
        <div class="toast-icon">
          <mat-icon *ngIf="toast.type === 'success'">check_circle</mat-icon>
          <mat-icon *ngIf="toast.type === 'error'">error</mat-icon>
          <mat-icon *ngIf="toast.type === 'info'">info</mat-icon>
          <mat-icon *ngIf="toast.type === 'warning'">warning</mat-icon>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <div class="toast-close" (click)="removeToast(i)">
          <mat-icon>close</mat-icon>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 350px;
      }

      .toast {
        display: flex;
        align-items: center;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        color: white;
        min-width: 300px;
      }

      .toast.success {
        background-color: #4caf50;
      }

      .toast.error {
        background-color: #f44336;
      }

      .toast.info {
        background-color: #2196f3;
      }

      .toast.warning {
        background-color: #ff9800;
      }

      .toast-icon {
        margin-right: 12px;
      }

      .toast-message {
        flex: 1;
        font-size: 14px;
      }

      .toast-close {
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.2s;
      }

      .toast-close:hover {
        opacity: 1;
      }
    `,
  ],
  animations: [
    trigger('toastAnimation', [
      state(
        'visible',
        style({
          transform: 'translateX(0)',
          opacity: 1,
        })
      ),
      state(
        'hidden',
        style({
          transform: 'translateX(100%)',
          opacity: 0,
        })
      ),
      transition('hidden => visible', [animate('300ms ease-out')]),
      transition('visible => hidden', [animate('300ms ease-in')]),
    ]),
  ],
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Array<ToastData & { state: 'visible' | 'hidden'; timerId?: any }> =
    [];
  private subscription: Subscription = new Subscription();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toast$.subscribe((toast) => {
      this.showToast(toast);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.toasts.forEach((toast) => {
      if (toast.timerId) {
        clearTimeout(toast.timerId);
      }
    });
  }

  showToast(toast: ToastData): void {
    const newToast = {
      ...toast,
      state: 'visible' as const,
    };

    this.toasts.push(newToast);

    // Set timer to remove toast
    const index = this.toasts.length - 1;
    newToast.timerId = setTimeout(() => {
      this.hideToast(index);
    }, toast.duration || 3000);
  }

  hideToast(index: number): void {
    if (index >= 0 && index < this.toasts.length) {
      this.toasts[index].state = 'hidden';

      // Remove toast after animation completes
      setTimeout(() => {
        this.removeToast(index);
      }, 300);
    }
  }

  removeToast(index: number): void {
    if (index >= 0 && index < this.toasts.length) {
      if (this.toasts[index].timerId) {
        clearTimeout(this.toasts[index].timerId);
      }
      this.toasts.splice(index, 1);
    }
  }
}
