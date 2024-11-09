import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarCajaComponent } from './consultar-caja.component';

describe('ConsultarCajaComponent', () => {
  let component: ConsultarCajaComponent;
  let fixture: ComponentFixture<ConsultarCajaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultarCajaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultarCajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
