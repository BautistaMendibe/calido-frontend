import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import {Configuracion} from "../models/configuracion.model";
import {SpResult} from "../models/resultadoSp.model";

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionesService {
  private urlBackend = environmentDEV.backendUrl;
  private controllerName = 'configuraciones';

  constructor(private http: HttpClient) {}

  public consultarConfiguraciones(): Observable<Configuracion>{
    return this.http.get<Configuracion>(`${this.urlBackend}/${this.controllerName}/consultar-configuraciones`);
  }

  public registrarConfiguracion(): Observable<SpResult>{
    return this.http.get<SpResult>(`${this.urlBackend}/${this.controllerName}/registrar-configuracion`);
  }

  public modificarConfiguracion(configuracion: Configuracion): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/modificar-configuracion`, configuracion);
  }

  public existeConfiguracion(): Observable<boolean>{
    return this.http.get<boolean>(`${this.urlBackend}/${this.controllerName}/existe-configuracion`);
  }

  public obtenerSuperusuario(): Observable<string>{
    return this.http.get<string>(`${this.urlBackend}/${this.controllerName}/obtener-superusuario`);
  }

}
