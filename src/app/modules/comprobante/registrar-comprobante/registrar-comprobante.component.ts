import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Proveedor} from "../../../models/proveedores.model";
import {Producto} from "../../../models/producto.model";
import {Pedido} from "../../../models/pedido.model";
import {MatTableDataSource} from "@angular/material/table";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
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
import {FiltrosComprobantes} from "../../../models/comandos/FiltrosComprobantes.comando";
import {NotificationService} from "../../../services/notificacion.service";
import {BuscarProductosComponent} from "../../productos/buscar-productos/buscar-productos.component";

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
  public columnas: string[] = ['imgProducto', 'nombre', 'costo', 'tipoProducto', 'proveedor', 'marca', 'cantidad'];
  public listaTiposComprobantes: TipoComprobante[] = [];
  public listaUsuarios: Usuario[] = [];
  public listaPedidosPorProveedor: Pedido[] = [];
  public listaComprobantes: Comprobante[] = [];

  public comprobante: Comprobante;
  public cantidadProductos: number = 0;
  public subtotalProductos: number = 0;
  public esConsulta: boolean;
  public numeroOrdenSeleccionada: number | null = null;
  public ordenSeleccionada: boolean = false;
  public formDesactivado: boolean;
  public tablaProductosDesactivada: boolean = false;
  public isLoading: boolean = false;
  public fechaHoy: Date = new Date();

  public dataSourceProductos = new MatTableDataSource(this.productosSeleccionados);

  constructor(
    private fb: FormBuilder,
    private proveedoresService: ProveedoresService,
    private productosService: ProductosService,
    private pedidosService: PedidosService,
    private comprobantesService: ComprobantesService,
    private usuariosService: UsuariosService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<any>,
    private notificacionService: SnackBarService,
    private notificationDialogService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: {
      referencia: ConsultarComprobanteComponent
      comprobante: Comprobante;
      esConsulta: boolean;
      formDesactivado: boolean;
      editar: boolean;
      esRegistro: boolean;
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
    this.buscarComprobantes();
    this.buscarTiposComprobantes();
    this.filtrosSuscripciones();

    if (this.data.editar) {
      this.tablaProductosDesactivada = true;
      this.txTipoComprobante.disable();
      this.txProveedor.disable();
      this.txBuscar.disable();
    }
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txBuscar: ['', []],
      txNumeroComprobante: ['', [Validators.required, Validators.maxLength(16)]],
      txFechaEmision: [new Date(), [Validators.required]],
      txProveedor: ['', [Validators.required]],
      txObservaciones: ['', [Validators.maxLength(200)]],
      txTipoComprobante: [1, [Validators.required]],
      txResponsable: ['', [Validators.required]],
      txReceptor: ['', [Validators.required]],
      txCantidadProductos: [ {value: '', disabled: true}, [Validators.required]],
      txTotal: [ {value: '', disabled: true}, [Validators.required]],
    });
  }

  private buscarComprobantes() {
    this.comprobantesService.consultarComprobantes(new FiltrosComprobantes()).subscribe((comprobantes) => {
      this.listaComprobantes = comprobantes;
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
    this.usuariosService.consultarEmpleados(new FiltrosEmpleados()).subscribe((usuarios) => {
      this.listaUsuarios = usuarios;
    });
  }

  private buscarProductos() {
    this.isLoading = true;
    this.productosService.consultarProductos(new FiltrosProductos()).subscribe((productos) => {
      this.productos = productos;

      if (this.esConsulta && this.comprobante) {
        this.rellenarFormularioDataComprobante();
      }
      this.isLoading = false;
    });
  }

  public ObtenerPedidosPorProveedor() {
    const filtroPedidos = new FiltrosPedidos();
    filtroPedidos.proveedor = this.txProveedor.value;
    this.txCantidadProductos.reset();
    this.txTotal.reset();

    this.pedidosService.consultarPedidos(filtroPedidos).subscribe((pedidos) => {
      // Filtrar los pedidos que estén en estado 1 (Pendiente) o 3 (Recibido con diferencias)
      this.listaPedidosPorProveedor = pedidos.filter(pedido => pedido.idEstadoPedido === 1 || pedido.idEstadoPedido === 3);
    });
  }

  public seleccionarPedido(idPedido: number) {
    this.ordenSeleccionada = true;
    this.numeroOrdenSeleccionada = idPedido;
    this.productosSeleccionados = [];

    const pedido = this.listaPedidosPorProveedor.find(p => p.id === idPedido);

    if (pedido) {
      pedido.detallePedido.forEach((detalle: DetallePedido) => {
        if (detalle.idestadodetallepedido !== 2) {
          const producto = this.productos.find(p => p.id === detalle.idproducto);

          if (producto) {
            // Inicializa cantidad faltante con la cantidad total del pedido
            let cantidadFaltante = detalle.cantidad;

            // 1. Buscar todos los comprobantes asociados al pedido para el producto
            this.listaComprobantes?.forEach(comprobante => {
              comprobante.detalleComprobante.forEach(detalleComp => {
                if (detalleComp.idproducto === producto.id && comprobante.idPedido === idPedido) {
                  // 2. Resta acumulativa de la cantidad registrada en cada comprobante
                  cantidadFaltante -= detalleComp.cantidad;
                }
              });
            });

            // Si la cantidad faltante es mayor a 0, agregar el producto
            if (cantidadFaltante > 0) {
              const productoSeleccionado = {
                ...producto,
                cantidadSeleccionada: cantidadFaltante
              };
              this.productosSeleccionados.push(productoSeleccionado);
            }
          }
        }
      });

      // Actualiza el dataSource de la tabla con los productos seleccionados
      this.dataSourceProductos = new MatTableDataSource(this.productosSeleccionados);
      this.calcularCantidadProductos();
      this.calcularTotalProductos();
    }
  }

  private rellenarFormularioDataComprobante() {
    this.txProveedor.setValue(this.comprobante.idProveedor);
    this.txNumeroComprobante.setValue(this.comprobante.numeroComprobante);
    this.txTipoComprobante.setValue(this.comprobante.idTipoComprobante);
    this.txResponsable.setValue(this.comprobante.idResponsable);
    this.txReceptor.setValue(this.comprobante.idReceptor);
    this.txFechaEmision.setValue(this.formatDate(this.comprobante.fechaEmision));
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
    this.calcularTotalProductos();
    this.dataSourceProductos._updateChangeSubscription();

    if (this.formDesactivado) {
      this.form.disable();
    }
  }

  formatDate(fecha: Date): string {
    return new Date(fecha).toISOString().substring(0, 10);
  }

  public habilitarEdicion(){
    this.form.enable();
    this.txCantidadProductos.disable();
    this.txTotal.disable();
    this.tablaProductosDesactivada = true;
    this.txTipoComprobante.disable();
    this.txProveedor.disable();
    this.txBuscar.disable();
    this.data.formDesactivado = false;
    this.formDesactivado = false;
    this.data.editar = true;
  }

  public registrarNuevoComprobante() {

    if (this.productosSeleccionados.length === 0) {
      this.notificacionService.openSnackBarError('Debe seleccionar al menos un producto, intente nuevamente.');
      return;
    }

    if (this.form.valid && this.ordenSeleccionada && this.productosSeleccionados.length > 0) {
      const comprobante: Comprobante = new Comprobante();

      comprobante.numeroComprobante = this.txNumeroComprobante.value;
      comprobante.fechaEmision = this.txFechaEmision.value;
      comprobante.idProveedor = this.txProveedor.value;
      comprobante.observaciones = this.txObservaciones.value;
      comprobante.total = this.txTotal.value;
      comprobante.idResponsable = this.txResponsable.value;
      comprobante.idReceptor = this.txReceptor.value;
      comprobante.idTipoComprobante = this.txTipoComprobante.value;
      comprobante.idPedido = this.numeroOrdenSeleccionada!;

      // Por cada producto seleccionado, creamos un detalle de pedido.
      const detallesComprobante: DetalleComprobante[] = this.productosSeleccionados.map((producto) => {
        const detalle = new DetalleComprobante();
        detalle.cantidad = producto.cantidadSeleccionada;
        detalle.costoIndividual = producto.costo;
        detalle.subTotal = producto.cantidadSeleccionada * producto.costo;
        detalle.idcomprobante = comprobante.id;
        detalle.idproducto = producto.id;

        return detalle;
      });

      comprobante.detalleComprobante = detallesComprobante;

      this.notificationDialogService.confirmation(
        `¿Desea registrar el comprobante?
        ${comprobante.idTipoComprobante === 1 ? '¡El inventario será modificado!' : ''}
        Esta acción no es reversible.`,
        'Registrar Comprobante'
      )
        .afterClosed()
        .subscribe((value) => {
          if (value) {
            this.comprobantesService.registrarComprobante(comprobante).subscribe((res) => {
              if (res.mensaje == 'OK') {
                this.notificacionService.openSnackBarSuccess('Comprobante registrado con éxito');
                this.dialogRef.close();
                this.referencia.buscar();
              } else {
                this.notificacionService.openSnackBarError(res.mensaje ? res.mensaje : 'Error al registrar comprobante');
              }
            });
          }
        });
    }
  }

  public modificarComprobante() {
    if (this.form.valid) {
      const comprobante: Comprobante = new Comprobante();

      comprobante.id = this.data.comprobante?.id;
      comprobante.numeroComprobante = this.txNumeroComprobante.value;
      comprobante.fechaEmision = this.txFechaEmision.value;
      comprobante.idProveedor = this.txProveedor.value;
      comprobante.observaciones = this.txObservaciones.value;
      comprobante.total = this.txTotal.value;
      comprobante.idResponsable = this.txResponsable.value;
      comprobante.idReceptor = this.txReceptor.value;
      comprobante.idTipoComprobante = this.txTipoComprobante.value;
      comprobante.idPedido = this.numeroOrdenSeleccionada!;

      // Por cada producto seleccionado, creamos un detalle de pedido.
      const detallesComprobante: DetalleComprobante[] = this.productosSeleccionados.map((producto) => {
        const detalle = new DetalleComprobante();
        detalle.cantidad = producto.cantidadSeleccionada;
        detalle.costoIndividual = producto.costo;
        detalle.subTotal = producto.cantidadSeleccionada * producto.costo;
        detalle.idcomprobante = comprobante.id;
        detalle.idproducto = producto.id;

        return detalle;
      });

      comprobante.detalleComprobante = detallesComprobante;

      this.comprobantesService.modificarComprobante(comprobante).subscribe((res) => {
        if (res.mensaje == 'OK') {
          this.notificacionService.openSnackBarSuccess('Comprobante modificado con éxito');
          this.dialogRef.close();
          this.referencia.buscar();
        } else {
          this.notificacionService.openSnackBarError(res.mensaje ? res.mensaje : 'Error al modificar comprobante');
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
    this.calcularTotalProductos();
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
    this.calcularTotalProductos();
  }

  private calcularCantidadProductos() {
    this.cantidadProductos = 0;
    this.productosSeleccionados.forEach((producto) => {
      this.cantidadProductos += producto.cantidadSeleccionada;
    });
    this.txCantidadProductos.setValue(this.cantidadProductos);
  }

  private calcularTotalProductos() {
    this.subtotalProductos = 0;
    this.productosSeleccionados.forEach((producto) => {
      this.subtotalProductos += producto.cantidadSeleccionada * producto.costo;
    });
    this.txTotal.setValue(this.subtotalProductos);
  }

  private filtrosSuscripciones() {
    const filtro = { textoBusqueda: '' };

    // Filtrar por texto de búsqueda
    this.txBuscar.valueChanges.subscribe(valor => {
      filtro.textoBusqueda = valor.trim().toLowerCase();
      this.dataSourceProductos.filter = filtro.textoBusqueda;

      if (this.dataSourceProductos.paginator) {
        this.dataSourceProductos.paginator.firstPage();
      }
    });

    this.dataSourceProductos.filterPredicate = (producto: Producto, filter: string) => {
      return producto.nombre.toLowerCase().includes(filter);
    };

    // Sacar la selección y resaltado de la orden si el proveedor cambió
    this.txProveedor.valueChanges.subscribe(() => {
      this.ordenSeleccionada = false;
      this.numeroOrdenSeleccionada = null;
    });
  }

  public agruparPedidos(listaPedidos: Pedido[], cantidadPorFila: number): any[][] {
    const filas = [];
    for (let i = 0; i < listaPedidos.length; i += cantidadPorFila) {
      filas.push(listaPedidos.slice(i, i + cantidadPorFila));
    }
    return filas;
  }

  public registrarNuevoProducto() {
    const dialogRef: MatDialogRef<BuscarProductosComponent> = this.dialog.open(
      BuscarProductosComponent,
      {
        width: '70%',
        height: 'auto',
        maxHeight: '70vh',
        panelClass: 'dialog-container',
        autoFocus: false,
        data: {
          proveedorId: this.txProveedor.value
        }
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.agregarNuevosProductosComprobante(result);
      }
    });
  }

  private agregarNuevosProductosComprobante(listaNuevosProductos: Producto[]) {
    if (listaNuevosProductos.length !== 0 && listaNuevosProductos) {
      listaNuevosProductos.forEach((producto) => {
        const productoEnLista = this.productosSeleccionados.find(p => p.id === producto.id);

        if (productoEnLista) {
          productoEnLista.cantidadSeleccionada++;
        } else {
          const productoClonado = { ...producto, cantidadSeleccionada: 1 };
          this.productosSeleccionados.push(productoClonado);
        }
      });

      this.dataSourceProductos = new MatTableDataSource(this.productosSeleccionados);
      this.calcularCantidadProductos();
      this.calcularTotalProductos();
    }
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

  get txTotal(): FormControl {
    return this.form.get('txTotal') as FormControl;
  }

  get txNumeroComprobante(): FormControl {
    return this.form.get('txNumeroComprobante') as FormControl;
  }
}
