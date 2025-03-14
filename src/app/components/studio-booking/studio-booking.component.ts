import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  NativeDateAdapter,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Studio } from '../../models/studio.interface';
import { BookingService } from '../../services/booking.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ToastService } from '../../services/toast.service';

interface BookingForm {
  date: Date;
  timeSlot: string;
  duration: number;
  notes: string;
  userName: string;
  userEmail: string;
}

@Component({
  selector: 'app-studio-booking',
  templateUrl: './studio-booking.component.html',
  styleUrls: ['./studio-booking.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
  ],
})
export class StudioBookingComponent implements OnInit {
  formData: BookingForm = {
    date: new Date(),
    timeSlot: '',
    duration: 1,
    notes: '',
    userName: '',
    userEmail: '',
  };

  timeSlots: string[] = [];
  minDate = new Date();
  maxDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
  errorMessage: string = '';

  constructor(
    public dialogRef: MatDialogRef<StudioBookingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { studio: Studio },
    private bookingService: BookingService,
    private dialog: MatDialog,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Create default time slots if studio data is missing
    if (!this.data || !this.data.studio) {
      this.errorMessage = 'Error: Studio data is missing';
      this.createDefaultTimeSlots();
      return;
    }

    // Check if Availability is present
    if (!this.data.studio.Availability) {
      this.errorMessage = 'Warning: Studio availability data is missing. Using default hours.';

      // Add default Availability
      this.data.studio.Availability = {
        Open: '09:00',
        Close: '18:00'
      };
    }

    this.generateTimeSlots();
  }

  private createDefaultTimeSlots(): void {
    // Create some default time slots from 9 AM to 6 PM
    const openTime = new Date();
    openTime.setHours(9, 0, 0);

    const closeTime = new Date();
    closeTime.setHours(18, 0, 0);

    while (openTime < closeTime) {
      this.timeSlots.push(
        openTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
      openTime.setMinutes(openTime.getMinutes() + 60);
    }
  }

  private generateTimeSlots(): void {
    try {
      if (!this.data || !this.data.studio || !this.data.studio.Availability) {
        console.error('Studio data or availability is missing:', this.data);
        this.errorMessage = 'Error: Studio availability data is missing';
        this.createDefaultTimeSlots();
        return;
      }

      // Ensure Open and Close properties exist
      if (!this.data.studio.Availability.Open || !this.data.studio.Availability.Close) {
        console.error('Studio Availability is missing Open/Close times:', this.data.studio.Availability);
        this.data.studio.Availability.Open = this.data.studio.Availability.Open || '09:00';
        this.data.studio.Availability.Close = this.data.studio.Availability.Close || '18:00';
      }

      const [openHour, openMinute] =
        this.data.studio.Availability.Open.split(':').map(Number);
      const [closeHour, closeMinute] =
        this.data.studio.Availability.Close.split(':').map(Number);

      const openTime = new Date();
      openTime.setHours(openHour, openMinute, 0);

      const closeTime = new Date();
      closeTime.setHours(closeHour, closeMinute, 0);

      // Ensure valid time range
      if (openTime >= closeTime) {
        console.error('Invalid time range:', { openTime, closeTime });
        this.errorMessage = 'Error: Invalid studio hours';
        this.createDefaultTimeSlots();
        return;
      }

      while (openTime < closeTime) {
        this.timeSlots.push(
          openTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })
        );
        openTime.setMinutes(openTime.getMinutes() + 60);
      }
    } catch (error) {
      console.error('Error generating time slots:', error);
      this.errorMessage = 'Error: Could not generate time slots';
      this.createDefaultTimeSlots();
    }
  }

  // Add this method to validate email
  validateEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  async onSubmit(): Promise<void> {
    // Validate email before submission
    if (!this.validateEmail(this.formData.userEmail)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    if (
      !this.formData.date ||
      !this.formData.timeSlot ||
      !this.formData.duration ||
      !this.formData.userName ||
      !this.formData.userEmail
    ) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    try {
      // Convert to a proper date object to ensure it's serialized correctly
      const bookingDate = new Date(this.formData.date);

      const isAvailable = await new Promise<boolean>((resolve) => {
        this.bookingService
          .checkAvailability(
            this.data.studio.Id,
            bookingDate,
            this.formData.timeSlot
          )
          .subscribe((available) => resolve(available));
      });

      if (!isAvailable) {
        this.errorMessage =
          'This time slot is not available. Please choose another time.';
        return;
      }

      // Open confirmation dialog
      const confirmDialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '450px',
        panelClass: 'custom-dialog-container',
        data: {
          title: 'Confirm Booking',
          message: `Are you sure you want to book ${this.data.studio.Name} on ${bookingDate.toLocaleDateString()} at ${this.formData.timeSlot} for ${this.formData.duration} hour(s)?`,
          confirmText: 'Yes, Book Now',
          cancelText: 'Cancel',
          icon: 'event_available',
          confirmColor: 'primary'
        }
      });

      confirmDialogRef.afterClosed().subscribe(confirmed => {
        if (confirmed) {
          this.processBooking(bookingDate);
        }
      });
    } catch (error) {
      console.error('Error in booking process:', error);
      this.errorMessage = 'An unexpected error occurred. Please try again.';
    }
  }

  private processBooking(bookingDate: Date): void {
    const booking = {
      studioId: this.data.studio.Id,
      studioName: this.data.studio.Name,
      studioType: this.data.studio.Type,
      location: `${this.data.studio.Location.Area}, ${this.data.studio.Location.City}`,
      date: bookingDate,
      timeSlot: this.formData.timeSlot,
      duration: this.formData.duration,
      notes: this.formData.notes,
      userName: this.formData.userName,
      userEmail: this.formData.userEmail,
    };

    this.bookingService.createBooking(booking).subscribe(
      (result) => {
        this.toastService.success('Booking created successfully!');
        this.dialogRef.close(result);
      },
      (error) => {
        this.toastService.error('An error occurred while creating the booking. Please try again.');
        this.errorMessage =
          'An error occurred while creating the booking. Please try again.';
      }
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
