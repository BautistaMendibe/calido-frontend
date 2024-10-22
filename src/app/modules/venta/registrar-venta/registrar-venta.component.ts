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
import {RegistrarProductoComponent} from "../../productos/registrar-producto/registrar-producto.component";
import {MatDialog} from "@angular/material/dialog";
import {RegistrarClientesComponent} from "../../clientes/registrar-clientes/registrar-clientes.component";
import {UsuariosService} from "../../../services/usuarios.service";
import {FiltrosEmpleados} from "../../../models/comandos/FiltrosEmpleados.comando";
import {TipoFactura} from "../../../models/tipoFactura.model";
import {PromocionesService} from "../../../services/promociones.service";
import {AuthService} from "../../../services/auth.service";
import {Tarjeta} from "../../../models/tarjeta.model";
import {TarjetasService} from "../../../services/tarjetas.service";
import {FormasDePagoEnum} from "../../../shared/enums/formas-de-pago.enum";
import {FiltrosTarjetas} from "../../../models/comandos/FiltrosTarjetas.comando";
import {TiposTarjetasEnum} from "../../../shared/enums/tipos-tarjetas.enum";
import {CuotaPorTarjeta} from "../../../models/cuotaPorTarjeta.model";

@Component({
  selector: 'app-registrar-venta',
  templateUrl: './registrar-venta.component.html',
  styleUrl: './registrar-venta.component.scss'
})
export class RegistrarVentaComponent implements OnInit{
  public productos: Producto[] = [];
  public productosFiltrados: Producto[] = [];
  public productosSeleccionados: Producto[] = [];
  public subTotal: number = 0;
  public impuestoIva: number = 0;
  public cargandoProductos: boolean = true;
  public totalVenta: number = 0;
  public form: FormGroup;
  public clientes: Usuario[] = [];
  public formasDePago: FormaDePago[] = [];
  public registrandoVenta: boolean = false;
  public tiposDeFacturacion: TipoFactura[] = [];
  public listaEmpleados: Usuario[] = [];
  public mostrarTarjetasCuotas: boolean = false;
  public tarjetasRegistradas: Tarjeta[] = [];
  public tarjetaSeleccionada: Tarjeta;
  public cantidadCuotaSeleccionada: CuotaPorTarjeta;
  public descuentoPorTarjeta: number = 0;
  public interesPorTarjeta: number = 0;

  constructor(
    private fb: FormBuilder,
    private productosService: ProductosService,
    private notificationDialogService: NotificationService,
    private ventasService: VentasService,
    private notificacionService: SnackBarService,
    private dialog: MatDialog,
    private usuariosService: UsuariosService,
    private promocionesService: PromocionesService,
    private authService: AuthService,
    private tarjetasService: TarjetasService
  ) {
    this.form = new FormGroup({});
    this.tarjetaSeleccionada = new Tarjeta();
    this.cantidadCuotaSeleccionada = new CuotaPorTarjeta();
  }

  ngOnInit(){
    this.buscar();
    this.crearFormulario();
    this.buscarDataCombos();
    this.filtrosSuscripciones();
  }

  public buscar() {
    const filtros: FiltrosProductos = new FiltrosProductos();
    this.productosService.consultarProductos(filtros).subscribe((productos) => {
      this.productos = productos;
      this.productosFiltrados = [...productos];
      this.cargandoProductos = false;
    });
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txFormaDePago: ['', [Validators.required]],
      txTipoFacturacion: ['', [Validators.required]],
      txCliente: ['', [Validators.required]],
      txEmpleado: ['', [Validators.required]],
      txBuscar: ['', []],
      txTarjeta: ['', []],
      txCuotas: ['', []]
    });
  }

  private buscarDataCombos() {
    this.buscarUsuariosClientes();
    this.buscarFormasDePago();
    this.buscarTiposFactura();
    this.buscarEmpleados();
    this.obtenerEmpleadoLogueado();
  }

  private buscarUsuariosClientes() {
    const filtro: FiltrosEmpleados = new FiltrosEmpleados();

    this.usuariosService.consultarClientes(filtro).subscribe((usuarios) => {
      this.clientes = usuarios;
      // Consumidor final por defecto
      this.txCliente.setValue(-1);
    });
  }

  private buscarFormasDePago() {
    this.ventasService.buscarFormasDePago().subscribe((formasDePago) => {
      this.formasDePago = formasDePago;
      this.txFormaDePago.setValue(this.formasDePago[0].id);
    });
  }

  private buscarTiposFactura() {
    this.ventasService.buscarTiposFactura().subscribe((tiposFacturacion) => {
      this.tiposDeFacturacion = tiposFacturacion;
      this.txTipoFacturacion.setValue(tiposFacturacion[1].id);
    });
  }

  private buscarEmpleados() {
    this.usuariosService.consultarEmpleados(new FiltrosEmpleados()).subscribe((empleados) => {
      this.listaEmpleados = empleados;
    });
  }

  private obtenerEmpleadoLogueado() {
    const token = this.authService.getToken();
    const infoToken: any = this.authService.getDecodedAccessToken(token);

    if (infoToken) {
      this.txEmpleado.setValue(infoToken.idusuario);
    }
  }

  public cambiarFormaDePago(formaDePagoElegida: number) {
    if (formaDePagoElegida == this.formasDePagoEnum.TARJETA_CREDITO || formaDePagoElegida == this.formasDePagoEnum.TARJETA_DEBITO) {
      const filtroTarjeta: FiltrosTarjetas = new FiltrosTarjetas();
      filtroTarjeta.tipoTarjeta = formaDePagoElegida == this.formasDePagoEnum.TARJETA_CREDITO ? this.tiposTarjetasEnum.TARJETA_CREDITO : this.tiposTarjetasEnum.TARJETA_DEBITO;

      this.txTarjeta.disable();
      this.tarjetasService.consultarTarjetas(filtroTarjeta).subscribe((tarjetas) => {
        this.tarjetasRegistradas = tarjetas;
        this.mostrarTarjetasCuotas = true;
        this.txTarjeta.enable();
      });

    } else {
      this.mostrarTarjetasCuotas = false;
      this.txTarjeta.setValue(null);
      this.txCuotas.setValue(null);
      this.txTarjeta.enable();
    }
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
    this.reordenarProductos();
  }

  public aumentarCantidad(producto: Producto) {
    producto.cantidadSeleccionada++;
    this.calcularSubTotal();
  }

  public disminuirCantidad(producto: Producto) {
    producto.cantidadSeleccionada--;
    if (producto.cantidadSeleccionada == 0) {
      const index = this.productosSeleccionados.findIndex(p => p.id === producto.id);
      this.productosSeleccionados.splice(index, 1);
      producto.seleccionadoParaVenta = false;
    }
    this.validarCantidadProductosSeleccionados();
  }

  private calcularSubTotal() {
    this.subTotal = 0;
    this.productosSeleccionados.forEach((producto) => {
      this.subTotal += (producto.precioSinIVA * producto.cantidadSeleccionada);
    });
    this.impuestoIva = this.subTotal * 0.21;
    this.calcularTotal();
  }

  private validarCantidadProductosSeleccionados() {
    if (this.productosSeleccionados.length == 0) {
      this.subTotal = 0;
      this.impuestoIva = 0;
      this.totalVenta = 0;
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

    if (this.cantidadCuotaSeleccionada?.id){
       this.descuentoPorTarjeta = this.totalVenta - this.totalVenta * (1 - (this.cantidadCuotaSeleccionada.descuento / 100));
       this.interesPorTarjeta = this.totalVenta * (1 + (this.cantidadCuotaSeleccionada.interes / 100)) - this.totalVenta;

       this.totalVenta = this.totalVenta - this.descuentoPorTarjeta + this.interesPorTarjeta;
    }
  }

  public seleccionarTarjeta(tarjetaId: number){
    const tarjeta = this.tarjetasRegistradas.find((tarjeta) => tarjeta.id == tarjetaId);
    this.tarjetaSeleccionada = tarjeta ? tarjeta : new Tarjeta();
  }

  public seleccionarCuota(cuotaId: number) {
    const cuota = this.tarjetaSeleccionada.cuotaPorTarjeta.find((cuota) => cuota.id == cuotaId);
    this.cantidadCuotaSeleccionada = cuota ? cuota : new CuotaPorTarjeta();
    this.calcularTotal();
  }

  public editarProductoEnVenta(producto: Producto){
    const ref = this.dialog.open(
      RegistrarProductoComponent,
      {
        width: '75%',
        autoFocus: false,
        maxHeight: '80vh',
        panelClass: 'dialog-container',
        data: {
          producto: producto,
          editarPrecioDeVenta: true,
          formDesactivado: true,
          editar: true,
          esConsulta: true,
        }
      }
    );

    ref.afterClosed().subscribe((respusta: Producto) => {
      if (respusta) {
        this.productosSeleccionados.map((producto: Producto) => {
          if (producto.id == respusta.id) {
            producto.precioSinIVA = respusta.precioSinIVA;
            producto.promocion = respusta.promocion;
          }
        })
        this.notificacionService.openSnackBarSuccess('Precio modificado para esta venta.');
        this.calcularSubTotal();
      }
    });
  }

  public obtenerClaseStock(producto: Producto): string {
    if (producto.cantidadEnStock > 5) {
      return 'stock-disponible';
    } else if (producto.cantidadEnStock >= 1 && producto.cantidadEnStock <= 5) {
      return 'stock-medio';
    } else if (producto.cantidadEnStock === 0) {
      return 'sin-stock';
    } else {
      return 'stock-bajo';
    }
  }

  public eliminarProductoDeVenta(producto: Producto) {
    const index = this.productosSeleccionados.findIndex(p => p.id === producto.id);
    // Si el producto ya está en la lista, lo eliminamos y marcamos el seleccionado para venta en false
    this.productosSeleccionados.splice(index, 1);
    producto.seleccionadoParaVenta = false;
    producto.cantidadSeleccionada = 0;
    this.calcularSubTotal();
  }

  public confirmarVenta() {
    if (this.form.valid && this.productosSeleccionados.length > 0) {
      const venta: Venta = new Venta();

      // Seteamos valores de la venta
      venta.cliente = new Usuario();
      venta.cliente.id = this.txCliente.value ? this.txCliente.value : null;
      venta.fecha = new Date();
      venta.formaDePago = new FormaDePago();
      venta.formaDePago.id = this.txFormaDePago.value;
      venta.facturacion = new TipoFactura();
      venta.facturacion.id = this.txTipoFacturacion.value;
      const selectedTipoFacturacion = this.tiposDeFacturacion.find(tp => tp.id === this.txTipoFacturacion.value);
      venta.facturacion.nombre = selectedTipoFacturacion?.nombre;
      venta.montoTotal = this.totalVenta;
      venta.detalleVenta = [];
      venta.productos = this.productosSeleccionados;
      venta.idEmpleado = this.txEmpleado.value;

      // Si el pago es con tarjeta se registran esos datos
      venta.tarjeta = this.tarjetaSeleccionada.nombre;
      venta.cantidadCuotas = this.cantidadCuotaSeleccionada.cantidadCuota;
      venta.interes = this.cantidadCuotaSeleccionada.interes;
      venta.descuento = this.cantidadCuotaSeleccionada.descuento;

      this.registrandoVenta = true;

      this.ventasService.registrarVenta(venta).subscribe((respuesta) => {
        if (respuesta.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('La venta se registró con éxito');
          venta.id = respuesta.id;
          //this.ventasService.facturarVentaConAfip(venta).subscribe((respuesta) => {})
          this.registrandoVenta = false;
          this.limpiarVenta();
        } else {
          this.notificacionService.openSnackBarError('Error al registrar la venta, intentelo nuevamente');
          this.registrandoVenta = false;
        }
      });
    }
  }

  private limpiarVenta() {
    this.productosSeleccionados.map((producto) => {
      producto.seleccionadoParaVenta = false;
      producto.cantidadSeleccionada = 0;
    });

    // Limpiar productos seleccionados y totales
    this.productosSeleccionados = [];
    this.totalVenta = 0;
    this.subTotal = 0;

    // Reestablecer valores
    this.txFormaDePago.setValue(this.formasDePago[0].id);
    this.txTipoFacturacion.setValue(this.tiposDeFacturacion[1].id);

    // Establecer txCliente en null pero como intacto
    this.txCliente.setValue(null);
    this.txCliente.markAsPristine();
    this.txCliente.markAsUntouched()
  }

  public registrarProducto() {
    this.dialog.open(
      RegistrarProductoComponent,
      {
        width: '75%',
        height: 'auto',
        autoFocus: false,
        maxHeight: '80vh',
        panelClass: 'dialog-container',
        data: {
          referencia: this,
          esConsulta: false,
          formDesactivado: false
        }
      }
    );
  }

  public registrarCliente() {
    const ref = this.dialog.open(
      RegistrarClientesComponent,
      {
        width: '75%',
        maxHeight: '80vh',
        panelClass: 'dialog-container',
        autoFocus: false,
        data: {
          esConsulta: false,
          formDesactivado: false,
        }
      }
    );

    ref.afterClosed().subscribe((res: Usuario) => {
      if (res) {
        this.clientes.push(res);
        this.txCliente.setValue(res.id);
      }
    });
  }

  public filtrosSuscripciones() {
    this.txBuscar.valueChanges.subscribe(() => {
      const textoBusqueda = this.normalizarTexto(this.txBuscar.value || '');

      let productosFiltrados = this.productos.filter(producto => {
        const codigoBarraNormalizado = this.normalizarTexto(producto.codigoBarra);
        const nombreProductoNormalizado = this.normalizarTexto(producto.nombre);

        // Filtrar productos que coincidan parcialmente con el código de barra o nombre
        return codigoBarraNormalizado.includes(textoBusqueda) ||
          nombreProductoNormalizado.includes(textoBusqueda);
      });

      // Ordenar productos: primero los seleccionados y luego los no seleccionados
      productosFiltrados = productosFiltrados.sort((a, b) => {
        return (b.seleccionadoParaVenta ? 1 : 0) - (a.seleccionadoParaVenta ? 1 : 0);
      });

      this.productosFiltrados = productosFiltrados;
    })
  }

  private normalizarTexto(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  private reordenarProductos(): void {
    // Ordenar productos: primero los seleccionados, luego los no seleccionados
    this.productosFiltrados = this.productos.sort((a, b) => {
      return (b.seleccionadoParaVenta ? 1 : 0) - (a.seleccionadoParaVenta ? 1 : 0);
    });
  }

  public enfocar() {
    const inputElement = document.getElementById('txBuscar') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  }

  // Region getters
  get txFormaDePago(): FormControl {
    return this.form.get('txFormaDePago') as FormControl;
  }

  get txTipoFacturacion(): FormControl {
    return this.form.get('txTipoFacturacion') as FormControl;
  }

  get txCliente(): FormControl {
    return this.form.get('txCliente') as FormControl;
  }

  get txEmpleado(): FormControl {
    return this.form.get('txEmpleado') as FormControl;
  }

  get txBuscar(): FormControl {
    return this.form.get('txBuscar') as FormControl;
  }

  get txTarjeta(): FormControl {
    return this.form.get('txTarjeta') as FormControl;
  }

  get txCuotas(): FormControl {
    return this.form.get('txCuotas') as FormControl;
  }

  get formasDePagoEnum(): typeof FormasDePagoEnum {
    return FormasDePagoEnum;
  }

  get tiposTarjetasEnum(): typeof TiposTarjetasEnum {
    return TiposTarjetasEnum;
  }
}
