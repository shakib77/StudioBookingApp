import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar color="primary">
      <span>Studio Booking</span>
      <span class="spacer"></span>
      <button mat-button routerLink="/">Studios</button>
      <button mat-button routerLink="/bookings">My Bookings</button>
    </mat-toolbar>

    <div class="content">
      <router-outlet></router-outlet>
    </div>

    <app-toast></app-toast>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    .content {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
  `],
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, ToastComponent]
})
export class AppComponent {
  title = 'Studio Booking';
}
