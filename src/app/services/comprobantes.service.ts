import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import {SpResult} from "../models/resultadoSp.model";
import {FiltrosComprobantes} from "../models/comandos/FiltrosComprobantes.comando";
import {Comprobante} from "../models/comprobante.model";
import {EstadoPedido} from "../models/estadoPedido";
import {TipoComprobante} from "../models/tipoComprobante.model";


@Injectable({
  providedIn: 'root'
})
export class ComprobantesService {
  private urlBackend = environmentDEV.backendUrl;
  private controllerName = 'comprobantes';

  constructor(private http: HttpClient) {}

  public registrarComprobante(comprobante: Comprobante): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/registrar-comprobante`, comprobante);
  }

  public consultarComprobantes(filtro: FiltrosComprobantes): Observable<Comprobante[]>{
    return this.http.post<Comprobante[]>(`${this.urlBackend}/${this.controllerName}/consultar-comprobantes`, filtro);
  }

  public eliminarComprobante(idComprobante: number): Observable<SpResult>{
    return this.http.get<SpResult>(`${this.urlBackend}/${this.controllerName}/eliminar-comprobante/${idComprobante}`);
  }

  public modificarComprobante(comprobante: Comprobante): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/modificar-comprobante`, comprobante);
  }

  public obtenerTiposComprobantes(): Observable<TipoComprobante[]>{
    return this.http.get<TipoComprobante[]>(`${this.urlBackend}/${this.controllerName}/buscar-tipos-comprobantes`);
  }

}
