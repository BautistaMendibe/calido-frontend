import {Component, OnInit} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Proveedor} from "../../../models/proveedores.model";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {RegistrarProveedorComponent} from "../registrar-proveedor/registrar-proveedor.component";
import {FiltrosProveedores} from "../../../models/comandos/FiltrosProveedores.comando";
import {ProveedoresService} from "../../../services/proveedores.service";
import {Router} from "@angular/router";
import {DetalleProveedorComponent} from "../detalle-proveedor/detalle-proveedor.component";
import {SnackBarService} from "../../../services/snack-bar.service";

@Component({
  selector: 'app-consultar-proveedores',
  templateUrl: './consultar-proveedores.component.html',
  styleUrl: './consultar-proveedores.component.scss'
})
export class ConsultarProveedoresComponent implements OnInit {

  public tableDataSource: MatTableDataSource<Proveedor> = new MatTableDataSource<Proveedor>([]);
  public form: FormGroup;
  public proveedores: Proveedor[] = [];
  public columnas: string[] = ['nombre', 'tipo', 'telefono', 'mail', 'acciones'];
  private filtros: FiltrosProveedores;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private proveedoresService: ProveedoresService,
    private router: Router,
    private notificacionService: SnackBarService,
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

    this.proveedoresService.consultarProveedores(this.filtros).subscribe((proveedores) => {
      this.proveedores = proveedores;
      this.tableDataSource.data = proveedores;
    });
  }

  public registrarNuevoProveedor() {
    this.dialog.open(
      RegistrarProveedorComponent,
      {
        width: '75%',
        autoFocus: false,
        data: {
          referencia: this
        }
      }
    )
  }

  public verProveedor(proveedor: Proveedor, editar: boolean) {
    this.dialog.open(
      RegistrarProveedorComponent,
      {
        width: '75%',
        autoFocus: false,
        data: {
          proveedor: proveedor,
          esConsulta: true,
          referencia: this
        }
      }
    )
  }

  public eliminarProveedor(idProveedor: number) {
    this.proveedoresService.eliminarProveedor(idProveedor).subscribe((respuesta) => {
      if (respuesta.mensaje == 'OK') {
        this.notificacionService.openSnackBarSuccess('Proveedor eliminado con éxito');
        this.buscar();
      } else {
        this.notificacionService.openSnackBarError('Error al eliminar el proveedor');
      }
    })
  }


  // Regios getters
  get txNombre(): FormControl {
    return this.form.get('txNombre') as FormControl;
  }

}
