import {Component, OnInit} from '@angular/core';
import {ProductosService} from "../../../services/productos.service";
import {Router} from "@angular/router";
import {Producto} from "../../../models/producto.model";

@Component({
  selector: 'app-productos-stock-limitado',
  templateUrl: './productos-stock-limitado.component.html',
  styleUrl: './productos-stock-limitado.component.scss'
})
export class ProductosStockLimitadoComponent implements OnInit {

  public listaProductos: Producto[] = [];
  public buscando:boolean = false;

  constructor(private productoService: ProductosService, private router: Router) { }

  ngOnInit() {
    this.buscarProductosStockLimitado();
  }

  public crearOrdenDeCompra() {
    this.router.navigate(['consultar-pedidos']);
  };

  private buscarProductosStockLimitado() {
    this.buscando = true;
    this.productoService.consultarProductosConStockLimitado().subscribe((productos: Producto[]) => {
      this.listaProductos = productos;
      this.buscando = false;
    });
  }

}
