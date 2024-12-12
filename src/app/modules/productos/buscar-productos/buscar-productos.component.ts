import {Component, EventEmitter, Inject, OnInit, Output, ViewChild} from '@angular/core';
import {Producto} from "../../../models/producto.model";
import {MatTableDataSource} from "@angular/material/table";
import {FormControl, FormGroup} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ProductosService} from "../../../services/productos.service";
import {FiltrosProductos} from "../../../models/comandos/FiltrosProductos.comando";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-buscar-productos',
  templateUrl: './buscar-productos.component.html',
  styleUrl: './buscar-productos.component.scss'
})
export class BuscarProductosComponent implements OnInit {

  public form: FormGroup;

  public columnas: string[] = ['select', 'imgProducto', 'nombre', 'costo', 'tipoProducto', 'proveedor', 'marca'];
  public productos: Producto[] = [];
  public productosFiltrados: Producto[] = [];
  public productosSeleccionados: Producto[] = [];
  public isLoading: boolean = false;

  public dataSourceProductos = new MatTableDataSource(this.productos);

  @Output() nuevosProductosSeleccionados = new EventEmitter<Producto[]>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private productosService: ProductosService,
    private dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) private data: { proveedorId: number }
  ) {
    this.form = new FormGroup({
      txBuscar: new FormControl('')
    });
  }

  ngOnInit() {
    this.buscarProductos();

    this.txBuscar.valueChanges.subscribe(value => {
      this.filtrarProductos(value);
    });

    
    
  }

  private buscarProductos() {
    const filtros = new FiltrosProductos();

    if (this.data.proveedorId) {
      filtros.proveedor = this.data.proveedorId;
    }

    this.isLoading = true;
    this.productosService.consultarProductos(filtros).subscribe((productos) => {
      this.productos = productos;
      this.dataSourceProductos.data = this.productos;
      this.dataSourceProductos.paginator = this.paginator;
      this.dataSourceProductos.sort = this.sort;
      this.isLoading = false;
    });
  }

  public devolverListaProductosSeleccionados() {
    this.nuevosProductosSeleccionados.emit(this.productosSeleccionados);
    this.dialogRef.close(this.productosSeleccionados);
  }

  // Método para filtrar los productos por el valor de búsqueda
  public filtrarProductos(filtro: string) {
    const filtroNormalizado = filtro.trim().toLowerCase();

    // Filtrar productos cuyo nombre coincida con el filtro
    this.productosFiltrados = this.productos.filter(producto =>
      producto.nombre.toLowerCase().includes(filtroNormalizado)
    );

    // Reordenar para que los seleccionados aparezcan primero
    this.ordenarProductos();
  }

  // Método para ordenar productos, moviendo los seleccionados al principio
  public ordenarProductos() {
    // Si no hay filtro, usar productos originales
    const productosAMostrar = this.productosFiltrados.length > 0 ? this.productosFiltrados : this.productos;

    productosAMostrar.sort((a, b) => {
      const esSeleccionadoA = this.isSelected(a) ? -1 : 1;
      const esSeleccionadoB = this.isSelected(b) ? -1 : 1;
      return esSeleccionadoA - esSeleccionadoB;
    });

    // Actualizar el DataSource de la tabla
    this.dataSourceProductos.data = productosAMostrar;
  }

  // Método para verificar si un producto está seleccionado
  public isSelected(producto: any): boolean {
    return this.productosSeleccionados.includes(producto);
  }

  // Método para manejar la selección de un producto
  public toggleSelection(event: any, producto: any): void {
    if (event.checked) {
      this.productosSeleccionados.push(producto);
    } else {
      // Si se desmarca el checkbox, eliminar el producto de la lista
      this.productosSeleccionados = this.productosSeleccionados.filter(p => p !== producto);
    }
    this.ordenarProductos();
  }

  public cancelar() {
    this.dialogRef.close();
  }

  // Región getters
  get txBuscar(): FormControl {
    return this.form.get('txBuscar') as FormControl;
  }

}
