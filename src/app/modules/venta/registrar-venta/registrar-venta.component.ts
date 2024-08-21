import {Component, OnInit} from '@angular/core';
import {Producto} from "../../../models/producto.model";
import {ProductosService} from "../../../services/productos.service";
import {FiltrosProductos} from "../../../models/comandos/FiltrosProductos.comando";

@Component({
  selector: 'app-registrar-venta',
  templateUrl: './registrar-venta.component.html',
  styleUrl: './registrar-venta.component.scss'
})
export class RegistrarVentaComponent implements OnInit{
  public isSelected: boolean = false;
  public productos: Producto[] = [];

  constructor(private productosService: ProductosService) {
  }

  ngOnInit(){
    this.buscarProductos();
  }

  private buscarProductos() {
    const filtros: FiltrosProductos = new FiltrosProductos();
    this.productosService.consultarProductos(filtros).subscribe((productos) => {
      this.productos = productos;
    });
  }

  toggleSelection() {
    this.isSelected = !this.isSelected;
  }
}
