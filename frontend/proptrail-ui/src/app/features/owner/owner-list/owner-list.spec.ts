import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OwnerListComponent } from './owner-list.component';
import { OwnerService } from '../../../core/services/owner.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';
import { of } from 'rxjs';

describe('OwnerListComponent', () => {
  let component: OwnerListComponent;
  let fixture: ComponentFixture<OwnerListComponent>;

  const mockOwnerService = {
    getOwners: () => of([]),
    addOwner: () => of({}),
    updateOwner: () => of({}),
    deleteOwner: () => of({})
  };

  const mockToastService = {
    show: () => {},
    showSuccess: () => {},
    showError: () => {},
    showWarning: () => {},
    showInfo: () => {},
    dismiss: () => {}
  };

  const mockLoaderService = {
    
    show: () => {},
    hide: () => {},
    loading$: of(false)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerListComponent],
      providers: [
        { provide: OwnerService, useValue: mockOwnerService },
        { provide: ToastService, useValue: mockToastService },
        { provide: LoaderService, useValue: mockLoaderService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

