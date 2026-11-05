import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  BaseRouteReuseStrategy,
  DetachedRouteHandle,
} from '@angular/router';
import { VentanasService } from '../services/ventanas.service';
import { rutaDeApp } from '../utils/rutas.utils';

/**
 * Al cambiar de ventana, la pantalla que se deja no se destruye si su app
 * sigue abierta en la barra de tareas: se guarda y se vuelve a enganchar al
 * reabrirla. Cerrar la app (×) la saca de la barra y entonces sí se destruye.
 * Cada pantalla se guarda por su ruta, así una app con varias pantallas
 * (Tweeter: listado, nueva publicación y detalle) conserva todas mientras
 * está abierta. Se vuelve a enganchar solo si la dirección es la misma: el
 * detalle de una publicación no se reutiliza para mostrar otra.
 */
@Injectable()
export class VentanasReuseStrategy extends BaseRouteReuseStrategy {
  private readonly ventanasService = inject(VentanasService);

  override shouldDetach(ruta: ActivatedRouteSnapshot): boolean {
    const clave = this.clave(ruta);
    return clave !== null && this.ventanasService.estaAbierta(rutaDeApp(clave));
  }

  override store(ruta: ActivatedRouteSnapshot, pantalla: DetachedRouteHandle | null): void {
    const clave = this.clave(ruta);
    if (clave !== null) this.ventanasService.guardarPantalla(clave, pantalla, this.direccion(ruta));
  }

  override shouldAttach(ruta: ActivatedRouteSnapshot): boolean {
    const clave = this.clave(ruta);
    return (
      clave !== null && this.ventanasService.pantallaGuardada(clave, this.direccion(ruta)) !== null
    );
  }

  override retrieve(ruta: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const clave = this.clave(ruta);
    return clave === null
      ? null
      : this.ventanasService.pantallaGuardada(clave, this.direccion(ruta));
  }

  /** Solo se guardan las pantallas que se abren en una ventana (`data.ventana`). */
  private clave(ruta: ActivatedRouteSnapshot): string | null {
    const camino = ruta.routeConfig?.path;
    return camino && ruta.data['ventana'] ? `/${camino}` : null;
  }

  /** Dirección de la pantalla con sus parámetros (`/publicaciones/<id>`). */
  private direccion(ruta: ActivatedRouteSnapshot): string {
    return `/${ruta.pathFromRoot.flatMap((tramo) => tramo.url.map(({ path }) => path)).join('/')}`;
  }
}
