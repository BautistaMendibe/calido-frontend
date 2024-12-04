import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsistenciasEmpleadosComponent } from './asistencias-empleados.component';

describe('AsistenciasEmpleadosComponent', () => {
  let component: AsistenciasEmpleadosComponent;
  let fixture: ComponentFixture<AsistenciasEmpleadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AsistenciasEmpleadosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AsistenciasEmpleadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
