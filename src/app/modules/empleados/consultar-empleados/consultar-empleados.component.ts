import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Usuario} from "../../../models/usuario.model";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {RegistrarEmpleadosComponent} from "../../empleados/registrar-empleados/registrar-empleados.component";
import {UsuariosService} from "../../../services/usuarios.service";
import {Router} from "@angular/router";
import {SnackBarService} from "../../../services/snack-bar.service";
import {MatDialog} from "@angular/material/dialog";
import {ProveedoresService} from "../../../services/proveedores.service";

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
  public columnas: string[] = ['nombre', 'apellido', 'cuil', 'telefono'];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private usuariosService: UsuariosService,
    private router: Router,
    private notificacionService: SnackBarService,
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
      txNombre: ['', []],
      txApellido: ['', []],
      txDNI: ['', []],
      txGenero: ['', []],
    });
  }

  public limpiarFiltros() {}

  public buscar() {}

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
