import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizacionesComprasComponent } from './visualizaciones-compras.component';

describe('VisualizacionesComprasComponent', () => {
  let component: VisualizacionesComprasComponent;
  let fixture: ComponentFixture<VisualizacionesComprasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VisualizacionesComprasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VisualizacionesComprasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
