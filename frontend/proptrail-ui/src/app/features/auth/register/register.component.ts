import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  mobile = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';

  showPassword = false;
  showConfirmPassword = false;
  acceptTerms = false;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private loaderService: LoaderService,
    private router: Router
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

   

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

     if (!this.acceptTerms) {
      this.errorMessage = 'Please accept the terms and conditions.';
      return;
    }

    this.errorMessage = '';
    this.loaderService.show();

    const registrationData = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      mobile: this.mobile,
      password: this.password
    };

    this.authService.register(registrationData).subscribe({
      next: (res) => {
        this.loaderService.hide();
        this.toastService.showSuccess(res.message || 'Registration successful! Please log in.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loaderService.hide();
        this.errorMessage = err.error?.message || 'Registration failed. Please check inputs.';
        this.toastService.showError(this.errorMessage);
      }
    });
  }
}
