import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarComprobanteComponent } from './consultar-comprobante.component';

describe('ConsultarComprobanteComponent', () => {
  let component: ConsultarComprobanteComponent;
  let fixture: ComponentFixture<ConsultarComprobanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultarComprobanteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultarComprobanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
