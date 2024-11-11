import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-visualizaciones',
  templateUrl: './visualizaciones.component.html',
  styleUrl: './visualizaciones.component.scss'
})
export class VisualizacionesComponent {

  constructor(private router: Router) {}

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
  

}
