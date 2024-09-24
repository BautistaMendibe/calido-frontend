import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarCuentaCorrienteComponent } from './registrar-cuenta-corriente.component';

describe('RegistrarCuentaCorrienteComponent', () => {
  let component: RegistrarCuentaCorrienteComponent;
  let fixture: ComponentFixture<RegistrarCuentaCorrienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarCuentaCorrienteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegistrarCuentaCorrienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
