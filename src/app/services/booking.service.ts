import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Booking } from '../models/studio.interface';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly STORAGE_KEY = 'studio_bookings';

  constructor() { }

  createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Observable<Booking> {
    const bookings = this.getAllBookings();
    const newBooking: Booking = {
      ...booking,
      id: Date.now(),
      createdAt: new Date()
    };

    bookings.push(newBooking);
    this.saveBookings(bookings);
    return of(newBooking);
  }

  getAllBookings(): Booking[] {
    const bookings = localStorage.getItem(this.STORAGE_KEY);
    if (!bookings) return [];

    try {
      // Parse bookings and convert date strings back to Date objects
      const parsedBookings = JSON.parse(bookings);
      return parsedBookings.map((booking: any) => ({
        ...booking,
        date: new Date(booking.date),
        createdAt: new Date(booking.createdAt)
      }));
    } catch (error) {
      console.error('Error parsing bookings from localStorage:', error);
      return [];
    }
  }

  private saveBookings(bookings: Booking[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings));
    } catch (error) {
      console.error('Error saving bookings to localStorage:', error);
    }
  }

  getBookingsByUser(email: string): Observable<Booking[]> {
    const bookings = this.getAllBookings();
    return of(bookings.filter(booking => booking.userEmail === email));
  }

  checkAvailability(studioId: number, date: Date, timeSlot: string): Observable<boolean> {
    const bookings = this.getAllBookings();
    const dateString = date.toDateString();

    const isAvailable = !bookings.some(booking => {
      const bookingDateString = new Date(booking.date).toDateString();
      return booking.studioId === studioId &&
        bookingDateString === dateString &&
        booking.timeSlot === timeSlot;
    });

    return of(isAvailable);
  }

  deleteBooking(id: number): Observable<void> {
    const bookings = this.getAllBookings();
    const updatedBookings = bookings.filter(booking => booking.id !== id);
    this.saveBookings(updatedBookings);
    return of(void 0);
  }
}
