import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {UsuariosService} from "./services/usuarios.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'front';
  sideBarOpen = true;
  estaLogeado: boolean = false;

  constructor(private router: Router, private usuariosService: UsuariosService) {}

  ngOnInit(){
    const estaLogeado = this.usuariosService.isAuthenticated();

    if (estaLogeado) {
      this.estaLogeado = true;
    } else {
      this.estaLogeado = false;
      this.router.navigate(['/login']);
    }
  }

  sideBarToggler(event: any) {
    if (event) {
      this.sideBarOpen = !this.sideBarOpen;
    } else {
      this.sideBarOpen = event;
    }
  }
}
