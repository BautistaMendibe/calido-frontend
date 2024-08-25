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
  public productos: Producto[] = [];
  public productosSeleccionados: Producto[] = [];
  public subTotal: number = 0;
  public impuestoIva: number = 0;
  public cargandoProductos: boolean = true;
  public totalVenta: number = 0;

  constructor(private productosService: ProductosService) {
  }

  ngOnInit(){
    this.buscarProductos();
  }

  private buscarProductos() {
    const filtros: FiltrosProductos = new FiltrosProductos();
    this.productosService.consultarProductos(filtros).subscribe((productos) => {
      this.productos = productos;
      this.cargandoProductos = false;
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

    this.validarCantidadProductosSeleccionados();
    this.calcularSubTotal();
    this.calcularTotal();
  }

  public aumentarCantidad(producto: Producto) {
    producto.cantidadSeleccionada++;
    this.calcularSubTotal();
    this.calcularTotal();
  }

  public disminuirCantidad(producto: Producto) {
    producto.cantidadSeleccionada--;
    if (producto.cantidadSeleccionada == 0) {
      const index = this.productosSeleccionados.findIndex(p => p.id === producto.id);
      this.productosSeleccionados.splice(index, 1);
      producto.seleccionadoParaVenta = false;
    }
    this.validarCantidadProductosSeleccionados();
    this.calcularSubTotal();
    this.calcularTotal();
  }

  private calcularSubTotal() {
    this.subTotal = 0;
    this.productosSeleccionados.forEach((producto) => {
      this.subTotal += (producto.costo * producto.cantidadSeleccionada);
    });
    this.impuestoIva = this.subTotal * 0.21;
  }

  private validarCantidadProductosSeleccionados() {
    if (this.productosSeleccionados.length == 0) {
      this.subTotal = 0;
      this.impuestoIva = 0;
    }
  }

  public cancelarVenta(){}

  private calcularTotal() {
    this.totalVenta = this.subTotal + this.impuestoIva;
  }

  public editarProductoEnVenta(producto: Producto){}

  public eliminarProductoDeVenta(producto: Producto) {}

}
