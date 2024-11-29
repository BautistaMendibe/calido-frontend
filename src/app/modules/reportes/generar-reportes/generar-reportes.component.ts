import {Component, OnInit} from '@angular/core';
import {SeccionReporteComando} from "../../../models/comandos/reportes/SeccionReporte.comando";
import {ReporteComando} from "../../../models/comandos/reportes/Reporte.comando";
import {FiltrosReportesComando} from "../../../models/comandos/FiltrosReportes.comando";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {SnackBarService} from "../../../services/snack-bar.service";
import {DataReporteComando} from "../../../models/comandos/reportes/DataReporte.comando";
import {ReportesService} from "../../../services/reportes.service";
import {Configuracion} from "../../../models/configuracion.model";
import {ConfiguracionesService} from "../../../services/configuraciones.service";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

@Component({
    selector: 'app-generar-reportes',
    templateUrl: './generar-reportes.component.html',
    styleUrl: './generar-reportes.component.scss'
})
export class GenerarReportesComponent implements OnInit {

    public secciones: SeccionReporteComando[] = [];
    public form: FormGroup;
    public configuracion: Configuracion = new Configuracion();

    constructor(
        private fb: FormBuilder,
        private notificacionService: SnackBarService,
        private reporteService: ReportesService,
        private configuracionesService: ConfiguracionesService
    ) {
      this.form = new FormGroup({});
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
    }

    ngOnInit() {
        this.obtenerSecciones();
        this.crearForm();
        this.buscarConfiguraciones();
    }

    private crearForm() {
        this.form = this.fb.group({
            txFechaDesde: [''],
            txFechaHasta: [''],
            txFiltroNumerico: [''],
            txFiltroString: [''],
        });
    }

    private async buscarConfiguraciones() {
      this.configuracionesService.consultarConfiguraciones().subscribe((configuracion) => {
        this.configuracion = configuracion;
      });
    }

    public expandirReporte(reporte: ReporteComando) {
        reporte.activo = !reporte.activo;
    }

    public generarReporte(reporte: ReporteComando) {
        const validarFecha = this.validarFechas();
        if (validarFecha) {
            //this.reporteService.obtenerDataReporte(reporte).subscribe((data) => {
            //    reporte.data = data;
            //    this.reporteService.generarPDF(reporte, this.configuracion);
            //});
            this.reporteService.generarPDF(reporte, this.configuracion);
        } else {
            this.notificacionService.openSnackBarError('La fecha desde tiene que ser menor o igual a la fecha hasta.')
        }
    }

    private validarFechas(): boolean {
        if (this.txFechaDesde.value <= this.txFechaHasta.value) {
            return true;
        } else {
            return false;
        }
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
                        new FiltrosReportesComando(),
                        [
                            new DataReporteComando(
                        'Tipo de producto',
                        ['Zapatillas', 'Pantalon', 'Medias']
                        ),
                        new DataReporteComando(
                            'Cantidad',
                            [100, 59, 243]
                        )]
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

    get txFiltroNumerico(): FormControl {
        return this.form.get('txFiltroNumerico') as FormControl;
    }

    get txFiltroString(): FormControl {
        return this.form.get('txFiltroString') as FormControl;
    }

}
