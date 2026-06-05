import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanySettingsService } from '../../core/services/company-settings.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold text-dark mb-1">⚙️ Settings</h2>
          <p class="text-muted small mb-0">Manage your company and application preferences</p>
        </div>
      </div>

      <!-- Company Information -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white border-0 py-3 px-4">
          <h5 class="fw-bold mb-0">🏢 Company Information</h5>
        </div>
        <div class="card-body p-4">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold small">Company Name</label>
              <input type="text" class="form-control" [(ngModel)]="companyName" placeholder="PropTrail Real Estate">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold small">Logo URL</label>
              <input type="text" class="form-control" [(ngModel)]="logoUrl" placeholder="assets/logo.png">
            </div>
          </div>
        </div>
      </div>

      <!-- Theme Settings -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white border-0 py-3 px-4">
          <h5 class="fw-bold mb-0">🎨 Theme Settings</h5>
        </div>
        <div class="card-body p-4">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold small">Primary Theme Color</label>
              <div class="d-flex gap-2 align-items-center">
                <input type="color" class="form-control form-control-color" [(ngModel)]="themeColor" style="width:50px; height:38px;">
                <span class="text-muted small">{{ themeColor }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Branding Email Templates -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white border-0 py-3 px-4">
          <h5 class="fw-bold mb-0">✉️ Email Branding Templates</h5>
        </div>
        <div class="card-body p-4">
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label fw-semibold small">Default Lead Notification Template</label>
              <textarea class="form-control" [(ngModel)]="emailTemplate" rows="4" placeholder="Dear {CustomerName}, thank you for choosing us..."></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="d-flex justify-content-end">
        <button class="btn btn-primary px-5 py-2 fw-semibold rounded-3 shadow-sm" (click)="saveSettings()">
          💾 Save Settings
        </button>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  id: number = 0;
  companyName = 'PropTrail Real Estate';
  logoUrl = 'assets/logo.png';
  themeColor = '#3b82f6';
  emailTemplate = '';
  systemPreferences = '{}';

  constructor(
    private companySettingsService: CompanySettingsService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.companySettingsService.getSettings().subscribe({
      next: (settings) => {
        if (settings) {
          this.id = settings.id;
          this.companyName = settings.companyName;
          this.logoUrl = settings.logoUrl || 'assets/logo.png';
          this.themeColor = settings.themeColor || '#3b82f6';
          this.emailTemplate = settings.emailTemplate || '';
          this.systemPreferences = settings.systemPreferences || '{}';
        }
      },
      error: (err) => console.error(err)
    });
  }

  saveSettings(): void {
    const payload = {
      id: this.id,
      companyName: this.companyName,
      logoUrl: this.logoUrl,
      themeColor: this.themeColor,
      emailTemplate: this.emailTemplate,
      systemPreferences: this.systemPreferences
    };

    this.companySettingsService.updateSettings(payload).subscribe({
      next: () => {
        this.toastService.showSuccess('Branding settings saved successfully!');
      },
      error: (err) => {
        console.error(err);
        this.toastService.showError('Failed to save settings.');
      }
    });
  }
}
