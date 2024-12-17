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
  public darkMode: boolean = false;
  public esAnulacion: boolean = false;

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
    @Inject(MAT_DIALOG_DATA) public data: {
      venta: Venta,
      esAnulacion: boolean
    }
  ) {
    this.form = new FormGroup({});
    this.venta = this.data.venta;
    this.esAnulacion = this.data.esAnulacion;
  }

  ngOnInit() {
    this.obtenerInformacionTema();
    this.crearFormulario();
    this.setearDatos();
    this.form.disable();
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
    this.txDescuento.setValue(this.venta.descuento);
    this.txInteres.setValue(this.venta.interes);
  }

  private formatDate(fecha: Date): string | null {
    return this.datePipe.transform(fecha, 'dd/MM/yyyy HH:mm');
  }

  public desHacerVenta() {
    // TODO: simplemente activar el formulario

    //this.referencia.anularVenta(this.venta, () => {
    //  this.dialogRef.close();
    //});
  }

  public imprimirComprobante() {
    const url = this.venta.comprobanteAfip.comprobante_pdf_url;
    window.open(url, '_blank');
  }

  public cerrar() {
    this.dialogRef.close();
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

}
