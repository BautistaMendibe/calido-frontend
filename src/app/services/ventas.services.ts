import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import {SpResult} from "../models/resultadoSp.model";
import {FormaDePago} from "../models/formaDePago.model";
import {Venta} from "../models/venta.model";
import {CondicionIva} from "../models/CondicionIva.model";
import {TipoFactura} from "../models/tipoFactura.model";
import {FiltrosVentas} from "../models/comandos/FiltrosVentas.comando";
import {VentasMensuales} from "../models/comandos/dashboard/VentasMensuales.comando";
import {VentasDiariaComando} from "../models/comandos/dashboard/VentasDiaria.comando";


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

  public buscarCategorias(): Observable<CondicionIva[]>{
    return this.http.get<CondicionIva[]>(`${this.urlBackend}/${this.controllerName}/obtener-condiciones-iva`);
  }

  public buscarTiposFactura(): Observable<TipoFactura[]>{
    return this.http.get<TipoFactura[]>(`${this.urlBackend}/${this.controllerName}/obtener-tipos-facturacion`);
  }

  public facturarVentaConAfip(venta: Venta): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/facturar-venta`, venta);
  }

  public anularVenta(venta: Venta): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/anular-venta`, venta);
  }

  public buscarVentas(filtros: FiltrosVentas): Observable<Venta[]>{
    return this.http.post<Venta[]>(`${this.urlBackend}/${this.controllerName}/buscar-ventas`, filtros);
  }

  public buscarVentasPaginadas(filtros: FiltrosVentas): Observable<Venta[]>{
    return this.http.post<Venta[]>(`${this.urlBackend}/${this.controllerName}/buscar-ventas-paginadas`, filtros);
  }

  public buscarVentasPorCC(idUsuario: number): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.urlBackend}/${this.controllerName}/buscar-ventas-por-cc/${idUsuario}`);
  }

  public buscarVentasFechaHora(fechaHora: string | null, fechaHoraCierre: string | null): Observable<Venta[]> {
    const body = { fechaHora, fechaHoraCierre };
    return this.http.post<Venta[]>(`${this.urlBackend}/${this.controllerName}/buscar-ventas-fecha-hora`, body);
  }

  public buscarCantidadVentasMensuales(): Observable<VentasMensuales[]>{
    return this.http.get<VentasMensuales[]>(`${this.urlBackend}/${this.controllerName}/obtener-cantidad-ventas-mensuales`);
  }

  public buscarVentasPorDiaYHoraDashboard(): Observable<VentasDiariaComando[]>{
    return this.http.get<VentasDiariaComando[]>(`${this.urlBackend}/${this.controllerName}/obtener-cantidad-ventas-dia-hora`);
  }

  public cancelarVenta(venta: Venta): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/cancelar-venta`, venta);
  }

  public cancelarVentaParcialmente(venta: Venta): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/cancelar-venta-parcialmente`, venta);
  }

  public pagarConSIROQR(venta: Venta): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/generar-pago`, venta);
  }

  public consultaPagoSIROQR(IdReferenciaOperacion: string): Observable<SpResult>{
    const body = { IdReferenciaOperacion: IdReferenciaOperacion };
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/consultar-pago`, body);
  }

  public anularVentaSinFacturacion(venta: Venta): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/anular-venta-sin-facturacion`, venta);
  }
}
