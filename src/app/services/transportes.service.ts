import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import {Transporte} from "../models/transporte.model";


@Injectable({
  providedIn: 'root'
})
export class TransportesService {
  private urlBackend = environmentDEV.backendUrl;
  private controllerName = 'transportes';

  constructor(private http: HttpClient) {}

  public buscarTransportes(): Observable<Transporte[]>{
    return this.http.get<Transporte[]>(`${this.urlBackend}/${this.controllerName}/buscar-transportes`);
  }
}
