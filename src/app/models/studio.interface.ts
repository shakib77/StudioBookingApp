export interface Coordinates {
  Latitude: number;
  Longitude: number;
}

export interface Location {
  City: string;
  Area: string;
  Address: string;
  Coordinates: Coordinates;
}

export interface Contact {
  Phone: string;
  Email: string;
}

export interface Availability {
  Open: string;
  Close: string;
}

export interface Studio {
  Id: number;
  Name: string;
  Type: string;
  Location: Location;
  Contact: Contact;
  Amenities: string[];
  Description: string;
  PricePerHour: number;
  Currency: string;
  Availability: Availability;
  Rating: number;
  Images: string[];
}

export interface Booking {
  id: number;
  studioId: number;
  studioName: string;
  studioType: string;
  location: string;
  date: Date;
  timeSlot: string;
  userName: string;
  userEmail: string;
  createdAt: Date;
}
