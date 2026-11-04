import { DatePipe, NgOptimizedImage } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { OpcionMenu, VentanaAbierta } from '../../../core/models/interfaz.model';
import { Menu } from '../menu/menu';

const INTERVALO_RELOJ_MS = 30_000;

/**
 * Fondo de escritorio con la barra de tareas. El botón Start despliega el
 * menú del sistema, pegado a la esquina sobre la barra, con Reboot. Cada app
 * abierta tiene su botón: si es la que está a la vista la minimiza, si no la
 * trae al frente. Los íconos y la ventana se proyectan en el área central. En
 * celular la barra solo muestra íconos.
 */
@Component({
  selector: 'app-escritorio',
  imports: [DatePipe, Menu, NgOptimizedImage],
  templateUrl: './escritorio.html',
  styleUrl: './escritorio.css',
  host: {
    '(document:pointerdown)': 'alTocarAfuera($event)',
  },
})
export class Escritorio implements OnInit, OnDestroy {
  readonly tareas = input<readonly VentanaAbierta[]>([]);
  /** Ruta de la ventana que está a la vista, o `null` si se ve el escritorio. */
  readonly visible = input<string | null>(null);

  readonly reiniciar = output<void>();
  readonly elegirTarea = output<string>();

  protected readonly ahora = signal(new Date());
  protected readonly menuAbierto = signal(false);

  protected readonly opcionesInicio: readonly OpcionMenu[] = [
    { id: 'reboot', etiqueta: 'Reboot', icono: 'reiniciar' },
  ];

  private readonly elemento: HTMLElement = inject(ElementRef).nativeElement;
  private reloj?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.reloj = setInterval(() => this.ahora.set(new Date()), INTERVALO_RELOJ_MS);
  }

  ngOnDestroy(): void {
    clearInterval(this.reloj);
  }

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  /** La única opción del menú es Reboot. */
  protected elegirOpcion(): void {
    this.cerrarMenu(true);
    this.reiniciar.emit();
  }

  /** Cierra el menú; con `devolverFoco`, el foco vuelve al botón Start. */
  protected cerrarMenu(devolverFoco: boolean): void {
    this.menuAbierto.set(false);
    if (devolverFoco) this.elemento.querySelector<HTMLElement>('.inicio')?.focus();
  }

  /** Tocar fuera del botón y del menú lo cierra (el botón ya lo alterna con su click). */
  protected alTocarAfuera(evento: PointerEvent): void {
    if (!this.menuAbierto()) return;
    const objetivo = evento.target as Element;
    if (!objetivo.closest('.inicio, .menu-inicio')) this.cerrarMenu(false);
  }
}
