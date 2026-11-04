import { Component, ElementRef, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { Spinner } from '../spinner/spinner';

/**
 * Spinner que acompaña al cursor mientras hay `visible`, como el puntero
 * "trabajando en segundo plano" de un sistema operativo. Solo existe con
 * mouse: con dedo o lápiz no hay puntero que seguir y se esconde.
 *
 * La posición se escribe directo en el estilo, sin signals: así mover el
 * mouse no dispara detección de cambios en toda la aplicación.
 */
@Component({
  selector: 'app-spinner-cursor',
  imports: [Spinner],
  templateUrl: './spinner-cursor.html',
  styleUrl: './spinner-cursor.css',
  host: {
    'aria-hidden': 'true',
    '[class.visible]': 'visible() && hayMouse()',
  },
})
export class SpinnerCursor implements OnInit, OnDestroy {
  readonly visible = input(false);

  protected readonly hayMouse = signal(false);

  private readonly elemento: HTMLElement = inject(ElementRef).nativeElement;

  private readonly seguir = (evento: PointerEvent) => {
    const esMouse = evento.pointerType === 'mouse';
    if (esMouse) this.elemento.style.translate = `${evento.clientX}px ${evento.clientY}px`;
    if (this.hayMouse() !== esMouse) this.hayMouse.set(esMouse);
  };

  ngOnInit(): void {
    document.addEventListener('pointermove', this.seguir, { passive: true });
    document.addEventListener('pointerdown', this.seguir, { passive: true });
  }

  ngOnDestroy(): void {
    document.removeEventListener('pointermove', this.seguir);
    document.removeEventListener('pointerdown', this.seguir);
  }
}
