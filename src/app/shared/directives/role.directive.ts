import {
  Directive,
  Input,
  Renderer2,
  ElementRef,
  OnChanges,
} from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Directive({
  selector: '[appRole]',
})
export class RoleDirective implements OnChanges {
  @Input('appRole') allowedRoles: string[] = []; // Roles permitidos

  private static cachedUserRoles: string[] | null = null;

  private userRoles: string[] = []; // Inicializado como un array vacío

  constructor(
    private authService: AuthService,
    private renderer: Renderer2,
    private element: ElementRef
  ) {
    // Solamente decodificar el jwt la primera vez, luego cachearlo
    if (!RoleDirective.cachedUserRoles) {
      const decodedToken: any = this.authService.getDecodedAccessToken(
        this.authService.getToken()
      );
      RoleDirective.cachedUserRoles = decodedToken?.roles || [];
    }

    this.userRoles = RoleDirective.cachedUserRoles || [];
  }

  ngOnChanges(): void {
    this.applyShowHideLogic();
  }

  private applyShowHideLogic() {
    if (this.hasRequiredRole()) {
      this.renderer.setStyle(this.element.nativeElement, 'display', 'block');
    } else {
      this.renderer.setStyle(this.element.nativeElement, 'display', 'none');
    }
  }

  private hasRequiredRole(): boolean {
    return this.allowedRoles.some((role) => this.userRoles.includes(role));
  }

  static clearRoleCache(): void {
    RoleDirective.cachedUserRoles = null;
  }
}

