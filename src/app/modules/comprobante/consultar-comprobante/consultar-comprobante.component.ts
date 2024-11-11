import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Producto} from "../../../models/producto.model";
import {Proveedor} from "../../../models/proveedores.model";
import {MatDialog} from "@angular/material/dialog";
import {ProveedoresService} from "../../../services/proveedores.service";
import {ProductosService} from "../../../services/productos.service";
import {Router} from "@angular/router";
import {SnackBarService} from "../../../services/snack-bar.service";
import {NotificationService} from "../../../services/notificacion.service";
import {FiltrosProductos} from "../../../models/comandos/FiltrosProductos.comando";
import {UsuariosService} from "../../../services/usuarios.service";
import {FiltrosEmpleados} from "../../../models/comandos/FiltrosEmpleados.comando";
import {Usuario} from "../../../models/usuario.model";
import {Comprobante} from "../../../models/comprobante.model";
import {ComprobantesService} from "../../../services/comprobantes.service";
import {FiltrosComprobantes} from "../../../models/comandos/FiltrosComprobantes.comando";
import {RegistrarComprobanteComponent} from "../registrar-comprobante/registrar-comprobante.component";
import {TipoComprobante} from "../../../models/tipoComprobante.model";

@Component({
  selector: 'app-consultar-comprobante',
  templateUrl: './consultar-comprobante.component.html',
  styleUrl: './consultar-comprobante.component.scss'
})
export class ConsultarComprobanteComponent implements OnInit {

  public tableDataSource: MatTableDataSource<Comprobante> = new MatTableDataSource<Comprobante>([]);
  public form: FormGroup;

  public comprobantes: Comprobante[] = [];
  public productos: Producto[] = [];
  public listaProveedor: Proveedor[] = [];
  public listaUsuarios: Usuario[] = [];
  public listaTiposComprobantes: TipoComprobante[] = [];
  public columnas: string[] = ['fechaEmision', 'numeroComprobante', 'tipoComprobante', 'proveedor', 'responsable', 'total', 'acciones'];

  private filtros: FiltrosComprobantes;
  public isLoading: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private formatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  });

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private comprobantesService: ComprobantesService,
    private proveedoresService: ProveedoresService,
    private productosService: ProductosService,
    private usuariosService: UsuariosService,
    private router: Router,
    private notificacionService: SnackBarService,
    private notificationDialogService: NotificationService,
  ) {
    this.form = new FormGroup({});
    this.filtros = new FiltrosComprobantes();
  }

  ngOnInit() {
    this.crearFormulario();
    this.buscarProveedores();
    this.buscarUsuarios();
    this.buscarProductos();
    this.buscarTiposComprobantes();
    this.buscar();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txComprobante: ['', []],
      txTipoComprobante: ['', []],
      txProveedor: ['', []],
      txFechaEmisionDesde: ['', []],
      txFechaEmisionHasta: ['', []],
      txResponsable: ['', []]
    });
  }

  public limpiarFiltros() {
    this.form.reset();
    this.buscar();
  }

  public buscar() {
    this.filtros = {
      comprobante: this.txComprobante.value,
      proveedor: this.txProveedor.value,
      fechaEmisionDesde: this.txFechaEmisionDesde.value,
      fechaEmisionHasta: this.txFechaEmisionHasta.value,
      responsable: this.txResponsable.value,
      tipoComprobante: this.txTipoComprobante.value,
    };

    this.isLoading = true;
    this.comprobantesService.consultarComprobantes(this.filtros).subscribe((comprobantes) => {
      this.comprobantes = comprobantes;
      this.tableDataSource.data = comprobantes;
      this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;
      this.isLoading = false;
    });
  }

  public buscarProveedores() {
    this.proveedoresService.buscarTodosProveedores().subscribe((proveedores) => {
      this.listaProveedor = proveedores;
    });
  }

  private buscarUsuarios() {
    this.usuariosService.consultarEmpleados(new FiltrosEmpleados()).subscribe((usuarios) => {
      this.listaUsuarios = usuarios;
    });
  }

  public buscarProductos() {
    this.productosService.consultarProductos(new FiltrosProductos()).subscribe((productos) => {
      this.productos = productos;
      this.tableDataSource.sort = this.sort;
    });
  }

  private buscarTiposComprobantes() {
    this.comprobantesService.obtenerTiposComprobantes().subscribe((tiposComprobantes) => {
      this.listaTiposComprobantes = tiposComprobantes;
    });
  }

  public registrarNuevoComprobante() {
    this.dialog.open(
      RegistrarComprobanteComponent,
      {
        width: '75%',
        maxHeight: '80vh',
        panelClass: 'dialog-container',
        autoFocus: false,
        data: {
          referencia: this,
          esConsulta: false,
          formDesactivado: false,
          esRegistro: true
        }
      }
    )
  }

  public verComprobante(comprobante: Comprobante, editar: boolean) {
    this.dialog.open(
      RegistrarComprobanteComponent,
      {
        width: '75%',
        maxHeight: '80vh',
        panelClass: 'dialog-container',
        autoFocus: false,
        data: {
          comprobante: comprobante,
          esConsulta: true,
          referencia: this,
          formDesactivado: !editar,
          editar: editar
        }
      }
    )
  }

  public eliminarComprobante(idComprobante: number) {
    const comprobante = this.comprobantes.find(comprobante => comprobante.id === idComprobante);

    if (!comprobante) {
      this.notificacionService.openSnackBarError('Comprobante no encontrado');
      return;
    }

    this.notificationDialogService.confirmation(
      `¿Desea eliminar el comprobante?
        ${comprobante.idTipoComprobante === 1 ? '¡El inventario será modificado!' : ''}
        Esta acción no es reversible.`,
      'Eliminar Comprobante'
    ) //Está seguro?
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.comprobantesService.eliminarComprobante(idComprobante).subscribe((respuesta) => {
            if (respuesta.mensaje == 'OK') {
              this.notificacionService.openSnackBarSuccess('Comprobante eliminado con éxito');
              this.buscar();
            } else {
              this.notificacionService.openSnackBarError('Error al eliminar el comprobante');
            }
          });
        }
      });
  }

  // Region getters
  get txComprobante(): FormControl {
    return this.form.get('txComprobante') as FormControl;
  }

  get txTipoComprobante(): FormControl {
    return this.form.get('txTipoComprobante') as FormControl;
  }

  get txProveedor(): FormControl {
    return this.form.get('txProveedor') as FormControl;
  }

  get txFechaEmisionDesde(): FormControl {
    return this.form.get('txFechaEmisionDesde') as FormControl;
  }

  get txFechaEmisionHasta(): FormControl {
    return this.form.get('txFechaEmisionHasta') as FormControl
  }

  get txResponsable(): FormControl {
    return this.form.get('txResponsable') as FormControl;
  }
}
