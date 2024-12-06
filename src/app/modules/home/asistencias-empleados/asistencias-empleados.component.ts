import {Component, OnInit} from '@angular/core';
import {Asistencia} from "../../../models/asistencia";
import {UsuariosService} from "../../../services/usuarios.service";
import {FiltrosAsistencias} from "../../../models/comandos/FiltrosAsistencias.comando";

@Component({
  selector: 'app-asistencias-empleados',
  templateUrl: './asistencias-empleados.component.html',
  styleUrl: './asistencias-empleados.component.scss'
})
export class AsistenciasEmpleadosComponent implements OnInit {

  public asistencias: Asistencia[] = [];
  private filtrosAsistencias: FiltrosAsistencias;
  public buscando: boolean = false;

  constructor(private usuariosService: UsuariosService) {
    this.filtrosAsistencias = new FiltrosAsistencias();
  }

  ngOnInit() {
    this.buscarAsistenciasHoy();
  }

  private buscarAsistenciasHoy() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    this.filtrosAsistencias.fecha = hoy;
    this.buscando = true;

    this.usuariosService.consultarAsistencias(this.filtrosAsistencias).subscribe((asistencias) => {
      this.asistencias = asistencias;
      this.buscando = false;
    });
  }

}
