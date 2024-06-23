import {Component, EventEmitter, OnInit, Input, Output} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.servicie";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  @Output() toggleSideBarForMe: EventEmitter<boolean> = new EventEmitter();
  public estaLogeado: boolean = false;
  public nombreApellido: string = '';

  constructor(private authService: AuthService, private router: Router) {
  }

  ngOnInit() {
    this.authService.authenticationStatus$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.toggleSideBarForMe.emit(true);
        const token = this.authService.getToken();
        console.log(token);
        this.estaLogeado = true;
      } else {
        this.toggleSideBarForMe.emit(false);
        this.estaLogeado = false;
        this.router.navigate(['/login']);
      }
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

  // Metodo para cambiar el rol del usuario actual
  public change() {}

}
