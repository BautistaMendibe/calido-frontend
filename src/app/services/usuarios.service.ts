import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private urlBackend = environmentDEV.backendUrl;
  private controllerName = 'usuarios';
  private authenticationStatusSource = new BehaviorSubject<boolean>(this.isAuthenticated());
  authenticationStatus$ = this.authenticationStatusSource.asObservable();

  constructor(private http: HttpClient) {}

  public validarInicioSesion(usuario: string, contrasena: string): Observable<string>{
    const body = {
      usuario: usuario,
      contrasena: contrasena
    }
    return this.http.post<string>(`${this.urlBackend}/${this.controllerName}/validar-inicio-sesion`, body);
  }

  public setToken(token: string) {
    localStorage.setItem('auth_token', token);
  }

  public logOut() {
    localStorage.removeItem('auth_token');
  }

  public getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  public isAuthenticated(): boolean {
    // Devuelve true si el token existe, indicando que el usuario está autenticado
    const token = localStorage.getItem('auth_token');
    return!!token;
  }

  public getAuthenticationStatus(): Observable<boolean> {
    // Retorna un Observable que emite el estado de autenticación
    // Esto permite a los componentes suscribirse a cambios en el estado de autenticación
    return new BehaviorSubject<boolean>(this.isAuthenticated()).asObservable();
  }

  // Método para actualizar el estado de autenticación
  public updateAuthenticationStatus(isAuthenticated: boolean): void {
    this.authenticationStatusSource.next(isAuthenticated);
  }

}
