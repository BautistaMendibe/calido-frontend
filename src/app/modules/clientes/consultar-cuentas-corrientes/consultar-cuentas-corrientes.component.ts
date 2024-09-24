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
import {TipoProducto} from "../../../models/tipoProducto.model";
import {CuentaCorriente} from "../../../models/cuentaCorriente.model";
import {ProductosService} from "../../../services/productos.service";
import {UsuariosService} from "../../../services/usuarios.service";
import {FiltrosEmpleados} from "../../../models/comandos/FiltrosEmpleados.comando";
import {RegistrarCuentaCorrienteComponent} from "../registrar-cuenta-corriente/registrar-cuenta-corriente.component";
@Component({
  selector: 'app-consultar-cuentas-corrientes',
  templateUrl: './consultar-cuentas-corrientes.component.html',
  styleUrl: './consultar-cuentas-corrientes.component.scss'
})

export class ConsultarCuentasCorrientesComponent implements OnInit{

  public tableDataSource: MatTableDataSource<CuentaCorriente> = new MatTableDataSource<CuentaCorriente>([]);
  public form: FormGroup;
  public cuentas: CuentaCorriente[] = [];
  public columnas: string[] = ['idCuenta','nombre', 'apellido','creada','balance','acciones'];
  private filtros: FiltrosCuentasCorrientes;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private notificacionService: SnackBarService,
    private notificationDialogService: NotificationService,
    private usuariosService: UsuariosService) {
    this.form = this.fb.group({
      txCliente: [''],
      txDesdeMonto: ['']
    });
    this.filtros = new FiltrosCuentasCorrientes();
  }

  ngOnInit() {
    this.createForm();
    this.buscar();
  }

  private createForm() {
    this.form = this.fb.group({
      txCliente: [''],
      txDesdeMonto:['']
    });
  }

  public limpiarFiltros() {
    this.form.reset();
  }


  public buscar() {
    this.filtros = {
      cliente: this.txCliente.value,
      desdeMonto: this.txDesdeMonto.value
    };

    this.usuariosService.consultarCuentasCorrientesxUsuario(this.filtros)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (cuentas) => {
          this.cuentas = cuentas;
          this.tableDataSource.data= cuentas;
          console.log(cuentas);
        },
        error: (err) => {
          console.error('Error al consultar cuentas corrientes:', err);
        }
      });
  }

  get txCliente(): FormControl {
    return this.form.get('txCliente') as FormControl;
  }

  get txDesdeMonto(): FormControl {
    return this.form.get('txDesdeMonto') as FormControl;
  }

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

  public verCuentaCorriente(cuentaCorriente: CuentaCorriente, editar: boolean) {
    this.dialog.open(
      RegistrarCuentaCorrienteComponent,
      {
        width: '75%',
        height: 'auto',
        autoFocus: false,
        data: {
          cuentaCorriente: cuentaCorriente,
          esConsulta: true,
          referencia: this,
          formDesactivado: !editar,
          editar: editar
        }
      }
    );
  }

  public eliminarCuentaCorriente(idCuentaCorriente: number) {
    this.notificationDialogService.confirmation('¿Desea eliminar la Cuenta Corriente?', 'Eliminar Cuenta Corriente')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.usuariosService.eliminarCuentaCorriente(idCuentaCorriente).subscribe((respuesta) => {
            if (respuesta.mensaje == 'OK') {
              this.notificacionService.openSnackBarSuccess('Cuenta Corriente eliminada con éxito');
              this.buscar();
            } else {
              this.notificacionService.openSnackBarError('Error al eliminar Cuenta Corriente');
            }
          });
        }
      });
  }

  /*public eliminarProducto(idProducto: number) {
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
  */

}
