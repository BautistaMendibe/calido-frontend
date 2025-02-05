import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {Menu} from "../../models/menu.model";
import {
  animateSubText,
  animateText,
  animateTextTraslate,
  onSideNavChange
} from '../../shared/animations';
import {NavigationEnd, Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {filter} from "rxjs";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  animations: [onSideNavChange, animateText, animateTextTraslate, animateSubText]
})
export class SidebarComponent implements OnInit {

  @Output() toggleSideBarForMe: EventEmitter<boolean> = new EventEmitter();
  @Input() darkMode: boolean = false;
  menuItems: Menu[] = [
    {id: 1, nombre: 'Inicio', path:'', icon: 'home', activo: false, subMenu: []},
    {id: 2, nombre: 'Ventas', path:'registrar-venta', icon: 'sell', activo: false, subMenu: [
        {id: 1, nombre: 'Registrar venta', path:'registrar-venta', icon: '', activo: false, subMenu: []},
        {id: 2, nombre: 'Consultar ventas', path:'consultar-ventas', icon: '', activo: false, subMenu: []}
      ]},
    {id: 3, nombre: 'Órdenes de Compra', path:'consultar-pedidos', icon: 'receipt', activo: false, subMenu: []},
    {id: 4, nombre: 'Inventario', path:'consultar-comprobante', icon: 'add_box', activo: false, subMenu: [
        {id: 1, nombre: 'Consultar comprobantes', path:'consultar-comprobante', icon: '', activo: false, subMenu: []},
        {id: 2, nombre: 'Consultar inventario', path:'consultar-inventario', icon: '', activo: false, subMenu: []}
      ]},
    {id: 5, nombre: 'Caja', path:'consultar-arqueo-caja', icon: 'store', activo: false, subMenu: [
        {id: 1, nombre: 'Consultar Arqueos de Caja', path:'consultar-arqueo-caja', icon: '', activo: false, subMenu: []},
        {id: 2, nombre: 'Consultar cajas', path:'consultar-cajas', icon: '', activo: false, subMenu: []}
      ]},
    {id: 6, nombre: 'Productos', path:'consultar-productos', icon: 'shopping_cart', activo: false, subMenu: []},
    {id: 7, nombre: 'Proveedores', path:'consultar-proveedores', icon: 'local_shipping', activo: false, subMenu: []},
    {id: 8, nombre: 'Análisis de datos', path:'generar-reportes', icon: 'data_usage', activo: false, subMenu: [
      {id: 1, nombre: 'reportes', path:'generar-reportes', icon: '', activo: false, subMenu: []},
      {id: 2, nombre: 'estadísticas', path:'visualizaciones-ventas', icon: '', activo: false, subMenu: []}
    ]},
    {id: 9, nombre: 'Empleados', path:'consultar-empleados', icon: 'supervisor_account', activo: false, subMenu: [
        {id: 1, nombre: 'Consultar empleados', path:'consultar-empleados', icon: '', activo: false, subMenu: []},
        {id: 2, nombre: 'Control de empleado', path:'control-empleados', icon: '', activo: false, subMenu: []}
      ]},
    {id: 10, nombre: 'Clientes', path:'consultar-clientes', icon: 'person_add', activo: false, subMenu: [
        {id: 1, nombre: 'Consultar clientes', path:'consultar-clientes', icon: '', activo: false, subMenu: []},
      ]},
    {id: 11, nombre: 'Promociones', path:'consultar-promociones', icon: 'card_giftcard', activo: false, subMenu: [
        {id: 1, nombre: 'Consultar promociones', path:'consultar-promociones', icon: '', activo: false, subMenu: []},
        {id: 2, nombre: 'Notificar promocion', path:'notificar-promocion', icon: '', activo: false, subMenu: []}
      ]},
    {id: 12, nombre: 'Cuentas Corrientes', path:'consultar-cuentas-corrientes', icon: 'account_balance', activo: false, subMenu: []},
    {id: 13, nombre: 'Tarjetas', path:'consultar-tarjetas', icon: 'credit_card', activo: false, subMenu: []},
    {id: 14, nombre: 'Panel de Empleado', path:'panel-empleado', icon: 'event_available', activo: false, subMenu: []},
    {id: 15, nombre: 'Configuración', path:'consultar-configuraciones', icon: 'settings', activo: false, subMenu: []}
  ];
  isExpanded = true;
  isShowing = false;
  showFiller = false;
  public sideNavState = false;
  public linkText = false;
  private lastSelectedItem: Menu | null = null;
  public sizeScreen: number = 0;
  private touchStartX: number = 0;
  private touchMoveX: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.setActiveItemBasedOnUrl();
    this.sizeScreen = window.innerWidth;
    this.mapearRoles();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.setActiveItemBasedOnUrl();
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.calcularSizeScreen();
  }

  private calcularSizeScreen() {
    this.sizeScreen = window.innerWidth;

    if (this.sizeScreen <= 700) {
      this.onSinenavToggle();
    }
  }

  /**
   * Mapea los roles de los usuarios a los menús y submenús desde las rutas.
   * Si una ruta tiene roles definidos, se asignan al menú correspondiente
   * para que se muestre o no según los permisos del usuario.
   */
  private mapearRoles() {
    const routeConfig = this.router.config;

    // Mapear roles desde las rutas hacia el menú
    this.menuItems.forEach((menuItem) => {
      // Buscar la ruta que coincide con el path del menú
      const matchingRoute = routeConfig.find((route) => route.path === menuItem.path);

      // Si la ruta tiene roles definidos, asignarlos al menú
      if (matchingRoute && matchingRoute.data?.['roles']) {
        menuItem.requiresRoles = matchingRoute.data['roles'];
      }

      // Hacer lo mismo para los submenús
      if (menuItem.subMenu) {
        menuItem.subMenu.forEach((subItem) => {
          const matchingSubRoute = routeConfig.find((route) => route.path === subItem.path);
          if (matchingSubRoute && matchingSubRoute.data?.['roles']) {
            subItem.requiresRoles = matchingSubRoute.data['roles'];
          }
        });
      }
    });
  }

  puedeMostrar(item: Menu): boolean {
    // Si no se especifican roles, el menú está accesible para todos
    if (!item.requiresRoles || item.requiresRoles.length === 0) {
      return true;
    }

    // Verificar si el usuario tiene al menos uno de los roles necesarios
    return this.tieneRol(item.requiresRoles);
  }

  /**
   * Verifica si el usuario tiene alguno de los roles pasados por parámetro.
   * Compara si el rol del usuario está incluido en la lista.
   * @param nombresRol lista con roles. Ejemplo: ['Administrador', 'Vendedor']
   */
  tieneRol(nombresRol: string[]): boolean {
    const token = this.authService.getToken();
    const infoToken: any = this.authService.getDecodedAccessToken(token);

    if (!infoToken || !infoToken.roles) {
      return false;
    }

    return nombresRol.some(nombreRol => infoToken.roles.includes(nombreRol));
  }

  setActiveItemBasedOnUrl(): void {
    const currentUrl = this.router.url;

    this.menuItems.forEach(item => {
      item.activo = (item.path && currentUrl.includes(item.path)) || (currentUrl === "/" && item.nombre === 'Inicio');

      // Activa submenús si la URL coincide con su path
      if (item.subMenu) {
        item.subMenu.forEach(subItem => {
          if (subItem.path && currentUrl.includes(subItem.path)) {
            subItem.activo = true;
            item.activo = true;
          }
        });
      }
    });
  }

  onSinenavToggle() {
    this.sideNavState = !this.sideNavState;

    if (!this.sideNavState) {
      this.colapsarSubmenus();
    }

    setTimeout(() => {
      this.linkText = this.sideNavState;
    }, 500);
  }

  onSinenavToggleMouse() {
    if (this.sizeScreen >= 700) {
      this.sideNavState = !this.sideNavState;

      if (!this.sideNavState) {
        this.colapsarSubmenus();
      }

      setTimeout(() => {
        this.linkText = this.sideNavState;
      }, 300);
    }
  }

  navigate(item: Menu) {
    this.router.navigate([item.path]);
  }

  activarItem(item: Menu) {
    // Si el ítem tiene submenús y es el mismo que el último seleccionado, alterna su estado
    if (item.subMenu?.length) {
      item.activo = this.lastSelectedItem === item ? !item.activo : true;
      this.menuItems.forEach(x => x !== item && (x.activo = false));
      this.lastSelectedItem = item.activo ? item : null;
    } else {
      // Si no tiene submenús, actívalo y resetea el último seleccionado
      this.menuItems.forEach(x => x.activo = false);
      item.activo = true;
      this.lastSelectedItem = null;
    }
  }

  capitalize(word?: string): string {
    // @ts-ignore
    return word?.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  activarSubItem(subItem: Menu) {
    this.menuItems.map((x) => {
      if (x.subMenu) {
        x.subMenu.map(s => {
            if (s.activo && subItem.id !== s.id) {
                s.activo = false;
            }
        });
      }
    });
    subItem.activo = !subItem.activo;
  }

  colapsarSubmenus() {
    this.menuItems.forEach(item => {
      if (!item.activo) {
        item.activo = false;
      }

      // Cerrar todos los submenús
      if (item.subMenu) {
        item.subMenu.forEach(subItem => {
          subItem.activo = false; // Cerrar todos los subítems
        });
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = (event.target as HTMLElement).closest('.sidenavContainer');
    if (!clickedInside && this.sideNavState) {
      this.onSinenavToggle(); // Cierra el sidebar si está abierto
    }
  }

  @HostListener('document:touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX; // Captura la posición inicial del toque
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    this.touchMoveX = event.touches[0].clientX; // Captura la posición actual mientras se mueve
  }

  @HostListener('document:touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    // Calcula la dirección del desplazamiento
    const deltaX = this.touchMoveX - this.touchStartX;

    if (deltaX > 50 && !this.sideNavState) {
      // Swipe hacia la derecha: abre el sidebar si está cerrado
      this.onSinenavToggle();
    } else if (deltaX < -50 && this.sideNavState) {
      // Swipe hacia la izquierda: cierra el sidebar si está abierto
      this.onSinenavToggle();
    }

    // Resetea las posiciones de toque
    this.touchStartX = 0;
    this.touchMoveX = 0;
  }
}
