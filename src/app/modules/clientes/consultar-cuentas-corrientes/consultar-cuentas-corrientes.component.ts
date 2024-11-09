import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {FiltrosCuentasCorrientes} from "../../../models/comandos/FiltrosCuentasCorrientes";
import {Subject} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {NotificationService} from "../../../services/notificacion.service";
import {takeUntil} from "rxjs/operators";
import {CuentaCorriente} from "../../../models/cuentaCorriente.model";
import {UsuariosService} from "../../../services/usuarios.service";
import {RegistrarCuentaCorrienteComponent} from "../registrar-cuenta-corriente/registrar-cuenta-corriente.component";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-consultar-cuentas-corrientes',
  templateUrl: './consultar-cuentas-corrientes.component.html',
  styleUrl: './consultar-cuentas-corrientes.component.scss'
})

export class ConsultarCuentasCorrientesComponent implements OnInit{

  public tableDataSource: MatTableDataSource<CuentaCorriente> = new MatTableDataSource<CuentaCorriente>([]);
  public form: FormGroup;
  public cuentas: CuentaCorriente[] = [];
  public columnas: string[] = ['id', 'nombre', 'apellido', 'fechaDesde', 'balanceTotal', 'acciones'];
  private filtros: FiltrosCuentasCorrientes;
  private unsubscribe$: Subject<void> = new Subject<void>();
  public isLoading: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

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

    this.isLoading = true;
    this.usuariosService.consultarCuentasCorrientesxUsuario(this.filtros)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (cuentas) => {
          this.cuentas = cuentas;
          this.tableDataSource.data= cuentas;
          this.tableDataSource.paginator = this.paginator;
          this.tableDataSource.sort = this.sort;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al consultar cuentas corrientes:', err);
          this.isLoading = false;
        }
      });
  }

  public registrarNuevaCuenta() {
    this.dialog.open(
      RegistrarCuentaCorrienteComponent,
      {
        width: '75%',
        maxHeight: '80vh',
        panelClass: 'custom-dialog-container',
        autoFocus: false,
        data: {
          referencia: this,
          esConsulta: false,
          formDesactivado: false,
          esRegistro: true,
        }
      }
    );
  }

  public verCuentaCorriente(cuentaCorriente: CuentaCorriente, editar: boolean) {
    this.dialog.open(
      RegistrarCuentaCorrienteComponent,
      {
        width: '75%',
        maxHeight: '80vh',
        panelClass: 'custom-dialog-container',
        autoFocus: false,
        data: {
          cuentaCorriente: cuentaCorriente,
          esConsulta: true,
          referencia: this,
          formDesactivado: !editar,
          editar: editar,
        }
      }
    );
  }

  public eliminarCuentaCorriente(idCuentaCorriente: number) {
    this.notificationDialogService.confirmation('¿Desea eliminar la cuenta corriente?', 'Eliminar Cuenta Corriente')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.usuariosService.eliminarCuentaCorriente(idCuentaCorriente).subscribe((respuesta) => {
            if (respuesta.mensaje == 'OK') {
              this.notificacionService.openSnackBarSuccess('Cuenta corriente eliminada con éxito');
              this.buscar();
            } else {
              this.notificacionService.openSnackBarError('Error al eliminar cuenta corriente');
            }
          });
        }
      });
  }

  // Región getters
  get txCliente(): FormControl {
    return this.form.get('txCliente') as FormControl;
  }

  get txDesdeMonto(): FormControl {
    return this.form.get('txDesdeMonto') as FormControl;
  }
}
