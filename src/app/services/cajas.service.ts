import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import {SpResult} from "../models/resultadoSp.model";
import {FiltrosCajas} from "../models/comandos/FiltrosCaja.comando";
import {Caja} from "../models/Caja.model";
import {Arqueo} from "../models/Arqueo.model";
import {FiltrosArqueos} from "../models/comandos/FiltrosArqueos.comando";
import {EstadoArqueo} from "../models/estadoArqueo.model";
import {MovimientoManual} from "../models/movimientoManual.model";

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

  public registrarArqueo(arqueo: Arqueo): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/registrar-arqueo`, arqueo);
  }

  public consultarArqueos(filtro: FiltrosArqueos): Observable<Arqueo[]>{
    return this.http.post<Arqueo[]>(`${this.urlBackend}/${this.controllerName}/consultar-arqueos`, filtro);
  }

  public eliminarArqueo(idArqueo: number): Observable<SpResult>{
    return this.http.get<SpResult>(`${this.urlBackend}/${this.controllerName}/eliminar-arqueo/${idArqueo}`);
  }

  public modificarArqueo(arqueo: Arqueo): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/modificar-arqueo`, arqueo);
  }

  public obtenerEstadosArqueo(): Observable<EstadoArqueo[]>{
    return this.http.get<EstadoArqueo[]>(`${this.urlBackend}/${this.controllerName}/buscar-estados-arqueo`);
  }

  public registrarMovimientoManual(movimiento: MovimientoManual): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/registrar-movimiento-manual`, movimiento);
  }

  public eliminarMovimientoManual(idMovimiento: number): Observable<SpResult>{
    return this.http.get<SpResult>(`${this.urlBackend}/${this.controllerName}/eliminar-movimiento-manual/${idMovimiento}`);
  }

  public consultarMovimientosManuales(idArqueo: number): Observable<MovimientoManual[]>{
    return this.http.get<MovimientoManual[]>(`${this.urlBackend}/${this.controllerName}/consultar-movimientos-manuales/${idArqueo}`);
  }

  public cerrarArqueo(arqueo: Arqueo): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/cerrar-arqueo`, arqueo);
  }
}
