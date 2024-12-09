import {Component, OnInit} from '@angular/core';
import {VentasService} from "../../../services/ventas.services";
import {Chart, ChartDataset, ChartOptions, registerables} from 'chart.js';
import {VentasDiariaComando} from "../../../models/comandos/dashboard/VentasDiaria.comando";
import {ThemeCalidoService} from "../../../services/theme.service";

Chart.register(...registerables);

@Component({
  selector: 'app-ventas-dia',
  templateUrl: './ventas-dia.component.html',
  styleUrl: './ventas-dia.component.scss'
})
export class VentasDiaComponent implements OnInit{
  public ventas: VentasDiariaComando[] = [];
  public buscando: boolean = false;
  private isDarkMode: boolean = false;


  constructor(private ventasService: VentasService, private themeService: ThemeCalidoService) {
  }

  ngOnInit() {
    this.buscarInfoTema();
    this.buscarTotalVentas();
  }

  private buscarInfoTema() {
    this.themeService.darkMode$.subscribe((isDarkMode) => {
      this.isDarkMode = isDarkMode;
    });
  }

  private buscarTotalVentas() {
    this.buscando = true;

    this.ventasService.buscarVentasPorDiaYHoraDashboard().subscribe((ventas) => {
      this.ventas = ventas;
      this.lineChartLabels = this.ventas.map(venta => venta.hora);
      this.lineChartData[0].data = this.ventas.map(venta => venta.totalHoy);
      this.lineChartData[1].data = this.ventas.map(venta => venta.totalAyer);
      this.buscando = false;
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
          color: this.isDarkMode ? 'rgb(255,255,255)' : 'rgb(74,74,74)',
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
          color: this.isDarkMode ? 'rgb(255,255,255)' : 'rgb(74,74,74)',
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
