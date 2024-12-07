import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {ConfiguracionesService} from "../../services/configuraciones.service";
import {ThemeCalidoService} from "../../services/theme.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  @Output() toggleSideBarForMe: EventEmitter<boolean> = new EventEmitter();
  public estaLogeado: boolean = false;
  public nombreApellido: string = '';
  public logoUrl: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private configuracionesService: ConfiguracionesService,
    private themeService: ThemeCalidoService,
    private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.authService.authenticationStatus$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.obtenerLogo();
        this.toggleSideBarForMe.emit(true);
        this.estaLogeado = true;
        const token = this.authService.getToken();

        // Del token sacamos el nombre del usuario para mostrar
        const infoToken: any = this.authService.getDecodedAccessToken(token);
        const nombre = infoToken.nombre;
        const apellido = infoToken.apellido;
        this.nombreApellido = `${nombre} ${apellido}`;

      } else {
        const currentUrl = window.location.href;
        if (!currentUrl.includes('recuperar-contrasena')) {
          this.router.navigate(['/login']);
          this.toggleSideBarForMe.emit(false);
          this.estaLogeado = false;
        }
      }
    });
  }

  public toggleTheme() {
    this.themeService.toggleDarkMode();
  }

  // Metodo que obtiene el logo para utilizar en el header desde la configuración
  public obtenerLogo() {
    this.configuracionesService.consultarConfiguraciones().subscribe((configuracion) => {
       this.logoUrl = configuracion.logo; // De todas formas, el scss redimensiona a 35x43px
    });
  }

  // Metodo para abrir el menu lateral
  public toggleSideBar() {
    this.toggleSideBarForMe.emit(true);
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }

  // Metodo para salir de la sesion actual
  public exit() {
    this.toggleSideBarForMe.emit(false);
    this.estaLogeado = false;
    this.authService.logOut();
    this.router.navigate(['/login']);
  }

}
