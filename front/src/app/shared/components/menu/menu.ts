import { AfterViewInit, Component, ElementRef, inject, input, output } from '@angular/core';
import { OpcionMenu } from '../../../core/models/interfaz.model';
import { Icono } from '../icono/icono';

/**
 * Menú desplegable de opciones. Al aparecer, el foco pasa a la primera
 * opción; las flechas recorren las opciones y Esc pide cerrarlo. Por defecto
 * es un menú contextual, con `titulo` arriba y atajos a la derecha; con
 * `franja` toma la forma del menú Start (franja vertical con el nombre del
 * sistema y opciones a todo el ancho, separadas por líneas). Quien lo muestra
 * decide dónde va y lo cierra al tocar afuera.
 */
@Component({
  selector: 'app-menu',
  imports: [Icono],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
  host: {
    '[class.con-franja]': 'franja() !== null',
    '(keydown)': 'navegar($event)',
  },
})
export class Menu implements AfterViewInit {
  readonly opciones = input.required<readonly OpcionMenu[]>();
  /** Nombre del menú para los lectores de pantalla. */
  readonly etiqueta = input.required<string>();
  readonly franja = input<string | null>(null);
  /** Encabezado chico del menú contextual (por ejemplo, el archivo de la app). */
  readonly titulo = input<string | null>(null);

  readonly elegir = output<string>();
  readonly cerrar = output<void>();

  private readonly elemento: HTMLElement = inject(ElementRef).nativeElement;

  ngAfterViewInit(): void {
    this.botones()[0]?.focus();
  }

  protected navegar(evento: KeyboardEvent): void {
    if (evento.key === 'Escape') {
      evento.stopPropagation();
      this.cerrar.emit();
      return;
    }
    const botones = this.botones();
    const actual = botones.findIndex((boton) => boton === document.activeElement);
    const destinos: Partial<Record<string, number>> = {
      ArrowDown: actual + 1,
      ArrowUp: actual - 1,
      Home: 0,
      End: botones.length - 1,
    };
    const destino = destinos[evento.key];
    if (destino === undefined) return;
    evento.preventDefault();
    botones[(destino + botones.length) % botones.length]?.focus();
  }

  private botones(): HTMLButtonElement[] {
    return [...this.elemento.querySelectorAll<HTMLButtonElement>('.opcion')];
  }
}
