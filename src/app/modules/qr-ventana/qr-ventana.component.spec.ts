import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QRVentanaComponent } from './qr-ventana.component';

describe('QRVentanaComponent', () => {
  let component: QRVentanaComponent;
  let fixture: ComponentFixture<QRVentanaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QRVentanaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QRVentanaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
