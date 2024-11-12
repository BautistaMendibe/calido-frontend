import {Component, OnInit} from '@angular/core';
import {VentasService} from "../../services/ventas.services";
import {Venta} from "../../models/venta.model";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{

  public cantidadVentasHoy = 0;
  public cantidadVentasAyer = 0;
  public diferenciaCantidadVentas = 0;

  private ventasHoy: Venta[] = [];
  private ventasAyer: Venta[] = [];


  constructor(
      private ventasService: VentasService
  ) {
  }


  ngOnInit() {
    this.buscarTotalVentasHoy();
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
