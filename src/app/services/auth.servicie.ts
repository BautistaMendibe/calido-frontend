import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import { jwtDecode } from 'jwt-decode';


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private urlBackend = environmentDEV.backendUrl;
    private authenticationStatusSource = new BehaviorSubject<boolean>(this.isAuthenticated());
    authenticationStatus$ = this.authenticationStatusSource.asObservable();

    constructor() {}

    public setToken(token: string) {
        localStorage.setItem('auth_token', token);
    }

    public logOut() {
        localStorage.removeItem('auth_token');
    }

    public getToken(): string {
        return localStorage.getItem('auth_token') ?? '';
    }

    public isAuthenticated(): boolean {
        // Devuelve true si el token existe, indicando que el usuario está autenticado
        const token = localStorage.getItem('auth_token');
        return!!token;
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
