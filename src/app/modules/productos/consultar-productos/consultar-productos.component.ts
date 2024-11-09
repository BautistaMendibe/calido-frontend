import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Producto} from "../../../models/producto.model";
import {FormBuilder, FormGroup, FormControl} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {FiltrosProductos} from "../../../models/comandos/FiltrosProductos.comando";
import {ProductosService} from "../../../services/productos.service";
import {RegistrarProductoComponent} from "../registrar-producto/registrar-producto.component";
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {SnackBarService} from "../../../services/snack-bar.service";
import {NotificationService} from "../../../services/notificacion.service";
import {TipoProducto} from "../../../models/tipoProducto.model";
import {Proveedor} from "../../../models/proveedores.model";
import {Marca} from "../../../models/Marcas.model";
import {MarcasService} from "../../../services/marcas.service";
import {ProveedoresService} from "../../../services/proveedores.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-consultar-productos',
  templateUrl: './consultar-productos.component.html',
  styleUrls: ['./consultar-productos.component.scss']
})
export class ConsultarProductosComponent implements OnInit {

  public tableDataSource: MatTableDataSource<Producto> = new MatTableDataSource<Producto>([]);
  public form: FormGroup;
  public productos: Producto[] = [];
  public columnas: string[] = ['imgProducto', 'nombre', 'costoCompra', 'precioConIVA', 'tipoProducto', 'proveedor', 'marca', 'acciones'];
  private filtros: FiltrosProductos;
  public listaTipoProducto: TipoProducto[] = [];
  public listaProveedores: Proveedor[] = [];
  public listaMarcas: Marca[] = [];
  private unsubscribe$: Subject<void> = new Subject<void>();
  public isLoading: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private notificacionService: SnackBarService,
    private marcasService: MarcasService,
    private proveedoresService: ProveedoresService,
    private notificationDialogService: NotificationService,
    private productosService: ProductosService) {
    this.form = this.fb.group({
      txNombre: [''],
      txMarca: [''],
      txTipo: [''],
      txProveedor: [''],
    });
    this.filtros = new FiltrosProductos();
  }

  ngOnInit() {
    this.createForm();
    this.buscarTiposProductos();
    this.buscarMarcas();
    this.buscarProveedores();
    this.buscar();
  }

  private createForm() {
    this.form = this.fb.group({
      txNombre: [''],
      txMarca: [''],
      txTipo: [''],
      txProveedor: [''],
    });
  }

  public limpiarFiltros() {
    this.form.reset();
  }

  public buscar() {
    this.filtros = {
      nombre: this.txNombre.value,
      tipoProducto: this.txTipo.value,
      proveedor: this.txProveedor.value,
      marca: this.txMarca.value,
    };

    this.isLoading = true;
    this.productosService.consultarProductos(this.filtros)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (productos) => {
          this.productos = productos;
          this.tableDataSource.data = this.productos;
          this.tableDataSource.paginator = this.paginator;
          this.tableDataSource.sort = this.sort;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
        }
      });
  }

  public registrarNuevoProducto() {
    const ref = this.dialog.open(
      RegistrarProductoComponent,
      {
        width: '75%',
        maxHeight: '80vh',
        panelClass: 'dialog-container',
        autoFocus: false,
        data: {
          referencia: this,
          esConsulta: false,
          formDesactivado: false
        }
      }
    );

    ref.afterClosed().subscribe((respusta) => {
      if (respusta) {
        this.buscar();
      }
    });
  }

  public verProducto(producto: Producto, editar: boolean) {
    const ref = this.dialog.open(
      RegistrarProductoComponent,
      {
        width: '85%',
        autoFocus: false,
        height: '85vh',
        panelClass: 'custom-dialog-container',
        data: {
          producto: producto,
          esConsulta: true,
          referencia: this,
          formDesactivado: !editar,
          editar: editar
        }
      }
    );

    ref.afterClosed().subscribe((respusta) => {
      if (respusta) {
        this.buscar();
      }
    });
  }

  public eliminarProducto(idProducto: number) {
    this.notificationDialogService.confirmation('¿Desea eliminar el producto?', 'Eliminar producto')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.productosService.eliminarProducto(idProducto).subscribe((respuesta) => {
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

  private buscarTiposProductos() {
    this.productosService.buscarTiposProductos().subscribe((tipoProductos) => {
      this.listaTipoProducto = tipoProductos;
    });
  }

  private buscarMarcas() {
    this.marcasService.buscarMarcas().subscribe((marcas) => {
      this.listaMarcas = marcas;
    });
  }

  private buscarProveedores() {
    this.proveedoresService.buscarTodosProveedores().subscribe((proveedores) => {
      this.listaProveedores = proveedores;
    });
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
