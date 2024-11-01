import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarLicenciaComponent } from './registrar-licencia.component';

describe('RegistrarLicenciaComponent', () => {
  let component: RegistrarLicenciaComponent;
  let fixture: ComponentFixture<RegistrarLicenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarLicenciaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegistrarLicenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
