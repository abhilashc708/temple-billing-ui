import { TestBed } from '@angular/core/testing';

import { GodsService } from './gods.service';

describe('GodsService', () => {
  let service: GodsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GodsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
