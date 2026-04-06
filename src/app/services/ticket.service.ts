import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  filaSP: string[] = [];
  filaSG: string[] = [];
  filaSE: string[] = [];

  ultimasChamadas: string[] = [];
  ultimaSenhaTipo: string = '';

  contadorSP = 1;
  contadorSG = 1;
  contadorSE = 1;

  gerarSenha(tipo: string): string {
    const hoje = new Date();

    const YY = hoje.getFullYear().toString().slice(-2);
    const MM = String(hoje.getMonth() + 1).padStart(2, '0');
    const DD = String(hoje.getDate()).padStart(2, '0');

    let sequencia = 0;

    if (tipo === 'SP') {
      sequencia = this.contadorSP++;
    } else if (tipo === 'SG') {
      sequencia = this.contadorSG++;
    } else {
      sequencia = this.contadorSE++;
    }

    const SQ = String(sequencia).padStart(3, '0');

    return `${YY}${MM}${DD}-${tipo}${SQ}`;
  }

  emitirSenha(tipo: string): string {
    const senha = this.gerarSenha(tipo);

    if (tipo === 'SP') this.filaSP.push(senha);
    if (tipo === 'SG') this.filaSG.push(senha);
    if (tipo === 'SE') this.filaSE.push(senha);

    return senha;
  }

  chamarProximaSenha(): string | null {
    let senha: string | undefined;

    if (this.ultimaSenhaTipo === 'SP') {
      senha = this.filaSE.shift() || this.filaSG.shift();
    } else {
      senha = this.filaSP.shift() || this.filaSE.shift() || this.filaSG.shift();
    }

    if (!senha) return null;

    this.ultimaSenhaTipo = senha.substring(7, 9);
    this.adicionarPainel(senha);

    return senha;
  }

  adicionarPainel(senha: string): void {
    this.ultimasChamadas.unshift(senha);

    if (this.ultimasChamadas.length > 5) {
      this.ultimasChamadas.pop();
    }
  }

  getFilas() {
    return {
      sp: [...this.filaSP],
      sg: [...this.filaSG],
      se: [...this.filaSE]
    };
  }

  getTempoBase(tipo: string): number {
    if (tipo === 'SP') return 25;
    if (tipo === 'SG') return 15;
    if (tipo === 'SE') return 10;
    return 10;
  }

  estimarTempoFila(): { senha: string; tempo: number }[] {
    const copiaSP = [...this.filaSP];
    const copiaSG = [...this.filaSG];
    const copiaSE = [...this.filaSE];

    const resultado: { senha: string; tempo: number }[] = [];
    let ultima = this.ultimaSenhaTipo;
    let acumulado = 0;

    while (copiaSP.length || copiaSG.length || copiaSE.length) {
      let proxima: string | undefined;

      if (ultima === 'SP') {
        proxima = copiaSE.shift() || copiaSG.shift();
      } else {
        proxima = copiaSP.shift() || copiaSE.shift() || copiaSG.shift();
      }

      if (!proxima) break;

      const tipo = proxima.substring(7, 9);
      acumulado += this.getTempoBase(tipo);

      resultado.push({
        senha: proxima,
        tempo: acumulado
      });

      ultima = tipo;
    }

    return resultado;
    
  }

removerSenhaDaFila(senha: string): void {
  this.filaSP = this.filaSP.filter(s => s !== senha);
  this.filaSG = this.filaSG.filter(s => s !== senha);
  this.filaSE = this.filaSE.filter(s => s !== senha);
} 
}