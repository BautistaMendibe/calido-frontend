import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {VentasService} from "../../../services/ventas.services";
import {UsuariosService} from "../../../services/usuarios.service";
import {FiltrosEmpleados} from "../../../models/comandos/FiltrosEmpleados.comando";
import {Subject} from "rxjs";
import {ProductosService} from "../../../services/productos.service";
import {ThemeCalidoService} from "../../../services/theme.service";

@Component({
  selector: 'app-visualizaciones-ventas',
  templateUrl: './visualizaciones-ventas.component.html',
  styleUrls: ['./visualizaciones-ventas.component.scss'],
})
export class VisualizacionesVentasComponent implements OnInit {
  filtersForm: FormGroup;
  public darkMode: boolean = false;
  public maxDate: Date;
  private dataLoaded$ = new Subject<boolean>();

  paymentMethods: string[] = [];
  categories: string[] = [];
  employees: string[] = [];
  grafanaUrls: {
    formaPago: SafeResourceUrl;
    fechaHora: SafeResourceUrl;
    categoria: SafeResourceUrl;
    empleados: SafeResourceUrl;
    clientes: SafeResourceUrl;
  } = {
    formaPago: '',
    fechaHora: '',
    categoria: '',
    empleados: '',
    clientes: '' ,
  };

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private ventasService: VentasService,
    private usuariosService: UsuariosService,
    private productosService: ProductosService,
    private themeService: ThemeCalidoService) {
    this.filtersForm = this.fb.group({
      start_date: [null],
      end_date: [null],
      payment_method: [''],
      var_category: [''],
      employee_name: [''],
    });
    this.maxDate = new Date();
  }

  ngOnInit(): void {
    this.obtenerInformacionTema();
    this.buscarDatosCombo();
  }

  obtenerInformacionTema() {
    this.darkMode = this.themeService.isDarkMode();
  }

  private buscarDatosCombo() {
    // Crear un contador para llevar la cuenta de las suscripciones completadas
    let completedSubscriptions = 0;
    const totalSubscriptions = 3;

    this.usuariosService.consultarEmpleados(new FiltrosEmpleados()).subscribe((empleados) => {
      this.employees = empleados.map((empleado) => empleado.nombre + ' ' + empleado.apellido);
      completedSubscriptions++;
      if (completedSubscriptions === totalSubscriptions) {
        this.dataLoaded$.next(true);
      }
    });

    this.ventasService.buscarFormasDePago().subscribe((formasPago) => {
      this.paymentMethods = formasPago.map((formaPago) => formaPago.nombre);
      completedSubscriptions++;
      if (completedSubscriptions === totalSubscriptions) {
        this.dataLoaded$.next(true);
      }
    });

    this.productosService.buscarTiposProductos().subscribe((categorias) => {
      this.categories = categorias.map((categoria) => categoria.nombre);
      completedSubscriptions++;
      if (completedSubscriptions === totalSubscriptions) {
        this.dataLoaded$.next(true);
      }
    });

    // Suscribirse al Subject para ejecutar updateGrafanaUrls() cuando todas las suscripciones se completen
    this.dataLoaded$.subscribe(() => {
      this.updateGrafanaUrls();
      this.filtersForm.valueChanges.subscribe(() => this.updateGrafanaUrls());
    });
  }

  private formatToUnix(date: Date | null, isEndDate: boolean = false): number {
    if (!date) return 0;
    const adjustedDate = new Date(date);
    if (isEndDate) {
      adjustedDate.setHours(23, 59, 59, 999); // Establece la hora a 23:59:59.999
    }
    return adjustedDate.getTime();
  }

  private formatToString(date: Date | null): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  updateGrafanaUrls(): void {
    const { start_date, end_date, payment_method, var_category, employee_name } = this.filtersForm.value;

    const startDateUnix = this.formatToUnix(start_date) || 1728259200000;
    const endDateUnix = this.formatToUnix(end_date, true) || 1733356800000;

    const formattedStartDate = this.formatToString(start_date) || '2024-01-01';
    const formattedEndDate = this.formatToString(end_date) || '2026-01-01';

    const baseGrafanaUrl = 'https://grafanae-production.up.railway.app/d-solo/cec3ghf2dxrswc/new-dashboard?';

    const theme: string = this.darkMode ? 'dark' : 'light';

    let employeeFilter = '';
    if (employee_name === 'Todos') {
      employeeFilter = this.employees.map((name) => encodeURIComponent(name)).join(',');
    } else if (employee_name) {
      employeeFilter = encodeURIComponent(employee_name);
    }

    const safeUrl = (url: string) => this.sanitizer.bypassSecurityTrustResourceUrl(url);

    this.grafanaUrls.formaPago = safeUrl(
      `${baseGrafanaUrl}?&from=${startDateUnix}&to=${endDateUnix}&timezone=browser&var-start_date=${formattedStartDate}&var-end_date=${formattedEndDate}&var-payment_method=${payment_method}&var-var_category=${var_category}&var-Empleado=${employeeFilter}&orgId=1&panelId=2&theme=${theme}`
    );

    this.grafanaUrls.fechaHora = safeUrl(
      `${baseGrafanaUrl}?&from=${startDateUnix}&to=${endDateUnix}&timezone=browser&var-start_date=${formattedStartDate}&var-end_date=${formattedEndDate}&var-Empleado=${employeeFilter}&var-payment_method=${payment_method}&var-var_category=${var_category}&orgId=1&panelId=4&theme=${theme}`
    );

    this.grafanaUrls.categoria = safeUrl(
      `${baseGrafanaUrl}?&from=${startDateUnix}&to=${endDateUnix}&timezone=browser&var-start_date=${formattedStartDate}&var-end_date=${formattedEndDate}&var-payment_method=${payment_method}&var-var_category=${var_category}&var-Empleado=${employeeFilter}&orgId=1&panelId=3&theme=${theme}`
    );

    this.grafanaUrls.empleados = safeUrl(
      `${baseGrafanaUrl}?&from=${startDateUnix}&to=${endDateUnix}&timezone=browser&var-start_date=${formattedStartDate}&var-end_date=${formattedEndDate}&var-Empleado=${employeeFilter}&var-var_category=${var_category}&var-payment_method=${payment_method}&orgId=1&panelId=1&theme=${theme}`
    );

    this.grafanaUrls.clientes = safeUrl(
      `${baseGrafanaUrl}?&from=${startDateUnix}&to=${endDateUnix}&timezone=browser&var-start_date=${formattedStartDate}&var-end_date=${formattedEndDate}&var-Empleado=${employeeFilter}&var-var_category=${var_category}&var-payment_method=${payment_method}&orgId=1&panelId=5&theme=${theme}`
    );
  }

  limpiarFiltros() {
    this.filtersForm.reset(); // Resetea el formulario
    this.filtersForm.patchValue({
      start_date: null, // O un valor predeterminado
      end_date: null, // O un valor predeterminado
      payment_method: '', // "Todos" o vacío
      var_category: '', // "Todas" o vacío
      employee_name: '', // "Todos" o vacío
    });
  }

  get txFechaDesde(): FormControl {
    return this.filtersForm.get('start_date') as FormControl;
  }
}
