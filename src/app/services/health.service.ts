import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";

@Injectable()
export class HealthService {
  private controllerName = 'health';
  private urlBackend = environmentDEV.backendUrl;
  constructor(private http: HttpClient) {}

  public getStatusBackend(): Observable<any>{
    return this.http.get<any>(`${this.urlBackend}/${this.controllerName}/getStatus`);
  }
}
