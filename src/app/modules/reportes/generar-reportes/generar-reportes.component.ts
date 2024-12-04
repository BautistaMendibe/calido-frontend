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
import {Chart, ChartDataset, ChartOptions, ChartType, registerables} from "chart.js";

Chart.register(...registerables);

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
  public tiposGraficos = [
    'Ninguno',
    'Barras',
    'Torta'
  ];
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
      txTipoGrafico: [this.tiposGraficos[0]],
    });
  }

  private async buscarConfiguraciones() {
    this.configuracionesService.consultarConfiguraciones().subscribe((configuracion) => {
      this.configuracion = configuracion;
    });
  }

  public expandirReporte(reporte: ReporteComando) {
    if (!reporte.noNecesitaFiltro) {
      reporte.activo = !reporte.activo;
    }
  }

  public generarReporte(reporte: ReporteComando) {
    const validarFecha = this.validarFechas(reporte);
    this.buscandoData = true;
    if (validarFecha) {
      this.limpiarDataReporte(reporte);
      this.reporteService.obtenerDataReporte(reporte).subscribe((data) => {
        reporte.data = data;

        if (this.txTipoGrafico.value != 'Ninguno' && !reporte.noNecesitaFiltro) {
          if(this.txTipoGrafico.value == 'Barras') {
            this.generarGraficoBarras(reporte);
          }
          if(this.txTipoGrafico.value == 'Torta') {
            this.generarGraficoTorta(reporte);
          }
        } else {
          reporte.imagenGrafico = '';
          this.reporteService.generarPDF(reporte, this.configuracion);
          this.buscandoData = false;
        }
      });
    } else {
      this.notificacionService.openSnackBarError('La fecha desde tiene que ser menor o igual a la fecha hasta.')
    }
  }

  private validarFechas(reporte: ReporteComando): boolean {
    if (this.txFechaDesde.value <= this.txFechaHasta.value) {
      reporte.filtros.fechaDesde = this.txFechaDesde.value ?  this.txFechaDesde.value : null;
      reporte.filtros.fechaHasta = this.txFechaHasta.value ?  this.txFechaHasta.value : null;
      return true;
    } else {
      reporte.filtros.fechaDesde = this.txFechaDesde.value ?  this.txFechaDesde.value : null;
      reporte.filtros.fechaHasta = this.txFechaHasta.value ?  this.txFechaHasta.value : null;
      return false;
    }
  }

  private limpiarDataReporte(reporte: ReporteComando) {
    reporte.data = [];
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
            backgroundColor: 'rgba(246,121,86,0.8)',
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

  private generarGraficoTorta(reporte: ReporteComando) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    if (!ctx || !reporte.data || reporte.data.length === 0) {
      console.error('No hay datos o contexto para generar el gráfico.');
      return;
    }

    const labels = reporte.data.map((item) => item.dato1);
    const data = reporte.data.map((item) => item.dato2);

    const colores = this.generarColoresDinamicos(data.length);

    // Crear el gráfico de tipo 'pie'
    this.chart = new Chart(ctx, {
      type: 'pie' as ChartType,
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Cantidad',
            data: data,
            backgroundColor: colores.backgroundColor,
            borderColor: colores.borderColor,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            enabled: true,
          },
        },
      },
    });

    // Generar imagen en base64 para el PDF
    setTimeout(() => {
      reporte.imagenGrafico = this.chart.toBase64Image();
      console.log(reporte.imagenGrafico);
      document.body.removeChild(canvas);
      this.reporteService.generarPDF(reporte, this.configuracion);
      this.buscandoData = false;
    }, 500);
  }

  private generarColoresDinamicos(cantidad: number): { backgroundColor: string[], borderColor: string[] } {
    const backgroundColor: string[] = [];
    const borderColor: string[] = [];

    for (let i = 0; i < cantidad; i++) {
      // Generar colores aleatorios en formato RGBA
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      const alpha = 0.8;

      backgroundColor.push(`rgba(${r}, ${g}, ${b}, ${alpha})`);
      borderColor.push(`rgba(${r}, ${g}, ${b}, 1)`);
    }

    return { backgroundColor, borderColor };
  }



  private obtenerSecciones() {
    this.secciones = [
      new SeccionReporteComando(
        'Productos',
        'shopping_cart',
        [
          new ReporteComando(
            'Stock actual de productos',
            'reportes_stock_actual',
            new FiltrosReportesComando(),
            ['Productos', 'Cantidad'],
            [],
            '',
            true
          ),
          new ReporteComando(
            'Productos más vendidos',
            'reportes_productos_mas_vendidos',
            new FiltrosReportesComando(),
            ['Productos', 'Cantidad de ventas'],
            [],
          ),
        ]
      ),

      new SeccionReporteComando(
        'Ventas',
        'sell',
        [
          new ReporteComando(
            'Ventas por tipo de producto',
            'reportes_ventas_por_tipo_producto',
            new FiltrosReportesComando(),
            ['Tipo de producto', 'Cantidad de ventas'],
            [],
          ),
          new ReporteComando(
            'Ventas por proveedor',
            'reportes_ventas_por_proveedor',
            new FiltrosReportesComando(),
            ['Proveedor', 'Cantidad de ventas'],
            [],
          ),
          new ReporteComando(
            'Ventas por clientes',
            'reportes_ventas_por_cliente',
            new FiltrosReportesComando(),
            ['Cliente', 'Cantidad de ventas'],
            [],
          ),
          new ReporteComando(
            'Ventas por forma de pago',
            'reportes_ventas_por_forma_de_pago',
            new FiltrosReportesComando(),
            ['Forma de pago', 'Cantidad de ventas'],
            [],
          ),
        ]
      ),

      new SeccionReporteComando(
        'Proveedores',
        'local_shipping',
        [
          new ReporteComando(
            'Compras por proveedor',
            'reportes_pedidos_por_proveedor',
            new FiltrosReportesComando(),
            ['Proveedor', 'Cantidad de compras'],
            [],
          ),
        ]
      ),

      new SeccionReporteComando(
        'Empleados',
        'supervisor_account',
        [
          new ReporteComando(
            'Ventas por empleados',
            'reportes_ventas_por_empleado',
            new FiltrosReportesComando(),
            ['Empleados', 'Cantidad de ventas'],
            [],
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

  get txTipoGrafico(): FormControl {
    return this.form.get('txTipoGrafico') as FormControl;
  }

}
