import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PropertyService } from '../../../core/services/property.service';
import { OwnerService } from '../../../core/services/owner.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';
import { AuthService } from '../../../core/services/auth.service';
import { VisitService } from '../../../core/services/visit.service';
import { Property } from '../models/property';
import { Owner } from '../../../core/models/owner';

@Component({
  selector: 'app-property',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.scss']
})

export class PropertyComponent implements OnInit {

  allProperties: Property[] = [];
  properties: Property[] = [];
  searchText = '';
  owners: Owner[] = [];
  userRole = '';

  // Request Visit Popup State
  showRequestVisitModal = false;
  requestVisitProperty: any = null;
  requestVisitDate = '';
  requestVisitNotes = '';

  // Phase 6 - Advanced Filters
  filterStatus = '';
  filterListingType = '';
  filterBhk: number | null = null;
  filterPropertyType = '';
  availablePropertyTypes: string[] = [];
  filterMinPrice: number | null = null;
  filterMaxPrice: number | null = null;

  isEditMode = false;
  selectedPropertyId = 0;
  showForm = false;
  viewMode = 'grid'; // 'grid' | 'table'

  // Quick Add Owner Modal State
  showQuickAddOwner = false;
  quickOwner = {
    id: 0,
    name: '',
    mobile: '',
    email: '',
    priceFlexibility: 'Medium (up to 5% negotiable)',
    nocStatus: 'Obtained',
    restrictions: 'None'
  };

  property: any = {
    propertyName: '',
    propertyType: '',
    location: '',
    price: 0,
    area: 0,
    status: 'Available',
    description: '',
    createdDate: new Date(),
    ownerId: 0,
    bhkCount: 1,
    listingType: 'Sale',
    imageUrls: '',
    videoUrl: '',
    keyFeatures: ''
  };

  constructor(
    private propertyService: PropertyService,
    private ownerService: OwnerService,
    private toastService: ToastService,
    private loaderService: LoaderService,
    public authService: AuthService,
    private visitService: VisitService
  ) { }

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole() || '';
    this.loadProperties();
    if (this.userRole !== 'Buyer') {
      this.loadOwners();
    }
  }

  loadOwners() {
    this.ownerService.getOwners().subscribe({
      next: (data) => {
        this.owners = data;
      },
      error: (err) => {
        console.error('Failed to load owners:', err);
      }
    });
  }

  getOwnerName(id?: number): string {
    if (!id || id === 0) return 'No Owner';
    const owner = this.owners.find(o => o.id === id);
    return owner ? owner.name : 'Unknown Owner';
  }

  loadProperties() {
    this.loaderService.show();
    this.propertyService.getProperties().subscribe({
      next: (data: Property[]) => {
        this.allProperties = data;
        this.availablePropertyTypes = this.extractPropertyTypes(data);
        this.filterProperties();
        this.loaderService.hide();
      },
      error: (err) => {
        console.error(err);
        this.loaderService.hide();
        this.toastService.showError('Failed to load properties inventory.');
      }
    });
  }

  extractPropertyTypes(properties: Property[]): string[] {
    const defaultTypes = ['Apartment', 'Villa', 'Office', 'Commercial', 'Penthouse', 'Plot'];
    const types = new Set<string>(defaultTypes);
    properties.forEach(p => {
      if (p.propertyType) {
        const trimmed = p.propertyType.trim();
        const capitalized = trimmed.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        if (capitalized) {
          types.add(capitalized);
        }
      }
    });
    return Array.from(types).sort();
  }

  filterProperties() {
    let result = [...this.allProperties];

    if (this.userRole === 'Buyer') {
      result = result.filter(p => p.status === 'Available');
    } else if (this.filterStatus) {
      result = result.filter(p => p.status === this.filterStatus);
    }

    if (this.searchText) {
      const q = this.searchText.toLowerCase();
      result = result.filter(
        p =>
          p.propertyName?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.propertyType?.toLowerCase().includes(q)
      );
    }

    if (this.filterListingType) {
      result = result.filter(p => p.listingType === this.filterListingType);
    }

    if (this.filterPropertyType) {
      result = result.filter(p => p.propertyType?.toLowerCase() === this.filterPropertyType.toLowerCase());
    }

    if (this.filterBhk !== null && this.filterBhk !== undefined && String(this.filterBhk) !== '') {
      result = result.filter(p => p.bhkCount === Number(this.filterBhk));
    }

    if (this.filterMinPrice !== null && this.filterMinPrice !== undefined && String(this.filterMinPrice) !== '') {
      result = result.filter(p => p.price >= Number(this.filterMinPrice));
    }

    if (this.filterMaxPrice !== null && this.filterMaxPrice !== undefined && String(this.filterMaxPrice) !== '') {
      result = result.filter(p => p.price <= Number(this.filterMaxPrice));
    }

    this.properties = result;
  }

  clearFilters() {
    this.searchText = '';
    this.filterStatus = '';
    this.filterListingType = '';
    this.filterBhk = null;
    this.filterPropertyType = '';
    this.filterMinPrice = null;
    this.filterMaxPrice = null;
    this.filterProperties();
  }

  addProperty() {
    if (!this.property.propertyName || !this.property.location) {
      this.toastService.showWarning('Please fill in Property Name and Location.');
      return;
    }

    if (this.isEditMode) {
      this.updateProperty();
      return;
    }

    this.loaderService.show();
    this.property.createdDate = new Date();

    this.propertyService.addProperty(this.property).subscribe({
      next: () => {
        this.loadProperties();
        this.resetForm();
        this.loaderService.hide();
        this.toastService.showSuccess('Property added successfully!');
      },
      error: (err) => {
        console.error(err);
        this.loaderService.hide();
        this.toastService.showError('Error adding property.');
      }
    });
  }

  editProperty(prop: Property) {
    this.isEditMode = true;
    this.selectedPropertyId = prop.id;
    this.showForm = true;
    this.property = {
      propertyName: prop.propertyName,
      propertyType: prop.propertyType,
      location: prop.location,
      price: prop.price,
      area: prop.area,
      status: prop.status,
      description: prop.description,
      createdDate: prop.createdDate,
      ownerId: prop.ownerId || 0,
      bhkCount: prop.bhkCount || 1,
      listingType: prop.listingType || 'Sale',
      imageUrls: prop.imageUrls || '',
      videoUrl: prop.videoUrl || '',
      keyFeatures: prop.keyFeatures || ''
    };
  }

  updateProperty() {
    const updatedProperty = {
      id: this.selectedPropertyId,
      ...this.property
    };

    this.loaderService.show();
    this.propertyService.updateProperty(this.selectedPropertyId, updatedProperty).subscribe({
      next: () => {
        this.loadProperties();
        this.resetForm();
        this.loaderService.hide();
        this.toastService.showSuccess('Property details updated successfully.');
      },
      error: (err) => {
        console.error(err);
        this.loaderService.hide();
        this.toastService.showError('Error updating property.');
      }
    });
  }

  deleteProperty(id: number) {
    if (!confirm('Are you sure you want to delete this property listing?')) {
      return;
    }

    this.loaderService.show();
    this.propertyService.deleteProperty(id).subscribe({
      next: () => {
        this.loadProperties();
        this.loaderService.hide();
        this.toastService.showSuccess('Property listing removed.');
      },
      error: (err) => {
        console.error(err);
        this.loaderService.hide();
        this.toastService.showError('Error deleting property.');
      }
    });
  }

  quickAddOwner() {
    if (!this.quickOwner.name || !this.quickOwner.mobile) {
      this.toastService.showWarning('Please enter Owner Name and Mobile number.');
      return;
    }

    this.loaderService.show();
    this.ownerService.addOwner(this.quickOwner).subscribe({
      next: (newOwner: Owner) => {
        this.loaderService.hide();
        this.toastService.showSuccess('Owner added successfully!');
        this.showQuickAddOwner = false;
        
        // Refresh owners list and auto-select the new owner
        this.ownerService.getOwners().subscribe({
          next: (data) => {
            this.owners = data;
            // Find the owner we just created and select them
            const created = data.find(o => o.mobile === this.quickOwner.mobile);
            if (created) {
              this.property.ownerId = created.id;
            }
            // Reset quick owner form
            this.quickOwner = {
              id: 0,
              name: '',
              mobile: '',
              email: '',
              priceFlexibility: 'Medium (up to 5% negotiable)',
              nocStatus: 'Obtained',
              restrictions: 'None'
            };
          }
        });
      },
      error: (err) => {
        this.loaderService.hide();
        console.error(err);
        this.toastService.showError('Failed to add owner.');
      }
    });
  }

  resetForm() {
    this.property = {
      propertyName: '',
      propertyType: '',
      location: '',
      price: 0,
      area: 0,
      status: 'Available',
      description: '',
      createdDate: new Date(),
      ownerId: 0,
      bhkCount: 1,
      listingType: 'Sale',
      imageUrls: '',
      videoUrl: '',
      keyFeatures: ''
    };
    this.isEditMode = false;
    this.selectedPropertyId = 0;
    this.showForm = false;
  }

  openRequestVisitModal(prop: Property) {
    this.requestVisitProperty = prop;
    this.requestVisitDate = '';
    this.requestVisitNotes = '';
    this.showRequestVisitModal = true;
  }

  submitRequestVisit() {
    if (!this.requestVisitProperty || !this.requestVisitDate) {
      this.toastService.showWarning('Please select a preferred date and time.');
      return;
    }

    this.loaderService.show();
    const visitData: any = {
      propertyId: this.requestVisitProperty.id,
      visitDate: new Date(this.requestVisitDate).toISOString(),
      notes: this.requestVisitNotes || `Requested walkthrough for ${this.requestVisitProperty.propertyName}`
    };

    this.visitService.addVisit(visitData).subscribe({
      next: () => {
        this.loaderService.hide();
        this.toastService.showSuccess('Walkthrough requested! A broker will contact you shortly to confirm.');
        this.showRequestVisitModal = false;
      },
      error: (err) => {
        console.error(err);
        this.loaderService.hide();
        this.toastService.showError('Failed to request site visit.');
      }
    });
  }
}