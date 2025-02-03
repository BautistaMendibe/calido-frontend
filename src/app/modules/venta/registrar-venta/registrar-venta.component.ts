import {Component, HostListener, OnInit} from '@angular/core';
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
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {RegistrarClientesComponent} from "../../clientes/registrar-clientes/registrar-clientes.component";
import {UsuariosService} from "../../../services/usuarios.service";
import {FiltrosEmpleados} from "../../../models/comandos/FiltrosEmpleados.comando";
import {TipoFactura} from "../../../models/tipoFactura.model";
import {AuthService} from "../../../services/auth.service";
import {Tarjeta} from "../../../models/tarjeta.model";
import {TarjetasService} from "../../../services/tarjetas.service";
import {FormasDePagoEnum} from "../../../shared/enums/formas-de-pago.enum";
import {FiltrosTarjetas} from "../../../models/comandos/FiltrosTarjetas.comando";
import {TiposTarjetasEnum} from "../../../shared/enums/tipos-tarjetas.enum";
import {CuotaPorTarjeta} from "../../../models/cuotaPorTarjeta.model";
import {ConfiguracionesService} from "../../../services/configuraciones.service";
import {Caja} from "../../../models/Caja.model";
import {CajasService} from "../../../services/cajas.service";
import {FiltrosCajas} from "../../../models/comandos/FiltrosCaja.comando";
import {CondicionIvaEnum} from "../../../shared/enums/condicion-iva.enum";
import {TiposFacturacionEnum} from "../../../shared/enums/tipos-facturacion.enum";
import {QRVentanaComponent} from "../../qr-ventana/qr-ventana.component";
import {Subject} from "rxjs";
import {FiltrosArqueos} from "../../../models/comandos/FiltrosArqueos.comando";
import {Arqueo} from "../../../models/Arqueo.model";
import {FiltrosCuentasCorrientes} from "../../../models/comandos/FiltrosCuentasCorrientes";
import {CuentaCorriente} from "../../../models/cuentaCorriente.model";

@Component({
  selector: 'app-registrar-venta',
  templateUrl: './registrar-venta.component.html',
  styleUrl: './registrar-venta.component.scss'
})
export class RegistrarVentaComponent implements OnInit{
  public productos: Producto[] = [];
  public productosFiltrados: Producto[] = [];
  public productosSeleccionados: Producto[] = [];
  public clientes: Usuario[] = [];
  public formasDePago: FormaDePago[] = [];
  public tiposDeFacturacion: TipoFactura[] = [];
  public listaEmpleados: Usuario[] = [];
  public listaCajas: Caja[] = [];
  public tarjetasRegistradas: Tarjeta[] = [];
  private arqueosHoy: Arqueo[] = [];

  public subTotal: number = 0;
  public impuestoIva: number = 0;
  public cargandoProductos: boolean = true;
  public totalVenta: number = 0;
  public descuentoPorTarjeta: number = 0;
  public interesPorTarjeta: number = 0;
  public montoConsumidorFinal: number = 99999999;

  public form: FormGroup;
  public tarjetaSeleccionada: Tarjeta;
  public cantidadCuotaSeleccionada: CuotaPorTarjeta;

  public mostrarTarjetasCuotas: boolean = false;
  public registrandoVenta: boolean = false;
  private facturacionAutomatica: boolean = false;
  public limiteProductos: number = 20;

  private cuentasCorrientes: CuentaCorriente[] = [];

  private stopPolling$ = new Subject<void>();
  private isDialogClosed = false;

  constructor(
    private fb: FormBuilder,
    private productosService: ProductosService,
    private notificationDialogService: NotificationService,
    private ventasService: VentasService,
    private notificacionService: SnackBarService,
    private dialog: MatDialog,
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private tarjetasService: TarjetasService,
    private configuracionesService: ConfiguracionesService,
    private cajasService: CajasService
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
    this.buscarConfiguracionesParaVenta();
    this.ajustarLimiteCantidadLimiteProducto();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.ajustarLimiteCantidadLimiteProducto();
  }

  public buscar() {
    const filtros: FiltrosProductos = new FiltrosProductos();
    this.productosService.consultarProductos(filtros).subscribe((productos) => {
      // Ordena los productos por cantidadEnStock (descendente) y luego por nombre (alfabético ascendente)
      productos.sort((a, b) => {
        const stockComparison = b.cantidadEnStock - a.cantidadEnStock;
        if (stockComparison !== 0) {
          return stockComparison;
        }
        return a.nombre.localeCompare(b.nombre);
      });

      // Asigna los productos ordenados a las variables
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
      txCuotas: ['', []],
      tx4UltimosDigitosTarjetas: ['', [Validators.pattern(/^\d+$/)]], // Solo números
      txCaja: [1, [Validators.required]],
      txCancelarConSaldo: [false, []]
    });
  }

  private buscarDataCombos() {
    this.buscarUsuariosClientes();
    this.buscarFormasDePago();
    this.buscarTiposFactura();
    this.buscarEmpleados();
    this.obtenerEmpleadoLogueado();
    this.buscarCajas();
    this.buscarArqueoCajaHoy();
    this.buscarCuentasCorrientes();
  }

  private buscarConfiguracionesParaVenta() {
    this.configuracionesService.consultarConfiguraciones().subscribe((configuracion) => {
      this.facturacionAutomatica = configuracion.facturacionAutomatica;
      this.montoConsumidorFinal = configuracion.montoConsumidorFinal;
    });
  }

  private ajustarLimiteCantidadLimiteProducto() {
    this.limiteProductos = window.innerWidth < 900 ? 6 : 30;
  }

  private buscarCajas() {
    this.cajasService.consultarCajas(new FiltrosCajas()).subscribe((cajas) => {
      this.listaCajas = cajas;
    });
  }

  private buscarArqueoCajaHoy() {
    const filtro = new FiltrosArqueos();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    filtro.fechaApertura = hoy;

    this.cajasService.consultarArqueos(filtro).subscribe((arqueos) => {
      this.arqueosHoy = arqueos;
    });
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

    this.txCuotas.setValue(null);
    this.txTarjeta.setValue(null);
    this.tx4UltimosDigitosTarjetas.setValue(null);

    this.tarjetaSeleccionada = new Tarjeta();

    if (formaDePagoElegida == this.formasDePagoEnum.TARJETA_CREDITO || formaDePagoElegida == this.formasDePagoEnum.TARJETA_DEBITO) {
      const filtroTarjeta: FiltrosTarjetas = new FiltrosTarjetas();
      filtroTarjeta.tipoTarjeta = formaDePagoElegida == this.formasDePagoEnum.TARJETA_CREDITO
        ? this.tiposTarjetasEnum.TARJETA_CREDITO
        : this.tiposTarjetasEnum.TARJETA_DEBITO;

      this.txTarjeta.disable();
      this.tarjetasService.consultarTarjetas(filtroTarjeta).subscribe((tarjetas) => {
        this.tarjetasRegistradas = tarjetas;
        this.mostrarTarjetasCuotas = true;
        this.txTarjeta.enable();
      });

      if (formaDePagoElegida == this.formasDePagoEnum.TARJETA_DEBITO) {
        this.mostrarTarjetasCuotas = false;
        this.txCuotas.setValue(null);
        this.txTarjeta.setValue(null);
        this.tx4UltimosDigitosTarjetas.setValue(null);
        this.cantidadCuotaSeleccionada = new CuotaPorTarjeta();
        this.calcularTotal();
      }

    } else {
      this.txTarjeta.setValue(null);
      this.txCuotas.setValue(null);
      this.tx4UltimosDigitosTarjetas.setValue(null);
      this.mostrarTarjetasCuotas = false;
      this.txTarjeta.enable();
      this.cantidadCuotaSeleccionada = new CuotaPorTarjeta();
      this.calcularTotal();
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
    if (producto.cantidadSeleccionada < producto.cantidadEnStock) {
      producto.cantidadSeleccionada++;
      this.calcularSubTotal();
    }
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
  }

  private calcularSubTotal() {
    this.subTotal = 0;
    this.productosSeleccionados.forEach((producto) => {
      this.subTotal += ((producto.precioConIVA * (1 - (producto.promocion ? producto.promocion.porcentajeDescuento : 0) / 100)) * producto.cantidadSeleccionada);
    });
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
    this.notificationDialogService.confirmation('Los productos serán eliminados de la venta actual\n¿Desea continuar?', 'Cancelar venta')
      .afterClosed()
      .subscribe((value) => {
        if (value) {
          this.limpiarVenta();
        }
      });
  }

  private calcularTotal() {
    this.totalVenta = this.subTotal;

    if (this.cantidadCuotaSeleccionada?.id){
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
        width: '90%',
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
            producto.precioConIVA = respusta.precioConIVA;
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
    } else if (producto.cantidadEnStock === 0 || producto.cantidadEnStock === null) {
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

  public async confirmarVenta() {
    if (this.form.valid && this.productosSeleccionados.length > 0) {
      // Validación de que la caja seleccionada esté abierta
      const arqueoConCaja = this.arqueosHoy.find((arqueo) => arqueo.idCaja === this.txCaja.value);
      if (!arqueoConCaja || arqueoConCaja.idEstadoArqueo !== 1) {
        this.notificacionService.openSnackBarError('La caja seleccionada no está abierta, intentelo nuevamente.');
        return;
      }

      // Validación para consumidor final
      if ((this.totalVenta >= this.montoConsumidorFinal) && this.txCliente.value == -1) {
        this.notificacionService.openSnackBarError(
          'El monto total de la venta supera el monto permitido para consumidor final. Seleccione o registre un cliente para esta venta.'
        );
        return;
      }

      // Validación para ver que cliente tenga cuenta corriente en ventas de cuenta corriente
      if (this.txFormaDePago.value == this.formasDePagoEnum.CUENTA_CORRIENTE &&
        !this.cuentasCorrientes.some(cuenta => cuenta.idUsuario === this.txCliente.value)) {
        this.notificacionService.openSnackBarError(
          'El cliente seleccionado no tiene cuenta corriente. Cree una cuenta corriente para este cliente e intentelo nuevamente.'
        );
        return;
      }

      const venta: Venta = new Venta();

      // Configuración de la venta
      venta.cliente = new Usuario();
      venta.cliente.id = this.txCliente.value ? this.txCliente.value : null;
      venta.fecha = new Date();
      venta.formaDePago = new FormaDePago();
      venta.formaDePago.id = this.txFormaDePago.value;
      const formaDePago = this.formasDePago.find(forma => forma.id === this.txFormaDePago.value);
      if (formaDePago) {
        venta.formaDePago.idAfip = formaDePago.idAfip;
      }
      venta.facturacion = new TipoFactura();
      venta.facturacion.id = this.txTipoFacturacion.value;
      const selectedTipoFacturacion = this.tiposDeFacturacion.find(tp => tp.id === this.txTipoFacturacion.value);
      venta.facturacion.nombre = selectedTipoFacturacion?.nombre;
      venta.detalleVenta = [];
      venta.productos = this.productosSeleccionados;
      venta.idEmpleado = this.txEmpleado.value;
      venta.idCaja = this.txCaja.value;
      venta.montoTotal = this.totalVenta;

      // Si el pago es con tarjeta, registramos esos datos
      venta.tarjeta = this.tarjetaSeleccionada?.nombre;
      venta.cantidadCuotas = this.cantidadCuotaSeleccionada?.cantidadCuota;
      venta.interes = this.cantidadCuotaSeleccionada?.interes;
      venta.ultimosCuatroDigitosTarjeta = this.tx4UltimosDigitosTarjetas.value;

      // Verificar que se paga con QR para esperar el pago ANTES de registrar la venta
      if (venta.formaDePago.id === this.formasDePagoEnum.QR) {
        const QRpagado = await this.pagarConQRSIRO(venta); // Espera a que se resuelva la promesa antes de seguir el flujo
        if (QRpagado) {
          //console.log('Pago confirmado. Registrando la venta');
        } else {
          this.notificacionService.openSnackBarError('El pago no se completó. Por favor, reintente la venta.');
          return; // Detenemos el flujo para no registrar la venta
        }
      }
      // FIN QR SIRO

      this.registrandoVenta = true;

      this.ventasService.registrarVenta(venta).subscribe((respuesta) => {
        if (respuesta.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('Venta registrada con éxito.');
          venta.id = respuesta.id;

          // Facturar venta automáticamente si la opción está marcada
          if (this.facturacionAutomatica) {
            // Mostrar snackbar de carga
            const snackBarRef = this.notificacionService.openSnackBarLoading();
            this.ventasService.facturarVentaConAfip(venta).subscribe((respuestaAfip) => {
              if (respuestaAfip.mensaje == 'OK') {
                snackBarRef.dismiss();
                this.notificacionService.openSnackBarSuccess('Venta facturada con éxito.');
                this.registrandoVenta = false;
                this.limpiarVenta();
              } else {
                snackBarRef.dismiss();
                this.notificacionService.openSnackBarError('Error al facturar venta. Inténtelo nuevamente desde consultas.');
              }
            });
          } else {
            this.limpiarVenta();
            this.registrandoVenta = false;
          }
        } else {
          this.notificacionService.openSnackBarError('Error al registrar la venta, inténtelo nuevamente.');
          this.registrandoVenta = false;
        }
      });
    }
  }

  /**
   * Función para pagar con QR SIRO
   * Realiza 65 intentos de polling cada 5 segundos para verificar el estado del pago
   * @param venta
   * @private
   */
  private async pagarConQRSIRO(venta: Venta): Promise<boolean> {
    let QRPagado = false;

    if (venta.formaDePago.id !== this.formasDePagoEnum.QR) {
      return QRPagado;
    }

    this.notificacionService.openSnackBarSuccess('Generando pago.');
    try {
      // Generar el pago
      const respuestaPago = await this.ventasService.pagarConSIROQR(venta).toPromise();
      //console.log('Respuesta recibida:', respuestaPago);

      if ((respuestaPago as { Hash: string }).Hash) {
        this.notificacionService.openSnackBarSuccess('Pago generado con éxito.');
        const idReferencia = (respuestaPago as { IdReferenciaOperacion: string }).IdReferenciaOperacion;
        //console.log('IdReferenciaOperacion:', idReferencia);

        if (idReferencia) {
          const dialogRef = this.mostrarQR(idReferencia);

          // Polling para consultar el estado del pago
          const pagoExitoso = await this.pollingEstadoPago(idReferencia, 65, 5000, dialogRef);
          if (pagoExitoso) {
            this.notificacionService.openSnackBarSuccess('El pago fue exitoso. Registrando venta.');
            QRPagado = true;

            // Actualizar el estado manualmente para que siempre se muestre el ícono
            if (dialogRef.componentInstance) {
              dialogRef.componentInstance.estadoPago = 'PAGADO';
              dialogRef.componentInstance.icono = 'check_circle';
            }

            setTimeout(() => {
              dialogRef.close();
            }, 2000);
          } else {
            this.notificacionService.openSnackBarError('Error. El pago no fue procesado.');
          }
        }
      }
    } catch (err) {
      console.error('Error en la llamada:', err);
      this.notificacionService.openSnackBarError('Error en la solicitud.');
    }

    return QRPagado;
  }

  /**
   * Función para realizar el polling del estado de un pago QR en una ventana modal.
   * Se consulta el estado de pago cada cierto intervalo de tiempo.
   * @param idReferencia
   * @param intentos
   * @param intervalo
   * @param dialogRef
   * @private
   */
  private async pollingEstadoPago(idReferencia: string, intentos: number, intervalo: number, dialogRef: MatDialogRef<QRVentanaComponent>): Promise<boolean> {
    this.stopPolling$ = new Subject<void>(); // Resetear el Subject
    this.isDialogClosed = false; // Reiniciar la bandera

    // Escuchar el cierre del diálogo
    const dialogCloseSubscription = dialogRef.afterClosed().subscribe(() => {
      if (!this.isDialogClosed) {
        this.isDialogClosed = true; // Evitar múltiples impresiones
        this.stopPolling$.next(); // Emitir señal para detener el polling
        this.stopPolling$.complete();
      }
    });

    try {
      for (let i = 0; i < intentos; i++) {
        // Verificar si el polling debe detenerse
        if (this.stopPolling$.isStopped || this.isDialogClosed) {
          break; // Salir del bucle si el polling fue cancelado
        }

        try {
          const respuestaConsulta = await this.ventasService.consultaPagoSIROQR(idReferencia).toPromise();
          if (Array.isArray(respuestaConsulta) && respuestaConsulta.length > 0) {
            const resultado = respuestaConsulta[respuestaConsulta.length - 1];
            const pagoExitoso = resultado.PagoExitoso;
            const estado = resultado.Estado;

            if (pagoExitoso && estado === 'PROCESADA') {
              dialogCloseSubscription.unsubscribe(); // Limpiar la suscripción
              return true; // Pago exitoso
            }
          }
        } catch (err) {
          console.error('Error al consultar el estado del pago:', err);
        }

        // Esperar antes de reintentar, con verificación para detener
        await this.delayWithCancel(intervalo, this.stopPolling$);
      }
    } finally {
      dialogCloseSubscription.unsubscribe(); // Asegurar la limpieza
    }

    return false; // Si se agotan los intentos
  }

  /**
   * Retrasa la ejecución por un tiempo determinado o la cancela si se emite un evento en `cancel$`.
   * @param ms - Tiempo en milisegundos para esperar.
   * @param cancel$ - Subject que permite cancelar el retraso.
   * @private
   */
  private async delayWithCancel(ms: number, cancel$: Subject<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve();
      }, ms);

      cancel$.subscribe(() => {
        clearTimeout(timeout);
        reject('Polling cancelado.');
      });
    });
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
    this.tx4UltimosDigitosTarjetas.setValue(null);
    this.txTarjeta.setValue(null);
    this.txBuscar.setValue(null);

    this.mostrarTarjetasCuotas = false;
    this.tarjetaSeleccionada = new Tarjeta();

    // Establecer txCliente en consumidor final
    this.txCliente.setValue(-1);

    this.buscar();
  }

  public registrarProducto() {
    this.dialog.open(
      RegistrarProductoComponent,
      {
        width: '90%',
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
    // Escuchar cambios en el tipo de facturación
    this.txTipoFacturacion.valueChanges.subscribe(() => {
      if (this.txTipoFacturacion.value == this.getTiposFacturacionEnum.FACTURA_A) {
        // Si el cliente es consumidor final, quitar selección
        if (this.txCliente.value === -1) {
          this.txCliente.setValue(null);
        }
      } else if (this.txTipoFacturacion.value == this.getTiposFacturacionEnum.FACTURA_B) {
        // Si no hay cliente seleccionado, seleccionar el consumidor final
        if (this.txCliente.value === null) {
          this.txCliente.setValue(-1);
        }
      }
    });

    // Escuchar cambios en el campo de búsqueda
    this.txBuscar.valueChanges.subscribe(() => {
      const textoBusqueda = this.normalizarTexto(this.txBuscar.value || '');

      // Filtrar productos basados en el texto de búsqueda
      this.productosFiltrados = this.productos
        .filter(producto => {
          const codigoBarraNormalizado = this.normalizarTexto(producto.codigoBarra);
          const nombreProductoNormalizado = this.normalizarTexto(producto.nombre);

          return (
            codigoBarraNormalizado.includes(textoBusqueda) ||
            nombreProductoNormalizado.includes(textoBusqueda)
          );
        })
        .sort((a, b) => {
          // Ordenar productos: seleccionados primero
          return (b.seleccionadoParaVenta ? 1 : 0) - (a.seleccionadoParaVenta ? 1 : 0);
        });
    });
  }

  public get clientesFiltrados() {
    if (this.txTipoFacturacion.value == this.getTiposFacturacionEnum.FACTURA_A) {
      // Retornar clientes con condición 'responsable inscripto'
      return this.clientes.filter(cliente => cliente.idCondicionIva == this.getCondicionIvaEnum.RESPONSABLE_INSCRIPTO);
    } else if (this.txTipoFacturacion.value == this.getTiposFacturacionEnum.FACTURA_B) {
      // Retornar clientes distintos a 'responsable inscripto'
      return this.clientes.filter(cliente => cliente.idCondicionIva != this.getCondicionIvaEnum.RESPONSABLE_INSCRIPTO);
    }
    // Si no hay filtros, retornar la lista completa
    return this.clientes;
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

  public cambioCliente(idCliente: number) {
    const cliente = this.clientes.find((cliente) => cliente.id == idCliente);

    if (cliente?.idCondicionIva == this.getCondicionIvaEnum.CONSUMIDOR_FINAL || cliente?.idCondicionIva == null) {
      this.txTipoFacturacion.setValue(this.getTiposFacturacionEnum.FACTURA_B);
    } else {
      this.txTipoFacturacion.setValue(this.getTiposFacturacionEnum.FACTURA_A);
    }
  }

  public mostrarQR(idReferenciaOperacion: string): MatDialogRef<QRVentanaComponent> {
    const qrImageUrl = 'assets/imgs/QR_SIRO.png'; // Ruta de tu imagen QR en el frontend
    return this.dialog.open(QRVentanaComponent, {
      data: { imageUrl: qrImageUrl, idReferenciaOperacion: idReferenciaOperacion },
      width: '400px',
    });
  }

  private buscarCuentasCorrientes() {
    this.usuariosService.consultarCuentasCorrientesxUsuario(new FiltrosCuentasCorrientes()).subscribe((cuentas) => {
      this.cuentasCorrientes = cuentas;
    });
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

  get tx4UltimosDigitosTarjetas(): FormControl {
    return this.form.get('tx4UltimosDigitosTarjetas') as FormControl;
  }

  get formasDePagoEnum(): typeof FormasDePagoEnum {
    return FormasDePagoEnum;
  }

  get tiposTarjetasEnum(): typeof TiposTarjetasEnum {
    return TiposTarjetasEnum;
  }

  get getCondicionIvaEnum(): typeof CondicionIvaEnum {
    return CondicionIvaEnum;
  }

  get getTiposFacturacionEnum(): typeof TiposFacturacionEnum {
    return TiposFacturacionEnum;
  }

  get txCaja(): FormControl {
    return this.form.get('txCaja') as FormControl;
  }

  protected readonly Math = Math;
}
