import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleArqueoComponent } from './detalle-arqueo.component';

describe('DetalleArqueoComponent', () => {
  let component: DetalleArqueoComponent;
  let fixture: ComponentFixture<DetalleArqueoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetalleArqueoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetalleArqueoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
