import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { Studio } from '../models/studio.interface';

@Injectable({
  providedIn: 'root'
})
export class StudioService {
  private studios: Studio[] = [];
  private studiosLoaded = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.loadStudios();
  }

  private loadStudios(): void {
    this.http.get<{ Studios: Studio[] }>('assets/studio-mock-data.json')
      .subscribe(data => {
        // Ensure all studios have the required properties
        this.studios = data.Studios.map(studio => {
          // Add default Availability if missing
          if (!studio.Availability) {
            console.warn(`Studio ${studio.Id} (${studio.Name}) is missing Availability property. Adding default.`);
            studio.Availability = {
              Open: '09:00',
              Close: '18:00'
            };
          }
          return studio;
        });

        // console.log('Studios loaded with availability check:', this.studios);
        this.studiosLoaded.next(true);
      });
  }

  getAllStudios(): Observable<Studio[]> {
    return this.studiosLoaded.pipe(
      switchMap(loaded => {
        if (loaded) {
          return of(this.studios);
        } else {
          return this.http.get<{ Studios: Studio[] }>('assets/studio-mock-data.json').pipe(
            map(data => data.Studios),
            tap(studios => {
              this.studios = studios;
              this.studiosLoaded.next(true);
            })
          );
        }
      })
    );
  }

  searchByLocation(area: string): Observable<Studio[]> {
    return of(this.studios.filter(studio =>
      studio.Location.Area.toLowerCase().includes(area.toLowerCase()) ||
      studio.Location.City.toLowerCase().includes(area.toLowerCase())
    ));
  }

  searchByRadius(latitude: number, longitude: number, radius: number): Observable<Studio[]> {
    return of(this.studios.filter(studio => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        studio.Location.Coordinates.Latitude,
        studio.Location.Coordinates.Longitude
      );
      return distance <= radius;
    }));
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  getStudioById(id: number): Observable<Studio | undefined> {
    return of(this.studios.find(studio => studio.Id === id));
  }

  getUniqueAreas(): string[] {
    return [...new Set(this.studios.map(studio => studio.Location.Area))];
  }

  getUniqueCities(): string[] {
    return [...new Set(this.studios.map(studio => studio.Location.City))];
  }
}
