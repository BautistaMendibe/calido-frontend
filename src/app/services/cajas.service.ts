import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import {SpResult} from "../models/resultadoSp.model";
import {FiltrosCajas} from "../models/comandos/FiltrosCaja.comando";
import {Caja} from "../models/Caja.model";

@Injectable({
  providedIn: 'root'
})
export class CajasService {
  private urlBackend = environmentDEV.backendUrl;
  private controllerName = 'cajas';

  constructor(private http: HttpClient) {}

  public registrarCaja(caja: Caja): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/registrar-caja`, caja);
  }

  public consultarCajas(filtro: FiltrosCajas): Observable<Caja[]>{
    return this.http.post<Caja[]>(`${this.urlBackend}/${this.controllerName}/consultar-cajas`, filtro);
  }

  public eliminarCaja(idCaja: number): Observable<SpResult>{
    return this.http.get<SpResult>(`${this.urlBackend}/${this.controllerName}/eliminar-caja/${idCaja}`);
  }

  public modificarCaja(caja: Caja): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/modificar-caja`, caja);
  }
}
