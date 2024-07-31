import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MessagesComponent } from '../shared/messages/messages.component';
import { TypeMessage } from '../shared/messages/type-messages.util';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private modalService: MatDialog) {}

  public messageOpen(message: string, title: string, messageType: number): MatDialogRef<any> {
    const modalRef = this.modalService.open(MessagesComponent, { height: 'auto', width: 'auto', autoFocus: false, maxWidth: '75vh', restoreFocus: false });
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.messageType = messageType;
    return modalRef;
  }

  public confirmation(message: string, title: string): MatDialogRef<any> {
    return this.messageOpen(message, title, TypeMessage.CONFIRMATION);
  }

  public error(message: string): MatDialogRef<any> {
    return this.messageOpen(message, '', TypeMessage.ERROR);
  }

  public delete(message: string, title: string): MatDialogRef<any> {
    return this.messageOpen(message, title, TypeMessage.DELETE);
  }

  public info(message: string, title: string): MatDialogRef<any> {
    return this.messageOpen(message, title, TypeMessage.INFORMATIVE);
  }

  public correct(message: string): MatDialogRef<any> {
    return this.messageOpen(message, '', TypeMessage.CORRECT);
  }

  public warning(message: string, title: string): MatDialogRef<any> {
    return this.messageOpen(message, title, TypeMessage.WARNING);
  }

  public warningWithHtml(message: string, title: string): MatDialogRef<any> {
    return this.messageOpen(message, title, TypeMessage.WARNING_WITH_HTML);
  }

  public warningError(message: string, title: string): MatDialogRef<any> {
    return this.messageOpen(message, title, TypeMessage.WARNING_ERROR);
  }
}
