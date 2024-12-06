import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class CajasService {
  //private urlBackend = environmentDEV.backendUrl;
  //private controllerName = 'cajas';

  public modo: string = '';

  constructor() {}


  obtenerModo() {
    return this.modo
  }

  cambiarModo(modo: string) {
    this.modo = modo;
  }

}
