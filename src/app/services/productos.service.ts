import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import {Producto} from "../models/producto.model";
import {SpResult} from "../models/resultadoSp.model";
import {FiltrosProductos} from "../models/comandos/FiltrosProductos.comando";
import {TipoProducto} from "../models/tipoProducto.model";
import {DetalleProducto} from "../models/detalleProducto";
import {FiltrosDetallesProductos} from "../models/comandos/FiltrosDetallesProductos";

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private urlBackend = environmentDEV.backendUrl;
  private controllerName = 'productos';

  constructor(private http: HttpClient) {}

  public consultarProductos(filtro: FiltrosProductos): Observable<Producto[]>{
    return this.http.post<Producto[]>(`${this.urlBackend}/${this.controllerName}/consultar-productos`, filtro);
  }

  public registrarProducto(producto: Producto): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/registrar-producto`, producto);
  }

  public modificarProducto(producto: Producto): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/modificar-producto`, producto);
  }

  public eliminarProducto(idProducto: number): Observable<SpResult>{
    return this.http.get<SpResult>(`${this.urlBackend}/${this.controllerName}/eliminar-producto/${idProducto}`);
  }

  public buscarTiposProductos(): Observable<TipoProducto[]>{
    return this.http.get<TipoProducto[]>(`${this.urlBackend}/${this.controllerName}/buscar-tipo-productos`);
  }

  public registrarDetalleProducto(detalle: DetalleProducto): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/registrar-detalle-producto`, detalle);
  }

  public modificarDetalleProducto(detalle: DetalleProducto): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/modificar-detalle-producto`, detalle);
  }

  public consultarDetallesProductos(filtro: FiltrosDetallesProductos): Observable<DetalleProducto[]>{
    return this.http.post<DetalleProducto[]>(`${this.urlBackend}/${this.controllerName}/consultar-detalles-productos`, filtro);
  }

  public eliminarDetalleProducto(idDetalleProducto: number): Observable<SpResult>{
    return this.http.get<SpResult>(`${this.urlBackend}/${this.controllerName}/eliminar-detalle-producto/${idDetalleProducto}`);
  }
}
