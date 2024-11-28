import {Component, OnInit} from '@angular/core';
import {SeccionReporteComando} from "../../../models/comandos/reportes/SeccionReporte.comando";
import {ReporteComando} from "../../../models/comandos/reportes/Reporte.comando";
import {FiltrosReportesComando} from "../../../models/comandos/FiltrosReportes.comando";

@Component({
  selector: 'app-generar-reportes',
  templateUrl: './generar-reportes.component.html',
  styleUrl: './generar-reportes.component.scss'
})
export class GenerarReportesComponent implements OnInit{

  public secciones: SeccionReporteComando[] = [];

  ngOnInit() {
    this.obtenerSecciones();
  }

  public expandirReporte(reporte: ReporteComando) {
    reporte.activo = !reporte.activo;
  }

  private obtenerSecciones() {
    this.secciones = [
      new SeccionReporteComando(
        'Ventas',
        'sell',
        [
          new ReporteComando(
            'Cantidad de ventas por tipo de producto',
            '',
            new FiltrosReportesComando()
          )
        ]
      )
    ]
  }
}
