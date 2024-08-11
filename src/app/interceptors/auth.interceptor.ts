import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import {AuthService} from "../services/auth.servicie";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Intercepta las peticiones HTTP y añade el token de autenticación
   * Esto permite poder enviarle el token del usuario al backend para
   * que este pueda validar la petición, sin necesidad de añadir esta
   * lógica en todos los componentes.
   * @param req
   * @param next
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    if (token) {
      if (this.authService.isAuthenticated()) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        this.authService.logOut();
        this.router.navigate(['/login']);
      }
    }

    // En caso de que el backend le envíe un ERROR 401 (Unauthorized) hace logout() y redirige al login.
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.logOut();
          this.router.navigate(['/login']);
        }
        return throwError(() => new Error(error.message));
      })
    );
  }
}
