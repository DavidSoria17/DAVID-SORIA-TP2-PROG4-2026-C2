import { Service, signal } from '@angular/core';
import { Notificacion } from '../models/interfaz.model';

const DURACION_AVISO_MS = 6000;

/** Avisos flotantes del sistema que se cierran solos después de unos segundos. */
@Service()
export class NotificacionService {
  private readonly listaAvisos = signal<Notificacion[]>([]);
  private proximoId = 0;

  readonly avisos = this.listaAvisos.asReadonly();
  /** Milisegundos que queda cada aviso en pantalla. */
  readonly duracion = DURACION_AVISO_MS;

  /** Muestra un aviso y programa su cierre. */
  mostrar(aviso: Omit<Notificacion, 'id'>): void {
    const id = this.proximoId++;
    this.listaAvisos.update((avisos) => [...avisos, { ...aviso, id }]);
    setTimeout(() => this.cerrar(id), DURACION_AVISO_MS);
  }

  /** Quita un aviso; si ya se había cerrado, no hace nada. */
  cerrar(id: number): void {
    this.listaAvisos.update((avisos) => avisos.filter((aviso) => aviso.id !== id));
  }
}
