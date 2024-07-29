import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleEmpleadosComponent } from './detalle-empleados.component';

describe('DetalleEmpleadosComponent', () => {
  let component: DetalleEmpleadosComponent;
  let fixture: ComponentFixture<DetalleEmpleadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetalleEmpleadosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetalleEmpleadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
