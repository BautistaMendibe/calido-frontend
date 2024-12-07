import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnChanges,
  Optional,
} from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Directive({
  selector: '[appRole]', // Directiva estructural (*appRole)
})
export class RoleDirective implements OnChanges {
  @Input('appRole') allowedRoles: string[] = []; // Roles permitidos

  private userRoles: string[] = [];

  constructor(
    private authService: AuthService,
    @Optional() private templateRef: TemplateRef<any>, // Para manipular contenido
    @Optional() private viewContainer: ViewContainerRef // Para mostrar u ocultar
  ) {
    const token = this.authService.getToken();
    const decodedToken: any = this.authService.getDecodedAccessToken(token);
    this.userRoles = decodedToken?.roles || []; // Obtiene los roles del usuario
    console.log(this.userRoles);
  }

  ngOnChanges(): void {
    this.applyShowHideLogic();
  }

  private applyShowHideLogic() {
    if (this.viewContainer && this.templateRef) {
      this.viewContainer.clear(); // Limpia el contenido existente
      if (this.hasRequiredRole()) {
        this.viewContainer.createEmbeddedView(this.templateRef); // Muestra el contenido
      }
    }
  }

  private hasRequiredRole(): boolean {
    return this.allowedRoles.some((role) => this.userRoles.includes(role)); // Verifica roles
  }
}
