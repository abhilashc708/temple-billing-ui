import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeSummaryComponent } from './income-summary.component';

describe('IncomeSummaryComponent', () => {
  let component: IncomeSummaryComponent;
  let fixture: ComponentFixture<IncomeSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
