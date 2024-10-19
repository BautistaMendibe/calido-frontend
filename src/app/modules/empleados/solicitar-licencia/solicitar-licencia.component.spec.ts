import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitarLicenciaComponent } from './solicitar-licencia.component';

describe('SolicitarLicenciaComponent', () => {
  let component: SolicitarLicenciaComponent;
  let fixture: ComponentFixture<SolicitarLicenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SolicitarLicenciaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SolicitarLicenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
