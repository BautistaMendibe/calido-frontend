export class Menu {
  id: number | undefined;
  nombre: string | undefined;
  path: string | undefined;
  icon: string | undefined;
  subMenu: Menu[] | undefined;
  requiresRoles?: string[];
  activo: boolean | undefined;

  constructor(id?: number,
              nombre?: string,
              path?: string,
              icon?: string,
              subMenu?: Menu[],
              activo?: boolean,
              requiresRoles?: string[]) {
    this.id = id;
    this.nombre = nombre;
    this.path = path;
    this.icon = icon;
    this.subMenu = subMenu;
    this.activo = activo;
    this.requiresRoles = requiresRoles;
  }
}
