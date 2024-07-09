import {Component, ViewChild} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {Usuario} from "../../../models/usuario.model";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Producto} from "../../../models/producto.model";

@Component({
  selector: 'app-consultar-productos',
  templateUrl: './consultar-productos.component.html',
  styleUrl: './consultar-productos.component.scss'
})
export class ConsultarProductosComponent {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  public tableDataSource: MatTableDataSource<Producto> = new MatTableDataSource<Producto>([]);
  public form: FormGroup;
  // Ver. Crear tabla empleados que cada uno tenga un usuario
  public productos: Producto[] = [];
  public columnas: string[] = ['id', 'nombre','proveedor', 'tipo' ,'costo', 'costoConIva', 'precioVenta', 'Cantidad'];

  constructor(
    private fb: FormBuilder,
  ) {
    this.form = new FormGroup({});
    this.tableDataSource.paginator = this.paginator;
    this.tableDataSource.sort = this.sort;
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

  public limpiarFiltros() {}

  public buscar() {}

  // Regios getters
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
