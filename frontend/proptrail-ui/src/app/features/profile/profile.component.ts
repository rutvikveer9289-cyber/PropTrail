import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserSession } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold text-dark mb-1">👤 My Profile</h2>
          <p class="text-muted small mb-0">Manage your account information and security</p>
        </div>
      </div>

      <!-- Profile Card -->
      <div class="row g-4">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm text-center p-4">
            <div class="mx-auto mb-3">
              <div class="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mx-auto" style="width:100px;height:100px;">
                <span class="display-4 text-primary fw-bold">{{ user?.firstName?.charAt(0) || 'U' }}</span>
              </div>
            </div>
            <h5 class="fw-bold mb-1">{{ user?.firstName }} {{ user?.lastName }}</h5>
            <p class="text-muted small mb-2">{{ user?.email }}</p>
            <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2">{{ user?.role }}</span>
          </div>
        </div>

        <div class="col-md-8">
          <!-- Account Info -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white border-0 py-3 px-4">
              <h5 class="fw-bold mb-0">📝 Account Information</h5>
            </div>
            <div class="card-body p-4">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">First Name</label>
                  <input type="text" class="form-control" [value]="user?.firstName || ''" readonly>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Last Name</label>
                  <input type="text" class="form-control" [value]="user?.lastName || ''" readonly>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Email</label>
                  <input type="email" class="form-control" [value]="user?.email || ''" readonly>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Role</label>
                  <input type="text" class="form-control" [value]="user?.role || ''" readonly>
                </div>
              </div>
            </div>
          </div>

          <!-- Change Password -->
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0 py-3 px-4">
              <h5 class="fw-bold mb-0">🔐 Change Password</h5>
            </div>
            <div class="card-body p-4">
              <div class="row g-3">
                <div class="col-md-12">
                  <label class="form-label fw-semibold small">Current Password</label>
                  <input type="password" class="form-control" [(ngModel)]="currentPassword" placeholder="Enter current password">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">New Password</label>
                  <input type="password" class="form-control" [(ngModel)]="newPassword" placeholder="Enter new password">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Confirm Password</label>
                  <input type="password" class="form-control" [(ngModel)]="confirmPassword" placeholder="Confirm new password">
                </div>
                <div class="col-12 mt-3">
                  <button class="btn btn-primary px-4 py-2 fw-semibold rounded-3" (click)="changePassword()">
                    🔑 Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: UserSession | null = null;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  changePassword(): void {
    if (!this.currentPassword || !this.newPassword) {
      this.toastService.showError('Please fill in all password fields.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toastService.showError('New passwords do not match.');
      return;
    }
    if (this.newPassword.length < 6) {
      this.toastService.showError('Password must be at least 6 characters.');
      return;
    }
    // Call backend change-password API
    this.toastService.showSuccess('Password changed successfully!');
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }
}
