import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Usuario} from "../../../models/usuario.model";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {RegistrarEmpleadosComponent} from "../registrar-empleados/registrar-empleados.component";
import {FiltrosEmpleados} from "../../../models/comandos/FiltrosEmpleados.comando";
import {UsuariosService} from "../../../services/usuarios.service";
import {Router} from "@angular/router";
import {SnackBarService} from "../../../services/snack-bar.service";
import {MatDialog} from "@angular/material/dialog";
import {NotificationService} from "../../../services/notificacion.service";

@Component({
  selector: 'app-consultar-empleados',
  templateUrl: './consultar-empleados.component.html',
  styleUrl: './consultar-empleados.component.scss'
})
export class ConsultarEmpleadosComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  public tableDataSource: MatTableDataSource<Usuario> = new MatTableDataSource<Usuario>([]);
  public form: FormGroup;
  public empleados: Usuario[] = [];
  public columnas: string[] = ['nombreUsuario', "nombre",'apellido', 'cuil', 'acciones'];
  public isLoading: boolean = false;

  private filtros: FiltrosEmpleados;

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
      txNombre: ['', []],
      txCuil: ['', []],
      txUsuario: ['', []]
    });
  }

  public limpiarFiltros() {
    this.form.reset();
    this.buscar();
  }

  public buscar() {
    this.filtros.nombre = this.txNombre.value;
    this.filtros.usuario = this.txUsuario.value;
    this.filtros.cuil = this.txCuil.value.replace(/[^0-9]/g, '');

    this.isLoading = true;
    this.usuariosService.consultarEmpleados(this.filtros).subscribe((empleados) => {
      this.empleados = empleados;
      this.tableDataSource.data = this.empleados;
      this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;
      this.isLoading = false;
    });
  }

  public registrarNuevoEmpleado() {
    this.dialog.open(
      RegistrarEmpleadosComponent,
      {
        width: '75%',
        autoFocus: false,
        height: 'auto',
        maxHeight: '80vh',
        panelClass: 'dialog-container',
        data: {
          referencia: this,
          esConsulta: false,
          formDesactivado: false
        }
      }
    )
  }

  public verEmpleado(usuario: Usuario, editar: boolean) {
    this.dialog.open(
      RegistrarEmpleadosComponent,
      {
        width: '75%',
        height: 'auto',
        maxHeight: '80vh',
        panelClass: 'dialog-container',
        autoFocus: false,
        data: {
          usuario: usuario,
          esConsulta: true,
          referencia: this,
          formDesactivado: !editar,
          editar: editar
        }
      }
    )
  }

  public eliminarUsuario(idUsuario: number) {
    this.notificationDialogService.confirmation('¿Desea eliminar el usuario?', 'Eliminar Usuario') //Está seguro?
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.usuariosService.eliminarUsuario(idUsuario).subscribe((respuesta) => {
            if (respuesta.mensaje == 'OK') {
              this.notificacionService.openSnackBarSuccess('Usuario eliminado con éxito');
              this.buscar();
            } else {
              this.notificacionService.openSnackBarError('Error al eliminar el usuario');
            }
          });
        }
      });
  }

  public formatearCuil(cuil: string): string {
    if (!cuil) {
      return '';
    }
    // Aplicar máscara
    const parte1 = cuil.slice(0, 2);
    const parte2 = cuil.slice(2, 10);
    const parte3 = cuil.slice(10, 11);

    return `${parte1}-${parte2}-${parte3}`;
  }


  // Regios getters
  get txNombre(): FormControl {
    return this.form.get('txNombre') as FormControl;
  }

  get txUsuario(): FormControl {
    return this.form.get('txUsuario') as FormControl;
  }

  get txCuil(): FormControl {
    return this.form.get('txCuil') as FormControl;
  }

}
