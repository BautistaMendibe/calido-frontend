import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {
  ConsultarCuentasCorrientesComponent
} from "../consultar-cuentas-corrientes/consultar-cuentas-corrientes.component";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {CuentaCorriente} from "../../../models/cuentaCorriente.model";
import {SnackBarService} from "../../../services/snack-bar.service";
import {Usuario} from "../../../models/usuario.model";
import {UsuariosService} from "../../../services/usuarios.service";
import {Venta} from "../../../models/venta.model";
import {MatTableDataSource} from "@angular/material/table";
import {RegistrarProductoComponent} from "../../productos/registrar-producto/registrar-producto.component";
import {Producto} from "../../../models/producto.model";
import {VentasService} from "../../../services/ventas.services";
import {FiltrosEmpleados} from "../../../models/comandos/FiltrosEmpleados.comando";
import {DetalleVentaComponent} from "../../venta/detalle-venta/detalle-venta.component";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {NotificationService} from "../../../services/notificacion.service";
import {ThemeCalidoService} from "../../../services/theme.service";

@Component({
  selector: 'app-registrar-cuenta-corriente',
  templateUrl: './registrar-cuenta-corriente.component.html',
  styleUrls: ['./registrar-cuenta-corriente.component.scss']
})
export class RegistrarCuentaCorrienteComponent implements OnInit {

  public form: FormGroup;
  public listaClientes: Usuario[] = [];
  public esConsulta: boolean;
  public esRegistro: boolean;
  public formDesactivado: boolean;
  private referencia: ConsultarCuentasCorrientesComponent;
  public fechaHoy: Date = new Date();

  public tableDataSource: MatTableDataSource<Venta> = new MatTableDataSource<Venta>([]);
  public ventas: Venta[] = [];
  public columnas: string[] = ['id', 'montoTotal', 'saldoDisponible', 'fecha', 'formaDePago', 'productos', 'estado', 'acciones'];

  public listaVentasDeshabilitada: boolean = false;
  public isLoading: boolean = false;
  public tieneAccionesPendientes: boolean = false;
  public darkMode: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuariosService,
    private dialogRef: MatDialogRef<RegistrarCuentaCorrienteComponent>,
    private notificacionService: SnackBarService,
    private ventasService: VentasService,
    private dialog: MatDialog,
    private notificationDialogService: NotificationService,
    private themeService: ThemeCalidoService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarCuentasCorrientesComponent;
      esConsulta: boolean;
      formDesactivado: boolean;
      editar: boolean;
      cuentaCorriente: CuentaCorriente;
      esRegistro: boolean;
    }
  ) {
    this.form = new FormGroup({});
    this.esConsulta = this.data.esConsulta;
    this.esRegistro = this.data.esRegistro;
    this.formDesactivado = this.data.formDesactivado;
    this.referencia = this.data.referencia;
  }

  ngOnInit() {
    this.obtenerInformacionTema();
    this.crearFormulario();

    if (this.data.formDesactivado) {
      this.form.disable();
    }

    this.txBalance.disable();
    this.txDebe.disable();
    this.txHaber.disable();

    if (this.data.editar) {
      this.listaVentasDeshabilitada = false;
      this.txCreada.disable();
      this.txCliente.disable();
    }

    this.buscarUsuarios();
    this.filtrosSuscripciones();

    if (this.esConsulta || this.data.editar) {
      this.buscarVentas(this.data.cuentaCorriente.idUsuario);
    }

    this.txCliente.valueChanges.subscribe(() => { this.buscarVentas(this.txCliente.value); this.calcularBalance(); });
  }

  private obtenerInformacionTema() {
    this.darkMode = this.themeService.isDarkMode();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txCliente: [this.data.cuentaCorriente?.usuario?.id || '', [Validators.required]],
      txCreada: [this.data.cuentaCorriente?.fechaDesde || new Date(), [Validators.required]],
      txBalance: ['', [Validators.required]],
      txDebe: [''],
      txHaber: [''],
      txBuscar: ['']
    });
  }

  private buscarUsuarios() {
    this.usuarioService.consultarClientes(new FiltrosEmpleados()).subscribe((clientes) => {
      this.listaClientes = clientes.filter(cliente => cliente.id !== -1); // Sacar el consumidor final
    });
  }

  public buscarVentas(idUsuario: number) {
    this.isLoading = true;
    this.ventasService.buscarVentasPorCC(idUsuario).subscribe((ventas) => {
      // Determinar si hay ventas no facturadas o no canceladas con saldo (lo que indica que hay cosas que hacer en esta cta cte)
      this.tieneAccionesPendientes = ventas.some((venta) =>
        (venta.comprobanteAfip.comprobante_nro == null)
      );

      // Asignar solo las ventas filtradas
      this.ventas = ventas;
      this.tableDataSource.data = ventas;
      this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;

      this.calcularBalance();
      this.isLoading = false;
    })
  }

  private calcularBalance() {
    let total = 0;
    let debe = 0;
    let haber = 0;

    this.ventas.forEach(venta => {
      if (venta.anulada && venta.comprobanteAfip.comprobante_nro !== null) {
        // Si la venta está anulada, sumamos el saldo disponible al balance.
        //total += Number(venta.saldoDisponible) || 0;
        //haber += Number(venta.saldoDisponible) || 0;
      } else if (venta.comprobanteAfip.comprobante_nro == null && !venta.anulada) {
        // Si no tiene comprobante (no facturada), la restamos como saldo negativo, salvo que haya sido cancelada con saldo.
        total -= Number(venta.montoTotal) || 0;
        debe -= Number(venta.montoTotal) || 0;
      }
    });

    this.txBalance.setValue(total);
    this.txDebe.setValue(debe);
    this.txHaber.setValue(haber);
  }

  public facturarVenta(venta: Venta) {
    this.notificationDialogService.confirmation('¿Desea facturar esta venta?', 'Facturar venta')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.ventasService.facturarVentaConAfip(venta).subscribe((respuesta) => {
            if (respuesta.mensaje == 'OK') {
              this.notificacionService.openSnackBarSuccess('Venta facturada correctamente');
              this.buscarVentas(this.txCliente.value);
              this.tableDataSource._updateChangeSubscription();
            } else {
              this.notificacionService.openSnackBarError('Error al facturar venta. Intentelo nuevamente.');
            }
          });
        }
      });
  }

  public cancelarVenta(venta: Venta) {
    this.notificationDialogService.confirmation('¿Desea cancelar esta venta con saldo?', 'Cancelar venta')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.ventasService.cancelarVenta(venta).subscribe((respuesta) => {
            if (respuesta.mensaje == 'OK') {
              this.notificacionService.openSnackBarSuccess('Venta cancelada con saldo de cuenta correctamente');
              this.buscarVentas(this.txCliente.value);
              this.tableDataSource._updateChangeSubscription();
            } else {
              this.notificacionService.openSnackBarError('Error al cancelar venta. Intentelo nuevamente.');
            }
          });
        }
      });
  }

  public verProducto(producto: Producto) {
    this.dialog.open(
      RegistrarProductoComponent,
      {
        width: '90%',
        autoFocus: false,
        maxHeight: '80vh',
        panelClass: 'custom-dialog-container',
        data: {
          producto: producto,
          esConsulta: true,
          formDesactivado: true,
          editar: false
        }
      }
    );
  }

  public verVenta(venta: Venta) {
    this.dialog.open(
      DetalleVentaComponent,
      {
        width: '75%',
        autoFocus: false,
        height: '85vh',
        panelClass: 'custom-dialog-container',
        data: {
          venta: venta,
        }
      }
    )
  }

  public getNombresProductos(productos: Producto[]): string {
    return productos.map(producto => producto.nombre).join(', ');
  }

  public registrarCuentaCorriente() {
    if (this.form.valid) {
      const cuentaCorriente = this.construirCuentaCorriente();
      this.usuarioService.registrarCuentaCorriente(cuentaCorriente).subscribe((respuesta) => {
        this.gestionarRespuesta(respuesta, 'La cuenta corriente se registró con éxito');
      });
    }
  }

  public modificarCuentaCorriente() {

    if (this.form.valid) {
      const cuentaCorriente = this.construirCuentaCorriente(this.data.cuentaCorriente?.id);
      this.usuarioService.modificarCuentaCorriente(cuentaCorriente).subscribe((respuesta) => {
        this.gestionarRespuesta(respuesta, 'La cuenta corriente se modificó con éxito');
        this.referencia.buscar();
      });
    }
  }

  private construirCuentaCorriente(id?: number): any {
    return {
      id: id || undefined,
      usuario: {id: this.txCliente.value},
      fechaDesde: this.txCreada.value,
      balanceTotal: parseFloat(this.txBalance.value) || 0
    } as CuentaCorriente;
  }

  private gestionarRespuesta(respuesta: any, mensajeExito: string) {
    if (respuesta.mensaje === 'OK') {
      this.notificacionService.openSnackBarSuccess(mensajeExito);
      this.dialogRef.close(respuesta);
    } else {
      this.notificacionService.openSnackBarError(respuesta.mensaje);
    }
  }

  public cancelar() {
    this.dialogRef.close();
  }

  public habilitarEdicion(){
    this.txBuscar.enable();
    this.formDesactivado = false;
    this.data.editar = true;
  }

  private filtrosSuscripciones() {
    // Filtrar por ID de venta.
    this.txBuscar.valueChanges.subscribe((valor) => {
      this.tableDataSource.filter = valor.trim();
    });

    this.tableDataSource.filterPredicate = (data: Venta, filter: string): boolean => {
      const nroVenta = data.id?.toString() || '';
      return nroVenta.includes(filter);
    };
  }

  // Región getters
  get txCliente() {
    return this.form.get('txCliente') as FormControl;
  }

  get txCreada() {
    return this.form.get('txCreada') as FormControl;
  }

  get txDebe() {
    return this.form.get('txDebe') as FormControl;
  }

  get txHaber() {
    return this.form.get('txHaber') as FormControl;
  }

  get txBalance() {
    return this.form.get('txBalance') as FormControl;
  }

  get txBuscar() {
    return this.form.get('txBuscar') as FormControl;
  }

  protected readonly Math = Math;
}
