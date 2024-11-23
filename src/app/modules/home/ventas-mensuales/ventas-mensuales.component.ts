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

  constructor() {}

  ngOnInit() {}

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10,
        },
      },
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 0,

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
      backgroundColor: 'rgba(225, 91, 53,0.5)',
      borderColor: 'rgba(225, 91, 53, 1)',
      borderWidth: 1
    }
  ];

}
