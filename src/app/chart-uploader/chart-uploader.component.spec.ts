import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartUploaderComponent } from './chart-uploader.component';

describe('ChartUploaderComponent', () => {
  let component: ChartUploaderComponent;
  let fixture: ComponentFixture<ChartUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartUploaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
