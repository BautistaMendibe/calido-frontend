import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagarCuentaCorrienteComponent } from './pagar-cuenta-corriente.component';

describe('PagarCuentaCorrienteComponent', () => {
  let component: PagarCuentaCorrienteComponent;
  let fixture: ComponentFixture<PagarCuentaCorrienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PagarCuentaCorrienteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PagarCuentaCorrienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
