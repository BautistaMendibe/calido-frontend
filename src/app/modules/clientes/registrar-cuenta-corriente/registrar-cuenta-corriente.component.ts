import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ConsultarCuentasCorrientesComponent } from "../consultar-cuentas-corrientes/consultar-cuentas-corrientes.component";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import { CuentaCorriente } from "../../../models/cuentaCorriente.model";
import { SnackBarService } from "../../../services/snack-bar.service";
import { Usuario } from "../../../models/usuario.model";
import { UsuariosService } from "../../../services/usuarios.service";
import {Venta} from "../../../models/venta.model";
import {MatTableDataSource} from "@angular/material/table";
import {RegistrarProductoComponent} from "../../productos/registrar-producto/registrar-producto.component";
import {Producto} from "../../../models/producto.model";
import {FiltrosVentas} from "../../../models/comandos/FiltrosVentas.comando";
import {VentasService} from "../../../services/ventas.services";
import {FiltrosEmpleados} from "../../../models/comandos/FiltrosEmpleados.comando";

@Component({
  selector: 'app-registrar-cuenta-corriente',
  templateUrl: './registrar-cuenta-corriente.component.html',
  styleUrls: ['./registrar-cuenta-corriente.component.scss']
})
export class RegistrarCuentaCorrienteComponent implements OnInit {

  public form: FormGroup;
  public listaClientes: Usuario[] = [];
  public usuariosFiltrados: Usuario[] = [];
  public esConsulta: boolean;
  public esRegistro: boolean;
  public formDesactivado: boolean;
  private referencia: ConsultarCuentasCorrientesComponent;

  public tableDataSource: MatTableDataSource<Venta> = new MatTableDataSource<Venta>([]);
  public ventas: Venta[] = [];
  public columnas: string[] = ['nroventa', 'montoTotal', 'fecha', 'formaDePago', 'productos'];

  public listaVentasDeshabilitada: boolean = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuariosService,
    private dialogRef: MatDialogRef<RegistrarCuentaCorrienteComponent>,
    private notificacionService: SnackBarService,
    private ventasService: VentasService,
    private dialog: MatDialog,
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
    this.crearFormulario();

    if (this.data.formDesactivado) {
      this.form.disable();
    }

    if (this.data.editar) {
      this.listaVentasDeshabilitada = false;
    }

    this.buscarUsuarios();
    this.buscarVentas();

    this.txCliente.valueChanges.subscribe(() => {
      this.actualizarNombreApellido();
    });
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txCliente: [this.data.cuentaCorriente?.usuario?.id || '', [Validators.required]],
      txNombre: [this.data.cuentaCorriente?.usuario?.nombre || '', [Validators.required]],
      txApellido: [this.data.cuentaCorriente?.usuario?.apellido || '', [Validators.required]],
      txCreada: [{ value: this.data.cuentaCorriente?.fechaDesde || '', disabled: true }, [Validators.required]],
      txBalance: [this.data.cuentaCorriente?.balanceTotal || '', [Validators.required, Validators.pattern('^[0-9]+$')]],
      txBuscar: ['']
    });
  }

  private buscarUsuarios() {
    this.usuarioService.consultarClientes(new FiltrosEmpleados()).subscribe((clientes) => {
      this.listaClientes = clientes;
      this.txCliente.valueChanges.subscribe((cliente) => {
        this.usuariosFiltrados = this.filtrarLista(cliente, this.listaClientes);
      });
    });
  }

  public buscarVentas() {
    this.ventasService.buscarVentas(new FiltrosVentas()).subscribe((ventas) => {
      this.ventas = ventas;
      this.tableDataSource.data = ventas;
    })
  }

  public verProducto(producto: Producto) {
    this.dialog.open(
      RegistrarProductoComponent,
      {
        width: '80%',
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

  public getNombresProductos(productos: Producto[]): string {
    return productos.map(producto => producto.nombre).join(', ');
  }

  private filtrarLista(busqueda: string, lista: any[]): any[] {
    return lista.filter((value) => value.nombre.toLowerCase().startsWith(busqueda.toLowerCase()));
  }

  private actualizarNombreApellido() {
    const usuarioId = this.txCliente.value;
    const usuarioSeleccionado = this.listaClientes.find(u => u.id === usuarioId);
    if (usuarioSeleccionado) {
      this.txNombre.setValue(usuarioSeleccionado.nombre, { emitEvent: false });
      this.txApellido.setValue(usuarioSeleccionado.apellido, { emitEvent: false });
    }
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
    const cuentaCorriente = {
      id: id || undefined,
      usuario: { id: this.txCliente.value },
      fechaDesde: this.txCreada.value ,
      balanceTotal: parseFloat(this.txBalance.value) || 0
    } as CuentaCorriente;
    return cuentaCorriente;
  }
  private gestionarRespuesta(respuesta: any, mensajeExito: string) {
    if (respuesta.mensaje === 'OK') {
      this.notificacionService.openSnackBarSuccess(mensajeExito);
      this.dialogRef.close();
    } else {
      this.notificacionService.openSnackBarError('Error al procesar la solicitud, intentelo nuevamente');
    }
  }

  public cancelar() {
    this.dialogRef.close();
  }

  public habilitarEdicion(){
    this.form.enable();
    this.txNombre.disable();
    this.txApellido.disable();
    this.formDesactivado = false;
    this.data.editar = true;
    this.txCliente.disable();
  }

  public getErrorMessage(control: FormControl): string {
    if (control.hasError('required')) return 'Este campo es obligatorio';
    if (control.hasError('pattern')) return 'Valor no válido';
    return '';
  }

  // Región getters
  get txCliente() {
    return this.form.get('txCliente') as FormControl;
  }

  get txNombre() {
    return this.form.get('txNombre') as FormControl;
  }

  get txApellido() {
    return this.form.get('txApellido') as FormControl;
  }

  get txCreada() {
    return this.form.get('txCreada') as FormControl;
  }

  get txBalance() {
    return this.form.get('txBalance') as FormControl;
  }

  get txBuscar() {
    return this.form.get('txBuscar') as FormControl;
  }
}
