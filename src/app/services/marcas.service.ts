import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";
import {Marca} from "../models/Marcas.model";


@Injectable({
  providedIn: 'root'
})
export class MarcasService {
  private urlBackend = environmentDEV.backendUrl;
  private controllerName = 'marcas';

  constructor(private http: HttpClient) {}

  public buscarMarcas(): Observable<Marca[]>{
    return this.http.get<Marca[]>(`${this.urlBackend}/${this.controllerName}/buscar-marcas`);
  }
}
