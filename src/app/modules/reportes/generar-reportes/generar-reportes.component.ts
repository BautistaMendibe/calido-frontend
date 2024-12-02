import {Component, OnInit} from '@angular/core';
import {SeccionReporteComando} from "../../../models/comandos/reportes/SeccionReporte.comando";
import {ReporteComando} from "../../../models/comandos/reportes/Reporte.comando";
import {FiltrosReportesComando} from "../../../models/comandos/FiltrosReportes.comando";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {SnackBarService} from "../../../services/snack-bar.service";
import {ReportesService} from "../../../services/reportes.service";
import {Configuracion} from "../../../models/configuracion.model";
import {ConfiguracionesService} from "../../../services/configuraciones.service";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import {Chart, ChartDataset, ChartOptions} from "chart.js";

@Component({
  selector: 'app-generar-reportes',
  templateUrl: './generar-reportes.component.html',
  styleUrl: './generar-reportes.component.scss'
})
export class GenerarReportesComponent implements OnInit {

  public secciones: SeccionReporteComando[] = [];
  public form: FormGroup;
  public configuracion: Configuracion = new Configuracion();
  public buscandoData: boolean = false;
  public barChartLabels: string[] = [];
  private chart!: Chart;

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
    this.buscandoData = true;
    if (validarFecha) {
      this.reporteService.obtenerDataReporte(reporte).subscribe((data) => {
        reporte.data = data;
        reporte.filtros.fechaDesde = this.txFechaDesde.value ?  this.txFechaDesde.value : null;
        reporte.filtros.fechaHasta = this.txFechaHasta.value ?  this.txFechaHasta.value : null;

        if (reporte.tipoGrafico) {
          if(reporte.tipoGrafico == 'bar') {
            this.generarGraficoBarras(reporte);
          }
        } else {
          this.reporteService.generarPDF(reporte, this.configuracion);
          this.buscandoData = false;
        }
      });
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

  private generarGraficoBarras(reporte: ReporteComando) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    if (!reporte.data || reporte.data.length === 0) {
      console.error('No hay datos para generar el gráfico.');
      return;
    }

    if (!ctx) {
      console.error('Error al crear el contexto del gráfico.');
      return;
    }

    // Mapeamos los datos para las etiquetas (dato1) y los valores (dato2)
    const labels = reporte.data.map((item) => item.dato1.length > 10 ? item.dato1.substring(0, 10) + '...' : item.dato1);
    const data = reporte.data.map((item) => item.dato2);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels, // Etiquetas dinámicas para el eje X
        datasets: [
          {
            label: 'Cantidad', // Etiqueta para la leyenda
            data: data, // Datos de la cantidad
            backgroundColor: 'rgba(246,121,86,0.5)',
            borderColor: 'rgba(225, 91, 53, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: this.barChartOptions,
    });

    // Generar la imagen en base64 cuando el gráfico esté renderizado
    setTimeout(() => {
      reporte.imagenGrafico = this.chart.toBase64Image();
      console.log(reporte.imagenGrafico);
      document.body.removeChild(canvas);
      this.reporteService.generarPDF(reporte, this.configuracion);
      this.buscandoData = false;
    }, 500);
  }


  private obtenerSecciones() {
    this.secciones = [
      new SeccionReporteComando(
        'Ventas',
        'sell',
        [
          new ReporteComando(
            'Cantidad de ventas por tipo de producto',
            'reportes_ventas_por_tipo_producto',
            new FiltrosReportesComando(),
            ['Tipo de producto', 'Cantidad'],
            [],
            'bar'
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


  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10,
          font: {
            size: 14,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 1)',
          lineWidth: 0.1,
        },

      },
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 0,
          padding: 5,
          font: {
            size: 14,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 1)',
          lineWidth: 0.1,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
        position: 'top',
      },
    },
    elements: {
      bar: {},
    },
  };


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
