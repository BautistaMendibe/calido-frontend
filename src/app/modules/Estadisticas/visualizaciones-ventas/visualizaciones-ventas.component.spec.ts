import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizacionesVentasComponent } from './visualizaciones-ventas.component';

describe('VisualizacionesVentasComponent', () => {
  let component: VisualizacionesVentasComponent;
  let fixture: ComponentFixture<VisualizacionesVentasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VisualizacionesVentasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VisualizacionesVentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
