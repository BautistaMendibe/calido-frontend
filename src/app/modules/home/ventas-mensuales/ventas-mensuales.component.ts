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

  constructor(private ventasService: VentasService) {}

  ngOnInit() {
    this.buscarCantidadVentasMensuales();
  }

  private buscarCantidadVentasMensuales() {
    this.buscando = true;
    this.ventasService.buscarCantidadVentasMensuales().subscribe((cantidadVentasMensuales) => {
      this.ventasMesuales = cantidadVentasMensuales;
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
          stepSize: 10,
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
      data: [100, 75, 30, 25, 50, 60, 100, 150, 90, 100, 110, 120],
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
