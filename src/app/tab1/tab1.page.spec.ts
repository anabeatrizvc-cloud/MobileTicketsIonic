import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TicketService } from '../services/ticket.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class Tab1Page {

  senhaGerada: string = '';

  constructor(public ticketService: TicketService) {}

  emitir(tipo: string) {
    this.senhaGerada = this.ticketService.emitirSenha(tipo);
  }
}
