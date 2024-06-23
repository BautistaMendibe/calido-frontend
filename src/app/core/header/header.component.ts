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
  @Input() estaLogeado: boolean;

  constructor(private usuariosService: UsuariosService, private router: Router) {
    this.estaLogeado = false;
  }

  ngOnInit() {
    if (this.estaLogeado) {
      const token = this.usuariosService.getToken();

    }
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
    this.usuariosService.logOut();
    this.router.navigate(['/login']);
  }

  // Metodo para cambiar el rol del usuario actual
  public change() {}

}
