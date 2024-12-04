import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentasMensualesComponent } from './ventas-mensuales.component';

describe('VentasMensualesComponent', () => {
  let component: VentasMensualesComponent;
  let fixture: ComponentFixture<VentasMensualesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VentasMensualesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VentasMensualesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
