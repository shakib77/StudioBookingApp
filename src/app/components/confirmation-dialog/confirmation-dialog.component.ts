import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirmation-dialog">
      <h2 mat-dialog-title>
        <mat-icon class="title-icon">{{
          data.icon || 'help_outline'
        }}</mat-icon>
        {{ data.title }}
      </h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" class="cancel-button">
          {{ data.cancelText }}
        </button>
        <button
          mat-raised-button
          color="accent"
          (click)="onConfirm()"
          class="confirm-button"
        >
          {{ data.confirmText }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .confirmation-dialog {
        padding: 0;
        animation: fadeIn 0.3s ease-out;
        background-color: white;
        color: white;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      mat-dialog-content {
        padding: 16px 0;
        min-width: 300px;
      }

      mat-dialog-actions {
        padding: 16px;
        margin-bottom: 0;
      }

      h2 {
        margin-top: 0;
        display: flex;
        align-items: center;
        color: white;
      }

      .title-icon {
        margin-right: 8px;
        color: white;
      }

      .confirm-button {
        transition: all 0.2s ease;
      }

      .confirm-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      p {
        font-size: 16px;
        line-height: 1.5;
        color: #000;
      }

      ::ng-deep .mat-mdc-dialog-container {
        --mdc-dialog-container-color: white;
      }

      ::ng-deep .mat-mdc-dialog-surface {
        background-color: #614caf !important;
        border-radius: 12px !important;
      }

      ::ng-deep .mdc-dialog__title {
        color: #000 !important;
      }

      ::ng-deep .mdc-dialog__content {
        color: #000 !important;
      }

      .cancel-button {
        background-color: red;
      }
      .mat-mdc-dialog-title {
        color: #000 !important;
      }
      .mat-icon {
        color: red !important;
      }
    `,
  ],
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      message: string;
      confirmText: string;
      cancelText: string;
      icon?: string;
      confirmColor?: 'primary' | 'accent' | 'warn';
    }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
