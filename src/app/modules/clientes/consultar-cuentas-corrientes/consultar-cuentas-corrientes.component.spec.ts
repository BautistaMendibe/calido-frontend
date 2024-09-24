import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarCuentasCorrientesComponent } from './consultar-cuentas-corrientes.component';

describe('ConsultarCuentasCorrientesComponent', () => {
  let component: ConsultarCuentasCorrientesComponent;
  let fixture: ComponentFixture<ConsultarCuentasCorrientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultarCuentasCorrientesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultarCuentasCorrientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
