import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarArqueoCajaComponent } from './consultar-arqueo-caja.component';

describe('ArqueoCajaComponent', () => {
  let component: ConsultarArqueoCajaComponent;
  let fixture: ComponentFixture<ConsultarArqueoCajaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultarArqueoCajaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultarArqueoCajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
