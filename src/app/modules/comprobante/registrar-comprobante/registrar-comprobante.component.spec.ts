import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarComprobanteComponent } from './registrar-comprobante.component';

describe('RegistrarComprobanteComponent', () => {
  let component: RegistrarComprobanteComponent;
  let fixture: ComponentFixture<RegistrarComprobanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarComprobanteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegistrarComprobanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
