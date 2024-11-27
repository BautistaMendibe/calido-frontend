import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UltimosClientesRegistradosComponent } from './ultimos-clientes-registrados.component';

describe('UltimosClientesRegistradosComponent', () => {
  let component: UltimosClientesRegistradosComponent;
  let fixture: ComponentFixture<UltimosClientesRegistradosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UltimosClientesRegistradosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UltimosClientesRegistradosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
