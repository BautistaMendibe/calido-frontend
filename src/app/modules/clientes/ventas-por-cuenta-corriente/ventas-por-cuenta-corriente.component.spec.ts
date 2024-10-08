import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentasPorCuentaCorrienteComponent } from './ventas-por-cuenta-corriente.component';

describe('VentasPorCuentaCorrienteComponent', () => {
  let component: VentasPorCuentaCorrienteComponent;
  let fixture: ComponentFixture<VentasPorCuentaCorrienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VentasPorCuentaCorrienteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VentasPorCuentaCorrienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
