import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsComponent } from './reports.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { of } from 'rxjs';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;

  const mockDashboardData = {
    totalBrokers: 2,
    totalLeads: 10,
    totalProperties: 15,
    totalVisits: 8,
    totalDeals: 6,
    totalRevenue: 500000,
    wonDeals: 3,
    openDeals: 2,
    lostDeals: 1,
    recentLeads: [],
    recentVisits: [],
    recentDeals: [],
    monthlyRevenue: [100000, 200000, 200000, 0, 0, 0],
    leadStatusData: [5, 3, 2],
    activeLeads: 5,
    scheduledVisits: 3,
    monthlyVisits: [2, 3, 3, 0, 0, 0]
  };

  const mockDashboardService = {
    getDashboard: () => of(mockDashboardData)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsComponent],
      providers: [
        { provide: DashboardService, useValue: mockDashboardService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate metrics correctly', () => {
    component.calculateMetrics();
    expect(component.dealConversionRate).toBeCloseTo(50.0); // 3 won / 6 total
    expect(component.averageRevenuePerDeal).toBe(166666.66666666666); // 500000 / 3
    expect(component.leadEngagementRate).toBeCloseTo(80.0); // 8 visits / 10 leads
  });
});
