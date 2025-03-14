import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/studio.interface';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-booking-list',
  templateUrl: './booking-list.component.html',
  styleUrls: ['./booking-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ]
})
export class BookingListComponent implements OnInit {
  displayedColumns: string[] = ['studioName', 'location', 'date', 'timeSlot', 'userName', 'userEmail', 'actions'];
  bookings: Booking[] = [];

  constructor(
    private bookingService: BookingService,
    private dialog: MatDialog,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  private loadBookings(): void {
    this.bookings = this.bookingService.getAllBookings();
  }

  onDeleteBooking(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      panelClass: 'custom-dialog-container',
      data: {
        title: 'Confirm Deletion',
        message: 'Are you sure you want to delete this booking? This action cannot be undone.',
        confirmText: 'Yes, Delete',
        cancelText: 'Cancel',
        icon: 'delete_forever',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.bookingService.deleteBooking(id).subscribe(() => {
          this.toastService.success('Booking deleted successfully');
          this.loadBookings();
        });
      }
    });
  }

  formatDate(date: Date | string): string {
    try {
      return new Date(date).toLocaleDateString();
    } catch (error) {
      this.toastService.error('Error formatting date');
      return 'Invalid date';
    }
  }
}
