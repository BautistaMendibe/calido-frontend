import {Injectable} from "@angular/core";
import {Observable, tap, throwError} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environmentDEV} from "../../environments/environment-dev";

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  private urlBackend = environmentDEV.backendUrl;
  private controllerName = 'files';

  constructor(private http: HttpClient) {}

  public guardarArchivo(file: File): Observable<{ nombreArchivo: string, fileId: number }> {
    const maxFileSize = 10 * 1024 * 1024; // 10MB en bytes

    // Verificar si el tamaño del archivo es mayor que el límite
    if (file.size > maxFileSize) {
      return throwError(() => 'El archivo excede el tamaño máximo de 10MB.');
    }

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ nombreArchivo: string, fileId: number }>(`${this.urlBackend}/files/upload`, formData);
  }

  public obtenerArchivo(nombreOriginal: string): Observable<Blob> {
    return this.http.get(`${this.urlBackend}/${this.controllerName}/download/${nombreOriginal}`, { responseType: 'blob' })
      .pipe(
        tap((blob: Blob) => {
          const url = window.URL.createObjectURL(blob);

          // Crear un enlace temporal para descargar
          const a = document.createElement('a');
          a.href = url;
          a.download = nombreOriginal;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        })
      );
  }

}
