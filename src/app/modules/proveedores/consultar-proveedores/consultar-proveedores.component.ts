import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Proveedor} from "../../../models/proveedores.model";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {RegistrarProveedorComponent} from "../registrar-proveedor/registrar-proveedor.component";
import {FiltrosProveedores} from "../../../models/comandos/FiltrosProveedores.comando";
import {ProveedoresService} from "../../../services/proveedores.service";
import {Router} from "@angular/router";
import {SnackBarService} from "../../../services/snack-bar.service";
import {NotificationService} from "../../../services/notificacion.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-consultar-proveedores',
  templateUrl: './consultar-proveedores.component.html',
  styleUrl: './consultar-proveedores.component.scss'
})
export class ConsultarProveedoresComponent implements OnInit {

  public tableDataSource: MatTableDataSource<Proveedor> = new MatTableDataSource<Proveedor>([]);
  public form: FormGroup;
  public proveedores: Proveedor[] = [];
  public columnas: string[] = ['nombre', 'tipo', 'telefono', 'email', 'acciones'];
  private filtros: FiltrosProveedores;
  public isLoading: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private proveedoresService: ProveedoresService,
    private router: Router,
    private notificacionService: SnackBarService,
    private notificationDialogService: NotificationService,
  ) {
    this.form = new FormGroup({});
    this.filtros = new FiltrosProveedores();
  }

  ngOnInit() {
    this.crearFormulario();
    this.buscar();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txNombre: ['', []],
    });
  }

  public limpiarFiltros() {
    this.form.reset();
    this.buscar();
  }

  public buscar() {
    this.filtros.nombre = this.txNombre.value;

    this.isLoading = true;
    this.proveedoresService.consultarProveedores(this.filtros).subscribe((proveedores) => {
      this.proveedores = proveedores;
      this.tableDataSource.data = this.proveedores;
      this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;
      this.isLoading = false;
    });
  }

  public registrarNuevoProveedor() {
    this.dialog.open(
      RegistrarProveedorComponent,
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
    )
  }

  public verProveedor(proveedor: Proveedor, editar: boolean) {
    this.dialog.open(
      RegistrarProveedorComponent,
      {
        width: '75%',
        height: 'auto',
        autoFocus: false,
        data: {
          proveedor: proveedor,
          esConsulta: true,
          referencia: this,
          formDesactivado: !editar,
          editar: editar
        }
      }
    )
  }

  public eliminarProveedor(idProveedor: number) {
    this.notificationDialogService.confirmation('¿Desea eliminar el proveedor?', 'Eliminar proveedor')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.proveedoresService.eliminarProveedor(idProveedor).subscribe((respuesta) => {
            if (respuesta.mensaje == 'OK') {
              this.notificacionService.openSnackBarSuccess('Proveedor eliminado con éxito');
              this.buscar();
            } else {
              this.notificacionService.openSnackBarError('Error al eliminar el proveedor');
            }
          });
        }
      });
  }


  // Regios getters
  get txNombre(): FormControl {
    return this.form.get('txNombre') as FormControl;
  }

}
