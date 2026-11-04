import { Directive, ElementRef, inject, input, output } from '@angular/core';
import { FinArrastre, Posicion } from '../../../core/models/interfaz.model';

/** Píxeles que hay que mover el puntero para que un click pase a ser un arrastre. */
const UMBRAL_ARRASTRE = 4;

/**
 * Convierte el elemento en una agarradera: informa cuánto se movió el puntero
 * desde que se apretó y dónde se soltó. No mueve nada por sí misma; quien la
 * usa decide qué hacer con el desplazamiento (mover una ventana, un ícono o
 * cambiar un tamaño). Los elementos internos con `data-sin-arrastre` no la activan.
 */
@Directive({
  selector: '[appArrastrable]',
  host: {
    '(pointerdown)': 'iniciar($event)',
    '(pointermove)': 'mover($event)',
    '(pointerup)': 'terminar($event)',
    '(pointercancel)': 'cancelar()',
  },
})
export class Arrastrable {
  readonly habilitado = input(true, { alias: 'appArrastrable' });
  readonly arrastre = output<Posicion>();
  readonly soltar = output<FinArrastre>();

  private readonly elemento: HTMLElement = inject(ElementRef).nativeElement;
  private inicio: Posicion | null = null;
  private arrastrando = false;

  protected iniciar(evento: PointerEvent): void {
    const objetivo = evento.target as Element;
    if (!this.habilitado() || evento.button !== 0 || objetivo.closest('[data-sin-arrastre]')) {
      return;
    }
    this.inicio = { x: evento.clientX, y: evento.clientY };
    // Con la captura, los movimientos siguen llegando aunque el puntero salga
    // rápido del elemento antes de superar el umbral.
    this.elemento.setPointerCapture(evento.pointerId);
  }

  protected mover(evento: PointerEvent): void {
    if (!this.inicio) return;
    const desplazamiento = this.desplazamiento(evento);
    if (!this.arrastrando) {
      if (Math.hypot(desplazamiento.x, desplazamiento.y) < UMBRAL_ARRASTRE) return;
      this.arrastrando = true;
    }
    evento.preventDefault();
    this.arrastre.emit(desplazamiento);
  }

  protected terminar(evento: PointerEvent): void {
    if (this.arrastrando) {
      this.soltar.emit({
        ...this.desplazamiento(evento),
        sobrePapelera: this.estaSobrePapelera(evento),
      });
      this.ignorarProximoClick();
    }
    this.cancelar();
  }

  protected cancelar(): void {
    this.inicio = null;
    this.arrastrando = false;
  }

  private desplazamiento(evento: PointerEvent): Posicion {
    return {
      x: evento.clientX - (this.inicio?.x ?? evento.clientX),
      y: evento.clientY - (this.inicio?.y ?? evento.clientY),
    };
  }

  private estaSobrePapelera(evento: PointerEvent): boolean {
    return document
      .elementsFromPoint(evento.clientX, evento.clientY)
      .some((elemento) => elemento.closest('[data-papelera]') && !this.elemento.contains(elemento));
  }

  /** Al soltar, el navegador dispara un click que no tiene que abrir ni seleccionar nada. */
  private ignorarProximoClick(): void {
    const frenar = (click: Event) => {
      click.stopPropagation();
      click.preventDefault();
    };
    window.addEventListener('click', frenar, { capture: true, once: true });
    setTimeout(() => window.removeEventListener('click', frenar, { capture: true }));
  }
}
