import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) 
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [roleGuard],
    data: { roles: ['Owner', 'Broker', 'Receptionist'] }
  },
  {
    path: 'property',
    loadComponent: () => import('./features/property/property/property.component').then(m => m.PropertyComponent),
    canActivate: [authGuard] // Anyone logged in can browse properties
  },
  {
    path: 'broker',
    loadComponent: () => import('./features/broker/broker-list/broker-list.component').then(m => m.BrokerListComponent),
    canActivate: [roleGuard],
    data: { roles: ['Owner'] }
  },
  {
    path: 'lead',
    loadComponent: () => import('./features/lead/lead-list/lead-list.component').then(m => m.LeadListComponent),
    canActivate: [roleGuard],
    data: { roles: ['Owner', 'Broker', 'Receptionist'] }
  },
  {
    path: 'lead/:id',
    loadComponent: () => import('./features/lead/lead-detail/lead-detail.component').then(m => m.LeadDetailComponent),
    canActivate: [roleGuard],
    data: { roles: ['Owner', 'Broker', 'Receptionist'] }
  },
  {
    path: 'visit',
    loadComponent: () => import('./features/visit/visit.component/visit.component').then(m => m.VisitComponent),
    canActivate: [roleGuard],
    data: { roles: ['Owner', 'Broker', 'Receptionist'] }
  },
  {
    path: 'my-visits',
    loadComponent: () => import('./features/visit/my-visits/my-visits.component').then(m => m.MyVisitsComponent),
    canActivate: [roleGuard],
    data: { roles: ['Buyer'] }
  },
  {
    path: 'deal',
    loadComponent: () => import('./features/deal/deal/deal.component').then(m => m.DealComponent),
    canActivate: [roleGuard],
    data: { roles: ['Owner', 'Broker', 'Receptionist'] }
  },
  {
    path: 'my-deals',
    loadComponent: () => import('./features/deal/my-deals/my-deals.component').then(m => m.MyDealsComponent),
    canActivate: [roleGuard],
    data: { roles: ['Buyer'] }
  },
  {
    path: 'owner',
    loadComponent: () => import('./features/owner/owner-list/owner-list.component').then(m => m.OwnerListComponent),
    canActivate: [roleGuard],
    data: { roles: ['Owner', 'Broker', 'Receptionist'] }
  },
  {
    path: 'reports',
    loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent),
    canActivate: [roleGuard],
    data: { roles: ['Owner', 'Broker', 'Receptionist'] }
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [roleGuard],
    data: { roles: ['Owner'] }
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [roleGuard],
    data: { roles: ['Owner', 'Broker', 'Receptionist'] }
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'calendar',
    loadComponent: () => import('./features/calendar/calendar.component').then(m => m.CalendarComponent),
    canActivate: [roleGuard],
    data: { roles: ['Owner', 'Broker', 'Receptionist'] }
  },
  {
    path: 'documents',
    loadComponent: () => import('./features/documents/documents-hub.component').then(m => m.DocumentsHubComponent),
    canActivate: [roleGuard],
    data: { roles: ['Owner', 'Broker', 'Receptionist'] }
  },
  {
    path: 'my-documents',
    loadComponent: () => import('./features/documents/my-documents/my-documents.component').then(m => m.MyDocumentsComponent),
    canActivate: [roleGuard],
    data: { roles: ['Buyer'] }
  },
  {
    path: 'broker-performance',
    loadComponent: () => import('./features/broker/broker-performance/broker-performance.component').then(m => m.BrokerPerformanceComponent),
    canActivate: [roleGuard],
    data: { roles: ['Owner', 'Broker', 'Receptionist'] }
  }
];