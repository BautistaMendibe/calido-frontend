import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarArqueoCajaComponent } from './registrar-arqueo-caja.component';

describe('RegistrarArqueoCajaComponent', () => {
  let component: RegistrarArqueoCajaComponent;
  let fixture: ComponentFixture<RegistrarArqueoCajaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarArqueoCajaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegistrarArqueoCajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
