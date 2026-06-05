import { TestBed } from '@angular/core/testing';

import { BrokerService } from './broker.service';

describe('Broker', () => {
  let service: BrokerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrokerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
