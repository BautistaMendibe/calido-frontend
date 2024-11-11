import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarCajaComponent } from './registrar-caja.component';

describe('RegistrarCajaComponent', () => {
  let component: RegistrarCajaComponent;
  let fixture: ComponentFixture<RegistrarCajaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarCajaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegistrarCajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
