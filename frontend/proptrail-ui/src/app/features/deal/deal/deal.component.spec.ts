import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DealComponent } from './deal.component';
import { DealService } from '../../../core/services/deal.service';
import { BrokerService } from '../../../core/services/broker.service';
import { LeadService } from '../../../core/services/lead.service';
import { PropertyService } from '../../../core/services/property.service';
import { DealDocumentService } from '../../../core/services/deal-document.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';
import { of } from 'rxjs';

describe('DealComponent', () => {
  let component: DealComponent;
  let fixture: ComponentFixture<DealComponent>;

  const mockDealService = {
    getDeals: () => of([]),
    addDeal: () => of({}),
    updateDeal: () => of({}),
    deleteDeal: () => of({})
  };

  const mockBrokerService = {
    getBrokers: () => of([]),
    addBroker: () => of({}),
    updateBroker: () => of({}),
    deleteBroker: () => of({})
  };

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

  const mockDealDocumentService = {
    getDocumentsForDeal: () => of([]),
    addDocument: () => of({}),
    updateDocument: () => of({}),
    deleteDocument: () => of({})
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
      imports: [DealComponent],
      providers: [
        { provide: DealService, useValue: mockDealService },
        { provide: BrokerService, useValue: mockBrokerService },
        { provide: LeadService, useValue: mockLeadService },
        { provide: PropertyService, useValue: mockPropertyService },
        { provide: DealDocumentService, useValue: mockDealDocumentService },
        { provide: ToastService, useValue: mockToastService },
        { provide: LoaderService, useValue: mockLoaderService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DealComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

