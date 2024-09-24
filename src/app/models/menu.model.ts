export class Menu {
  id: number | undefined;
  nombre: string | undefined;
  path: string | undefined;
  icon: string | undefined;
  subMenu: Menu[] | undefined;
  requiresAdmin?: boolean;
  activo: boolean | undefined;

  constructor(id?: number,
              nombre?: string,
              path?: string,
              icon?: string,
              subMenu?: Menu[],
              activo?: boolean,
              requiresAdmin?: boolean) {
    this.id = id;
    this.nombre = nombre;
    this.path = path;
    this.icon = icon;
    this.subMenu = subMenu;
    this.activo = activo;
    this.requiresAdmin = requiresAdmin;
  }
}
