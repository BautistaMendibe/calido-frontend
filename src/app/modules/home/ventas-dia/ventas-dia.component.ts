import {Component, OnInit} from '@angular/core';
import {Venta} from "../../../models/venta.model";
import {VentasService} from "../../../services/ventas.services";

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

}
