import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarPromocionesComponent } from './consultar-promociones.component';

describe('ConsultarPromocionesComponent', () => {
  let component: ConsultarPromocionesComponent;
  let fixture: ComponentFixture<ConsultarPromocionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultarPromocionesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultarPromocionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
