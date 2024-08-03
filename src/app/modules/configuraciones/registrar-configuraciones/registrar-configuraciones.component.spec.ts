import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarConfiguracionesComponent } from './registrar-configuraciones.component';

describe('RegistrarConfiguracionesComponent', () => {
  let component: RegistrarConfiguracionesComponent;
  let fixture: ComponentFixture<RegistrarConfiguracionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarConfiguracionesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegistrarConfiguracionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
