import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {Venta} from "../../../models/venta.model";

@Component({
  selector: 'app-detalle-venta',
  templateUrl: './detalle-venta.component.html',
  styleUrl: './detalle-venta.component.scss'
})
export class DetalleVentaComponent implements OnInit{

  public form: FormGroup;
  public venta: Venta;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<any>,
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
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txFecha: ['', []],
      txFormaDePago: ['', []],
      txTipoFactura: ['', []],
      txCliente: ['', []],
      txDniCliente: ['', []],
      txMailCliente: ['', []],
      txCondicionIvaCliente: ['', []],
    });
  }

  private setearDatos() {

  }

  public desHacerVenta() {
    this.txFecha.setValue(this.venta.fecha);
    this.txFormaDePago.setValue(this.venta.formaDePago.nombre);
    this.txTipoFactura.setValue(this.venta.facturacion.nombre);
    this.txCliente.setValue(this.venta.usuario.nombre);
    this.txDniCliente.setValue(this.venta.usuario.dni);
    this.txMailCliente.setValue(this.venta.usuario.mail);
    this.txCondicionIvaCliente.setValue(this.venta.usuario.idCondicionIva);
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
