import { Component, computed, inject, signal } from '@angular/core';
import { PapeleraService } from '../../../core/services/papelera.service';
import { EscritorioService } from '../../../core/services/escritorio.service';
import { diaYHora } from '../../../core/utils/fechas.utils';
import { EstadoVacio } from '../../../shared/components/estado-vacio/estado-vacio';
import { IconoApp } from '../../../shared/components/icono-app/icono-app';
import { Icono } from '../../../shared/components/icono/icono';
import { Modal } from '../../../shared/components/modal/modal';
import { EliminacionPapelera } from '../../../core/models/interfaz.model';

/**
 * Apps tiradas a la papelera, en una lista con la fecha en que se tiraron. Se
 * elige una y se la restaura al escritorio o se la elimina definitivamente;
 * también se puede vaciar la papelera entera. Eliminar pide confirmación. La
 * ventana también recibe lo que se suelta encima (`data-papelera`), igual que
 * el ícono de la papelera.
 */
@Component({
  selector: 'app-papelera',
  imports: [EstadoVacio, Icono, IconoApp, Modal],
  templateUrl: './papelera.html',
  styleUrl: './papelera.css',
  host: {
    'data-papelera': '',
  },
})
export class Papelera {
  private readonly papeleraService = inject(PapeleraService);
  private readonly enPapelera = inject(EscritorioService).enPapelera;
  private readonly idSeleccionada = signal<string | null>(null);

  protected readonly porEliminar = signal<EliminacionPapelera | null>(null);

  protected readonly filas = computed(() => {
    const ahora = new Date();
    return this.enPapelera().map(({ app, borrada }) => ({
      app,
      borrada: diaYHora(borrada, ahora),
    }));
  });

  /** App elegida; deja de estarlo sola si sale de la papelera (por ejemplo, con un Reboot). */
  protected readonly seleccionada = computed(
    () => this.enPapelera().find(({ app }) => app.id === this.idSeleccionada())?.app ?? null,
  );

  protected readonly cantidad = computed(() => {
    const cantidad = this.filas().length;
    return `${cantidad} ${cantidad === 1 ? 'elemento' : 'elementos'}`;
  });

  protected seleccionar(idApp: string): void {
    this.idSeleccionada.set(idApp);
  }

  /** Supr sobre una fila pide eliminarla. */
  protected alTeclear(idApp: string, evento: KeyboardEvent): void {
    if (evento.key !== 'Delete') return;
    evento.preventDefault();
    this.seleccionar(idApp);
    this.porEliminar.set('seleccionada');
  }

  protected restaurar(): void {
    const app = this.seleccionada();
    if (app) this.papeleraService.restaurar(app.id);
  }

  protected eliminar(): void {
    const ids =
      this.porEliminar() === 'todas'
        ? this.enPapelera().map(({ app }) => app.id)
        : [this.seleccionada()?.id ?? ''];
    this.papeleraService.eliminar(ids);
    this.porEliminar.set(null);
  }
}
