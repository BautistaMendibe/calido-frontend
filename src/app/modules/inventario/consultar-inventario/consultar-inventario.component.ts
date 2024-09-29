import {Component, OnInit} from '@angular/core';
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

@Component({
  selector: 'app-consultar-inventario',
  templateUrl: './consultar-inventario.component.html',
  styleUrl: './consultar-inventario.component.scss'
})
export class ConsultarInventarioComponent implements OnInit {
  public tableDataSource: MatTableDataSource<DetalleProducto> = new MatTableDataSource<DetalleProducto>([]);
  public form: FormGroup;
  public detallesProducto: DetalleProducto[] = [];
  public columnas: string[] = ['imgProducto', 'producto', 'proveedor', 'cantidadEnInventario', 'acciones'];
  private filtros: FiltrosDetallesProductos;
  public listaProveedores: Proveedor[] = [];
  private unsubscribe$: Subject<void> = new Subject<void>();

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

    this.productosService.consultarDetallesProductos(this.filtros)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (detallesProducto) => {
          this.detallesProducto = detallesProducto;
          this.tableDataSource.data = detallesProducto;
        },
        error: (err) => {
          console.error('Error al consultar detalles de productos:', err);
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
          formDesactivado: false
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
        autoFocus: false,
        data: {
          detalle: detalle,
          esConsulta: true,
          referencia: this,
          formDesactivado: !editar,
          editar: editar
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
              this.notificacionService.openSnackBarSuccess('Producto eliminado con éxito');
              this.buscar();
            } else {
              this.notificacionService.openSnackBarError('Error al eliminar el producto');
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
