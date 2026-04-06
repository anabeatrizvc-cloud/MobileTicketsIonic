import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TicketService } from '../services/ticket.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class Tab1Page {

  senhasGeradas: string[] = [];

  constructor(public ticketService: TicketService) {}

  emitir(tipo: string) {
    const senha = this.ticketService.emitirSenha(tipo);
    this.senhasGeradas.unshift(senha); 
  }
}

