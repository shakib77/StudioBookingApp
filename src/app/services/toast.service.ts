import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastData {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  timerId?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<ToastData>();
  public toast$ = this.toastSubject.asObservable();

  constructor() {}

  /**
   * Show a success toast notification
   * @param message The message to display
   * @param duration Duration in milliseconds (default: 3000)
   */
  success(message: string, duration: number = 3000): void {
    this.show({
      message,
      type: 'success',
      duration
    });
  }

  /**
   * Show an error toast notification
   * @param message The message to display
   * @param duration Duration in milliseconds (default: 5000)
   */
  error(message: string, duration: number = 5000): void {
    this.show({
      message,
      type: 'error',
      duration
    });
  }

  /**
   * Show an info toast notification
   * @param message The message to display
   * @param duration Duration in milliseconds (default: 3000)
   */
  info(message: string, duration: number = 3000): void {
    this.show({
      message,
      type: 'info',
      duration
    });
  }

  /**
   * Show a warning toast notification
   * @param message The message to display
   * @param duration Duration in milliseconds (default: 4000)
   */
  warning(message: string, duration: number = 4000): void {
    this.show({
      message,
      type: 'warning',
      duration
    });
  }

  /**
   * Show a toast notification
   * @param toast The toast data
   */
  private show(toast: ToastData): void {
    this.toastSubject.next(toast);
  }
}
