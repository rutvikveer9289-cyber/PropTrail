import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const expectedRoles = route.data?.['roles'] as string[];
  const userRole = authService.getUserRole();

  if (!expectedRoles || expectedRoles.includes(userRole || '')) {
    return true;
  }

  // Role not authorized, redirect to dashboard or login
  toastService.showError('Access Denied: You do not have the permission required to view this page.');
  router.navigate(['/dashboard']);
  return false;
};
