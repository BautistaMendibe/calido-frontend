import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentasDiaComponent } from './ventas-dia.component';

describe('VentasDiaComponent', () => {
  let component: VentasDiaComponent;
  let fixture: ComponentFixture<VentasDiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VentasDiaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VentasDiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
