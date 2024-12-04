import {Component, OnInit} from '@angular/core';
import {Usuario} from "../../../models/usuario.model";
import {UsuariosService} from "../../../services/usuarios.service";

@Component({
  selector: 'app-ultimos-clientes-registrados',
  templateUrl: './ultimos-clientes-registrados.component.html',
  styleUrl: './ultimos-clientes-registrados.component.scss'
})
export class UltimosClientesRegistradosComponent implements OnInit {

  public clientes: Usuario[] = [];
  public buscando: boolean = false;

  constructor(private usuariosService: UsuariosService) {
  }

  ngOnInit() {
    this.buscarUltimosClientes();
  }

  private buscarUltimosClientes() {
    this.buscando = true;
    this.usuariosService.buscarUltimosClientes().subscribe((usuarios: Usuario[]) => {
      this.clientes = usuarios;
      this.buscando = false;
    });
  }

}
