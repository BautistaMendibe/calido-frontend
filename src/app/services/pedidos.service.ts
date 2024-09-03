import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import {SpResult} from "../models/resultadoSp.model";
import {Pedido} from "../models/pedido.model";
import {FiltrosPedidos} from "../models/comandos/FiltrosPedidos.comando";
import {EstadoPedido} from "../models/estadoPedido";


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

  public consultarPedidos(filtro: FiltrosPedidos): Observable<Pedido[]>{
    return this.http.post<Pedido[]>(`${this.urlBackend}/${this.controllerName}/consultar-pedidos`, filtro);
  }

  public eliminarPedido(idPedido: number): Observable<SpResult>{
    return this.http.get<SpResult>(`${this.urlBackend}/${this.controllerName}/eliminar-pedido/${idPedido}`);
  }

  public obtenerEstadosPedido(): Observable<EstadoPedido[]>{
    return this.http.get<EstadoPedido[]>(`${this.urlBackend}/${this.controllerName}/buscar-estados-pedido`);
  }

  public modificarPedido(pedido: Pedido): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/modificar-pedido`, pedido);
  }
}
