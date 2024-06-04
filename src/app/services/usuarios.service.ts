import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import {SpResult} from "../models/resultadoSp.model";

@Injectable()
export class UsuariosService {
  private urlBackend = environmentDEV.backendUrl;
  private controllerName = 'usuarios';
  constructor(private http: HttpClient) {}

  public validarInicioSesion(usuario: string, contrasena: string): Observable<SpResult>{
    const body = {
      usuario: usuario,
      contrasena: contrasena
    }
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/validar-inicio-sesion`, body);
  }
}
