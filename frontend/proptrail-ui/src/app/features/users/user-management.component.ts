import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../core/services/toast.service';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  role: string;
  password?: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="page-title mb-1">👮 User Management</h2>
          <p class="page-subtitle mb-0">Create and manage broker accounts and access roles</p>
        </div>
        <div class="d-flex align-items-center gap-3">
          <div class="pt-badge bg-primary-subtle text-primary">
            👥 {{ users.length }} Total Users
          </div>
          <button class="pt-btn pt-btn-primary" (click)="toggleForm()">
            <span class="material-symbols-rounded">{{ showForm && !editMode ? 'close' : 'add' }}</span>
            {{ showForm && !editMode ? 'Cancel' : 'Add User' }}
          </button>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="pt-card p-3 mb-4">
        <div class="row align-items-center">
          <div class="col-md-4">
            <div class="search-input-wrap position-relative">
              <span class="material-symbols-rounded position-absolute top-50 translate-middle-y ms-3 text-muted">search</span>
              <input type="text" class="pt-input ps-5 w-100" placeholder="Search by name, email, role..." [(ngModel)]="searchQuery">
            </div>
          </div>
          <div class="col-md-8 text-end">
            <span class="text-muted small fw-medium">{{ filteredUsers.length }} result(s)</span>
          </div>
        </div>
      </div>

      <div class="split-layout" [class.show-sidebar]="showForm">
        <!-- Main Content (User Table) -->
        <div class="layout-main">
          <div class="pt-card p-0">
            <div class="table-responsive">
              <table class="table pt-table align-middle mb-0">
                <thead>
                  <tr>
                    <th class="ps-4">USER</th>
                    <th>CONTACT</th>
                    <th>ROLE</th>
                    <th class="text-end pe-4">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let u of filteredUsers">
                    <td class="ps-4">
                      <div class="d-flex align-items-center gap-3">
                        <div class="pt-avatar bg-primary text-white">
                          {{ u.firstName.charAt(0) }}{{ u.lastName.charAt(0) }}
                        </div>
                        <div>
                          <div class="fw-bold text-dark">{{ u.firstName }} {{ u.lastName }}</div>
                          <div class="text-muted small">ID #{{ u.id }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="d-flex flex-column gap-1">
                        <span class="d-flex align-items-center gap-2 text-muted small"><span class="material-symbols-rounded fs-6">mail</span> {{ u.email }}</span>
                        <span class="d-flex align-items-center gap-2 text-muted small"><span class="material-symbols-rounded fs-6">call</span> {{ u.mobile }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="pt-badge"
                        [class.bg-danger-subtle]="u.role === 'Owner'"
                        [class.text-danger]="u.role === 'Owner'"
                        [class.bg-primary-subtle]="u.role === 'Broker'"
                        [class.text-primary]="u.role === 'Broker'"
                        [class.bg-success-subtle]="u.role === 'Receptionist'"
                        [class.text-success]="u.role === 'Receptionist'">
                        {{ u.role }}
                      </span>
                    </td>
                    <td class="text-end pe-4">
                      <div class="d-flex gap-2 justify-content-end">
                        <button class="pt-btn pt-btn-outline pt-btn-sm" (click)="editUser(u)">
                          <span class="material-symbols-rounded fs-6">edit</span>
                        </button>
                        <button class="pt-btn pt-btn-outline pt-btn-sm text-danger" (click)="deleteUser(u.id)">
                          <span class="material-symbols-rounded fs-6">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="filteredUsers.length === 0">
                    <td colspan="4" class="text-center py-5">
                      <div class="pt-empty-icon bg-primary-subtle text-primary mb-3 mx-auto" style="width:64px;height:64px;display:flex;align-items:center;justify-content:center;border-radius:50%">
                        <span class="material-symbols-rounded" style="font-size:32px;">group_off</span>
                      </div>
                      <h5 class="fw-bold text-dark">No users found</h5>
                      <p class="text-muted">Adjust your search or add a new user.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Sidebar Form -->
        <div class="layout-sidebar pt-card p-0" *ngIf="showForm">
          <div class="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
            <h5 class="mb-0 d-flex align-items-center gap-2">
              <span class="material-symbols-rounded text-primary">{{ editMode ? 'edit_square' : 'person_add' }}</span>
              {{ editMode ? 'Edit User' : 'Add User' }}
            </h5>
            <button class="pt-btn pt-btn-text p-1" (click)="toggleForm()">
              <span class="material-symbols-rounded">close</span>
            </button>
          </div>
          
          <div class="p-4">
            <div class="d-flex flex-column gap-3">
              <div class="row g-3">
                <div class="col-6">
                  <label class="pt-label">First Name</label>
                  <input class="pt-input w-100" [(ngModel)]="user.firstName" placeholder="First Name">
                </div>
                <div class="col-6">
                  <label class="pt-label">Last Name</label>
                  <input class="pt-input w-100" [(ngModel)]="user.lastName" placeholder="Last Name">
                </div>
              </div>
              
              <div class="form-group">
                <label class="pt-label">Email Address</label>
                <input type="email" class="pt-input w-100" [(ngModel)]="user.email" placeholder="work@proptrail.com">
              </div>
              
              <div class="form-group">
                <label class="pt-label">Mobile Number</label>
                <input class="pt-input w-100" [(ngModel)]="user.mobile" placeholder="9876543210">
              </div>
              
              <div class="form-group">
                <label class="pt-label">Access Role</label>
                <select class="pt-input w-100" [(ngModel)]="user.role">
                  <option value="Owner">Owner / Admin</option>
                  <option value="Broker">Broker</option>
                  <option value="Receptionist">Manager / Staff</option>
                </select>
              </div>
              
              <div class="form-group" *ngIf="!editMode">
                <label class="pt-label">Initial Password</label>
                <div style="position:relative;">
                  <input [type]="showPassword ? 'text' : 'password'" class="pt-input w-100 pe-5"
                    [(ngModel)]="user.password" placeholder="Set initial password">
                  <button type="button"
                    style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#64748b;padding:0;"
                    (click)="showPassword = !showPassword">
                    <span class="material-symbols-rounded" style="font-size:18px;line-height:1;">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
                <small class="text-muted d-block mt-1">💡 Share this password with the user after creating their account.</small>
              </div>

              <div class="form-group" *ngIf="editMode">
                <label class="pt-label">Reset Password (optional)</label>
                <div style="position:relative;">
                  <input [type]="showPassword ? 'text' : 'password'" class="pt-input w-100 pe-5"
                    [(ngModel)]="user.password" placeholder="Leave blank to keep current password">
                  <button type="button"
                    style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#64748b;padding:0;"
                    (click)="showPassword = !showPassword">
                    <span class="material-symbols-rounded" style="font-size:18px;line-height:1;">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
                <small class="text-muted d-block mt-1">💡 Fill only if you want to reset this user's password.</small>
              </div>
              
              <div class="d-flex flex-column gap-2 mt-4 pt-4 border-top">
                <button class="pt-btn pt-btn-primary w-100" (click)="saveUser()">
                  <span class="material-symbols-rounded fs-5">save</span>
                  {{ editMode ? 'Update User' : 'Create User' }}
                </button>
                <button class="pt-btn pt-btn-outline w-100" (click)="resetForm()">
                  Clear Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .split-layout {
      display: flex;
      gap: 1.5rem;
      align-items: flex-start;
    }
    .layout-main {
      flex: 1;
      min-width: 0;
      transition: all 0.3s ease;
    }
    .layout-sidebar {
      width: 400px;
      flex-shrink: 0;
      position: sticky;
      top: 1.5rem;
      height: calc(100vh - 8rem);
      overflow-y: auto;
      display: none;
      animation: slideInRight 0.3s ease-out forwards;
    }
    .show-sidebar .layout-sidebar {
      display: block;
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .pt-table th {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      padding: 1rem;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    .pt-table td {
      padding: 1rem;
      border-bottom: 1px solid #f1f5f9;
    }
  `]

})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  showForm = false;
  editMode = false;
  searchQuery = '';
  showPassword = false;

  user: User = this.emptyUser();

  get filteredUsers(): User[] {
    if (!this.searchQuery) return this.users;
    const q = this.searchQuery.toLowerCase();
    return this.users.filter(u =>
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }

  constructor(private http: HttpClient, private toastService: ToastService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.http.get<User[]>('/api/broker').subscribe({
      next: (data) => this.users = data,
      error: () => this.toastService.showError('Failed to load users.')
    });
  }

  saveUser(): void {
    if (!this.user.firstName || !this.user.email) {
      this.toastService.showError('Name and Email are required.');
      return;
    }
    if (this.editMode) {
      const payload: any = { ...this.user };
      if (!payload.password) delete payload.password; // don't reset if blank
      this.http.put(`/api/broker/${this.user.id}`, payload).subscribe({
        next: () => { this.loadUsers(); this.resetForm(); this.toastService.showSuccess('User updated.'); },
        error: () => this.toastService.showError('Failed to update user.')
      });
    } else {
      if (!this.user.password) {
        this.toastService.showError('Initial password is required.');
        return;
      }
      this.http.post('/api/broker', this.user).subscribe({
        next: () => { this.loadUsers(); this.resetForm(); this.toastService.showSuccess('User created successfully! Share the password with them.'); },
        error: () => this.toastService.showError('Failed to create user.')
      });
    }
  }

  editUser(u: User): void {
    this.user = { ...u };
    this.editMode = true;
    this.showForm = true;
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  deleteUser(id: number): void {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.http.delete(`/api/broker/${id}`).subscribe({
      next: () => { this.loadUsers(); this.toastService.showSuccess('User deleted.'); },
      error: () => this.toastService.showError('Failed to delete user.')
    });
  }

  resetForm(): void {
    this.user = this.emptyUser();
    this.editMode = false;
    this.showForm = false;
    this.showPassword = false;
  }

  private emptyUser(): User {
    return { id: 0, firstName: '', lastName: '', email: '', mobile: '', role: 'Broker', password: '' };
  }
}
