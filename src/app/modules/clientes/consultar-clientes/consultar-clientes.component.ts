import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {Usuario} from "../../../models/usuario.model";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {FiltrosEmpleados} from "../../../models/comandos/FiltrosEmpleados.comando";
import {MatDialog} from "@angular/material/dialog";
import {UsuariosService} from "../../../services/usuarios.service";
import {Router} from "@angular/router";
import {SnackBarService} from "../../../services/snack-bar.service";
import {NotificationService} from "../../../services/notificacion.service";
import {RegistrarClientesComponent} from "../registrar-clientes/registrar-clientes.component";

@Component({
  selector: 'app-consultar-clientes',
  templateUrl: './consultar-clientes.component.html',
  styleUrl: './consultar-clientes.component.scss'
})
export class ConsultarClientesComponent implements OnInit {

  public tableDataSource: MatTableDataSource<Usuario> = new MatTableDataSource<Usuario>([]);
  public form: FormGroup;
  public clientes: Usuario[] = [];
  public columnas: string[] = ['nombre', 'mail', 'acciones'];
  public isLoading: boolean = false;

  private filtros: FiltrosEmpleados;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private usuariosService: UsuariosService,
    private router: Router,
    private notificacionService: SnackBarService,
    private notificationDialogService: NotificationService,
  ) {
    this.form = new FormGroup({});
    this.filtros = new FiltrosEmpleados();
  }

  ngOnInit() {
    this.crearFormulario();
    this.buscar();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txNombre: ['', [Validators.pattern(/^[^\d@!¿?+#$%&*/()=<>;:{}[\]\\]+$/)]],
      txMail: ['', []],
    });
  }

  public limpiarFiltros() {
    this.form.reset();
    this.buscar();
  }

  public buscar() {
    this.filtros.nombre = this.txNombre.value;
    this.filtros.mail = this.txMail.value;
    this.isLoading = true;

    this.usuariosService.consultarClientes(this.filtros).subscribe((clientes) => {
      this.clientes = clientes.filter(cliente => cliente.id !== -1); // no mostrar consumidor final
      this.tableDataSource.data = this.clientes;
      this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;
      this.isLoading = false;
    });
  }

  public registrarNuevoCliente() {
    const ref = this.dialog.open(
      RegistrarClientesComponent,
      {
        width: '75%',
        autoFocus: false,
        height: '80vh',
        panelClass: 'custom-dialog-container',
        data: {
          referencia: this,
          esConsulta: false,
          formDesactivado: false
        }
      }
    )

    ref.afterClosed().subscribe((res) => {
      if (res) {
        this.buscar();
      }
    });
  }

  public verUsuario(usuario: Usuario, editar: boolean) {
    this.dialog.open(
      RegistrarClientesComponent,
      {
        width: '75%',
        maxHeight: '80vh',
        panelClass: 'custom-dialog-container',
        autoFocus: false,
        data: {
          usuario: usuario,
          esConsulta: true,
          referencia: this,
          formDesactivado: !editar,
          editar: editar,
        }
      }
    );
  }

  public eliminarUsuario(idUsuario: number) {
    this.notificationDialogService.confirmation('¿Desea eliminar el cliente?', 'Eliminar Cliente') //Está seguro?
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.usuariosService.eliminarUsuario(idUsuario).subscribe((respuesta) => {
            if (respuesta.mensaje == 'OK') {
              this.notificacionService.openSnackBarSuccess('Cliente eliminado con éxito');
              this.buscar();
            } else {
              this.notificacionService.openSnackBarError('Error al eliminar el cliente');
            }
          });
        }
      });
  }

  // Regios getters
  get txNombre(): FormControl {
    return this.form.get('txNombre') as FormControl;
  }

  get txMail(): FormControl {
    return this.form.get('txMail') as FormControl;
  }

}
