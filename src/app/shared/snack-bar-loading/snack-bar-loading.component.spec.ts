import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackBarLoadingComponent } from './snack-bar-loading.component';

describe('SnackBarLoadingComponent', () => {
  let component: SnackBarLoadingComponent;
  let fixture: ComponentFixture<SnackBarLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SnackBarLoadingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SnackBarLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
