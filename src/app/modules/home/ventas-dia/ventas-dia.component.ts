import {Component, OnInit} from '@angular/core';
import {VentasService} from "../../../services/ventas.services";
import {Chart, ChartDataset, ChartOptions, registerables} from 'chart.js';
import {VentasDiariaComando} from "../../../models/comandos/dashboard/VentasDiaria.comando";

Chart.register(...registerables);

@Component({
  selector: 'app-ventas-dia',
  templateUrl: './ventas-dia.component.html',
  styleUrl: './ventas-dia.component.scss'
})
export class VentasDiaComponent implements OnInit{
  public ventasHoy: VentasDiariaComando[] = [];
  public ventasAyer: VentasDiariaComando[] = [];
  public buscandoHoy: boolean = false;
  public buscandoAyer: boolean = false;


  constructor(private ventasService: VentasService) {
  }

  ngOnInit() {
    this.buscarTotalVentasHoy();
    this.buscarTotalVentasAyer();
  }

  private buscarTotalVentasHoy() {
    const fechaHora = new Date();
    const hours = fechaHora.getHours();
    const minutes = fechaHora.getMinutes();
    const seconds = fechaHora.getSeconds() || 0;

    fechaHora.setHours(hours, minutes, seconds);
    this.buscandoHoy = true;

    this.ventasService.buscarVentasPorDiaYHoraDashboard(fechaHora.toISOString()).subscribe((ventas) => {
      this.ventasHoy = ventas;
      this.lineChartData[0].data = this.ventasHoy.map(venta => venta.total);
      this.buscandoHoy = false;
    });
  }


  private buscarTotalVentasAyer() {
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    const hours = ayer.getHours();
    const minutes = ayer.getMinutes();
    const seconds = ayer.getSeconds() || 0;
    ayer.setHours(hours, minutes, seconds);
    this.buscandoAyer = true;

    this.ventasService.buscarVentasPorDiaYHoraDashboard(ayer.toISOString()).subscribe((ventas) => {
      this.ventasAyer = ventas;
      this.lineChartLabels = this.ventasAyer.map(venta => venta.hora);
      this.lineChartData[1].data = this.ventasHoy.map(venta => venta.total);
      this.buscandoAyer = false;
    });
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
      data: [],
      label: 'Today',
      borderColor: 'rgba(225, 91, 53, 1)',
      backgroundColor: 'rgb(248,135,99)',
      borderWidth: 2,
      fill: false,
    },
    {
      type: 'line',
      data: [],
      label: 'Yesterday',
      borderColor: 'rgba(128, 128, 128, 1)',
      backgroundColor: 'rgba(128, 128, 128, 0.1)',
      borderWidth: 2,
      fill: false,
    },
  ];

}
