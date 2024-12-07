import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ThemeCalidoService {
  //private urlBackend = environmentDEV.backendUrl;
  //private controllerName = 'cajas';

  private darkMode: boolean = false;

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    const classList = document.body.classList;
    if (this.darkMode) {
      classList.add('dark-theme');
      localStorage.setItem('darkMode', 'true');
    } else {
      classList.remove('dark-theme');
      localStorage.setItem('darkMode', 'false');
    }
  }

  initializeTheme() {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
      this.darkMode = true;
      document.body.classList.add('dark-theme');
    }
  }

  isDarkMode(): boolean {
    return this.darkMode;
  }


}
