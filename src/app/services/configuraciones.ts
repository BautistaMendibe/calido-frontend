import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import {Configuracion} from "../models/configuracion.model";

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionesService {
  private urlBackend = environmentDEV.backendUrl;
  private controllerName = 'configuraciones';

  constructor(private http: HttpClient) {}

  public consultarConfiguraciones(): Observable<Configuracion>{
    return this.http.get<Configuracion>(`${this.urlBackend}/${this.controllerName}/consultar-promociones`);
  }
}
