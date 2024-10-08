import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import {SpResult} from "../models/resultadoSp.model";
import {FiltrosTarjetas} from "../models/comandos/FiltrosTarjetas.comando";
import {Tarjeta} from "../models/tarjeta.model";
import {TipoTarjeta} from "../models/tipoTarjeta.model";
import {Cuota} from "../models/Cuota.model";

@Injectable({
  providedIn: 'root'
})
export class TarjetasService {
  private urlBackend = environmentDEV.backendUrl;
  private controllerName = 'tarjetas';

  constructor(private http: HttpClient) {}

  public consultarTarjetas(filtro: FiltrosTarjetas): Observable<Tarjeta[]>{
    return this.http.post<Tarjeta[]>(`${this.urlBackend}/${this.controllerName}/consultar-tarjetas`, filtro);
  }

  public registrarTarjeta(tarjeta: Tarjeta): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/registrar-tarjeta`, tarjeta);
  }

  public modificarTarjeta(tarjeta: Tarjeta): Observable<SpResult>{
    return this.http.post<SpResult>(`${this.urlBackend}/${this.controllerName}/modificar-tarjeta`, tarjeta);
  }

  public eliminarTarjeta(idTarjeta: number): Observable<SpResult>{
    return this.http.get<SpResult>(`${this.urlBackend}/${this.controllerName}/eliminar-tarjeta/${idTarjeta}`);
  }

  public buscarTiposTarjetas(): Observable<TipoTarjeta[]>{
    return this.http.get<TipoTarjeta[]>(`${this.urlBackend}/${this.controllerName}/buscar-tipo-tarjetas`);
  }

  public buscarCuotas(): Observable<Cuota[]>{
    return this.http.get<Cuota[]>(`${this.urlBackend}/${this.controllerName}/buscar-cuotas`);
  }
}
