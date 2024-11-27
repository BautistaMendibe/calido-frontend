import {Component, OnInit} from '@angular/core';
import {PedidosService} from "../../../services/pedidos.service";
import {OrdenDeCompraComando} from "../../../models/comandos/dashboard/OrdenDeCompra.comando";

@Component({
  selector: 'app-ordenes-de-compra',
  templateUrl: './ordenes-de-compra.component.html',
  styleUrl: './ordenes-de-compra.component.scss'
})
export class OrdenesDeCompraComponent implements OnInit {

  public ordenesDeCompras: OrdenDeCompraComando[] = [];
  public buscando: boolean = false;

  constructor(
    private pedidosService: PedidosService,
  ) {}

  ngOnInit() {
    this.buscarOrdenesDeCompraHome();
  }

  private buscarOrdenesDeCompraHome() {
    this.buscando = true;
    this.pedidosService.buscarOrdenesDeCompraHome().subscribe((ordenes) => {
      this.ordenesDeCompras = ordenes;
      this.buscando = false;
    });
  }

  public obtenerClaseEstado(estadoPedido: string) {
    switch (estadoPedido) {
      case 'Pendiente':
        return 'amount estado-pendiente';
      case 'Recibido':
        return 'amount estado-recibido';
      case 'Recibido con diferencias':
        return 'amount estado-recibido-diferencias';
      case 'Cancelado':
        return 'amount estado-cancelado';
      case 'Devuelto':
        return 'amount estado-devuelto';
      default:
        return 'amount';
    }
  }

}
