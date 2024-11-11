import {Component, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
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
  public ventas: Venta[] = [];
  public isLoading: boolean = false;
  public totalPorFormaPago: [string, number][] = [];

  public tableDataSource: MatTableDataSource<Venta> = new MatTableDataSource<Venta>([]);
  public columnas: string[] = ['fecha', 'formaPago', 'descripcion', 'tipoMovimiento', 'montoTotal'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  tipoMovimiento: string = '';
  detalleEfectivo: boolean = false;
  detalleTarjeta: boolean = false;
  detalleMercadoPago: boolean = false;
  detalleEgreso: boolean = false;

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
    });
  }

  public buscarFormasPago() {
    this.ventasService.buscarFormasDePago().subscribe((formasPago) => {
      this.formasPago = formasPago;
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

  public buscarVentas() {
    if (this.arqueo) {
      this.isLoading = true;
      const arqueo = this.arqueo;
      const fechaHora = new Date(arqueo.fechaApertura);

      // Genera un DATE a partir de la fecha y hora de apertura del arqueo
      const [hours, minutes, seconds] = (arqueo.horaApertura as unknown as string).split(':').map(Number);
      fechaHora.setHours(hours, minutes, seconds || 0);

      this.ventasService.buscarVentasFechaHora(fechaHora.toISOString()).subscribe((ventas: Venta[]) => {
        this.ventas = ventas;
        this.determinarAnulacion();
        this.tableDataSource.data = this.ventas;
        this.tableDataSource.paginator = this.paginator;
        this.tableDataSource.sort = this.sort;
        this.isLoading = false;
        this.calcularTotalesPorFormaPago();
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

  toggleDetalle(tipo: string): void {
    switch (tipo) {
      case 'efectivo':
        this.detalleEfectivo = !this.detalleEfectivo;
        break;
      case 'tarjeta':
        this.detalleTarjeta = !this.detalleTarjeta;
        break;
      case 'mercadopago':
        this.detalleMercadoPago = !this.detalleMercadoPago;
        break;
      case 'egreso':
        this.detalleEgreso = !this.detalleEgreso;
        break;
    }
  }

  public calcularTotalesPorFormaPago() {
    const totales: { [key: string]: number } = {};

    for (let venta of this.ventas) {
      const formaPago = venta.formaDePago.nombre;
      const monto = parseFloat(String(venta.montoTotal));

      if (totales[formaPago]) {
        totales[formaPago] += monto;
      } else {
        totales[formaPago] = monto;
      }
    }

    this.totalPorFormaPago = this.formasPago
      .filter(forma => totales[forma.nombre] !== undefined)
      .map(forma => [forma.nombre, totales[forma.nombre]] as [string, number]);

    console.log(this.totalPorFormaPago);
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
}
