import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Proveedor} from "../../../models/proveedores.model";
import {Producto} from "../../../models/producto.model";
import {Transporte} from "../../../models/transporte.model";
import {Pedido} from "../../../models/pedido.model";
import {MatTableDataSource} from "@angular/material/table";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ProveedoresService} from "../../../services/proveedores.service";
import {ProductosService} from "../../../services/productos.service";
import {PedidosService} from "../../../services/pedidos.service";
import {SnackBarService} from "../../../services/snack-bar.service";
import {FiltrosProductos} from "../../../models/comandos/FiltrosProductos.comando";
import {DetallePedido} from "../../../models/detallePedido.model";
import {TipoComprobante} from "../../../models/tipoComprobante.model";
import {ComprobantesService} from "../../../services/comprobantes.service";
import {Usuario} from "../../../models/usuario.model";
import {UsuariosService} from "../../../services/usuarios.service";
import {FiltrosEmpleados} from "../../../models/comandos/FiltrosEmpleados.comando";
import {Comprobante} from "../../../models/comprobante.model";
import {ConsultarComprobanteComponent} from "../consultar-comprobante/consultar-comprobante.component";
import {DetalleComprobante} from "../../../models/detalleComprobante.model";
import {FiltrosPedidos} from "../../../models/comandos/FiltrosPedidos.comando";

@Component({
  selector: 'app-registrar-comprobante',
  templateUrl: './registrar-comprobante.component.html',
  styleUrl: './registrar-comprobante.component.scss'
})
export class RegistrarComprobanteComponent implements OnInit {
  public form: FormGroup;
  private referencia: ConsultarComprobanteComponent;

  public listaProveedores: Proveedor[] = [];
  public productos: Producto[] = [];
  public productosSeleccionados: Producto[] = [];
  public columnas: string[] = ['imgProducto', 'producto', 'costo', 'tipoProducto', 'proveedor', 'marca', 'cantidad'];
  public listaTiposComprobantes: TipoComprobante[] = [];
  public listaUsuarios: Usuario[] = [];
  public listaPedidosPorProveedor: Pedido[] = [];

  public comprobante: Comprobante;
  public cantidadProductos: number = 0;
  public esConsulta: boolean;
  public numeroOrdenSeleccionada: number | null = null;
  public ordenSeleccionada: boolean = false;
  public formDesactivado: boolean;

  public dataSourceProductos = new MatTableDataSource(this.productos);

  constructor(
    private fb: FormBuilder,
    private proveedoresService: ProveedoresService,
    private productosService: ProductosService,
    private pedidosService: PedidosService,
    private comprobantesService: ComprobantesService,
    private usuariosService: UsuariosService,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarComprobanteComponent
      comprobante: Comprobante;
      esConsulta: boolean;
      formDesactivado: boolean;
      editar: boolean;
    }
  ) {
    this.form = new FormGroup({});
    this.referencia = this.data.referencia;
    this.comprobante = this.data.comprobante;
    this.esConsulta = this.data.esConsulta;
    this.formDesactivado = this.data.formDesactivado;
  }

  ngOnInit() {
    this.crearFormulario();
    this.buscarProductos();
    this.buscarProveedores();
    this.buscarUsuarios();
    this.buscarTiposComprobantes();
    this.filtrosSuscripciones();
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txBuscar: ['', []],
      txFechaEmision: [new Date(), [Validators.required]],
      txProveedor: ['', [Validators.required]],
      txObservaciones: ['', [Validators.maxLength(200)]],
      txTipoComprobante: ['', [Validators.required]],
      txResponsable: ['', [Validators.required]],
      txReceptor: ['', [Validators.required]],
      txCantidadProductos: [ {value: '', disabled: true}, [Validators.required]]
    });
  }

  private buscarTiposComprobantes() {
    this.comprobantesService.obtenerTiposComprobantes().subscribe((tiposComprobantes) => {
      this.listaTiposComprobantes = tiposComprobantes;
    });
  }

  private buscarProveedores() {
    this.proveedoresService.buscarTodosProveedores().subscribe((proveedores) => {
      this.listaProveedores = proveedores;
    });
  }

  private buscarUsuarios() {
    this.usuariosService.consultarUsuarios(new FiltrosEmpleados()).subscribe((usuarios) => {
      this.listaUsuarios = usuarios;
    });
  }

  private buscarProductos() {
    this.productosService.consultarProductos(new FiltrosProductos()).subscribe((productos) => {
      this.productos = productos;

      if (this.esConsulta && this.comprobante) {
        this.rellenarFormularioDataPedido();
      }
    });
  }

  public ObtenerPedidosPorProveedor() {
    const filtroProveedor = new FiltrosPedidos();
    filtroProveedor.proveedor = this.txProveedor.value;

    this.pedidosService.consultarPedidos(filtroProveedor).subscribe((pedidos) => {
      this.listaPedidosPorProveedor = pedidos;
    });
  }

  public seleccionarPedido(idPedido: number) {
    this.ordenSeleccionada = true;
    this.numeroOrdenSeleccionada = idPedido;
    this.productosSeleccionados = [];

    const pedido = this.listaPedidosPorProveedor.find(p => p.id === idPedido);

    // Recorrer los detalles del pedido y buscar los productos
    if (pedido) {
      pedido.detallePedido.forEach((detalle: DetallePedido) => {
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

      // Actualiza el dataSource de la tabla con los productos seleccionados
      this.dataSourceProductos = new MatTableDataSource(this.productosSeleccionados);
      this.calcularCantidadProductos();
    }
  }

  private rellenarFormularioDataPedido() {
    this.txFechaEmision.setValue(this.formatDate(this.comprobante.fechaEmision));
    this.txProveedor.setValue(this.comprobante.idProveedor);
    this.txObservaciones.setValue(this.comprobante.observaciones);

    this.comprobante.detalleComprobante.forEach((detalle: DetalleComprobante) => {
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

    this.calcularCantidadProductos();

    if (this.formDesactivado) {
      this.form.disable();
    }
  }

  formatDate(fecha: Date): string {
    return new Date(fecha).toISOString().substring(0, 10);
  }

  public habilitarEdicion(){
    this.form.enable();
    this.data.formDesactivado = false;
    this.formDesactivado = false;
    this.data.editar = true;
  }

  public registrarNuevoPedido() {

    if (this.form.valid) {
      const pedido: Pedido = new Pedido();
      const transporte: Transporte = new Transporte();

      pedido.fechaEmision = this.txFechaEmision.value;
      pedido.idEstadoPedido = 1; // Estado 'pendiente' al registrar.
      pedido.idProveedor = this.txProveedor.value;
      pedido.observaciones = this.txObservaciones.value;
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
          this.notificacionService.openSnackBarSuccess('La orden de compra se registró con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError('Error al registrar una orden de compra, inténtelo nuevamente');
        }
      });
    }
  }

  public modificarPedido() {
    if (this.form.valid) {
      const pedido: Pedido = new Pedido();
      const transporte: Transporte = new Transporte();

      pedido.id = this.data.comprobante?.id;
      pedido.fechaEmision = this.txFechaEmision.value;
      pedido.idProveedor = this.txProveedor.value;
      pedido.observaciones = this.txObservaciones.value;
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
          this.notificacionService.openSnackBarSuccess('Orden de compra modificada con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError(res.mensaje ? res.mensaje : 'Error al modificar la orden de compra');
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

    this.calcularCantidadProductos();
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

    this.calcularCantidadProductos();
  }

  private calcularCantidadProductos() {
    this.cantidadProductos = 0;
    this.productosSeleccionados.forEach((producto) => {
      this.cantidadProductos += producto.cantidadSeleccionada;
      this.txCantidadProductos.setValue(this.cantidadProductos);
    });
  }

  // TODO: Implementar lógica de filtros
  private filtrosSuscripciones() {
    this.dataSourceProductos.filterPredicate = (data: Producto, filter: string) => {
      const filtro = JSON.parse(filter);
      const textoBusqueda = filtro.textoBusqueda;

      // Lógica de comparación por nombre de producto
      return data.nombre.toLowerCase().includes(textoBusqueda);
    };

    const controlBuscar = this.form.get('txBuscar');

    if (controlBuscar) {
      controlBuscar.valueChanges.subscribe(valor => {
        const filtro = {
          textoBusqueda: valor.trim().toLowerCase()
        };
        this.dataSourceProductos.filter = JSON.stringify(filtro);
      });
    }
  }

  public agruparPedidos(listaPedidos: Pedido[], cantidadPorFila: number): any[][] {
    const filas = [];
    for (let i = 0; i < listaPedidos.length; i += cantidadPorFila) {
      filas.push(listaPedidos.slice(i, i + cantidadPorFila));
    }
    return filas;
  }

  public cancelar() {
    this.dialogRef.close();
  }

  // Getters
  get txFechaEmision(): FormControl {
    return this.form.get('txFechaEmision') as FormControl;
  }

  get txProveedor(): FormControl {
    return this.form.get('txProveedor') as FormControl;
  }

  get txBuscar(): FormControl {
    return this.form.get('txBuscar') as FormControl;
  }

  get txObservaciones(): FormControl {
    return this.form.get('txObservaciones') as FormControl;
  }

  get txTipoComprobante(): FormControl {
    return this.form.get('txTipoComprobante') as FormControl;
  }

  get txResponsable(): FormControl {
    return this.form.get('txResponsable') as FormControl;
  }

  get txReceptor(): FormControl {
    return this.form.get('txReceptor') as FormControl;
  }

  get txCantidadProductos(): FormControl {
    return this.form.get('txCantidadProductos') as FormControl;
  }
}
