import { HttpErrorResponse } from '@angular/common/http';
import { effect, inject, Service, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { mensajeDeError } from '../utils/errores.utils';
import { vencimientoDelToken } from '../utils/token.utils';
import { AuthService } from './auth.service';
import { NotificacionService } from './notificacion.service';

/** Anticipación con la que se pregunta si se quiere extender la sesión. */
const AVISO_ANTES_DE_VENCER_MS = 5 * 60 * 1000;

/**
 * Ciclo de vida de la sesión en el navegador. Al arrancar la aplicación se
 * valida el token guardado (lo dispara la pantalla de carga). Mientras hay
 * sesión, cinco minutos antes de que venza el token se pregunta si se quiere
 * extenderla; si se acepta, se refresca. Si vence, o la API responde 401, se
 * cierra la sesión y se vuelve al login.
 */
@Service()
export class SesionService {
  private readonly authService = inject(AuthService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly router = inject(Router);

  private readonly sesionValidada = signal(false);
  private readonly mostrandoAviso = signal(false);
  private readonly refrescando = signal(false);
  private temporizadorAviso = 0;
  private temporizadorVencimiento = 0;

  /** Si ya se validó el token guardado al arrancar. Hasta entonces se ve la pantalla de carga. */
  readonly validada = this.sesionValidada.asReadonly();
  /** Si se está preguntando si se quiere extender la sesión. */
  readonly avisoVencimiento = this.mostrandoAviso.asReadonly();
  readonly extendiendo = this.refrescando.asReadonly();

  /** Cada token nuevo (login, registro o refresco) reprograma el aviso y el vencimiento. */
  private readonly programarVencimiento = effect(() => {
    const token = this.sesionValidada() ? this.authService.token() : null;
    untracked(() => this.programar(token));
  });

  /**
   * Valida el token guardado contra `POST /auth/autorizar`. Si no hay token o
   * no es válido, cierra la sesión.
   * @returns si quedó una sesión válida
   */
  async validar(): Promise<boolean> {
    try {
      if (!this.authService.token()) return false;
      await this.authService.autorizar();
      return true;
    } catch (error) {
      // El 401 ya lo avisa `erroresInterceptor`.
      if (!(error instanceof HttpErrorResponse && error.status === 401)) {
        this.notificacionService.mostrar({
          tipo: 'peligro',
          titulo: 'No pudimos validar tu sesión',
          texto: mensajeDeError(error),
        });
      }
      this.authService.cerrarSesion();
      return false;
    } finally {
      this.sesionValidada.set(true);
    }
  }

  /** Refresca el token por otros 15 minutos y cierra el aviso. Si falla, lo avisa. */
  async extender(): Promise<void> {
    this.refrescando.set(true);
    try {
      await this.authService.refrescar();
      this.mostrandoAviso.set(false);
    } catch (error) {
      this.notificacionService.mostrar({
        tipo: 'peligro',
        titulo: 'No pudimos extender tu sesión',
        texto: mensajeDeError(error),
      });
    } finally {
      this.refrescando.set(false);
    }
  }

  /** Cierra el aviso sin extender la sesión: vence a su hora. */
  descartarAviso(): void {
    this.mostrandoAviso.set(false);
  }

  /**
   * Cierra la sesión que terminó (venció o la API la rechazó), lo avisa y
   * vuelve al login. Si ya no había sesión, no hace nada: varios pedidos
   * rechazados a la vez avisan una sola vez.
   * @param motivo texto del aviso
   */
  terminar(motivo: string): void {
    if (!this.authService.token()) return;
    this.authService.cerrarSesion();
    this.notificacionService.mostrar({
      tipo: 'alerta',
      titulo: 'Tu sesión terminó',
      texto: motivo,
    });
    void this.router.navigate(['/login']);
  }

  private programar(token: string | null): void {
    clearTimeout(this.temporizadorAviso);
    clearTimeout(this.temporizadorVencimiento);
    this.mostrandoAviso.set(false);

    const vencimiento = token ? vencimientoDelToken(token) : null;
    if (vencimiento === null) return;
    const restante = vencimiento - Date.now();
    this.temporizadorAviso = window.setTimeout(
      () => this.mostrandoAviso.set(true),
      Math.max(restante - AVISO_ANTES_DE_VENCER_MS, 0),
    );
    this.temporizadorVencimiento = window.setTimeout(
      () => this.terminar('Pasaron 15 minutos. Volvé a iniciar sesión para seguir.'),
      Math.max(restante, 0),
    );
  }
}
