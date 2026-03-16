import { TestBed } from '@angular/core/testing';

import { IncomeEntryService } from './income-entry.service';

describe('IncomeEntryService', () => {
  let service: IncomeEntryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IncomeEntryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
