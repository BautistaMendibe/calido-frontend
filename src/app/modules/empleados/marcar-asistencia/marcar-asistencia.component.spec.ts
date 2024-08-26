import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcarAsistenciaComponent } from './marcar-asistencia.component';

describe('RegistrarAsistenciaComponent', () => {
  let component: MarcarAsistenciaComponent;
  let fixture: ComponentFixture<MarcarAsistenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarcarAsistenciaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarcarAsistenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
