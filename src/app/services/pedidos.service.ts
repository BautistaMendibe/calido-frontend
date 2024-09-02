import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import {SpResult} from "../models/resultadoSp.model";
import {Pedido} from "../models/pedido.model";


@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private urlBackend = environmentDEV.backendUrl;
  private controllerName = 'pedidos';

  constructor(private http: HttpClient) {}

  public registrarPedido(pedido: Pedido): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/registrar-pedido`, pedido);
  }
}
