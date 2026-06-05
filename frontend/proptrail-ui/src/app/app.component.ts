import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter, distinctUntilChanged } from 'rxjs/operators';

import { AuthService } from './core/services/auth.service';
import { NotificationService, AppNotification } from './core/services/notification.service';
import { CompanySettingsService } from './core/services/company-settings.service';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';

interface NavItem {
  route: string;
  icon: string;
  label: string;
  roles?: string[]; // if omitted = visible to all
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule, ToastContainerComponent, LoadingSpinnerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  // ── Sidebar State ─────────────────────────────────────
  sidebarCollapsed = false;

  // ── Breadcrumb ────────────────────────────────────────
  currentPageLabel = 'Dashboard';

  // ── Notification Panel ────────────────────────────────
  unreadCount = 0;
  notifications: AppNotification[] = [];
  showNotificationPanel = false;

  // ── Quick-Add Menu ────────────────────────────────────
  showQuickAdd = false;

  // ── User Dropdown Panel ──────────────────────────────
  showUserDropdown = false;

  // ── Search ────────────────────────────────────────────
  globalSearch = '';

  // ── Custom branding from backend settings ────────────
  companyBrandingName = 'PropTrail CRM';
  companyLogoUrl = '/assets/images/proptrail-logo.png';

  // ── Pre-computed nav (avoids function call in template = no infinite loop) ──
  visibleNavGroups: NavGroup[] = [];

  // ── Nav Structure ─────────────────────────────────────
  readonly navGroups: NavGroup[] = [
    {
      label: 'Overview',
      items: [
        { route: '/dashboard', icon: 'dashboard', label: 'Dashboard', roles: ['Owner', 'Broker', 'Receptionist'] },
      ]
    },
    {
      label: 'Operations',
      items: [
        { route: '/property', icon: 'apartment',      label: 'Properties' },
        { route: '/lead',     icon: 'groups',          label: 'Leads', roles: ['Owner', 'Broker', 'Receptionist'] },
        { route: '/visit',    icon: 'calendar_today',  label: 'Visits', roles: ['Owner', 'Broker', 'Receptionist'] },
        { route: '/deal',     icon: 'handshake',       label: 'Deals', roles: ['Owner', 'Broker', 'Receptionist'] },
        { route: '/calendar', icon: 'calendar_month',  label: 'Calendar', roles: ['Owner', 'Broker', 'Receptionist'] },
        { route: '/documents',icon: 'folder_open',     label: 'Documents', roles: ['Owner', 'Broker', 'Receptionist'] },
      ]
    },
    {
      label: 'My Portal',
      items: [
        { route: '/my-visits', icon: 'calendar_today', label: 'My Visits', roles: ['Buyer'] },
        { route: '/my-deals', icon: 'handshake', label: 'My Deals', roles: ['Buyer'] },
        { route: '/my-documents', icon: 'folder_open', label: 'My Documents', roles: ['Buyer'] },
      ]
    },
    {
      label: 'Directory',
      items: [
        { route: '/owner',  icon: 'real_estate_agent', label: 'Owners',  roles: ['Owner', 'Broker', 'Receptionist'] },
        { route: '/broker', icon: 'badge',             label: 'Brokers', roles: ['Owner'] },
        { route: '/broker-performance', icon: 'leaderboard', label: 'Leaderboard', roles: ['Owner', 'Broker', 'Receptionist'] },
      ]
    },
    {
      label: 'Intelligence',
      items: [
        { route: '/reports', icon: 'bar_chart', label: 'Reports', roles: ['Owner', 'Broker', 'Receptionist'] },
      ]
    },
    {
      label: 'Admin',
      items: [
        { route: '/users',    icon: 'manage_accounts', label: 'Users',    roles: ['Owner'] },
        { route: '/settings', icon: 'settings',        label: 'Settings', roles: ['Owner', 'Broker', 'Receptionist'] },
        { route: '/profile',  icon: 'account_circle',  label: 'Profile' },
      ]
    },
  ];

  private readonly routeLabelMap: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/property':  'Properties',
    '/lead':      'Leads',
    '/visit':     'Visits',
    '/deal':      'Deals',
    '/owner':     'Owners',
    '/broker':    'Brokers',
    '/reports':   'Reports',
    '/users':     'Users',
    '/settings':  'Settings',
    '/profile':   'My Profile',
    '/calendar':  'Calendar',
    '/documents': 'Documents Hub',
    '/broker-performance': 'Broker Performance',
  };

  private getLabelForUrl(url: string): string {
    const path = url.split('?')[0].split('#')[0];
    if (this.routeLabelMap[path]) {
      return this.routeLabelMap[path];
    }
    
    // Dynamic segments fallback
    if (path.startsWith('/lead/')) return 'Leads';
    if (path.startsWith('/property/')) return 'Properties';
    if (path.startsWith('/visit/')) return 'Visits';
    if (path.startsWith('/deal/')) return 'Deals';
    if (path.startsWith('/owner/')) return 'Owners';
    if (path.startsWith('/broker/')) return 'Brokers';
    
    return 'PropTrail';
  }

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private companySettingsService: CompanySettingsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Restore sidebar state
    const saved = localStorage.getItem('pt_sidebar_collapsed');
    if (saved !== null) {
      this.sidebarCollapsed = saved === 'true';
    }

    // Build initial nav groups based on current role
    this.updateVisibleNavGroups();

    this.companySettingsService.getSettings().subscribe({
      next: (settings) => {
        if (settings) {
          setTimeout(() => {
            if (settings.companyName) {
              this.companyBrandingName = settings.companyName;
            }
            if (settings.logoUrl) {
              this.companyLogoUrl = settings.logoUrl.startsWith('/') ? settings.logoUrl : '/' + settings.logoUrl;
            }
            this.cdr.detectChanges();
          }, 0);
        }
      },
      error: (err) => console.error('Failed to load branding settings:', err)
    });

    // Track route for breadcrumb
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.currentPageLabel = this.getLabelForUrl(e.urlAfterRedirects);
      this.showNotificationPanel = false;
      this.showQuickAdd = false;
      this.showUserDropdown = false;
      this.cdr.detectChanges();
    });

    // Initial page label
    this.currentPageLabel = this.getLabelForUrl(this.router.url);

    // Use distinctUntilChanged to prevent duplicate calls when BehaviorSubject
    // emits the same user reference multiple times
    this.authService.currentUser$.pipe(
      distinctUntilChanged()
    ).subscribe(user => {
      this.updateVisibleNavGroups();
      if (user) {
        this.notificationService.connect();
        this.loadNotifications();
      }
    });
  }

  // ── Sidebar ──────────────────────────────────────────
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem('pt_sidebar_collapsed', String(this.sidebarCollapsed));
  }

  // ── Nav Filtering by Role ────────────────────────────
  // Stored as a property so Angular doesn't call this on every change detection
  // cycle (which would cause NG0103 infinite loop from new array references)
  updateVisibleNavGroups(): void {
    const role = this.authService.getUserRole();
    this.visibleNavGroups = this.navGroups.map(group => ({
      ...group,
      items: group.items.filter(item =>
        !item.roles || item.roles.includes(role ?? '')
      )
    })).filter(group => group.items.length > 0);
  }

  // ── Notifications ─────────────────────────────────────
  loadNotifications(): void {
    this.notificationService.getUnreadCount().subscribe(res => {
      this.unreadCount = res.count;
    });
    this.notificationService.getAll().subscribe(list => {
      this.notifications = list;
    });
  }

  toggleNotifications(): void {
    this.showNotificationPanel = !this.showNotificationPanel;
    this.showQuickAdd = false;
  }

  markAllRead(): void {
    this.notificationService.markAllRead().subscribe(() => {
      this.unreadCount = 0;
      this.notifications.forEach(n => n.isRead = true);
    });
  }

  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      'Success': 'check_circle',
      'Warning': 'warning',
      'Error':   'error',
      'Info':    'info',
    };
    return icons[type] ?? 'notifications';
  }

  getNotificationColor(type: string): string {
    const colors: Record<string, string> = {
      'Success': '#16a34a',
      'Warning': '#d97706',
      'Error':   '#dc2626',
      'Info':    '#2563eb',
    };
    return colors[type] ?? '#64748b';
  }

  // ── Quick Add ─────────────────────────────────────────
  toggleQuickAdd(): void {
    this.showQuickAdd = !this.showQuickAdd;
    this.showNotificationPanel = false;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.showQuickAdd = false;
  }

  // ── Global click outside panels ───────────────────────
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notif-wrapper') && !target.closest('.quick-add-wrapper')) {
      this.showNotificationPanel = false;
      this.showQuickAdd = false;
    }
    if (!target.closest('.user-dropdown')) {
      this.showUserDropdown = false;
    }
  }

  // ── Auth ──────────────────────────────────────────────
  logout(): void {
    this.authService.logout();
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  getInitials(): string {
    const user = this.getCurrentUser();
    if (!user) return 'U';
    return `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase();
  }
}