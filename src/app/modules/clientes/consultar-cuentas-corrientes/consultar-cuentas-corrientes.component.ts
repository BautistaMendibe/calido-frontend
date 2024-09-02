import {Component, OnInit} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {FiltrosCuentasCorrientes} from "../../../models/comandos/FiltrosCuentasCorrientes";
import {Subject} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {NotificationService} from "../../../services/notificacion.service";
import {takeUntil} from "rxjs/operators";
import {Usuario} from "../../../models/usuario.model";
//import {RegistrarCuentaCorriente} from "../../clientes/registrar-cuenta-corriente/registrar-cuenta-corriente.component";
import {CuentasCorrientesService} from "../../../services/cuentasCorrientes.service";
@Component({
  selector: 'app-consultar-cuentas-corrientes',
  templateUrl: './consultar-cuentas-corrientes.component.html',
  styleUrl: './consultar-cuentas-corrientes.component.scss'
})

export class ConsultarCuentasCorrientesComponent implements OnInit{

  public tableDataSource: MatTableDataSource<Usuario> = new MatTableDataSource<Usuario>([]);
  public form: FormGroup;
  public cuentas: Usuario[] = [];
  public columnas: string[] = ['nombre', 'apellido','creada','diasDeuda','balance'];
  private filtros: FiltrosCuentasCorrientes;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private notificacionService: SnackBarService,
    private notificationDialogService: NotificationService,
    private cuentasCorrientesService: CuentasCorrientesService) {
    this.form = this.fb.group({
      txCliente: [''],
      txDiasDeuda: ['']
    });
    this.filtros = new FiltrosCuentasCorrientes();
  }

  ngOnInit() {
    this.createForm();
    this.buscar();
  }

  private createForm() {
    this.form = this.fb.group({
      txCliente: ['']
    });
  }

  public limpiarFiltros() {
    this.form.reset();
  }

  public buscar() {
    this.filtros = {
      cliente: this.txCliente.value,
      diasDeuda: this.txDiasDeuda.value
    };

    this.cuentasCorrientesService.consultarCuentasCorrientes(this.filtros)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (cuentas) => {
          this.cuentas = cuentas;
          this.tableDataSource.data = cuentas;
        },
        error: (err) => {
          console.error('Error al consultar cuentas corrientes:', err);
        }
      });
  }

  get txCliente(): FormControl {
    return this.form.get('txCliente') as FormControl;
  }

  get txDiasDeuda(): FormControl {
    return this.form.get('txDiasDeuda') as FormControl;
  }
 /*
  public registrarNuevaCuenta() {
    this.dialog.open(
      RegistrarCuentaCorrienteComponent,
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
    );
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
  */

}
