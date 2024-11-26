import {Component, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {SnackBarService} from "../../../services/snack-bar.service";
import {CajasService} from "../../../services/cajas.service";
import {VentasService} from "../../../services/ventas.services";
import {MatTableDataSource} from "@angular/material/table";
import {Venta} from "../../../models/venta.model";
import {Arqueo} from "../../../models/Arqueo.model";
import {FiltrosArqueos} from "../../../models/comandos/FiltrosArqueos.comando";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {FormaDePago} from "../../../models/formaDePago.model";
import {MovimientoManual} from "../../../models/movimientoManual.model";

@Component({
  selector: 'app-detalle-arqueo',
  templateUrl: './detalle-arqueo.component.html',
  styleUrl: './detalle-arqueo.component.scss'
})
export class DetalleArqueoComponent implements OnInit {
  public form: FormGroup;
  public idArqueo: string | null = null;
  public arqueo: Arqueo = new Arqueo();
  public formasPago: FormaDePago[] = [];
  public filtradoPorFormasPago: FormaDePago[] = [];
  public ventas: Venta[] = [];
  public isLoading: boolean = false;
  public movimientosManuales: MovimientoManual[] = [];
  public totalCaja: number = 0;
  public totalOtrosMedios: number = 0;
  public diferenciaCaja: number = 0;
  public diferenciaOtrosMedios: number = 0;
  public formaPagoDefecto!: number;

  public tableDataSource: MatTableDataSource<Venta> = new MatTableDataSource<Venta>([]);
  public columnas: string[] = ['fecha', 'formaPago', 'descripcion', 'tipoMovimiento', 'montoTotal'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private notificacionService: SnackBarService,
    private dialog: MatDialog,
    private cajasService: CajasService,
    private ventasService: VentasService,
    private route: ActivatedRoute,
  ) {
    this.form = new FormGroup({});
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.idArqueo = params.get('id');
      this.crearFormulario();
      this.buscarFormasPago();
      this.buscarArqueo();
    });
  }

  private crearFormulario() {
    this.form = this.fb.group({
      txTipoMovimiento: ['', []],
      txDescripcion: ['', []],
      txMonto: ['', []],
      txFormaPago: ['', []],
      txCantidadDineroCaja: ['', [Validators.required]],
      txCantidadDineroOtrosMedios: ['', [Validators.required]],
    });
  }

  public buscarFormasPago() {
    this.ventasService.buscarFormasDePago().subscribe((formasPago) => {
      // Asignar las formas de pago recibidas del servicio
      this.formasPago = formasPago.map((forma) => {
        // Agregar el ícono representativo según el ID
        switch (forma.id) {
          case 1: // Efectivo
            forma.icon = 'payments';
            break;
          case 2: // Tarjeta de débito
            forma.icon = 'credit_card';
            break;
          case 3: // Tarjeta de crédito
            forma.icon = 'credit_score';
            break;
          case 4: // Mercado Pago
            forma.icon = 'account_balance_wallet';
            break;
          case 5: // Transferencia
            forma.icon = 'account_balance';
            break;
          case 6: // Cuenta Corriente
            forma.icon = 'receipt';
            break;
          case 7: // QR
            forma.icon = 'qr_code';
            break;
          default:
            forma.icon = 'help';
            break;
        }
        return forma;
      });

      const todas = new FormaDePago();
      todas.id = 0;
      todas.nombre = 'Todas';

      this.filtradoPorFormasPago = [todas, ...this.formasPago]
      this.formaPagoDefecto = todas.id;
    });
  }

  public buscarArqueo() {
    const filtroArqueo: FiltrosArqueos = new FiltrosArqueos();
    filtroArqueo.idArqueo = Number(this.idArqueo);
    this.cajasService.consultarArqueos(filtroArqueo).subscribe((arqueos: Arqueo[]) => {
      if (arqueos.length > 0) {
        this.arqueo = arqueos[0];
        this.buscarVentas();
      }
    });
  }

  public filtrarTabla(idFormaPago: number): void {
    if (idFormaPago === 0) {
      // Si se selecciona "Todas", muestra todos los datos
      this.tableDataSource.filter = '';
    } else {
      // Filtra por la forma de pago seleccionada
      this.tableDataSource.filterPredicate = (data: any) => data.formaDePago.id === idFormaPago;
      this.tableDataSource.filter = idFormaPago.toString();
    }
  }

  public buscarVentas() {
    if (this.arqueo) {
      this.isLoading = true;
      const arqueo = this.arqueo;
      const fechaHora = new Date(arqueo.fechaApertura);

      // Genera un DATE a partir de la fecha y hora de apertura del arqueo
      const [hours, minutes, seconds] = (arqueo.horaApertura as unknown as string).split(':').map(Number);
      fechaHora.setHours(hours, minutes, seconds || 0);

      // Convierte a un string 'es-AR' la fecha y hora del arqueo
      const fechaHoraLocal = fechaHora.toLocaleString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' }).replace('T', ' ');

      this.ventasService.buscarVentasFechaHora(fechaHoraLocal).subscribe((ventas: Venta[]) => {
        this.ventas = ventas;
        this.determinarAnulacion();
        this.tableDataSource.data = this.ventas;
        this.tableDataSource.paginator = this.paginator;
        this.tableDataSource.sort = this.sort;
        this.isLoading = false;
        this.calcularFormasPago();
      });
    }
  }

  private determinarAnulacion() {
    this.ventas.forEach(venta => {
      if (venta.anulada) {
        venta.montoTotal = -Math.abs(venta.montoTotal);
      }
    });
  }

  public toggleDetalle(forma: any): void {
    forma.detalleVisible = !forma.detalleVisible;
  }

  public calcularFormasPago(): void {
    this.formasPago.forEach((forma) => {
      // Calcula los ingresos
      const ingresosVentas = this.ventas
        .filter((v: Venta) => v.formaDePago.nombre === forma.nombre && v.fechaAnulacion === null)
        .reduce((sum: number, venta: Venta) => sum + venta.montoTotal, 0);

      const ingresosMovimientos = this.movimientosManuales
        .filter((m: MovimientoManual) => m.formaPago.nombre === forma.nombre && m.tipoMovimiento === 'ingreso')
        .reduce((sum: number, mov: MovimientoManual) => sum + mov.monto, 0);

      forma.totalIngresos = ingresosVentas + ingresosMovimientos;
      forma.detallesIngresos = [
        { concepto: 'Ventas facturadas', monto: ingresosVentas },
        { concepto: 'Movimientos manuales', monto: ingresosMovimientos },
      ];

      // Calcula los egresos
      const egresosVentas = this.ventas
        .filter((v: Venta) => v.formaDePago.nombre === forma.nombre && v.fechaAnulacion !== null)
        .reduce((sum: number, venta: Venta) => sum + (venta.montoTotal * -1), 0);

      const egresosMovimientos = this.movimientosManuales
        .filter((m: MovimientoManual) => m.formaPago.nombre === forma.nombre && m.tipoMovimiento === 'egreso')
        .reduce((sum: number, mov: MovimientoManual) => sum + (mov.monto * -1), 0);

      forma.totalEgresos = egresosVentas + egresosMovimientos;
      forma.detallesEgresos = [
        { concepto: 'Ventas anuladas', monto: egresosVentas },
        { concepto: 'Movimientos manuales', monto: egresosMovimientos },
      ];
    });
  }

  public registrarMovimiento() {

  }

  get txTipoMovimiento(): FormControl {
    return this.form.get('txTipoMovimiento') as FormControl;
  }

  get txDescripcion(): FormControl {
    return this.form.get('txDescripcion') as FormControl;
  }

  get txMonto(): FormControl {
    return this.form.get('txMonto') as FormControl;
  }

  get txFormaPago(): FormControl {
    return this.form.get('txFormaPago') as FormControl;
  }

  get txCantidadDineroCaja(): FormControl {
    return this.form.get('txCantidadDineroCaja') as FormControl;
  }

  get txCantidadDineroOtrosMedios(): FormControl {
    return this.form.get('txCantidadDineroOtrosMedios') as FormControl;
  }
}
