import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  NativeDateAdapter,
} from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Observable, of } from 'rxjs';
import { Studio } from '../../models/studio.interface';
import { StudioService } from '../../services/studio.service';
import { ToastService } from '../../services/toast.service';
import { StudioBookingComponent } from '../studio-booking/studio-booking.component';

@Component({
  selector: 'app-studio-list',
  templateUrl: './studio-list.component.html',
  styleUrls: ['./studio-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatPaginatorModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatButtonModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
  ],
})
export class StudioListComponent implements OnInit {
  studios: Studio[] = [];
  filteredStudios: Studio[] = [];
  displayedStudios: Studio[] = [];
  searchTerm: string = '';
  selectedRadius: number = 10;
  isLoading: boolean = true;
  lastKnownLatitude: number | null = null;
  lastKnownLongitude: number | null = null;
  isRadiusSearchActive: boolean = false;

  // Location suggestions
  locationSuggestions: string[] = [];
  filteredLocations: Observable<string[]> = of([]);

  // Pagination properties
  pageSize = 6;
  pageSizeOptions = [3, 6, 9, 12];
  pageIndex = 0;
  totalStudios = 0;

  // Define available radius options
  radiusOptions: number[] = [10, 20, 30, 40, 50];

  constructor(
    private studioService: StudioService,
    private dialog: MatDialog,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadStudios();
  }

  private loadStudios(): void {
    this.isLoading = true;
    this.studioService.getAllStudios().subscribe({
      next: (studios) => {
        // console.log('Loaded studios:', studios);

        // Check if studios have the correct structure
        if (studios && studios.length > 0) {
          const firstStudio = studios[0];
          /* console.log('First studio structure:', {
            hasAvailability: !!firstStudio.Availability,
            availabilityProps: firstStudio.Availability
              ? Object.keys(firstStudio.Availability)
              : 'none',
            studioProps: Object.keys(firstStudio),
          }); */
        }

        this.studios = studios;
        this.filteredStudios = studios;
        this.totalStudios = studios.length;
        this.updateDisplayedStudios();
        this.initializeLocationSuggestions();
        this.isLoading = false;
        // this.toastService.info(`Loaded ${studios.length} studios`);
      },
      error: (err) => {
        console.error('Error loading studios:', err);
        this.toastService.error('Error loading studios');
        this.isLoading = false;
      },
    });
  }

  private initializeLocationSuggestions(): void {
    // Get unique areas and cities
    const areas = this.studioService.getUniqueAreas();
    const cities = this.studioService.getUniqueCities();

    // Combine and remove duplicates
    this.locationSuggestions = [...new Set([...areas, ...cities])];

    // Initialize filtered locations
    this.filterLocations();
  }

  filterLocations(): void {
    this.filteredLocations = of(
      this.searchTerm
        ? this.locationSuggestions.filter((location) =>
            location.toLowerCase().includes(this.searchTerm.toLowerCase())
          )
        : this.locationSuggestions
    );
  }

  onSearchInput(): void {
    this.filterLocations();
  }

  onLocationSelected(location: string): void {
    this.searchTerm = location;
    this.onSearch(location);
  }

  updateDisplayedStudios(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedStudios = this.filteredStudios.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayedStudios();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.isLoading = true;

    // Reset radius search when performing a regular search
    this.isRadiusSearchActive = false;
    this.lastKnownLatitude = null;
    this.lastKnownLongitude = null;

    if (term) {
      this.studioService.searchByLocation(term).subscribe((studios) => {
        this.filteredStudios = studios;
        this.totalStudios = studios.length;
        this.pageIndex = 0;
        this.updateDisplayedStudios();
        this.isLoading = false;
      });
    } else {
      this.filteredStudios = this.studios;
      this.totalStudios = this.studios.length;
      this.pageIndex = 0;
      this.updateDisplayedStudios();
      this.isLoading = false;
    }
  }

  resetSearch(): void {
    this.searchTerm = '';
    this.isLoading = true;
    this.filteredStudios = this.studios;
    this.totalStudios = this.studios.length;
    this.pageIndex = 0;

    // Reset radius search parameters
    this.selectedRadius = 10;
    this.lastKnownLatitude = null;
    this.lastKnownLongitude = null;
    this.isRadiusSearchActive = false;

    this.updateDisplayedStudios();
    this.filterLocations();
    this.isLoading = false;
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.lastKnownLatitude = position.coords.latitude;
          this.lastKnownLongitude = position.coords.longitude;
          this.onRadiusSearch(
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (error) => {
          this.toastService.error(
            'Unable to get your location. Please check your location settings.'
          );
        }
      );
    } else {
      this.toastService.warning(
        'Geolocation is not supported by your browser.'
      );
    }
  }

  onRadiusSearch(latitude: number, longitude: number): void {
    this.isLoading = true;
    this.isRadiusSearchActive = true;
    this.studioService
      .searchByRadius(latitude, longitude, this.selectedRadius)
      .subscribe((studios) => {
        this.filteredStudios = studios;
        this.totalStudios = studios.length;
        this.pageIndex = 0; // Reset to first page on new search
        this.updateDisplayedStudios();
        this.isLoading = false;
      });
  }

  openBookingModal(studio: Studio): void {
    this.toastService.info(`Opening booking for ${studio.Name}`);

    if (!studio) {
      this.toastService.error('Cannot open booking modal: studio is undefined');
      return;
    }

    try {
      // Create a deep copy of the studio object to avoid modifying the original
      const studioForBooking = JSON.parse(JSON.stringify(studio));

      // Make sure we have a valid studio object with all required properties
      if (!studioForBooking.Availability) {
        this.toastService.warning(
          'Studio is missing Availability data. Adding default values.'
        );
        studioForBooking.Availability = {
          Open: '09:00',
          Close: '18:00',
        };
      } else if (
        !studioForBooking.Availability.Open ||
        !studioForBooking.Availability.Close
      ) {
        this.toastService.warning(
          'Studio Availability is missing Open/Close times. Adding default values.'
        );
        studioForBooking.Availability.Open =
          studioForBooking.Availability.Open || '09:00';
        studioForBooking.Availability.Close =
          studioForBooking.Availability.Close || '18:00';
      }

      const dialogRef = this.dialog.open(StudioBookingComponent, {
        width: '500px',
        data: { studio: studioForBooking },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          // this.toastService.success('Booking successful!');
          console.log('booking successfully!')
        }
      });
    } catch (error) {
      this.toastService.error('Error opening booking dialog');
    }
  }

  getStars(rating: number): number[] {
    // console.log({rating});
    // Ensure rating is a valid number between 0 and 5
    const validRating = Math.min(Math.max(0, Math.round(rating || 0)), 5);
    return Array(validRating).fill(0);
  }

  onRadiusChange(radius: number): void {
    this.selectedRadius = radius;
    // If we already have coordinates, perform a new search with the updated radius
    if (this.lastKnownLatitude && this.lastKnownLongitude) {
      this.onRadiusSearch(this.lastKnownLatitude, this.lastKnownLongitude);
    }
  }
}
