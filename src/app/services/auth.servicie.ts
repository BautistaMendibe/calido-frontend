import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {environmentDEV} from "../../environments/environment-dev";
import { jwtDecode } from 'jwt-decode';
import {SnackBarService} from "./snack-bar.service";


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private urlBackend = environmentDEV.backendUrl;
    private authenticationStatusSource = new BehaviorSubject<boolean>(this.isAuthenticated());
    authenticationStatus$ = this.authenticationStatusSource.asObservable();


    constructor(
      private notificacionService: SnackBarService
    ) {}

    public setToken(token: string) {
        localStorage.setItem('auth_token', token);
    }

    public logOut() {
        localStorage.removeItem('auth_token');
        this.updateAuthenticationStatus(false);
    }

    public getToken(): string {
        return localStorage.getItem('auth_token') ?? '';
    }

  /**
   * Método para verificar si el token está expirado
   * @returns boolean
   */
  public isAuthenticated(): boolean {

      // Verifica que el token exista
      const token = this.getToken();
      if (!token) {
        return false;
      }

      // Verifica que el token puede ser decodificado correctamente
      const tokenPayload = this.getDecodedAccessToken(token);
      if (!tokenPayload) {
        return false;
      }

      // Verifica que la fecha de expiración del token sea mayor a la fecha actual
      const expirationDate = tokenPayload.exp * 1000;
      const currentDate = Date.now();

      if (currentDate > expirationDate) {
        this.notificacionService.openSnackBarError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }

      return currentDate < expirationDate;
    }

    // Método para actualizar el estado de autenticación
    public updateAuthenticationStatus(isAuthenticated: boolean): void {
        this.authenticationStatusSource.next(isAuthenticated);
    }

    // Devuelve el token decodificado
    public getDecodedAccessToken(token: string): any {
        try {
            return jwtDecode(token);
        } catch(Error) {
            return null;
        }
    }

}
