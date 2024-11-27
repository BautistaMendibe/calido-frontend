import {Component, OnInit} from '@angular/core';
import {VentasService} from "../../services/ventas.services";
import {Venta} from "../../models/venta.model";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  constructor() {
  }

}
