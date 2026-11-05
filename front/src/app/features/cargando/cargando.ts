import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LineaArranque } from '../../core/models/interfaz.model';
import { AuthService } from '../../core/services/auth.service';
import { SesionService } from '../../core/services/sesion.service';
import { Arranque } from '../../shared/components/arranque/arranque';
import { Spinner } from '../../shared/components/spinner/spinner';

/** Pasos que se muestran mientras se espera la validación del token. */
const PASOS_DE_ARRANQUE = ['Cargando kernel32.dll', 'Conectando con la disque nube'];

/** Tiempo que tarda cada paso de la pantalla de carga. */
const PASO_MS = 400;

/**
 * Pantalla con la que arranca la aplicación. Mientras muestra el arranque de
 * Windose valida el token guardado contra la API: si es válido lleva a
 * Tweeter y, si no hay token o no sirve, al login. Sale recién cuando
 * terminaron los pasos y llegó la respuesta, la que tarde más.
 */
@Component({
  selector: 'app-cargando',
  imports: [Arranque, Spinner],
  templateUrl: './cargando.html',
})
export class Cargando implements OnInit, OnDestroy {
  private readonly sesionService = inject(SesionService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly pasosListos = signal(0);
  /** `null` mientras se espera la respuesta de la API. */
  private readonly sesionValida = signal<boolean | null>(null);
  private temporizador = 0;

  protected readonly lineas = computed<LineaArranque[]>(() => {
    const listos = this.pasosListos();
    const lineas = PASOS_DE_ARRANQUE.slice(0, listos + 1).map((texto, indice) => ({
      texto,
      lista: indice < listos,
    }));
    if (listos < PASOS_DE_ARRANQUE.length) return lineas;
    const valida = this.sesionValida();
    const texto =
      valida === null
        ? 'Validando tu sesión'
        : valida
          ? 'Sesión validada'
          : 'No hay sesión iniciada';
    return [...lineas, { texto, lista: valida !== null }];
  });

  protected readonly progreso = computed(() => {
    const listos = this.pasosListos() + (this.sesionValida() === null ? 0 : 1);
    return Math.round((listos / (PASOS_DE_ARRANQUE.length + 1)) * 100);
  });

  async ngOnInit(): Promise<void> {
    if (this.sesionService.validada()) {
      await this.salir(this.authService.token() !== null);
      return;
    }
    this.temporizador = window.setInterval(() => this.avanzar(), PASO_MS);
    this.sesionValida.set(await this.sesionService.validar());
  }

  ngOnDestroy(): void {
    clearInterval(this.temporizador);
  }

  /** Termina un paso; con todos listos y la respuesta de la API, sale. */
  private avanzar(): void {
    if (this.pasosListos() < PASOS_DE_ARRANQUE.length) {
      this.pasosListos.update((listos) => listos + 1);
      return;
    }
    const valida = this.sesionValida();
    if (valida === null) return;
    clearInterval(this.temporizador);
    void this.salir(valida);
  }

  private async salir(sesionValida: boolean): Promise<void> {
    await this.router.navigate([sesionValida ? '/publicaciones' : '/login'], { replaceUrl: true });
  }
}
