import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrokerListComponent } from './broker-list.component';
import { BrokerService } from '../../../core/services/broker.service';
import { of } from 'rxjs';

describe('BrokerListComponent', () => {
  let component: BrokerListComponent;
  let fixture: ComponentFixture<BrokerListComponent>;

  const mockBrokerService = {
    getBrokers: () => of([]),
    addBroker: () => of({}),
    updateBroker: () => of({}),
    deleteBroker: () => of({})
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrokerListComponent],
      providers: [
        { provide: BrokerService, useValue: mockBrokerService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BrokerListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

