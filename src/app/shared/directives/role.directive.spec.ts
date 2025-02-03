import { TestBed } from '@angular/core/testing';
import { RoleDirective } from './role.directive';
import { AuthService } from '../../services/auth.service';
import { Renderer2, ElementRef } from '@angular/core';

describe('RoleDirective', () => {
  let directive: RoleDirective;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RoleDirective,
        { provide: AuthService, useValue: {} },
        { provide: Renderer2, useValue: { setStyle: () => {} } },
        { provide: ElementRef, useValue: new ElementRef(document.createElement('div')) }
      ]
    });

    directive = TestBed.inject(RoleDirective);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });
});
