import {Component, OnInit} from '@angular/core';
import {SeccionReporteComando} from "../../../models/comandos/reportes/SeccionReporte.comando";
import {ReporteComando} from "../../../models/comandos/reportes/Reporte.comando";
import {FiltrosReportesComando} from "../../../models/comandos/FiltrosReportes.comando";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-generar-reportes',
  templateUrl: './generar-reportes.component.html',
  styleUrl: './generar-reportes.component.scss'
})
export class GenerarReportesComponent implements OnInit{

  public secciones: SeccionReporteComando[] = [];
  public form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = new FormGroup({});
  }

  ngOnInit() {
    this.obtenerSecciones();
    this.crearForm();
  }

  private crearForm() {
    this.form = this.fb.group({
      txFechaDesde: [''],
      txFechaHasta: [''],
    });
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



  //getters
  get txFechaDesde(): FormControl {
    return this.form.get('txFechaDesde') as FormControl;
  }

  get txFechaHasta(): FormControl {
    return this.form.get('txFechaHasta') as FormControl;
  }
}
