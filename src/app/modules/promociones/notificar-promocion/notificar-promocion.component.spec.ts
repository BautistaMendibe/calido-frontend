import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificarPromocionComponent } from './notificar-promocion.component';

describe('NotificarPromocionComponent', () => {
  let component: NotificarPromocionComponent;
  let fixture: ComponentFixture<NotificarPromocionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificarPromocionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotificarPromocionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
