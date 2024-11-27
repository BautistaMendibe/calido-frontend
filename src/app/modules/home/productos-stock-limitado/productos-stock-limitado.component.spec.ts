import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosStockLimitadoComponent } from './productos-stock-limitado.component';

describe('ProductosStockLimitadoComponent', () => {
  let component: ProductosStockLimitadoComponent;
  let fixture: ComponentFixture<ProductosStockLimitadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductosStockLimitadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductosStockLimitadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
