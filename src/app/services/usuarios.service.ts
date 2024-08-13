import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import {SpResult} from "../models/resultadoSp.model";
import {Usuario} from "../models/usuario.model";
import {FiltrosEmpleados} from "../models/comandos/FiltrosEmpleados.comando";
import {Proveedor} from "../models/proveedores.model";

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private urlBackend = environmentDEV.backendUrl;
  private controllerName = 'usuarios';

  constructor(private http: HttpClient) {}

  public validarInicioSesion(usuario: string, contrasena: string): Observable<string>{
    const body = {
      usuario: usuario,
      contrasena: contrasena
    }
    return this.http.post<string>(`${this.urlBackend}/${this.controllerName}/validar-inicio-sesion`, body);
  }

  public registrarUsuario(usuario: Usuario): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/registrar-usuario`, usuario);
  }

  public consultarUsuarios(filtro: FiltrosEmpleados): Observable<Usuario[]>{
    return this.http.post<Usuario[]>(`${this.urlBackend}/${this.controllerName}/consultar-usuarios`, filtro);
  }

  public modificarUsuario(usuario: Usuario): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/modificar-usuario`, usuario);
  }

  public eliminarUsuario(idUsuario: number): Observable<SpResult>{
    return this.http.get<SpResult>(`${this.urlBackend}/${this.controllerName}/eliminar-usuario/${idUsuario}`);
  }

  public registrarSuperusuario(usuario: Usuario): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/registrar-superusuario`, usuario);
  }

}
