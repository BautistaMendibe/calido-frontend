import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import {SpResult} from "../models/resultadoSp.model";
import {Usuario} from "../models/usuario.model";
import {FormaDePago} from "../models/formaDePago.model";
import {Venta} from "../models/venta.model";

import { FiltrosCuentasCorrientes } from "../models/comandos/FiltrosCuentasCorrientes";
import {CondicionIva} from "../models/CondicionIva.model";
import {TipoFactura} from "../models/tipoFactura.model";
import {FiltrosVentas} from "../models/comandos/FiltrosVentas.comando";


@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private urlBackend = environmentDEV.backendUrl;
  private controllerName = 'ventas';

  constructor(private http: HttpClient) {}

  public registrarVenta(venta: Venta): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/registrar-venta`, venta);
  }

  public buscarFormasDePago(): Observable<FormaDePago[]>{
    return this.http.get<FormaDePago[]>(`${this.urlBackend}/${this.controllerName}/buscar-formas-de-pago`);
  }


  public buscarVentasPorCC(filtro: FiltrosCuentasCorrientes): Observable<Venta[]> {
    return this.http.post<Venta[]>(`${this.urlBackend}/${this.controllerName}/buscar-ventas-por-cc`, filtro);
  }
  
  public buscarCategorias(): Observable<CondicionIva[]>{
    return this.http.get<CondicionIva[]>(`${this.urlBackend}/${this.controllerName}/obtener-condiciones-iva`);
  }

  public buscarTiposFactura(): Observable<TipoFactura[]>{
    return this.http.get<TipoFactura[]>(`${this.urlBackend}/${this.controllerName}/obtener-tipos-facturacion`);
  }

  public facturarVentaConAfip(venta: Venta): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/facturar-venta`, venta);
  }

  public buscarVentas(filtros: FiltrosVentas): Observable<Venta[]>{
    return this.http.post<Venta[]>(`${this.urlBackend}/${this.controllerName}/buscar-ventas`, filtros);
  }

}
