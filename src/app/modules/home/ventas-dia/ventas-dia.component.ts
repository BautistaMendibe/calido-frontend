import {Component, OnInit} from '@angular/core';
import {Venta} from "../../../models/venta.model";
import {VentasService} from "../../../services/ventas.services";
import {Chart, ChartDataset, ChartOptions, registerables} from 'chart.js';
import {VentasDiariasComando} from "../../../models/comandos/dashboard/VentasDiarias.comando";

Chart.register(...registerables);

@Component({
  selector: 'app-ventas-dia',
  templateUrl: './ventas-dia.component.html',
  styleUrl: './ventas-dia.component.scss'
})
export class VentasDiaComponent implements OnInit{
  private ventasHoy: VentasDiariasComando[] = [];
  private ventasAyer: VentasDiariasComando[] = [];

  constructor(private ventasService: VentasService) {
  }

  ngOnInit() {
    //this.buscarTotalVentasHoy();
  }

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          font: {
            size: 10,
          },
          maxRotation: 0,
          minRotation: 0,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        ticks: {
          font: {
            size: 10,
          },
          padding: 10,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(64,64,64,0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2,
      },
      point: {
        radius: 1,
        hoverRadius: 8,
        hitRadius: 10,
      },
    },
    layout: {
      padding: {
        top: 10,
        left: 10,
        right: 10,
        bottom: 10,
      },
    },
  };

  public lineChartLabels: string[] = [
    '8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00',
  ];

  public lineChartData: ChartDataset<'line', number[]>[] = [
    {
      type: 'line',
      data: [200, 300, 400, 500, 573, 600, 550, 500],
      label: 'Today',
      borderColor: 'rgba(225, 91, 53, 1)',
      backgroundColor: 'rgb(248,135,99)',
      borderWidth: 2,
      fill: false,
    },
    {
      type: 'line',
      data: [150, 250, 350, 400, 451, 480, 470, 420],
      label: 'Yesterday',
      borderColor: 'rgba(128, 128, 128, 1)',
      backgroundColor: 'rgba(128, 128, 128, 0.1)',
      borderWidth: 2,
      fill: false,
    },
  ];

}
