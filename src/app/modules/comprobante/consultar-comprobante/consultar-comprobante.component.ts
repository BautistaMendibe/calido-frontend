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

@Component({
  selector: 'app-consultar-comprobante',
  templateUrl: './consultar-comprobante.component.html',
  styleUrl: './consultar-comprobante.component.scss'
})
export class ConsultarComprobanteComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  public tableDataSource: MatTableDataSource<Comprobante> = new MatTableDataSource<Comprobante>([]);
  public form: FormGroup;

  public comprobantes: Comprobante[] = [];
  public productos: Producto[] = [];
  public listaProveedor: Proveedor[] = [];
  public listaUsuarios: Usuario[] = [];
  public columnas: string[] = ['fechaEmision', 'numeroComprobante', "proveedor", 'responsable', 'total', 'acciones'];

  private filtros: FiltrosComprobantes;

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
    this.tableDataSource.paginator = this.paginator;
  }

  ngOnInit() {
    this.crearFormulario();
    this.buscarProveedores();
    this.buscarUsuarios();
    this.buscarProductos();
    this.buscar();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txPedido: ['', []],
      txProveedor: ['', []],
      txFechaEmisionDesde: ['', []],
      txFechaEmisionHasta: ['', []],
      txEstado: [1, []],
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
      responsable: this.txResponsable.value
    };

    this.comprobantesService.consultarComprobantes(this.filtros).subscribe((comprobantes) => {
      this.comprobantes = comprobantes;
      this.tableDataSource.data = comprobantes;
    });
  }

  public buscarProveedores() {
    this.proveedoresService.buscarTodosProveedores().subscribe((proveedores) => {
      this.listaProveedor = proveedores;
    });
  }

  private buscarUsuarios() {
    this.usuariosService.consultarUsuarios(new FiltrosEmpleados()).subscribe((usuarios) => {
      this.listaUsuarios = usuarios;
    });
  }

  public buscarProductos() {
    this.productosService.consultarProductos(new FiltrosProductos()).subscribe((productos) => {
      this.productos = productos;
      this.tableDataSource.sort = this.sort;
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
          formDesactivado: false
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
    this.notificationDialogService.confirmation('¿Desea eliminar el comprobante?', 'Eliminar Comprobante') //Está seguro?
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
