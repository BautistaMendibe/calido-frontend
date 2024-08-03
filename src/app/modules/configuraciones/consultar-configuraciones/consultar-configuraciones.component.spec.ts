import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarConfiguracionesComponent } from './consultar-configuraciones.component';

describe('ConsultarConfiguracionesComponent', () => {
  let component: ConsultarConfiguracionesComponent;
  let fixture: ComponentFixture<ConsultarConfiguracionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultarConfiguracionesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultarConfiguracionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
