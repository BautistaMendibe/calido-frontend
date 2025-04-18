import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import {Promocion} from "../models/promociones.model";
import {SpResult} from "../models/resultadoSp.model";
import {FiltrosPromociones} from "../models/comandos/FiltrosPromociones.comando";
import {Producto} from "../models/producto.model";

@Injectable({
  providedIn: 'root'
})
export class PromocionesService {
  private urlBackend = environmentDEV.backendUrl;
  private controllerName = 'promociones';

  constructor(private http: HttpClient) {}

  public consultarPromociones(filtro: FiltrosPromociones): Observable<Promocion[]>{
    return this.http.post<Promocion[]>(`${this.urlBackend}/${this.controllerName}/consultar-promociones`, filtro);
  }

  public registrarPromocion(promocion: Promocion): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/registrar-promocion`, promocion);
  }

  public modificarPromocion(promocion: Promocion): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/modificar-promocion`, promocion);
  }

  public eliminarPromocion(idPromocion: number): Observable<SpResult>{
    return this.http.get<SpResult>(`${this.urlBackend}/${this.controllerName}/eliminar-promocion/${idPromocion}`);
  }

  public notificarPromocion(formData: FormData): Observable<SpResult> {
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/notificar-promocion`, formData);
  }

  public buscarProductos(): Observable<Producto[]>{
    return this.http.get<Producto[]>(`${this.urlBackend}/${this.controllerName}/buscar-productos`);
  }

  public buscarPromocionPorProducto(idProducto: number): Observable<Promocion[]>{
    return this.http.get<Promocion[]>(`${this.urlBackend}/${this.controllerName}/consultar-promociones-por-producto/${idProducto}`);
  }
}
