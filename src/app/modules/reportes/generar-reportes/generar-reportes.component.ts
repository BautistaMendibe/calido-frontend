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

  public generarReporte(reporte: ReporteComando) {
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
          ),
          new ReporteComando(
            'Cantidad de ventas por proveedor',
            '',
            new FiltrosReportesComando()
          ),
          new ReporteComando(
            'Ventas por temporada',
            '',
            new FiltrosReportesComando()
          ),
          new ReporteComando(
            'Ventas por clientes',
            '',
            new FiltrosReportesComando()
          )
        ]
      ),

      new SeccionReporteComando(
        'Proveedores',
        'local_shipping',
        [
          new ReporteComando(
            'Cantidad de ventas por tipo de producto',
            '',
            new FiltrosReportesComando()
          ),
          new ReporteComando(
            'Cantidad de ventas por proveedor',
            '',
            new FiltrosReportesComando()
          ),
        ]
      ),

      new SeccionReporteComando(
        'Productos',
        'shopping_cart',
        [
          new ReporteComando(
            'Cantidad de ventas por tipo de producto',
            '',
            new FiltrosReportesComando()
          ),
          new ReporteComando(
            'Cantidad de ventas por proveedor',
            '',
            new FiltrosReportesComando()
          ),
        ]
      ),

    ]
  }
}
