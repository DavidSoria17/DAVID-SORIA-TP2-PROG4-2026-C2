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
import {
  AppEscritorio,
  Celda,
  FinArrastre,
  Grilla,
  IconoUbicado,
  OpcionMenu,
  Posicion,
} from '../../../core/models/interfaz.model';
import { CELDA_ICONO } from '../../../core/utils/escritorio.constants';
import { Arrastrable } from '../../directives/arrastrable/arrastrable';
import { IconoApp } from '../icono-app/icono-app';
import { Menu } from '../menu/menu';

const ABRIR: OpcionMenu = { id: 'abrir', etiqueta: 'Abrir', icono: 'maximizar', atajo: 'Enter' };
const TIRAR: OpcionMenu = {
  id: 'tirar',
  etiqueta: 'Mover a la papelera',
  icono: 'basura',
  atajo: 'Supr',
  peligro: true,
  separada: true,
};

/** Tiempo que hay que mantener apretado un ícono con el dedo para abrir su menú. */
const PRESION_LARGA_MS = 500;

/** Ancho aproximado del menú contextual, para que no se salga del escritorio. */
const ANCHO_MENU = 240;
const ALTO_MENU = 120;

interface MenuAbierto {
  app: AppEscritorio;
  posicion: Posicion;
}

/**
 * Íconos de las apps sobre el escritorio, cada uno en su casillero.
 *
 * Con mouse, un click selecciona el ícono y doble click lo abre; con el dedo,
 * tocarlo lo abre. Click derecho (o mantenerlo apretado) muestra su menú:
 * Abrir y Mover a la papelera (la papelera solo se abre). Con el teclado,
 * Enter abre y Supr lo manda a la papelera. Soltarlo sobre la papelera
 * también lo tira (`tirar`).
 *
 * Si son `movibles`, se arrastran a otro casillero y avisan cuántos
 * casilleros entran. En celular van en una grilla fija.
 */
@Component({
  selector: 'app-iconos-escritorio',
  imports: [Arrastrable, IconoApp, Menu],
  templateUrl: './iconos-escritorio.html',
  styleUrl: './iconos-escritorio.css',
  host: {
    '[class.fijos]': '!movibles()',
    '[style.--celda-icono.px]': 'celda',
    '(document:pointerdown)': 'alTocarAfuera($event)',
  },
})
export class IconosEscritorio implements OnInit, OnDestroy {
  readonly iconos = input.required<readonly IconoUbicado[]>();
  readonly movibles = input(false);

  readonly abrir = output<AppEscritorio>();
  readonly tirar = output<AppEscritorio>();
  readonly mover = output<{ app: AppEscritorio; celda: Celda }>();
  readonly medir = output<Grilla>();

  protected readonly celda = CELDA_ICONO;
  protected readonly seleccionado = signal<string | null>(null);
  protected readonly menu = signal<MenuAbierto | null>(null);
  protected readonly arrastre = signal<{ id: string; desplazamiento: Posicion } | null>(null);

  private readonly elemento: HTMLElement = inject(ElementRef).nativeElement;

  private observador?: ResizeObserver;
  private presionLarga?: ReturnType<typeof setTimeout>;
  /** El click que sigue a una presión larga no abre la app: ya se mostró el menú. */
  private ignorarClick = false;

  /** Mide cuántos casilleros entran cada vez que cambia el tamaño del escritorio. */
  ngOnInit(): void {
    this.observador = new ResizeObserver(([{ contentRect }]) => {
      this.medir.emit({
        columnas: Math.max(1, Math.floor(contentRect.width / CELDA_ICONO)),
        filas: Math.max(1, Math.floor(contentRect.height / CELDA_ICONO)),
      });
    });
    this.observador.observe(this.elemento);
  }

  ngOnDestroy(): void {
    this.observador?.disconnect();
    clearTimeout(this.presionLarga);
  }

  protected opcionesDe(app: AppEscritorio): OpcionMenu[] {
    return app.esPapelera ? [ABRIR] : [ABRIR, TIRAR];
  }

  /**
   * Click del ícono: con mouse lo selecciona; con el dedo o con Enter
   * (un click sin puntero) lo abre.
   */
  protected alTocar(app: AppEscritorio, evento: MouseEvent): void {
    if (this.ignorarClick) {
      this.ignorarClick = false;
      return;
    }
    const porTeclado = evento.detail === 0;
    const conDedo = evento instanceof PointerEvent && evento.pointerType === 'touch';
    if (porTeclado || conDedo) this.elegir(app, ABRIR.id);
    else this.seleccionado.set(app.id);
  }

  protected alPresionar(app: AppEscritorio, evento: PointerEvent): void {
    if (evento.pointerType !== 'touch') return;
    clearTimeout(this.presionLarga);
    this.presionLarga = setTimeout(() => {
      this.ignorarClick = true;
      this.abrirMenu(app, null);
    }, PRESION_LARGA_MS);
  }

  protected cancelarPresion(): void {
    clearTimeout(this.presionLarga);
  }

  /** Click derecho, mantener apretado (Android) o la tecla de menú contextual. */
  protected alPedirMenu(app: AppEscritorio, evento: MouseEvent): void {
    evento.preventDefault();
    if (this.menu()?.app.id === app.id) return;
    const desdeTeclado = evento.clientX === 0 && evento.clientY === 0;
    this.abrirMenu(app, desdeTeclado ? null : { x: evento.clientX, y: evento.clientY });
  }

  protected alTeclear(app: AppEscritorio, evento: KeyboardEvent): void {
    if (evento.key === 'Delete' && !app.esPapelera) {
      evento.preventDefault();
      this.tirar.emit(app);
    }
  }

  /** Opción elegida en el menú (o doble click, que abre). */
  protected elegir(app: AppEscritorio, opcion: string): void {
    this.cerrarMenu(false);
    if (opcion === ABRIR.id) this.abrir.emit(app);
    else this.tirar.emit(app);
  }

  /** Cierra el menú; con `devolverFoco`, el foco vuelve al ícono que lo abrió. */
  protected cerrarMenu(devolverFoco: boolean): void {
    const abierto = this.menu();
    this.menu.set(null);
    if (devolverFoco && abierto) {
      this.elemento.querySelector<HTMLElement>(`[data-app="${abierto.app.id}"]`)?.focus();
    }
  }

  protected alTocarAfuera(evento: PointerEvent): void {
    if (!this.elemento.contains(evento.target as Node)) {
      this.menu.set(null);
      this.seleccionado.set(null);
    }
  }

  protected desplazar(app: AppEscritorio, desplazamiento: Posicion): void {
    this.cancelarPresion();
    this.menu.set(null);
    this.seleccionado.set(app.id);
    this.arrastre.set({ id: app.id, desplazamiento });
  }

  /** Al soltar, el ícono va al casillero más cercano a donde quedó (o a la papelera). */
  protected soltar({ app, celda }: IconoUbicado, fin: FinArrastre): void {
    this.arrastre.set(null);
    if (fin.sobrePapelera && !app.esPapelera) {
      this.tirar.emit(app);
      return;
    }
    if (!celda) return;
    this.mover.emit({
      app,
      celda: {
        columna: celda.columna + Math.round(fin.x / CELDA_ICONO),
        fila: celda.fila + Math.round(fin.y / CELDA_ICONO),
      },
    });
  }

  protected desplazamientoDe(id: string): string | null {
    const arrastre = this.arrastre();
    if (arrastre?.id !== id) return null;
    return `translate(${arrastre.desplazamiento.x}px, ${arrastre.desplazamiento.y}px)`;
  }

  /**
   * Abre el menú de un ícono y lo deja seleccionado. Con mouse aparece donde
   * se hizo click; sin puntero, al costado del ícono. Nunca se sale del
   * escritorio. En celular la posición la pone el CSS (abajo, a lo ancho).
   */
  private abrirMenu(app: AppEscritorio, puntero: Posicion | null): void {
    const area = this.elemento.getBoundingClientRect();
    const icono = this.elemento.querySelector(`[data-app="${app.id}"]`)?.getBoundingClientRect();
    const destino = puntero ?? { x: icono?.right ?? area.left, y: icono?.top ?? area.top };
    this.seleccionado.set(app.id);
    this.menu.set({
      app,
      posicion: {
        x: Math.max(0, Math.min(destino.x - area.left, area.width - ANCHO_MENU)),
        y: Math.max(0, Math.min(destino.y - area.top, area.height - ALTO_MENU)),
      },
    });
  }
}
