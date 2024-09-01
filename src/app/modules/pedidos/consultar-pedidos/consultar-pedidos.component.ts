import {Component, ViewChild} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {Usuario} from "../../../models/usuario.model";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {UsuariosService} from "../../../services/usuarios.service";
import {Router} from "@angular/router";
import {SnackBarService} from "../../../services/snack-bar.service";
import {NotificationService} from "../../../services/notificacion.service";
import {RegistrarEmpleadosComponent} from "../../empleados/registrar-empleados/registrar-empleados.component";
import {FiltrosPedidos} from "../../../models/comandos/FiltrosPedidos.comando";
import {Proveedor} from "../../../models/proveedores.model";
import {ProveedoresService} from "../../../services/proveedores.service";
import {Pedido} from "../../../models/pedido.model";
import {RegistrarPedidoComponent} from "../registrar-pedido/registrar-pedido.component";

@Component({
  selector: 'app-consultar-pedidos',
  templateUrl: './consultar-pedidos.component.html',
  styleUrl: './consultar-pedidos.component.scss'
})
export class ConsultarPedidosComponent {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  public tableDataSource: MatTableDataSource<Usuario> = new MatTableDataSource<Usuario>([]);
  public form: FormGroup;

  public pedidos: Pedido[] = [];
  public listaProveedor: Proveedor[] = [];
  public columnas: string[] = ['numeroPedido', "proveedor",'fechaEmision', 'fechaEntrega', 'total', 'acciones'];

  private filtros: FiltrosPedidos;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private usuariosService: UsuariosService,
    private proveedoresService: ProveedoresService,
    private router: Router,
    private notificacionService: SnackBarService,
    private notificationDialogService: NotificationService,
  ) {
    this.form = new FormGroup({});
    this.filtros = new FiltrosPedidos();
    this.tableDataSource.paginator = this.paginator;
    this.tableDataSource.sort = this.sort;
  }

  ngOnInit() {
    this.crearFormulario();
    this.buscarProveedores();
    this.buscar();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txPedido: ['', []],
      txProveedor: ['', []],
      txFechaEntrega: ['', []],
    });
  }

  public limpiarFiltros() {
    this.form.reset();
    this.buscar();
  }

  public buscar() {
    this.filtros.pedido = this.txPedido.value;
    this.filtros.proveedor = this.txProveedor.value;
    this.filtros.fechaEmision = this.txFechaEmision.value;

    //this.usuariosService.consultarUsuarios(this.filtros).subscribe((empleados) => {
      //this.empleados = empleados;
      //this.tableDataSource.data = empleados;
    //});
  }

  public buscarProveedores() {
    this.proveedoresService.buscarTodosProveedores().subscribe((proveedores) => {
      this.listaProveedor = proveedores;
    });
  }

  public registrarNuevoPedido() {
    this.dialog.open(
      RegistrarPedidoComponent,
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

  public verPedido(pedido: Pedido, editar: boolean) {
    this.dialog.open(
      RegistrarEmpleadosComponent,
      {
        width: '75%',
        maxHeight: '80vh',
        panelClass: 'dialog-container',
        autoFocus: false,
        data: {
          pedido: pedido,
          esConsulta: true,
          referencia: this,
          formDesactivado: !editar,
          editar: editar
        }
      }
    )
  }

  public eliminarPedido(idPedido: number) {
    this.notificationDialogService.confirmation('¿Desea eliminar el pedido?', 'Eliminar Pedido') //Está seguro?
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.usuariosService.eliminarUsuario(idPedido).subscribe((respuesta) => {
            if (respuesta.mensaje == 'OK') {
              this.notificacionService.openSnackBarSuccess('Pedido eliminado con éxito');
              this.buscar();
            } else {
              this.notificacionService.openSnackBarError('Error al eliminar el pedido');
            }
          });
        }
      });
  }


  // Regios getters
  get txPedido(): FormControl {
    return this.form.get('txPedido') as FormControl;
  }

  get txProveedor(): FormControl {
    return this.form.get('txProveedor') as FormControl;
  }

  get txFechaEmision(): FormControl {
    return this.form.get('txFechaEmision') as FormControl;
  }

}
