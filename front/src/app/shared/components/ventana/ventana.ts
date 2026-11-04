import {
  afterRenderEffect,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
  untracked,
} from '@angular/core';
import {
  BordeVentana,
  DisposicionVentana,
  FinArrastre,
  Posicion,
  Tamano,
} from '../../../core/models/interfaz.model';
import {
  ALTO_MINIMO_VENTANA,
  ANCHO_MINIMO_VENTANA,
  BORDES_VENTANA,
  MARGEN_SUPERIOR_VENTANA,
  MARGEN_VISIBLE_VENTANA,
} from '../../../core/utils/ventana.constants';
import { Arrastrable } from '../../directives/arrastrable/arrastrable';
import { Icono } from '../icono/icono';
import { Spinner } from '../spinner/spinner';

interface InicioRedimension {
  tamano: Tamano;
  posicion: Posicion;
  escritorio: Tamano;
}

const limitar = (valor: number, minimo: number, maximo: number) =>
  Math.min(Math.max(valor, minimo), maximo);

/** Lleva la ventana a un lugar desde donde se la pueda volver a agarrar. */
const posicionVisible = (posicion: Posicion, ancho: number, escritorio: Tamano): Posicion => ({
  x: limitar(posicion.x, MARGEN_VISIBLE_VENTANA - ancho, escritorio.ancho - MARGEN_VISIBLE_VENTANA),
  y: limitar(posicion.y, 0, escritorio.alto - MARGEN_VISIBLE_VENTANA),
});

let contadorVentanas = 0;

/**
 * Ventana del escritorio. Si es `movible` (computadora), flota sobre el
 * escritorio: se mueve desde la barra de título, cambia de tamaño desde
 * cualquier borde o esquina (entre un mínimo y el tamaño del escritorio) y se
 * maximiza con el botón o con doble click en la barra. Recuerda su lugar y
 * tamaño por `clave`, así cada app vuelve a aparecer donde se la dejó.
 * Avisa cuando se pide minimizarla, cerrarla o cuando se suelta sobre la papelera.
 */
@Component({
  selector: 'app-ventana',
  imports: [Arrastrable, Icono, Spinner],
  templateUrl: './ventana.html',
  styleUrl: './ventana.css',
  host: {
    role: 'region',
    '[attr.aria-labelledby]': 'idTitulo',
    '[class.flotante]': 'movible()',
    '[class.maximizada]': 'maximizada()',
    '[class.arrastrando]': 'ocupada()',
    '[class.oculta]': 'oculta()',
    '[class.con-secciones]': 'secciones()',
    '[style.--ancho-ventana]': 'ancho()',
    '[style.left.px]': 'movible() && !maximizada() ? posicion()?.x : null',
    '[style.top.px]': 'movible() && !maximizada() ? posicion()?.y : null',
    '[style.width.px]': 'movible() && !maximizada() ? tamano()?.ancho : null',
    '[style.height.px]': 'movible() && !maximizada() ? tamano()?.alto : null',
  },
})
export class Ventana implements OnInit, OnDestroy {
  readonly titulo = input.required<string>();
  /** Identifica de quién es la ventana para recordar su disposición (por ejemplo, la ruta). */
  readonly clave = input('');
  /** Ancho inicial en escritorio, como valor CSS. En celular ocupa todo el ancho. */
  readonly ancho = input('auto');
  /** Textos de la barra de estado; si está vacía, no se muestra. */
  readonly estado = input<readonly string[]>([]);
  readonly oculta = input(false);
  readonly movible = input(false);
  readonly minimizable = input(false);
  readonly maximizable = input(false);
  readonly cerrable = input(false);
  readonly cargando = input(false);
  /** El contenido arma sus propias secciones del marco (ver `ConfigVentana.secciones`). */
  readonly secciones = input(false);

  readonly minimizar = output<void>();
  readonly cerrar = output<void>();
  readonly soltarEnPapelera = output<void>();

  protected readonly idTitulo = `ventana-titulo-${contadorVentanas++}`;
  protected readonly bordes = BORDES_VENTANA;

  protected readonly posicion = signal<Posicion | null>(null);
  protected readonly tamano = signal<Tamano | null>(null);
  protected readonly maximizada = signal(false);
  protected readonly ocupada = signal(false);

  private readonly elemento: HTMLElement = inject(ElementRef).nativeElement;
  private readonly disposiciones = new Map<string, DisposicionVentana>();
  private posicionAlEmpezar: Posicion | null = null;
  private inicioRedimension: InicioRedimension | null = null;
  private observador?: ResizeObserver;

  protected readonly redimensionable = computed(() => this.movible() && !this.maximizada());

  private claveAnterior: string | null = null;

  /** Al cambiar de app se guarda la disposición de la anterior y se recupera la de la nueva. */
  private readonly cambiarDeApp = effect(() => {
    const clave = this.clave();
    untracked(() => {
      if (this.claveAnterior !== null) {
        this.disposiciones.set(this.claveAnterior, this.disposicionActual());
      }
      this.aplicar(this.disposiciones.get(clave));
      this.claveAnterior = clave;
    });
  });

  /** La primera vez que se ve, la ventana se ubica centrada arriba del escritorio. */
  private readonly ubicarAlAparecer = afterRenderEffect(() => {
    if (!this.movible() || this.oculta()) return;
    const escritorio = this.elemento.offsetParent;
    if (!(escritorio instanceof HTMLElement)) return;
    // Una app que se reabre trae el lugar donde quedó; si mientras tanto el
    // escritorio se achicó, se la vuelve a dejar al alcance.
    if (this.posicion() !== null) {
      untracked(() => this.reubicar(escritorio));
      return;
    }
    this.posicion.set({
      x: Math.max(0, (escritorio.clientWidth - this.elemento.offsetWidth) / 2),
      y: MARGEN_SUPERIOR_VENTANA,
    });
  });

  /** Vigila el tamaño del escritorio (el contenedor de la ventana) para no dejarla afuera. */
  ngOnInit(): void {
    const escritorio = this.elemento.parentElement;
    if (!escritorio) return;
    this.observador = new ResizeObserver(() => this.reubicar(escritorio));
    this.observador.observe(escritorio);
  }

  ngOnDestroy(): void {
    this.observador?.disconnect();
  }

  /** Olvida la disposición guardada de una app, para que la próxima vez se abra centrada. */
  olvidar(clave: string): void {
    this.disposiciones.delete(clave);
    if (clave === this.clave()) this.aplicar(undefined);
  }

  protected alternarMaximizada(): void {
    if (this.maximizable()) this.maximizada.update((maximizada) => !maximizada);
  }

  protected mover(desplazamiento: Posicion): void {
    const escritorio = this.elemento.offsetParent;
    if (!escritorio) return;
    this.posicionAlEmpezar ??= this.posicion() ?? { x: 0, y: 0 };
    this.ocupada.set(true);
    this.posicion.set(
      posicionVisible(
        {
          x: this.posicionAlEmpezar.x + desplazamiento.x,
          y: this.posicionAlEmpezar.y + desplazamiento.y,
        },
        this.elemento.offsetWidth,
        { ancho: escritorio.clientWidth, alto: escritorio.clientHeight },
      ),
    );
  }

  /** Sobre la papelera la ventana vuelve a donde estaba; si no, queda donde se soltó. */
  protected soltar(fin: FinArrastre): void {
    if (fin.sobrePapelera && this.posicionAlEmpezar) {
      this.posicion.set(this.posicionAlEmpezar);
      this.soltarEnPapelera.emit();
    }
    this.posicionAlEmpezar = null;
    this.ocupada.set(false);
  }

  /**
   * Cambia el tamaño desde un borde, entre el mínimo y el borde del escritorio
   * hacia el que se estira. Los bordes izquierdo y superior además corren la
   * ventana, para que el lado opuesto quede quieto.
   */
  protected redimensionar(borde: BordeVentana, desplazamiento: Posicion): void {
    this.inicioRedimension ??= this.medirInicioRedimension();
    if (!this.inicioRedimension) return;
    this.ocupada.set(true);
    const { tamano, posicion, escritorio } = this.inicioRedimension;

    const anchoMaximo = borde.x === 1 ? escritorio.ancho - posicion.x : posicion.x + tamano.ancho;
    const altoMaximo = borde.y === 1 ? escritorio.alto - posicion.y : posicion.y + tamano.alto;
    const ancho =
      borde.x === 0
        ? tamano.ancho
        : limitar(
            tamano.ancho + borde.x * desplazamiento.x,
            ANCHO_MINIMO_VENTANA,
            Math.max(ANCHO_MINIMO_VENTANA, anchoMaximo),
          );
    const alto =
      borde.y === 0
        ? tamano.alto
        : limitar(
            tamano.alto + borde.y * desplazamiento.y,
            ALTO_MINIMO_VENTANA,
            Math.max(ALTO_MINIMO_VENTANA, altoMaximo),
          );

    this.tamano.set({ ancho, alto });
    this.posicion.set({
      x: borde.x === -1 ? posicion.x + tamano.ancho - ancho : posicion.x,
      y: borde.y === -1 ? posicion.y + tamano.alto - alto : posicion.y,
    });
  }

  protected terminarRedimension(): void {
    this.inicioRedimension = null;
    this.ocupada.set(false);
  }

  private medirInicioRedimension(): InicioRedimension | null {
    const escritorio = this.elemento.offsetParent;
    if (!escritorio) return null;
    return {
      tamano: { ancho: this.elemento.offsetWidth, alto: this.elemento.offsetHeight },
      posicion: this.posicion() ?? { x: 0, y: 0 },
      escritorio: { ancho: escritorio.clientWidth, alto: escritorio.clientHeight },
    };
  }

  /**
   * El escritorio cambió de tamaño: un tamaño elegido a mano no puede pasar
   * del escritorio, y la ventana vuelve a quedar al alcance. Mientras se
   * arrastra o se redimensiona no se toca, para no pelear con el puntero.
   */
  private reubicar(escritorio: HTMLElement): void {
    const posicion = this.posicion();
    if (!this.movible() || this.oculta() || this.ocupada() || !posicion) return;
    const limites = { ancho: escritorio.clientWidth, alto: escritorio.clientHeight };
    const tamano = this.tamano();
    if (tamano) {
      const ancho = limitar(
        tamano.ancho,
        ANCHO_MINIMO_VENTANA,
        Math.max(ANCHO_MINIMO_VENTANA, limites.ancho),
      );
      const alto = limitar(
        tamano.alto,
        ALTO_MINIMO_VENTANA,
        Math.max(ALTO_MINIMO_VENTANA, limites.alto),
      );
      // Solo se escribe si cambió: un objeto nuevo con los mismos valores
      // vuelve a renderizar la ventana.
      if (ancho !== tamano.ancho || alto !== tamano.alto) this.tamano.set({ ancho, alto });
    }
    const corregida = posicionVisible(posicion, this.elemento.offsetWidth, limites);
    if (corregida.x !== posicion.x || corregida.y !== posicion.y) this.posicion.set(corregida);
  }

  private disposicionActual(): DisposicionVentana {
    return { posicion: this.posicion(), tamano: this.tamano(), maximizada: this.maximizada() };
  }

  private aplicar(disposicion: DisposicionVentana | undefined): void {
    this.posicion.set(disposicion?.posicion ?? null);
    this.tamano.set(disposicion?.tamano ?? null);
    this.maximizada.set(disposicion?.maximizada ?? false);
  }
}
