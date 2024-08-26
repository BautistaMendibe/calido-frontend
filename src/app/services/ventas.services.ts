import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import {SpResult} from "../models/resultadoSp.model";
import {Usuario} from "../models/usuario.model";
import {FormaDePago} from "../models/formaDePago.model";
import {Venta} from "../models/venta.model";

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

  public buscarUsuariosClientes(): Observable<Usuario[]>{
    return this.http.get<Usuario[]>(`${this.urlBackend}/${this.controllerName}/buscar-usuarios-clientes`);
  }

  public buscarFormasDePago(): Observable<FormaDePago[]>{
    return this.http.get<FormaDePago[]>(`${this.urlBackend}/${this.controllerName}/buscar-formas-de-pago`);
  }

}
