import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarCuentaCorrienteComponent } from './asignar-cuenta-corriente.component';

describe('AsignarCuentaCorrienteComponent', () => {
  let component: AsignarCuentaCorrienteComponent;
  let fixture: ComponentFixture<AsignarCuentaCorrienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AsignarCuentaCorrienteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AsignarCuentaCorrienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
