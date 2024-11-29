import {Injectable} from "@angular/core";
import {environmentDEV} from "../../environments/environment-dev";
import {HttpClient} from "@angular/common/http";
import {ReporteComando} from "../models/comandos/reportes/Reporte.comando";
import {Observable} from "rxjs";


Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private urlBackend = environmentDEV.backendUrl;
  private controllerName = 'reportes';

  constructor(private http: HttpClient) {}

  //public obtenerDataReporte(reporte: ReporteComando): Observable<[]>{
  //  return this.http.post<>(`${this.urlBackend}/${this.controllerName}/obtener-data-reporte`, reporte);
  //}



}
