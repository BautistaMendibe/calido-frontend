import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import {Usuario} from "../models/usuario.model";
import {SpResult} from "../models/resultadoSp.model";
import {FiltrosCuentasCorrientes} from "../models/comandos/FiltrosCuentasCorrientes";

@Injectable({
  providedIn: 'root'
})

export class CuentasCorrientesService {
  private urlBackend = environmentDEV.backendUrl;
  private controllerName = 'cuentasCorrientes';

  constructor(private http: HttpClient) {}

  public consultarCuentasCorrientes(filtro: FiltrosCuentasCorrientes): Observable<Usuario[]>{
    return this.http.post<Usuario[]>(`${this.urlBackend}/${this.controllerName}/consultar-cuentas-corrientes`, filtro);
  }
}
