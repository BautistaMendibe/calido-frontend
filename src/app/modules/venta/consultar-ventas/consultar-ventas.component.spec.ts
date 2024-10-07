import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarVentasComponent } from './consultar-ventas.component';

describe('ConsultarVentasComponent', () => {
  let component: ConsultarVentasComponent;
  let fixture: ComponentFixture<ConsultarVentasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultarVentasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultarVentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
