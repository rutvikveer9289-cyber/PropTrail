import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../../core/services/dashboard.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  const mockDashboardData = {
    wonDeals: 5,
    openDeals: 10,
    lostDeals: 2,
    monthlyRevenue: [1000, 2000, 1500, 3000, 2500, 4000],
    leadStatusData: [10, 20, 30]
  };

  const mockDashboardService = {
    getFilteredSummary: () => of(mockDashboardData),
    getDashboardSummary: () => of(mockDashboardData),
    getDashboard: () => of(mockDashboardData),
    getFollowUpReminders: () => of([])
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: DashboardService, useValue: mockDashboardService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


