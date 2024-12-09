import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ThemeCalidoService {
  // BehaviorSubject inicializado con el valor guardado en localStorage o false por defecto
  private darkModeSubject = new BehaviorSubject<boolean>(
      localStorage.getItem('darkMode') === 'true'
  );
  darkMode$ = this.darkModeSubject.asObservable();

  constructor() {
    // Aplicar el estado inicial del tema al cargar el servicio
    const initialDarkMode = this.darkModeSubject.getValue();
    this.updateBodyClass(initialDarkMode);
  }

  // Alternar entre modo oscuro y modo claro
  toggleDarkMode(): void {
    const currentMode = this.darkModeSubject.getValue();
    const newMode = !currentMode;
    this.darkModeSubject.next(newMode); // Emitir nuevo valor
    this.updateBodyClass(newMode); // Actualizar la clase del body
    localStorage.setItem('darkMode', newMode.toString()); // Guardar el estado en localStorage
  }

  // Obtener el estado actual del modo oscuro
  isDarkMode(): boolean {
    return this.darkModeSubject.getValue();
  }

  // Actualizar la clase del body según el estado del tema
  private updateBodyClass(isDarkMode: boolean): void {
    const classList = document.body.classList;
    if (isDarkMode) {
      classList.add('dark-theme');
    } else {
      classList.remove('dark-theme');
    }
  }
}
