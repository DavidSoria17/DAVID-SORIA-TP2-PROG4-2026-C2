import { Service, signal } from '@angular/core';

const CONSULTA_CELULAR = '(max-width: 640px)';

/** Tamaño de pantalla. En celular las ventanas no se mueven, no se redimensionan ni se maximizan. */
@Service()
export class PantallaService {
  private readonly consulta = window.matchMedia(CONSULTA_CELULAR);
  private readonly celular = signal(this.consulta.matches);

  readonly esCelular = this.celular.asReadonly();

  constructor() {
    this.consulta.addEventListener('change', (evento) => this.celular.set(evento.matches));
  }
}
