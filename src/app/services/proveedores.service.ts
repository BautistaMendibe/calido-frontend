import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import {Proveedor} from "../models/proveedores.model";
import {SpResult} from "../models/resultadoSp.model";
import {FiltrosProveedores} from "../models/comandos/FiltrosProveedores.comando";
import {TipoProveedor} from "../models/tipoProveedor.model";

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {
  private urlBackend = environmentDEV.backendUrl;
  private controllerName = 'proveedores';

  constructor(private http: HttpClient) {}

  public consultarProveedores(filtro: FiltrosProveedores): Observable<Proveedor[]>{
    return this.http.post<Proveedor[]>(`${this.urlBackend}/${this.controllerName}/consultar-proveedores`, filtro);
  }

  public buscarTodosProveedores(): Observable<Proveedor[]>{
    return this.http.get<Proveedor[]>(`${this.urlBackend}/${this.controllerName}/buscar-todos-proveedores`);
  }

  public registrarProveedor(proveedor: Proveedor): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/registrar-proveedor`, proveedor);
  }

  public modificarProveedor(proveedor: Proveedor): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/modificar-proveedor`, proveedor);
  }

  public eliminarProveedor(idProveedor: number): Observable<SpResult>{
    return this.http.get<SpResult>(`${this.urlBackend}/${this.controllerName}/eliminar-proveedor/${idProveedor}`);
  }

  public buscarTiposProveedores(): Observable<TipoProveedor[]>{
    return this.http.get<TipoProveedor[]>(`${this.urlBackend}/${this.controllerName}/buscar-tipos-proveedores`);
  }
}
