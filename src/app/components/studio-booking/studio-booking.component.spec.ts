import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudioBookingComponent } from './studio-booking.component';

describe('StudioBookingComponent', () => {
  let component: StudioBookingComponent;
  let fixture: ComponentFixture<StudioBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudioBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudioBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
