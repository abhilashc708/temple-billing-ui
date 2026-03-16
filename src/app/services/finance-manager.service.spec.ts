import { TestBed } from '@angular/core/testing';

import { FinanceManagerService } from './finance-manager.service';

describe('FinanceManagerService', () => {
  let service: FinanceManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinanceManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
