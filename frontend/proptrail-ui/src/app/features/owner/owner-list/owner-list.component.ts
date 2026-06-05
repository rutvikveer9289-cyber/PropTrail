import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OwnerService } from '../../../core/services/owner.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';
import { Owner } from '../../../core/models/owner';

@Component({
  selector: 'app-owner-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-list.component.html',
  styleUrls: ['./owner-list.component.scss'],
})
export class OwnerListComponent implements OnInit {
  owners: Owner[] = [];
  isEditMode = false;
  selectedOwnerId = 0;

  owner: Owner = {
    id: 0,
    name: '',
    mobile: '',
    email: '',
    priceFlexibility: '',
    nocStatus: '',
    restrictions: '',
  };

  constructor(
    private ownerService: OwnerService,
    private toastService: ToastService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.loadOwners();
  }

  loadOwners() {
    this.loaderService.show();
    this.ownerService.getOwners().subscribe({
      next: (data) => {
        this.owners = data;
        this.loaderService.hide();
      },
      error: (err) => {
        console.error('Failed to load owners:', err);
        this.loaderService.hide();
        this.toastService.showError('Failed to load owners directory.');
      },
    });
  }

  saveOwner() {
    if (!this.owner.name || !this.owner.mobile || !this.owner.email) {
      this.toastService.showWarning('Please fill in Name, Mobile, and Email fields.');
      return;
    }

    if (this.owner.mobile.length !== 10 && this.owner.mobile.length !== 12) {
      this.toastService.showWarning('Mobile number must be 10 or 12 digits.');
      return;
    }

    if (this.isEditMode) {
      this.updateOwner();
      return;
    }

    this.loaderService.show();
    this.ownerService.addOwner(this.owner).subscribe({
      next: () => {
        this.loadOwners();
        this.resetForm();
        this.loaderService.hide();
        this.toastService.showSuccess('Owner profile added successfully!');
      },
      error: (err) => {
        console.error('Failed to add owner:', err);
        this.loaderService.hide();
        this.toastService.showError('Error adding owner to directory.');
      },
    });
  }

  editOwner(item: Owner) {
    this.isEditMode = true;
    this.selectedOwnerId = item.id;
    this.owner = { ...item };
  }

  updateOwner() {
    this.loaderService.show();
    this.ownerService.updateOwner(this.selectedOwnerId, this.owner).subscribe({
      next: () => {
        this.loadOwners();
        this.resetForm();
        this.loaderService.hide();
        this.toastService.showSuccess('Owner details updated.');
      },
      error: (err) => {
        console.error('Failed to update owner:', err);
        this.loaderService.hide();
        this.toastService.showError('Error updating owner details.');
      },
    });
  }

  deleteOwner(id: number) {
    if (!confirm('Are you sure you want to delete this owner from the directory?')) {
      return;
    }

    this.loaderService.show();
    this.ownerService.deleteOwner(id).subscribe({
      next: () => {
        this.loadOwners();
        this.loaderService.hide();
        this.toastService.showSuccess('Owner profile deleted.');
      },
      error: (err) => {
        console.error('Failed to delete owner:', err);
        this.loaderService.hide();
        this.toastService.showError('Error deleting owner.');
      },
    });
  }

  resetForm() {
    this.owner = {
      id: 0,
      name: '',
      mobile: '',
      email: '',
      priceFlexibility: '',
      nocStatus: '',
      restrictions: '',
    };
    this.isEditMode = false;
    this.selectedOwnerId = 0;
  }
}
