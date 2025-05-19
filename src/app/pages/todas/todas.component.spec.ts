import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodasComponent } from './todas.component';

describe('TodasComponent', () => {
  let component: TodasComponent;
  let fixture: ComponentFixture<TodasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
