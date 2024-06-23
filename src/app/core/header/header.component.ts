import {Component, EventEmitter, OnInit, Input, Output} from '@angular/core';
import {UsuariosService} from "../../services/usuarios.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  @Output() toggleSideBarForMe: EventEmitter<boolean> = new EventEmitter();
  estaLogeado: boolean = false;

  constructor(private usuariosService: UsuariosService, private router: Router) {
  }

  ngOnInit() {
    this.usuariosService.authenticationStatus$.subscribe(isAuthenticated => {
      this.estaLogeado = isAuthenticated;
      // Aquí puedes agregar cualquier lógica adicional que necesites ejecutar cuando el estado de autenticación cambie
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
    this.usuariosService.logOut();
    this.router.navigate(['/login']);
  }

  // Metodo para cambiar el rol del usuario actual
  public change() {}

}
