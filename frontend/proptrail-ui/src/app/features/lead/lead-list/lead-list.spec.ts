import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeadListComponent } from './lead-list.component';
import { LeadService } from '../../../core/services/lead.service';
import { PropertyService } from '../../../core/services/property.service';
import { BrokerService } from '../../../core/services/broker.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';
import { of } from 'rxjs';

describe('LeadListComponent', () => {
  let component: LeadListComponent;
  let fixture: ComponentFixture<LeadListComponent>;

  const mockLeadService = {
    getLeads: () => of([]),
    addLead: () => of({}),
    updateLead: () => of({}),
    deleteLead: () => of({})
  };

  const mockPropertyService = {
    getProperties: () => of([]),
    addProperty: () => of({}),
    updateProperty: () => of({}),
    deleteProperty: () => of({})
  };

  const mockBrokerService = {
    getBrokers: () => of([]),
    addBroker: () => of({}),
    updateBroker: () => of({}),
    deleteBroker: () => of({})
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
      imports: [LeadListComponent],
      providers: [
        { provide: LeadService, useValue: mockLeadService },
        { provide: PropertyService, useValue: mockPropertyService },
        { provide: BrokerService, useValue: mockBrokerService },
        { provide: ToastService, useValue: mockToastService },
        { provide: LoaderService, useValue: mockLoaderService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LeadListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

