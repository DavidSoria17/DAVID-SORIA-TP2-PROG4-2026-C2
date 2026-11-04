import {
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  untracked,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AppEscritorio, ConfigVentana } from '../../core/models/interfaz.model';
import { CargaService } from '../../core/services/carga.service';
import { EscritorioService } from '../../core/services/escritorio.service';
import { PantallaService } from '../../core/services/pantalla.service';
import { PapeleraService } from '../../core/services/papelera.service';
import { RebootService } from '../../core/services/reboot.service';
import { VentanasService } from '../../core/services/ventanas.service';
import { rutaDeApp } from '../../core/utils/rutas.utils';
import { Arranque } from '../../shared/components/arranque/arranque';
import { Escritorio } from '../../shared/components/escritorio/escritorio';
import { IconosEscritorio } from '../../shared/components/iconos-escritorio/iconos-escritorio';
import { Ventana } from '../../shared/components/ventana/ventana';

/**
 * Escritorio de la aplicación. Puede haber varias apps abiertas en la barra de
 * tareas, pero a la vista hay una sola ventana: la de la ruta activa, con
 * título, ancho y barra de estado tomados de `data.ventana`. Abrir otra app
 * deja la anterior minimizada; cerrarla la saca de la barra y vuelve al escritorio.
 *
 * Coordina lo que pasa entre piezas: tirar una app a la papelera cierra su
 * ventana, y mientras dura el Reboot del menú Start se ve la pantalla de arranque.
 */
@Component({
  selector: 'app-escritorio-layout',
  imports: [Arranque, Escritorio, IconosEscritorio, RouterOutlet, Ventana],
  templateUrl: './escritorio-layout.html',
})
export class EscritorioLayout implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly papeleraService = inject(PapeleraService);
  private readonly cargaService = inject(CargaService);
  protected readonly escritorioService = inject(EscritorioService);
  protected readonly ventanasService = inject(VentanasService);
  protected readonly rebootService = inject(RebootService);

  protected readonly esCelular = inject(PantallaService).esCelular;

  private readonly ventana = viewChild.required(Ventana);

  /** Ventana a la vista (la activa, si no está minimizada). */
  protected readonly visible = this.ventanasService.visible;

  /** Config de la ventana activa; se mantiene aunque esté minimizada para no perder su contenido. */
  protected readonly configActiva = computed(() => {
    const activa = this.ventanasService.activa();
    return this.ventanasService.abiertas().find((abierta) => abierta.ruta === activa)?.config;
  });

  /** Si la ventana activa espera una respuesta que pidió ella. */
  protected readonly cargandoVentana = computed(() =>
    this.cargaService.ventanasCargando().has(this.ventanasService.activa()),
  );

  /** En celular los íconos se esconden mientras hay una ventana a la vista. */
  protected readonly mostrarIconos = computed(() => !this.esCelular() || this.visible() === null);

  private navegaciones?: Subscription;

  /**
   * Cuando una app abierta deja de estar en el escritorio (cambió la sesión o
   * se tiró a la papelera), se cierra. La activa se deja: o la cierra quien la
   * tiró, o está terminando su propia navegación (por ejemplo, Iniciar sesión
   * después de entrar).
   */
  private readonly cerrarAppsNoDisponibles = effect(() => {
    const rutasDisponibles = new Set(this.escritorioService.apps().map((app) => app.ruta));
    const activa = this.ventanasService.activa();
    untracked(() => {
      for (const { ruta } of this.ventanasService.abiertas()) {
        if (ruta !== activa && !rutasDisponibles.has(ruta)) this.cerrarApp(ruta);
      }
    });
  });

  ngOnInit(): void {
    this.sincronizarVentana();
    this.navegaciones = this.router.events
      .pipe(filter((evento) => evento instanceof NavigationEnd))
      .subscribe(() => this.sincronizarVentana());
  }

  ngOnDestroy(): void {
    this.navegaciones?.unsubscribe();
  }

  /**
   * Abre la app; si es la que está activa y minimizada, la restaura. Una app
   * que ya estaba abierta vuelve a la pantalla en la que se la dejó.
   */
  protected async abrir(ruta: string): Promise<void> {
    if (this.ventanasService.activa() === ruta) {
      this.ventanasService.restaurar();
      return;
    }
    await this.router.navigateByUrl(this.ventanasService.urlDe(ruta) ?? ruta);
  }

  /** Botón de la barra de tareas: minimiza la ventana a la vista o trae otra al frente. */
  protected async elegirTarea(ruta: string): Promise<void> {
    if (this.visible()?.ruta === ruta) {
      this.ventanasService.minimizar();
      return;
    }
    await this.abrir(ruta);
  }

  protected async cerrarVentana(): Promise<void> {
    const activa = this.ventanasService.activa();
    if (activa) this.cerrarApp(activa);
    await this.router.navigate(['/']);
  }

  /** Manda la app a la papelera. Si su ventana era la activa, se cierra y vuelve el escritorio. */
  protected async tirar(app: AppEscritorio): Promise<void> {
    if (!this.papeleraService.tirar(app)) return;
    if (this.ventanasService.activa() === app.ruta) await this.cerrarVentana();
  }

  /** Soltar la barra de título sobre la papelera tira la app de esa ventana. */
  protected async tirarVentanaActiva(): Promise<void> {
    const activa = this.ventanasService.activa();
    const app = activa ? this.escritorioService.appDeRuta(activa) : undefined;
    if (app) await this.tirar(app);
  }

  /**
   * Toma la ventana de la ruta activa: la de su app, aunque se esté en una
   * pantalla interna (`/publicaciones/nueva` se ve en la ventana de Tweeter).
   * Se lee del router después de cada navegación porque una pantalla puede
   * aparecer creada de cero o reenganchada desde la barra de tareas, y el
   * `router-outlet` avisa cada caso con un evento distinto.
   */
  private sincronizarVentana(): void {
    let ruta = this.router.routerState.snapshot.root;
    while (ruta.firstChild) ruta = ruta.firstChild;
    const config = ruta.data['ventana'] as ConfigVentana | undefined;
    const camino = ruta.routeConfig?.path;
    if (config && camino) {
      this.ventanasService.activar(rutaDeApp(`/${camino}`), config, this.router.url);
    } else {
      this.ventanasService.desactivar();
    }
  }

  private cerrarApp(ruta: string): void {
    this.ventanasService.cerrar(ruta);
    this.ventana().olvidar(ruta);
  }
}
