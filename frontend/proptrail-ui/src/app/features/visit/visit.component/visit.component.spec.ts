import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisitComponent } from './visit.component';
import { VisitService } from '../../../core/services/visit.service';
import { BrokerService } from '../../../core/services/broker.service';
import { LeadService } from '../../../core/services/lead.service';
import { PropertyService } from '../../../core/services/property.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';
import { of } from 'rxjs';

describe('VisitComponent', () => {
  let component: VisitComponent;
  let fixture: ComponentFixture<VisitComponent>;

  const mockVisitService = {
    getVisits: () => of([]),
    addVisit: () => of({}),
    updateVisit: () => of({}),
    deleteVisit: () => of({})
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
      imports: [VisitComponent],
      providers: [
        { provide: VisitService, useValue: mockVisitService },
        { provide: BrokerService, useValue: mockBrokerService },
        { provide: LeadService, useValue: mockLeadService },
        { provide: PropertyService, useValue: mockPropertyService },
        { provide: ToastService, useValue: mockToastService },
        { provide: LoaderService, useValue: mockLoaderService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VisitComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

