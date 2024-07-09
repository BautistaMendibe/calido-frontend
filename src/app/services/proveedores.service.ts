import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import {Proveedor} from "../models/proveedores.model";
import {SpResult} from "../models/resultadoSp.model";
import {FiltrosProveedores} from "../models/comandos/FiltrosProveedores.comando";

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

  public registrarProveedor(proveedor: Proveedor): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/registrar-proveedor`, proveedor);
  }

}
