import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';
import { CompanySettingsService } from '../../../core/services/company-settings.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  companyBrandingName = 'PropTrail';
  companyLogoUrl = '/assets/images/proptrail-logo.png';
  email = '';
  password = '';
  rememberMe = false;
  errorMessage = '';
  showPassword = false;
  isLoading = false;


  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private loaderService: LoaderService,
    private router: Router,
    private companySettingsService: CompanySettingsService
  ) {
    // If already logged in, redirect
    if (this.authService.isLoggedIn()) {
      const role = this.authService.getUserRole();
      if (role === 'Buyer') {
        this.router.navigate(['/property']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    }
  }

  ngOnInit(): void {
    this.companySettingsService.getSettings().subscribe({
      next: (settings) => {
        if (settings) {
          if (settings.companyName) {
            this.companyBrandingName = settings.companyName;
          }
          if (settings.logoUrl) {
            this.companyLogoUrl = settings.logoUrl.startsWith('/') ? settings.logoUrl : '/' + settings.logoUrl;
          }
        }
      },
      error: (err) => console.error('Failed to load company settings on login page:', err)
    });
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;
    this.loaderService.show();

    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        this.loaderService.hide();
        this.isLoading = false;
        this.toastService.showSuccess(`Welcome back, ${user.firstName}! Logged in as ${user.role}.`);
        if (user.role === 'Buyer') {
          this.router.navigate(['/property']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loaderService.hide();
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Authentication failed. Please check credentials.';
        this.toastService.showError(this.errorMessage);
      }
    });
  }

  quickFill(role: string) {
    if (role === 'Owner') {
      this.email = 'owner@proptrail.com';
    } else if (role === 'Broker') {
      this.email = 'broker@proptrail.com';
    } else if (role === 'Receptionist') {
      this.email = 'staff@proptrail.com';
    }
    this.password = 'password123';
    this.errorMessage = '';
  }

  forgotPassword() {
    if (!this.email) {
      this.toastService.showError("Please enter your work email to reset password.");
      return;
    }
    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => this.toastService.showSuccess(res.message || "Reset link sent."),
      error: (err) => this.toastService.showError("Failed to request password reset.")
    });
  }
}
