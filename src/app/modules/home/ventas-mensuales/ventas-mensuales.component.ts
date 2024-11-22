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
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10,
        },
      },
      x: {},
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
  };

  public barChartLabels: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  public barChartData: ChartDataset<'bar', number[]>[] = [
    {
      data: [10, 15, 30, 25, 50, 60, 70, 80, 90, 100, 110, 120],
      label: 'Ventas',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }
  ];

}
