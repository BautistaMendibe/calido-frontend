import { Component, OnInit } from '@angular/core';
import { ChartDataset, ChartOptions, ChartType, Chart as ChartJS } from 'chart.js';
import {
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import {VentasMensuales} from "../../../models/comandos/dashboard/VentasMensuales.comando";
import {VentasService} from "../../../services/ventas.services";
import {ThemeCalidoService} from "../../../services/theme.service";

// Registra los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-ventas-mensuales',
  templateUrl: './ventas-mensuales.component.html',
  styleUrls: ['./ventas-mensuales.component.scss']
})
export class VentasMensualesComponent implements OnInit {

  public ventasMesuales: VentasMensuales[] = [];
  public buscando: boolean = false;
  private isDarkMode: boolean = false;

  constructor(private ventasService: VentasService, private themeService: ThemeCalidoService) {}

  ngOnInit() {
    this.buscarInfoTema();
    this.buscarCantidadVentasMensuales();
  }

  private buscarInfoTema() {
    this.themeService.darkMode$.subscribe((isDarkMode) => {
      this.isDarkMode = isDarkMode;
    });
  }

  private buscarCantidadVentasMensuales() {
    this.buscando = true;

    // Mapeo de meses en inglés a español
    const mesesEnEspanol: { [key: string]: string } = {
      January: 'Enero',
      February: 'Febrero',
      March: 'Marzo',
      April: 'Abril',
      May: 'Mayo',
      June: 'Junio',
      July: 'Julio',
      August: 'Agosto',
      September: 'Septiembre',
      October: 'Octubre',
      November: 'Noviembre',
      December: 'Diciembre'
    };

    this.ventasService.buscarCantidadVentasMensuales().subscribe((cantidadVentasMensuales) => {

      // Traducir los nombres de los meses
      this.ventasMesuales = cantidadVentasMensuales.map(venta => {
        const [mes, anio] = venta.mes.split('  '); // Separar mes y año
        return {
          ...venta,
          mes: `${mesesEnEspanol[mes.trim()]} ${anio.trim()}` // Traducir el mes y conservar el año
        };
      });

      this.barChartLabels = this.ventasMesuales.map(venta => venta.mes);
      this.barChartData[0].data = this.ventasMesuales.map(venta => venta.total);
      this.buscando = false;
    });
  }

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          maxTicksLimit: 10,
          color: this.isDarkMode ? 'rgb(255,255,255)' : 'rgb(74,74,74)',
          font: {
            size: 10,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.2)',
          lineWidth: 0.1,
        },
      },
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          minRotation: 0,
          color: this.isDarkMode ? 'rgb(255,255,255)' : 'rgb(74,74,74)',
          padding: 5,
          font: {
            size: 10,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.2)',
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
      bar: {

      },
    },
  };

  public barChartLabels: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  public barChartData: ChartDataset<'bar', number[]>[] = [
    {
      data: [],
      label: 'Ventas',
      backgroundColor: 'rgba(246,121,86,0.5)',
      borderColor: 'rgba(225, 91, 53, 1)',
      borderWidth: {
        top: 3,
        right: 1,
        bottom: 1,
        left: 1
      }
    }
  ];

}
