import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {Venta} from "../../../models/venta.model";
import {DatePipe} from "@angular/common";
import {MatTableDataSource} from "@angular/material/table";
import {Producto} from "../../../models/producto.model";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {ConsultarVentasComponent} from "../consultar-ventas/consultar-ventas.component";
import {NotificationService} from "../../../services/notificacion.service";
import {SnackBarService} from "../../../services/snack-bar.service";
import {ThemeCalidoService} from "../../../services/theme.service";
import {CuentaCorriente} from "../../../models/cuentaCorriente.model";
import {FiltrosCuentasCorrientes} from "../../../models/comandos/FiltrosCuentasCorrientes";
import {UsuariosService} from "../../../services/usuarios.service";
import {
  RegistrarCuentaCorrienteComponent
} from "../../clientes/registrar-cuenta-corriente/registrar-cuenta-corriente.component";
import {VentasService} from "../../../services/ventas.services";
import {FormasDePagoEnum} from "../../../shared/enums/formas-de-pago.enum";

@Component({
  selector: 'app-detalle-venta',
  templateUrl: './detalle-venta.component.html',
  styleUrl: './detalle-venta.component.scss'
})
export class DetalleVentaComponent implements OnInit{

  public form: FormGroup;
  public venta: Venta;
  public tableDataSource: MatTableDataSource<Producto> = new MatTableDataSource<Producto>([]);
  public columnas: string[] = ['imgProducto', 'nombre', 'cantidadSeleccionada', 'subTotalVenta'];
  public columnasAnulacion: string[] = ['seleccionar', 'imgProducto', 'nombre', 'cantidadSeleccionada', 'subTotalVenta'];
  public darkMode: boolean = false;
  public esAnulacion: boolean = false;
  public cuentas: CuentaCorriente[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<any>,
    private datePipe: DatePipe,
    private notificacionService: SnackBarService,
    private notificationDialogService: NotificationService,
    private themeService: ThemeCalidoService,
    private usuariosService: UsuariosService,
    private ventasService: VentasService,
    @Inject(MAT_DIALOG_DATA) public data: {
      venta: Venta,
      esAnulacion: boolean
    }
  ) {
    this.form = new FormGroup({});
    this.venta = this.data.venta;
    this.esAnulacion = this.data.esAnulacion;
    this.venta.productosSeleccionadoParaAnular = [];
  }

  ngOnInit() {
    this.obtenerInformacionTema();
    this.crearFormulario();
    this.consultarCuentasCorrientes();
    this.setearDatos();
    this.desactivarFormulario();
    this.tableDataSource.data = this.venta.productos;
    this.tableDataSource.paginator = this.paginator;
    this.tableDataSource.sort = this.sort;
  }

  private obtenerInformacionTema() {
    this.darkMode = this.themeService.isDarkMode();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txNumeroVenta: ['', []],
      txFecha: ['', []],
      txFormaDePago: ['', []],
      txTipoFactura: ['', []],
      txMontoTotal: ['', []],
      txCliente: ['', []],
      txDniCliente: ['', []],
      txMailCliente: ['', []],
      txCondicionIvaCliente: ['', []],
      txDescuento: ['', []],
      txInteres: ['', []],
      txCuenta: [{ value: '', disabled: true }, []]
    });
  }

  public consultarCuentasCorrientes(idCuenta?: number) {
    this.usuariosService.consultarCuentasCorrientesxUsuario(new FiltrosCuentasCorrientes()).subscribe((cuentas) => {
      this.cuentas = cuentas;
      if (idCuenta) {
        this.txCuenta.setValue(this.venta.cliente.id);
      }
    });
  }

  private setearDatos() {
    this.txNumeroVenta.setValue(this.venta.id)
    this.txFecha.setValue(this.formatDate(this.venta.fecha));
    this.txFormaDePago.setValue(this.venta.formaDePago.nombre);
    this.txTipoFactura.setValue(this.venta.facturacion?.nombre);
    this.txMontoTotal.setValue(this.venta.montoTotal);
    this.txCliente.setValue( this.venta.cliente.nombre ? (this.venta.cliente.nombre + ' ' + this.venta.cliente.apellido) : 'Consumidor final');
    this.txDniCliente.setValue(this.venta.cliente.dni ? this.venta.cliente.dni : 'No registrado');
    this.txMailCliente.setValue(this.venta.cliente.mail ? this.venta.cliente.mail : 'No registrado');
    this.txCondicionIvaCliente.setValue(this.venta.cliente.idCondicionIva);
    this.txInteres.setValue(this.venta.interes);
    this.txCuenta.setValue(this.venta.cliente.id == -1 ? '' : this.venta.cliente.id);
  }

  public desactivarFormulario() {
    if (!this.esAnulacion) {
      this.form.disable();
    } else {
      // Cuando es anulacion solo desactivar los datos comunes
      this.txNumeroVenta.disable();
      this.txFecha.disable();
      this.txFormaDePago.disable();
      this.txTipoFactura.disable();
      this.txMontoTotal.disable();
      this.txCliente.disable();
      this.txDniCliente.disable();
      this.txMailCliente.disable();
      this.txCondicionIvaCliente.disable();
      this.txDescuento.disable();
      this.txInteres.disable();
    }
  }

  private formatDate(fecha: Date): string | null {
    return this.datePipe.transform(fecha, 'dd/MM/yyyy HH:mm');
  }

  public imprimirComprobante() {
    const url = this.venta.comprobanteAfip.comprobante_pdf_url;
    window.open(url, '_blank');
  }

  public cerrar() {
    this.dialogRef.close();
  }

  public seleccionarProductoParaAnular(producto: Producto, event: boolean) {
    const index = this.venta.productos.findIndex(p => p.id === producto.id);
    if (!event) {
      this.venta.productosSeleccionadoParaAnular.splice(index, 1);
      producto.anulado = false;
      producto.cantidadAnulada = 0;
      this.calcularTotalAnulado();
    } else {
      this.venta.productosSeleccionadoParaAnular.push(producto);
      producto.anulado = true;
      producto.cantidadAnulada = producto.cantidadSeleccionada;
      this.calcularTotalAnulado();
    }
  }

  public aumentarCantidad(producto: Producto) {
    if (producto.cantidadAnulada < producto.cantidadSeleccionada) {
      producto.cantidadAnulada++;
      this.calcularTotalAnulado();
    }
  }

  public disminuirCantidad(producto: Producto) {
    producto.cantidadAnulada--;
    this.calcularTotalAnulado();
  }

  public anularVenta() {
    this.notificationDialogService.confirmation('¿Desea anular esta venta?', 'Anular venta') //Está seguro?
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.calcularTotalAnulado();
          this.ventasService.anularVenta(this.venta).subscribe((res) => {
            if (res.mensaje == 'OK') {
              this.notificacionService.openSnackBarSuccess('Venta anulada correctamente');
              this.dialogRef.close(true);
            } else {
              this.notificacionService.openSnackBarError('Error al anular la venta, intentelo nuevamente.');
            }
          });
        }
      });
  }

  private calcularTotalAnulado() {
    let monto = 0;
    this.venta.totalAnulado = 0;
    this.venta.productosSeleccionadoParaAnular.map((producto) => {
      monto += ((producto.precioConIVA * (1 - (producto.promocion ? producto.promocion.porcentajeDescuento : 0) / 100)) * producto.cantidadAnulada) * (1 + (this.venta.interes ?? 0) / 100);
    });
    this.venta.totalAnulado = monto;
  }

  // Getters
  get txFecha(): FormControl {
    return this.form.get('txFecha') as FormControl;
  }

  get txFormaDePago(): FormControl {
    return this.form.get('txFormaDePago') as FormControl;
  }

  get txTipoFactura(): FormControl {
    return this.form.get('txTipoFactura') as FormControl;
  }

  get txMontoTotal(): FormControl {
    return this.form.get('txMontoTotal') as FormControl;
  }

  get txCliente(): FormControl {
    return this.form.get('txCliente') as FormControl;
  }

  get txDniCliente(): FormControl {
    return this.form.get('txDniCliente') as FormControl;
  }

  get txMailCliente(): FormControl {
    return this.form.get('txMailCliente') as FormControl;
  }

  get txCondicionIvaCliente(): FormControl {
    return this.form.get('txCondicionIvaCliente') as FormControl;
  }

  get txNumeroVenta(): FormControl {
    return this.form.get('txNumeroVenta') as FormControl;
  }

  get txDescuento(): FormControl {
    return this.form.get('txDescuento') as FormControl;
  }

  get txInteres(): FormControl {
    return this.form.get('txInteres') as FormControl;
  }

  get txCuenta() {
    return this.form.get('txCuenta') as FormControl;
  }

  get formasDePagoEnum(): typeof FormasDePagoEnum {
    return FormasDePagoEnum;
  }

}
