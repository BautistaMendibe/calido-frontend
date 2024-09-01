import {Component, OnInit} from '@angular/core';
import {Producto} from "../../../models/producto.model";
import {ProductosService} from "../../../services/productos.service";
import {FiltrosProductos} from "../../../models/comandos/FiltrosProductos.comando";
import {NotificationService} from "../../../services/notificacion.service";
import {Venta} from "../../../models/venta.model";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Usuario} from "../../../models/usuario.model";
import {FormaDePago} from "../../../models/formaDePago.model";
import {VentasService} from "../../../services/ventas.services";
import {SnackBarService} from "../../../services/snack-bar.service";

@Component({
  selector: 'app-registrar-venta',
  templateUrl: './registrar-venta.component.html',
  styleUrl: './registrar-venta.component.scss'
})
export class RegistrarVentaComponent implements OnInit{
  public productos: Producto[] = [];
  public productosSeleccionados: Producto[] = [];
  public subTotal: number = 0;
  public impuestoIva: number = 0;
  public cargandoProductos: boolean = true;
  public totalVenta: number = 0;
  public form: FormGroup;
  public usuarios: Usuario[] = [];
  public formasDePago: FormaDePago[] = [];

  constructor(
    private fb: FormBuilder,
    private productosService: ProductosService,
    private notificationDialogService: NotificationService,
    private ventasService: VentasService,
    private notificacionService: SnackBarService
  ) {
    this.form = new FormGroup({});
  }

  ngOnInit(){
    this.buscarProductos();
    this.crearFormulario();
    this.buscarDataCombos();
  }

  private buscarProductos() {
    const filtros: FiltrosProductos = new FiltrosProductos();
    this.productosService.consultarProductos(filtros).subscribe((productos) => {
      this.productos = productos;
      this.cargandoProductos = false;
    });
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txFormaDePago: ['', []],
      txNumeracion: ['', []],
      txCliente: ['', []],
    });
  }

  private buscarDataCombos() {
    this.buscarUsuariosClientes();
    this.buscarFormasDePago();
  }

  private buscarUsuariosClientes() {
    this.ventasService.buscarUsuariosClientes().subscribe((usuarios) => {
      this.usuarios = usuarios;
    });
  }

  private buscarFormasDePago() {
    this.ventasService.buscarFormasDePago().subscribe((formasDePago) => {
      this.formasDePago = formasDePago;
      this.txFormaDePago.setValue(this.formasDePago[0].id);
    });
  }

  public seleccionarProducto(producto: Producto) {
    const index = this.productosSeleccionados.findIndex(p => p.id === producto.id);

    if (index > -1) {
      // Si el producto ya está en la lista, lo eliminamos y marcamos el seleccionado para venta en false
      this.productosSeleccionados.splice(index, 1);
      producto.seleccionadoParaVenta = false;
      producto.cantidadSeleccionada = 0;
    } else {
      // Si el producto no está en la lista, lo agregamos y marcamos el seleccionado para venta en true
      this.productosSeleccionados.push(producto);
      producto.seleccionadoParaVenta = true;
      producto.cantidadSeleccionada = 1;
    }

    this.validarCantidadProductosSeleccionados();
    this.calcularSubTotal();
    this.calcularTotal();
  }

  public aumentarCantidad(producto: Producto) {
    producto.cantidadSeleccionada++;
    this.calcularSubTotal();
    this.calcularTotal();
  }

  public disminuirCantidad(producto: Producto) {
    producto.cantidadSeleccionada--;
    if (producto.cantidadSeleccionada == 0) {
      const index = this.productosSeleccionados.findIndex(p => p.id === producto.id);
      this.productosSeleccionados.splice(index, 1);
      producto.seleccionadoParaVenta = false;
    }
    this.validarCantidadProductosSeleccionados();
    this.calcularSubTotal();
    this.calcularTotal();
  }

  private calcularSubTotal() {
    this.subTotal = 0;
    this.productosSeleccionados.forEach((producto) => {
      this.subTotal += (producto.costo * producto.cantidadSeleccionada);
    });
    this.impuestoIva = this.subTotal * 0.21;
  }

  private validarCantidadProductosSeleccionados() {
    if (this.productosSeleccionados.length == 0) {
      this.subTotal = 0;
      this.impuestoIva = 0;
    }
  }

  public cancelarVenta() {
    this.notificationDialogService.confirmation('Los productos serán eliminados de la venta actual\n\n¿Desea continuar?', 'Cancelar venta')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          // Recorremos los productos seleccionados en orden inverso
          for (let i = this.productosSeleccionados.length - 1; i >= 0; i--) {
            // Actualizamos las propiedades del producto
            const producto = this.productosSeleccionados[i];
            producto.seleccionadoParaVenta = false;
            producto.cantidadSeleccionada = 0;

            // Eliminamos el producto del array de productos seleccionados
            this.productosSeleccionados.splice(i, 1);
          }
        }
      });
  }

  private calcularTotal() {
    this.totalVenta = this.subTotal + this.impuestoIva;
  }

  public editarProductoEnVenta(producto: Producto){}

  public eliminarProductoDeVenta(producto: Producto) {
    const index = this.productosSeleccionados.findIndex(p => p.id === producto.id);
    // Si el producto ya está en la lista, lo eliminamos y marcamos el seleccionado para venta en false
    this.productosSeleccionados.splice(index, 1);
    producto.seleccionadoParaVenta = false;
    producto.cantidadSeleccionada = 0;
  }

  public confirmarVenta() {
    const venta: Venta = new Venta();

    // Seteamos valores de la venta
    venta.usuario = this.txCliente.value ? this.txCliente.value : null;
    venta.fecha = new Date();
    venta.formaDePago = this.txFormaDePago.value;
    venta.montoTotal = this.totalVenta;
    venta.detalleVenta = [];
    venta.productos = this.productosSeleccionados;

    this.ventasService.registrarVenta(venta).subscribe((respuesta) => {
      if (respuesta.mensaje == 'OK') {
        this.notificacionService.openSnackBarSuccess('La venta se registró con éxito');
      } else {
        this.notificacionService.openSnackBarError('Error al registrar la venta, intentelo nuevamente');
      }
    });

  }

  // Region getters
  get txFormaDePago(): FormControl {
    return this.form.get('txFormaDePago') as FormControl;
  }

  get txNumeracion(): FormControl {
    return this.form.get('txNumeracion') as FormControl;
  }

  get txCliente(): FormControl {
    return this.form.get('txCliente') as FormControl;
  }

}
