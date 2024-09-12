import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import {Provincia} from "../models/provincia.model";
import {Localidad} from "../models/localidad.model";

@Injectable({
  providedIn: 'root'
})
export class DomicilioService {
  private urlBackend = environmentDEV.backendUrl;
  private controllerName = 'domicilio';

  constructor(private http: HttpClient) {}

  public obtenerProvincias(): Observable<Provincia[]>{
    return this.http.get<Provincia[]>(`${this.urlBackend}/${this.controllerName}/obtener-provincias`);
  }

  public obtenerLocalidadesPorProvincia(idProvincia: number | null): Observable<Localidad[]>{
    return this.http.get<Localidad[]>(`${this.urlBackend}/${this.controllerName}/obtener-localidades-por-provincia/${idProvincia}`);
  }

}
