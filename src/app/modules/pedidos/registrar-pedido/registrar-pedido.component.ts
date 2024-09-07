import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {Proveedor} from "../../../models/proveedores.model";
import {Pedido} from "../../../models/pedido.model";
import {ProveedoresService} from "../../../services/proveedores.service";
import {ConsultarPedidosComponent} from "../consultar-pedidos/consultar-pedidos.component";
import {Producto} from "../../../models/producto.model";
import {ProductosService} from "../../../services/productos.service";
import {FiltrosProductos} from "../../../models/comandos/FiltrosProductos.comando";
import {MatTableDataSource} from "@angular/material/table";
import {RegistrarProductoComponent} from "../../productos/registrar-producto/registrar-producto.component";
import {TransportesService} from "../../../services/transportes.service";
import {Transporte} from "../../../models/transporte.model";
import {DetallePedido} from "../../../models/detallePedido.model";
import {PedidosService} from "../../../services/pedidos.service";
import {EstadoPedido} from "../../../models/estadoPedido";

@Component({
  selector: 'app-registrar-pedido',
  templateUrl: './registrar-pedido.component.html',
  styleUrl: './registrar-pedido.component.scss'
})
export class RegistrarPedidoComponent implements OnInit {

  public form: FormGroup;
  private referencia: ConsultarPedidosComponent;

  public listaProveedores: Proveedor[] = [];
  public productos: Producto[] = [];
  public productosSeleccionados: Producto[] = [];
  public columnas: string[] = ['imgProducto', 'producto', 'costo', 'tipoProducto', 'proveedor', 'marca', 'cantidad'];
  public listaTransportes: Transporte[] = [];
  public transportesFiltrados: Transporte[] = [];
  private idTransporte: number = -1;
  public listaEstadosPedido: EstadoPedido[] = [];

  public pedido: Pedido;
  public descuentos: { value: number, label: string }[] = [];
  public subTotal: number = 0;
  public esConsulta: boolean;
  public formDesactivado: boolean;

  public dataSourceProductos = new MatTableDataSource(this.productos);

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private proveedoresService: ProveedoresService,
    private productosService: ProductosService,
    private transportesService: TransportesService,
    private pedidosService: PedidosService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarPedidosComponent
      pedido: Pedido;
      esConsulta: boolean;
      formDesactivado: boolean;
      editar: boolean;
    }
  ) {
    this.form = new FormGroup({});
    this.referencia = this.data.referencia;
    this.pedido = this.data.pedido;
    this.esConsulta = this.data.esConsulta;
    this.formDesactivado = this.data.formDesactivado;
  }

  ngOnInit() {
    this.crearFormulario();
    this.generarDescuentos();
    this.buscarProductos();
    this.buscarProveedores();
    this.buscarTransportes();
    this.buscarEstadosPedido();
    this.filtrosSuscripciones();
  }

  public generarDescuentos() {
    for (let i = 0; i <= 100; i += 5) {
      this.descuentos.push({
        value: i,
        label: i === 0 ? 'Ninguno (0%)' : `(${i}%)`
      });
    }
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txBuscar: ['', []],
      txMontoEnvio: ['', [Validators.required]],
      txFechaPedido: [new Date(), [Validators.required]],
      txFechaEntrega: ['', [Validators.required]],
      txEstadoPedido: [1, [Validators.required]],
      txTransporte: ['', [Validators.required]],
      txProveedor: ['', [Validators.required]],
      txDescuento: [0, [Validators.required]],
      txImpuestos: ['21', [Validators.required]], // Valor por defecto IVA
      txObservaciones: ['', [Validators.maxLength(200)]],
      txSubtotal: [ {value: '', disabled: true}, [Validators.required]],
      txTotal: [ {value: '', disabled: true}, [Validators.required]],
    });
  }

  private buscarEstadosPedido() {
    this.pedidosService.obtenerEstadosPedido().subscribe((estados) => {
      this.listaEstadosPedido = estados;
    });
  }

  private buscarProveedores() {
    this.proveedoresService.buscarTodosProveedores().subscribe((proveedores) => {
      this.listaProveedores = proveedores;
    });
  }

  private buscarProductos() {
    this.productosService.consultarProductos(new FiltrosProductos()).subscribe((productos) => {
      this.productos = productos;
      this.dataSourceProductos.data = productos;

      if (this.esConsulta && this.pedido) {
        this.rellenarFormularioDataPedido();
      }
    });
  }

  private buscarTransportes() {
    this.transportesService.buscarTransportes().subscribe((transportes) => {
      this.listaTransportes = transportes;

      // Filtra los transportes por nombre.
      // Si encuentra un transporte válido, asigna su ID.
      // Si no encuentra un transporte válido, asigna -1 para su creación futura.
      this.txTransporte.valueChanges.subscribe((transporte) => {
        if (transporte) {
          this.transportesFiltrados = this.filterTransportes(transporte);
          const transporteValido = this.listaTransportes.some(t => t.nombre === transporte);

          if (transporteValido) {
            this.idTransporte = this.listaTransportes.find(t => t.nombre === transporte)?.id || -1;
          } else {
            this.idTransporte = -1;
          }
        } else {
          this.idTransporte = -1;
        }
      });
    });
  }

  private rellenarFormularioDataPedido() {
    this.txMontoEnvio.setValue(this.pedido.montoEnvio);
    this.txFechaPedido.setValue(this.formatDate(this.pedido.fechaEmision));
    this.txFechaEntrega.setValue(this.formatDate(this.pedido.fechaEntrega));
    this.txEstadoPedido.setValue(this.pedido.idEstadoPedido);
    this.txTransporte.setValue(this.pedido.transporte.nombre);
    this.txProveedor.setValue(this.pedido.idProveedor);
    this.txDescuento.setValue(this.pedido.descuento);
    this.txImpuestos.setValue(this.pedido.impuesto.toString());
    this.txObservaciones.setValue(this.pedido.observaciones);
    this.txTotal.setValue(this.pedido.total);

    this.pedido.detallePedido.forEach((detalle: DetallePedido) => {
      // Encuentra el producto correspondiente al idproducto
      const producto = this.productos.find(producto => producto.id === detalle.idproducto);

      if (producto) {
        producto.cantidadSeleccionada = detalle.cantidad;
        // Crea una copia del producto y actualiza la cantidadSeleccionada
        const productoSeleccionado = {
          ...producto,
          cantidadSeleccionada: detalle.cantidad
        };

        // Agrega el producto modificado a la lista de productos seleccionados
        this.productosSeleccionados.push(productoSeleccionado);
      }
    });

    this.calcularSubTotal();
    this.calcularTotal();

    if (this.formDesactivado) {
      this.form.disable();
    }
  }

  formatDate(fecha: Date): string {
    return new Date(fecha).toISOString().substring(0, 10);
  }

  public habilitarEdicion(){
    this.form.enable();
    this.txSubtotal.disable();
    this.txTotal.disable();
    this.data.formDesactivado = false;
    this.formDesactivado = false;
    this.data.editar = true;
  }

  public registrarNuevoPedido() {

    if (this.form.valid) {
      const pedido: Pedido = new Pedido();
      const transporte: Transporte = new Transporte();

      pedido.montoEnvio = this.txMontoEnvio.value;
      pedido.fechaEmision = this.txFechaPedido.value;
      pedido.fechaEntrega = this.txFechaEntrega.value;
      pedido.idEstadoPedido = 1; // Estado 'pendiente' al registrar.
      pedido.idTransporte = this.idTransporte;
      pedido.idProveedor = this.txProveedor.value;
      pedido.descuento = this.txDescuento.value;
      pedido.impuesto = this.txImpuestos.value;
      pedido.observaciones = this.txObservaciones.value;
      pedido.total = this.txTotal.value;
      transporte.nombre = this.txTransporte.value;
      pedido.transporte = transporte;

      // Por cada producto seleccionado, creamos un detalle de pedido.
      const detallesPedido: DetallePedido[] = this.productosSeleccionados.map((producto) => {
        const detalle = new DetallePedido();
        detalle.cantidad = producto.cantidadSeleccionada;
        detalle.subTotal = producto.cantidadSeleccionada * producto.costo;
        detalle.idpedido = pedido.id;
        detalle.idproducto = producto.id;

        return detalle;
      });

      pedido.detallePedido = detallesPedido;

      this.pedidosService.registrarPedido(pedido).subscribe((respuesta) => {
        if (respuesta.mensaje === 'OK') {
          this.notificacionService.openSnackBarSuccess('El pedido se registró con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError('Error al registrar un pedido, inténtelo nuevamente');
        }
      });
    }
  }

  public modificarPedido() {
    if (this.form.valid) {
      const pedido: Pedido = new Pedido();
      const transporte: Transporte = new Transporte();

      pedido.id = this.data.pedido?.id;
      pedido.montoEnvio = this.txMontoEnvio.value;
      pedido.fechaEmision = this.txFechaPedido.value;
      pedido.fechaEntrega = this.txFechaEntrega.value;
      pedido.idEstadoPedido = this.txEstadoPedido.value;
      pedido.idTransporte = this.idTransporte;
      pedido.idProveedor = this.txProveedor.value;
      pedido.descuento = this.txDescuento.value;
      pedido.impuesto = this.txImpuestos.value;
      pedido.observaciones = this.txObservaciones.value;
      pedido.total = this.txTotal.value;
      transporte.nombre = this.txTransporte.value;
      pedido.transporte = transporte;

      // Por cada producto seleccionado, creamos un detalle de pedido.
      const detallesPedido: DetallePedido[] = this.productosSeleccionados.map((producto) => {
        const detalle = new DetallePedido();
        detalle.cantidad = producto.cantidadSeleccionada;
        detalle.subTotal = producto.cantidadSeleccionada * producto.costo;
        detalle.idpedido = pedido.id;
        detalle.idproducto = producto.id;

        return detalle;
      });

      pedido.detallePedido = detallesPedido;

      this.pedidosService.modificarPedido(pedido).subscribe((res) => {
        if (res.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('Pedido modificado con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError(res.mensaje ? res.mensaje : 'Error al modificar el pedido');
        }
      });
    }
  }

  public aumentarCantidad(producto: Producto) {
    // Incrementamos la cantidad del producto seleccionado.
    producto.cantidadSeleccionada++;

    // Buscamos si el producto esta en la lista de productos seleccionados o no.
    const productoEnLista = this.productosSeleccionados.find(p => p.id === producto.id);

    if (productoEnLista) {
      // En caso de estar, simplemente actualizamos la cantidad seleccionada.
      productoEnLista.cantidadSeleccionada = producto.cantidadSeleccionada;
    } else {
      // De no estar, lo añadimos con la cantidad.
      const productoClonado = { ...producto, cantidadSeleccionada: producto.cantidadSeleccionada };
      this.productosSeleccionados.push(productoClonado);
    }

    this.calcularSubTotal();
    this.calcularTotal();
  }

  public disminuirCantidad(producto: Producto) {
    // Decrementamos la cantidad del producto seleccionado.
    (producto.cantidadSeleccionada > 0) ? producto.cantidadSeleccionada-- : producto.cantidadSeleccionada = 0;

    // Buscamos si el producto esta en la lista de productos seleccionados o no.
    const productoEnLista = this.productosSeleccionados.find(p => p.id === producto.id);

    if (productoEnLista) {

      if (producto.cantidadSeleccionada === 0) {
        // En caso de estar en lista y llegar a cero, eliminar de la lista de productos seleccionados.
        const index = this.productosSeleccionados.findIndex(p => p.id === producto.id);
        if (index > -1) {
          this.productosSeleccionados.splice(index, 1);
        }
      } else {
        // En caso de estar en lista y no llegar a cero, actualizamos la cantidad seleccionada.
        productoEnLista.cantidadSeleccionada = producto.cantidadSeleccionada;
      }
    }

    this.calcularSubTotal();
    this.calcularTotal();
  }

  private calcularSubTotal() {
    this.subTotal = 0;
    this.productosSeleccionados.forEach((producto) => {
      this.subTotal += (producto.costo * producto.cantidadSeleccionada);
    });
    this.txSubtotal.setValue(this.subTotal, { emitEvent: false });
  }

  private calcularTotal() {
    const descuento = parseFloat(this.txDescuento.value);
    const impuestos = this.txImpuestos.value ? parseFloat(this.txImpuestos.value) : 0;
    const costoEnvio = parseFloat(this.txMontoEnvio.value);

    // El descuento normalmente se aplica al subtotal (costo base de productos)
    const subtotalConDescuento = this.subTotal * (1 - descuento / 100);

    // Los impuestos se aplican al costo base de productos luego de aplicado el descuento
    const importeImpuestos = subtotalConDescuento * (impuestos / 100);

    // El total se calcula como la suma del subtotal con descuento, los impuestos y el costo de envío (si aplica)
    const total = subtotalConDescuento + importeImpuestos + costoEnvio;

    this.txTotal.setValue(total);
  }

  public registrarNuevoProducto() {
    this.dialog.open(
      RegistrarProductoComponent,
      {
        width: '75%',
        height: 'auto',
        autoFocus: false,
        data: {
          referencia: this,
          esConsulta: false,
          formDesactivado: false
        }
      }
    );
  }

  private filterTransportes(valor: string): Transporte[] {
    const valorFiltrado = valor.toLowerCase();
    return this.listaTransportes.filter(transporte =>
      transporte.nombre.toLowerCase().includes(valorFiltrado)
    );
  }

  private filtrosSuscripciones() {
    const filtro = {
      idProveedor: this.txProveedor.value,
      textoBusqueda: ''
    };

    // Filtrar por proveedor
    this.txProveedor.valueChanges.subscribe(proveedorId => {
      filtro.idProveedor = proveedorId;
      this.dataSourceProductos.filter = JSON.stringify(filtro);
    });

    // Filtrar por texto de búsqueda
    this.txBuscar.valueChanges.subscribe(valor => {
      filtro.textoBusqueda = valor.trim().toLowerCase();
      this.dataSourceProductos.filter = JSON.stringify(filtro);
    });

    this.dataSourceProductos.filterPredicate = (producto, filter: string) => {
      const filtro = JSON.parse(filter);
      const coincideProveedor = filtro.idProveedor ? producto.proveedor.id === filtro.idProveedor : true;
      const coincideTexto = producto.nombre.toLowerCase().includes(filtro.textoBusqueda);
      return coincideProveedor && coincideTexto;
    };

    // Suscripciones para actualizar subtotal y total.
    this.txDescuento.valueChanges.subscribe(() => this.calcularTotal());
    this.txImpuestos.valueChanges.subscribe(() => this.calcularTotal());
    this.txMontoEnvio.valueChanges.subscribe(() => this.calcularTotal());
  }

  public cancelar() {
    this.dialogRef.close();
  }

  // Getters
  get txMontoEnvio(): FormControl {
    return this.form.get('txMontoEnvio') as FormControl;
  }

  get txFechaPedido(): FormControl {
    return this.form.get('txFechaPedido') as FormControl;
  }

  get txFechaEntrega(): FormControl {
    return this.form.get('txFechaEntrega') as FormControl;
  }

  get txEstadoPedido(): FormControl {
    return this.form.get('txEstadoPedido') as FormControl;
  }

  get txTransporte(): FormControl {
    return this.form.get('txTransporte') as FormControl;
  }

  get txProveedor(): FormControl {
    return this.form.get('txProveedor') as FormControl;
  }

  get txBuscar(): FormControl {
    return this.form.get('txBuscar') as FormControl;
  }

  get txDescuento(): FormControl {
    return this.form.get('txDescuento') as FormControl;
  }

  get txImpuestos(): FormControl {
    return this.form.get('txImpuestos') as FormControl;
  }

  get txObservaciones(): FormControl {
    return this.form.get('txObservaciones') as FormControl;
  }

  get txSubtotal(): FormControl {
    return this.form.get('txSubtotal') as FormControl;
  }

  get txTotal(): FormControl {
    return this.form.get('txTotal') as FormControl;
  }
}
