import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarTarjetasComponent } from './consultar-tarjetas.component';

describe('ConsultarTarjetasComponent', () => {
  let component: ConsultarTarjetasComponent;
  let fixture: ComponentFixture<ConsultarTarjetasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultarTarjetasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultarTarjetasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
