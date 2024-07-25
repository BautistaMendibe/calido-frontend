import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import {Producto} from "../models/producto.model";
import {SpResult} from "../models/resultadoSp.model";
import {FiltrosProductos} from "../models/comandos/FiltrosProductos.comando";

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

}
