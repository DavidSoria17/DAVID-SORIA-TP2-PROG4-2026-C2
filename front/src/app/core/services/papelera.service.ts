import { computed, Service, signal } from '@angular/core';
import { AppEscritorio, AppQuitada } from '../models/interfaz.model';
import { esRegistroDe, guardar, leerGuardado } from '../utils/almacenamiento.utils';

const CLAVE_QUITADAS = 'apps-quitadas';

const esAppQuitada = (valor: unknown): valor is AppQuitada => {
  if (typeof valor !== 'object' || valor === null) return false;
  const { estado, fecha } = valor as Record<string, unknown>;
  return (estado === 'papelera' || estado === 'eliminada') && typeof fecha === 'number';
};

/**
 * Apps que se sacaron del escritorio. Una app tirada queda en la papelera,
 * de donde se restaura o se elimina definitivamente; una eliminada solo
 * vuelve con el Reboot, que restaura la copia del escritorio de antes de
 * sacar la primera. Se guarda en el navegador, así que vale para cualquier
 * sesión que se abra en él.
 */
@Service()
export class PapeleraService {
  /** Estado por id de app. El orden de las claves es el orden en que se tiraron. */
  private readonly quitadas = signal<Record<string, AppQuitada>>(
    leerGuardado(CLAVE_QUITADAS, (valor) => esRegistroDe(valor, esAppQuitada), {}),
  );

  /** Apps en la papelera con la fecha en que se tiraron, de la primera a la última. */
  readonly enPapelera = computed(() =>
    Object.entries(this.quitadas())
      .filter(([, { estado }]) => estado === 'papelera')
      .map(([id, { fecha }]) => ({ id, borrada: new Date(fecha) })),
  );

  /** Ids de las apps fuera del escritorio, en la papelera o eliminadas. */
  readonly faltantes = computed(() => Object.keys(this.quitadas()));

  /**
   * Momento de la copia que restaura el Reboot: el escritorio de justo antes
   * de sacar la primera app que falta. `null` si no falta ninguna.
   */
  readonly copia = computed(() => {
    const fechas = Object.values(this.quitadas()).map(({ fecha }) => fecha);
    return fechas.length > 0 ? new Date(Math.min(...fechas)) : null;
  });

  /** Si la app está en el escritorio (no se tiró ni se eliminó). */
  estaInstalada(idApp: string): boolean {
    return !(idApp in this.quitadas());
  }

  /**
   * Manda una app a la papelera. La papelera misma no se puede tirar.
   * @returns `false` si no se movió (es la papelera o ya estaba afuera)
   */
  tirar(app: AppEscritorio): boolean {
    if (app.esPapelera || !this.estaInstalada(app.id)) return false;
    this.actualizar((quitadas) => ({
      ...quitadas,
      [app.id]: { estado: 'papelera', fecha: Date.now() },
    }));
    return true;
  }

  /** Devuelve una app de la papelera al escritorio. */
  restaurar(idApp: string): void {
    if (this.quitadas()[idApp]?.estado !== 'papelera') return;
    this.actualizar((quitadas) =>
      Object.fromEntries(Object.entries(quitadas).filter(([id]) => id !== idApp)),
    );
  }

  /** Elimina definitivamente apps que están en la papelera: desaparecen también de ahí. */
  eliminar(idsApps: readonly string[]): void {
    this.actualizar((quitadas) =>
      Object.fromEntries(
        Object.entries(quitadas).map(([id, quitada]) => [
          id,
          idsApps.includes(id) ? { ...quitada, estado: 'eliminada' } : quitada,
        ]),
      ),
    );
  }

  /** Reboot: vuelven al escritorio todas las apps que falten, estén en la papelera o eliminadas. */
  reiniciar(): void {
    this.actualizar(() => ({}));
  }

  private actualizar(
    cambio: (quitadas: Record<string, AppQuitada>) => Record<string, AppQuitada>,
  ): void {
    this.quitadas.update(cambio);
    guardar(CLAVE_QUITADAS, this.quitadas());
  }
}
