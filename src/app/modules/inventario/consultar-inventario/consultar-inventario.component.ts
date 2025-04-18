import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Proveedor} from "../../../models/proveedores.model";
import {Subject} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {ProveedoresService} from "../../../services/proveedores.service";
import {NotificationService} from "../../../services/notificacion.service";
import {ProductosService} from "../../../services/productos.service";
import {takeUntil} from "rxjs/operators";
import {FiltrosDetallesProductos} from "../../../models/comandos/FiltrosDetallesProductos";
import {DetalleProducto} from "../../../models/detalleProducto";
import {RegistrarInventarioComponent} from "../registrar-inventario/registrar-inventario.component";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-consultar-inventario',
  templateUrl: './consultar-inventario.component.html',
  styleUrl: './consultar-inventario.component.scss'
})
export class ConsultarInventarioComponent implements OnInit {
  public tableDataSource: MatTableDataSource<DetalleProducto> = new MatTableDataSource<DetalleProducto>([]);
  public form: FormGroup;
  public detallesProducto: DetalleProducto[] = [];
  public columnas: string[] = ['imgProducto', 'producto', 'proveedor', 'marca', 'cantEnInventario', 'acciones'];
  private filtros: FiltrosDetallesProductos;
  public listaProveedores: Proveedor[] = [];
  private unsubscribe$: Subject<void> = new Subject<void>();
  public isLoading: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private notificacionService: SnackBarService,
    private proveedoresService: ProveedoresService,
    private notificationDialogService: NotificationService,
    private productosService: ProductosService) {
    this.form = this.fb.group({
      txProducto: [''],
      txProveedor: [''],
    });
    this.filtros = new FiltrosDetallesProductos();
  }

  ngOnInit() {
    this.createForm();
    this.buscarProveedores();
    this.buscar();
  }

  private createForm() {
    this.form = this.fb.group({
      txProducto: [''],
      txProveedor: [''],
    });
  }

  public limpiarFiltros() {
    this.form.reset();
  }

  public buscar() {
    this.filtros = {
      producto: this.txProducto.value,
      proveedor: this.txProveedor.value,
    };

    this.isLoading = true;
    this.productosService.consultarDetallesProductos(this.filtros)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (detallesProducto) => {
          this.detallesProducto = detallesProducto;
          this.tableDataSource.data = this.detallesProducto;
          this.tableDataSource.paginator = this.paginator;
          this.tableDataSource.sort = this.sort;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al consultar detalles de productos:', err);
          this.isLoading = false;
        }
      });
  }

  public registrarNuevoDetalleProducto() {
    this.dialog.open(
      RegistrarInventarioComponent,
      {
        width: '75%',
        height: 'auto',
        autoFocus: false,
        data: {
          referencia: this,
          esConsulta: false,
          formDesactivado: false,
          esRegistro: true
        }
      }
    );
  }

  public verDetalleProducto(detalle: DetalleProducto, editar: boolean) {
    this.dialog.open(
      RegistrarInventarioComponent,
      {
        width: '75%',
        height: 'auto',
        maxHeight: '80vh',
        panelClass: 'dialog-container',
        autoFocus: false,
        data: {
          detalle: detalle,
          esConsulta: true,
          referencia: this,
          formDesactivado: !editar,
          editar: editar,
          esRegistro: false
        }
      }
    );
  }

  public eliminarDetalleProducto(idDetalleProducto: number) {
    this.notificationDialogService.confirmation('¿Desea eliminar el producto del inventario?', 'Eliminar producto de inventario')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.productosService.eliminarDetalleProducto(idDetalleProducto).subscribe((respuesta) => {
            if (respuesta.mensaje == 'OK') {
              this.notificacionService.openSnackBarSuccess('Producto eliminado del inventario con éxito');
              this.buscar();
            } else {
              this.notificacionService.openSnackBarError('Error al eliminar el producto del inventario');
            }
          });
        }
      });
  }

  private buscarProveedores() {
    this.proveedoresService.buscarTodosProveedores().subscribe((proveedores) => {
      this.listaProveedores = proveedores;
    });
  }

  get txProducto(): FormControl {
    return this.form.get('txProducto') as FormControl;
  }

  get txProveedor(): FormControl {
    return this.form.get('txProveedor') as FormControl;
  }
}
