import {Component, OnInit} from '@angular/core';
import {Venta} from "../../../models/venta.model";
import {VentasService} from "../../../services/ventas.services";
import {Chart, ChartDataset, ChartOptions, registerables} from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-ventas-dia',
  templateUrl: './ventas-dia.component.html',
  styleUrl: './ventas-dia.component.scss'
})
export class VentasDiaComponent implements OnInit{

  public cantidadVentasHoy = 0;
  public cantidadVentasAyer = 0;
  public diferenciaCantidadVentas = 0;

  private ventasHoy: Venta[] = [];
  private ventasAyer: Venta[] = [];

  constructor(private ventasService: VentasService) {
  }

  ngOnInit() {
    //this.buscarTotalVentasHoy();
  }

  private buscarTotalVentasHoy() {
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);


    this.ventasService.buscarVentasFechaHora(hoy as unknown as string).subscribe((ventas) => {
      this.ventasHoy = ventas;
      this.cantidadVentasHoy = ventas.length;

      this.ventasService.buscarVentasFechaHora(ayer as unknown as string).subscribe((ventas) => {
        this.ventasAyer = ventas;
        this.cantidadVentasAyer = ventas.length;

        this.calcularDiferenciaVentasAyerHoy();
      });

    });
  }

  private calcularDiferenciaVentasAyerHoy() {}


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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#0e0e0e',
        bodyColor: '#bc7777',
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2,
      },
      point: {
        radius: 0,
        hoverRadius: 5,
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
      backgroundColor: 'rgb(85,24,5)',
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
