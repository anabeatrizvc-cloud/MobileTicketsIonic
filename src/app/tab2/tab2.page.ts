import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController, IonicModule } from '@ionic/angular';
import { TicketService } from '../services/ticket.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class Tab2Page implements OnDestroy {

  senhaAtual: string | null = null;
  tempoRestante = 0;

  intervalo: any = null;
  timeoutLimpar: any = null;

  atendimentoIniciado = false;
  audioLiberado = false;

  proximasSenhas: { senha: string; tempo: number }[] = [];

  constructor(
    public ticketService: TicketService,
    private alertController: AlertController
  ) {}

  ngOnDestroy(): void {
    clearInterval(this.intervalo);
    clearTimeout(this.timeoutLimpar);
  }

  atualizarFilaDeEspera(): void {
    this.proximasSenhas = this.ticketService.estimarTempoFila();
  }

  async liberarAudio() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.frequency.value = 800;
      gain.gain.value = 0.05;

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);

      this.audioLiberado = true;
    } catch {
      this.audioLiberado = false;
    }
  }

  tocarSom() {
    if (!this.audioLiberado) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.frequency.value = 900;
      gain.gain.value = 0.06;

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch {}
  }

  iniciarAtendimentoAutomatico() {
    if (this.atendimentoIniciado) return;

    this.atendimentoIniciado = true;
    this.atualizarFilaDeEspera();
    this.proximoAtendimento();
  }

  pararAtendimento() {
    this.atendimentoIniciado = false;

    clearInterval(this.intervalo);
    clearTimeout(this.timeoutLimpar);

    this.senhaAtual = null;
    this.tempoRestante = 0;

    this.atualizarFilaDeEspera();
  }

  async proximoAtendimento() {
    clearInterval(this.intervalo);
    clearTimeout(this.timeoutLimpar);

    if (!this.atendimentoIniciado) return;

    const senha = this.ticketService.chamarProximaSenha();

    this.atualizarFilaDeEspera();

    if (!senha) {
      this.senhaAtual = null;
      this.tempoRestante = 0;
      return;
    }

    this.senhaAtual = senha;

    const tipo = senha.substring(7, 9);
    this.tempoRestante = this.calcularTempo(tipo);

    this.tocarSom();
    await this.mostrarAlertaSenha(senha);

    this.timeoutLimpar = setTimeout(() => {
      this.senhaAtual = null;
    }, 6000);

    this.intervalo = setInterval(() => {
      this.tempoRestante--;

      if (this.tempoRestante <= 0) {
        clearInterval(this.intervalo);
        this.proximoAtendimento();
      }
    }, 1000);
  }

  calcularTempo(tipo: string): number {
    if (tipo === 'SP') return 25 + this.random(-5, 5);
    if (tipo === 'SG') return 15 + this.random(-3, 3);
    if (tipo === 'SE') return Math.random() < 0.95 ? 10 : 18;

    return 10;
  }

  random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async mostrarAlertaSenha(senha: string) {
    const alert = await this.alertController.create({
      header: 'Senha chamada',
      message: `<strong>${senha}</strong>`,
      buttons: ['OK']
    });

    await alert.present();

    setTimeout(() => {
      alert.dismiss();
    }, 6000);
  }

  async excluirSenha(senha: string) {
    const alert = await this.alertController.create({
      header: 'Excluir senha',
      message: `Remover ${senha}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.ticketService.removerSenhaDaFila(senha);
            this.atualizarFilaDeEspera();
          }
        }
      ]
    });

    await alert.present();
  }
}