import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';
import { CompanySettingsService } from './core/services/company-settings.service';
import { of } from 'rxjs';

describe('App', () => {
  const mockAuthService = {
    isLoggedIn: () => true,
    getUserRole: () => 'Owner',
    getCurrentUser: () => ({
      firstName: 'Aarav',
      lastName: 'Kumar',
      role: 'Owner',
      email: 'owner@proptrail.com'
    }),
    currentUser$: of({
      firstName: 'Aarav',
      lastName: 'Kumar',
      role: 'Owner',
      email: 'owner@proptrail.com'
    }),
    logout: () => {}
  };

  const mockNotificationService = {
    connect: () => {},
    getUnreadCount: () => of({ count: 0 }),
    getAll: () => of([]),
    markAllRead: () => of(null)
  };

  const mockCompanySettingsService = {
    getSettings: () => of({ companyName: 'PropTrail CRM' })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: CompanySettingsService, useValue: mockCompanySettingsService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render dashboard navigation link', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('nav')?.textContent).toContain('Dashboard');
  });
});

