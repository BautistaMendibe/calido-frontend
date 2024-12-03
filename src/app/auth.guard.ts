import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rolesPermitidos = route.data['roles'] as string[];
  const token = authService.getToken();
  if (!token) {
    authService.logOut();
    router.navigate(['/login']);
    return false;
  }

  const infoToken: any = authService.getDecodedAccessToken(token);
  if (!infoToken || !infoToken.roles) {
    authService.logOut();
    router.navigate(['/login']);
    return false;
  }

  const tieneAcceso = rolesPermitidos.some((nombreRol) =>
    infoToken.roles.includes(nombreRol),
  );

  if (!tieneAcceso) {
    router.navigate(['']);
  }

  return tieneAcceso;
};
