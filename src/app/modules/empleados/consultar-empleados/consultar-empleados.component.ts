import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Usuario} from "../../../models/usuario.model";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {RegistrarEmpleadosComponent} from "../../empleados/registrar-empleados/registrar-empleados.component";
import {FiltrosEmpleados} from "../../../models/comandos/FiltrosEmpleados.comando";
import {UsuariosService} from "../../../services/usuarios.service";
import {Router} from "@angular/router";
import {SnackBarService} from "../../../services/snack-bar.service";
import {MatDialog} from "@angular/material/dialog";
import {DetalleEmpleadosComponent} from "../detalle-empleados/detalle-empleados.component";

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
  // Ver. Crear tabla empleados que cada uno tenga un usuario
  public empleados: Usuario[] = [];
  public columnas: string[] = ['nombreUsuario', "nombre",'apellido', 'cuil', 'acciones'];


  private filtros: FiltrosEmpleados;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private usuariosService: UsuariosService,
    private router: Router,
    private notificacionService: SnackBarService,
  ) {
    this.form = new FormGroup({});
    this.filtros = new FiltrosEmpleados();
    this.tableDataSource.paginator = this.paginator;
    this.tableDataSource.sort = this.sort;
  }

  ngOnInit() {
    this.crearFormulario();
    this.buscar();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txNombreUsuario: ['', []],
      txNombre: ['', []],
      txApellido: ['', []],
      txCuil: ['', []],
    });
  }

  public limpiarFiltros() {
    this.form.reset();
    this.buscar();
  }

  public buscar() {
    this.filtros.nombre = this.txNombre.value;
    this.usuariosService.consultarUsuarios(this.filtros).subscribe((empleados) => {
      this.empleados = empleados;
      this.tableDataSource.data = empleados;
    });
  }

  public registrarNuevoEmpleado() {
    this.dialog.open(
      RegistrarEmpleadosComponent,
      {
        width: '75%',
        autoFocus: false,
        data: {
          referencia: this
        }
      }
    )
  }

  public verEmpleado(usuario: Usuario, editar: boolean) {
    this.dialog.open(
      DetalleEmpleadosComponent,
      {
        width: '75%',
        autoFocus: false,
        data: {
          usuario: usuario,
          edit: editar,
          referencia: this
        }
      }
    )
  }

   public eliminarUsuario(idUsuario: number) {
    this.usuariosService.eliminarUsuario(idUsuario).subscribe((respuesta) => {
      if (respuesta.mensaje == 'OK') {
        this.notificacionService.openSnackBarSuccess('Usuario eliminado con éxito');
        this.buscar();
      } else {
        this.notificacionService.openSnackBarError('Error al eliminar el usuario');
      }
    })
  }


  // Regios getters
  get txNombre(): FormControl {
    return this.form.get('txNombre') as FormControl;
  }

  get txApellido(): FormControl {
    return this.form.get('txApellido') as FormControl;
  }

  get txDNI(): FormControl {
    return this.form.get('txDNI') as FormControl;
  }

  get txGenero(): FormControl {
    return this.form.get('txGenero') as FormControl;
  }

}
