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
  public productosSeleccionados: Producto[] = [];

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

  public seleccionarProducto(producto: Producto) {
    const index = this.productosSeleccionados.findIndex(p => p.id === producto.id);

    if (index > -1) {
      // Si el producto ya está en la lista, lo eliminamos y marcamos el seleccionado para venta en false
      this.productosSeleccionados.splice(index, 1);
      producto.seleccionadoParaVenta = false;
      producto.cantidadSeleccionada = 0;
    } else {
      // Si el producto no está en la lista, lo agregamos y marcamos el seleccionado para venta en true
      this.productosSeleccionados.push(producto);
      producto.seleccionadoParaVenta = true;
      producto.cantidadSeleccionada = 1;
    }
  }

  toggleSelection() {
    this.isSelected = !this.isSelected;
  }
}
