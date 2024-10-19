import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizacionesComponent } from './visualizaciones.component';

describe('VisualizacionesComponent', () => {
  let component: VisualizacionesComponent;
  let fixture: ComponentFixture<VisualizacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VisualizacionesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VisualizacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
