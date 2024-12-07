import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  Renderer2,
  ElementRef,
  OnChanges,
} from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appRole]',
})
export class RoleDirective implements OnChanges {
  @Input('appRole') allowedRoles: string[] = [];
  @Input('appRoleAction') action: 'show' | 'disable' = 'show';

  private userRoles: string[] = [];

  constructor(
    private authService: AuthService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private renderer: Renderer2,
    private element: ElementRef
  ) {
    const token = this.authService.getToken();
    const decodedToken: any = this.authService.getDecodedAccessToken(token);
    this.userRoles = decodedToken?.roles || [];
  }

  ngOnChanges(): void {
    if (this.action === 'show') {
      this.applyShowHideLogic();
    } else if (this.action === 'disable') {
      this.applyDisableLogic();
    }
  }

  private applyShowHideLogic() {
    this.viewContainer.clear();
    if (this.hasRequiredRole()) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  private applyDisableLogic() {
    if (!this.hasRequiredRole()) {
      this.renderer.setAttribute(this.element.nativeElement, 'disabled', 'true');
    } else {
      this.renderer.removeAttribute(this.element.nativeElement, 'disabled');
    }
  }

  private hasRequiredRole(): boolean {
    return this.allowedRoles.some((role) => this.userRoles.includes(role));
  }
}
