import { Component, Input } from '@angular/core';
import {MatDialogClose} from "@angular/material/dialog";


@Component({
  selector: 'caja-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent {

  @Input()
  public messageType: number = 0;
  @Input()
  public title: string = '';
  @Input()
  public message: string = '';

  constructor() { }

}

