import {Component} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Producto} from "../../../models/producto.model";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {FiltrosProductos} from "../../../models/comandos/FiltrosProductos.comando";
import {ProductosService} from "../../../services/productos.service";

@Component({
  selector: 'app-consultar-productos',
  templateUrl: './consultar-productos.component.html',
  styleUrls: ['./consultar-productos.component.scss']
})

export class ConsultarProductosComponent {

  public tableDataSource: MatTableDataSource<Producto> = new MatTableDataSource<Producto>([]);
  public form: FormGroup;
  // Ver. Crear tabla empleados que cada uno tenga un usuario
  public productos: Producto[] = [];
  public columnas: string[] = ['id', 'nombre','costo', 'costoIva', 'tipoProducto' , 'proveedor' , 'marca'];
  private filtros: FiltrosProductos;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private productosService: ProductosService) {

    this.form = new FormGroup({});
    this.filtros = new FiltrosProductos();
  }

  ngOnInit() {
    this.createForm();
  }

  private createForm() {
    this.form = this.fb.group({
      txId: ['', []],
      txNombre: ['', []],
      txMarca: ['', []],
      txTipo: ['', []],
      txProveedor: ['', []],
    });
  }

  public limpiarFiltros() {
    this.form.reset();
  }

  public buscar() {
    this.filtros = {
      id: this.txId.value,
      nombre: this.txNombre.value,
      tipoProducto: this.txTipo.value,
      proveedor: this.txProveedor.value,
      marca: this.txMarca.value,
    };



      this.productosService.consultarProductos(this.filtros).subscribe((productos) => {
        this.productos = productos;
        this.tableDataSource.data = productos;
      })

  }


  get txId(): FormControl {
    return this.form.get('txId') as FormControl;
  }

  get txNombre(): FormControl {
    return this.form.get('txNombre') as FormControl;
  }

  get txMarca(): FormControl {
    return this.form.get('txMarca') as FormControl;
  }

  get txTipo(): FormControl {
    return this.form.get('txTipo') as FormControl;
  }

  get txProveedor(): FormControl {
    return this.form.get('txProveedor') as FormControl;
  }
}
