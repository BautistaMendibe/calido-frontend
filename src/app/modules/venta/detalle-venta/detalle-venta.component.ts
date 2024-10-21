import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {Venta} from "../../../models/venta.model";
import {DatePipe} from "@angular/common";
import {MatTableDataSource} from "@angular/material/table";
import {Producto} from "../../../models/producto.model";

@Component({
  selector: 'app-detalle-venta',
  templateUrl: './detalle-venta.component.html',
  styleUrl: './detalle-venta.component.scss'
})
export class DetalleVentaComponent implements OnInit{

  public form: FormGroup;
  public venta: Venta;
  public tableDataSource: MatTableDataSource<Producto> = new MatTableDataSource<Producto>([]);
  public columnas: string[] = ['imgProducto', 'producto', 'cantidad', 'subTotal'];



  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<any>,
    private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: {
      venta: Venta
    }
  ) {
    this.form = new FormGroup({});
    this.venta = this.data.venta;
  }

  ngOnInit() {
    this.crearFormulario();
    this.setearDatos();
    this.form.disable();
    this.tableDataSource.data = this.venta.productos;
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txFecha: ['', []],
      txFormaDePago: ['', []],
      txTipoFactura: ['', []],
      txMontoTotal: ['', []],
      txCliente: ['', []],
      txDniCliente: ['', []],
      txMailCliente: ['', []],
      txCondicionIvaCliente: ['', []],
    });
  }

  private setearDatos() {
    this.txFecha.setValue(this.formatDate(this.venta.fecha));
    this.txFormaDePago.setValue(this.venta.formaDePago.nombre);
    this.txTipoFactura.setValue(this.venta.comprobanteAfip.comprobante_tipo);
    this.txMontoTotal.setValue(this.venta.montoTotal);
    this.txCliente.setValue( this.venta.cliente.nombre ? (this.venta.cliente.nombre + ' ' + this.venta.cliente.apellido) : 'Consumidor final');
    this.txDniCliente.setValue(this.venta.cliente.dni ? this.venta.cliente.dni : 'No registrado');
    this.txMailCliente.setValue(this.venta.cliente.mail ? this.venta.cliente.mail : 'No registrado');
    this.txCondicionIvaCliente.setValue(this.venta.cliente.idCondicionIva);
  }

  private formatDate(fecha: Date): string | null {
    return this.datePipe.transform(fecha, 'dd/MM/yyyy HH:mm');
  }

  public desHacerVenta() {}

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

}
