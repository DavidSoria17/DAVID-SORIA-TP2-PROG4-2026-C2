import { formatDate } from '@angular/common';
import { computed, inject, LOCALE_ID, Service, signal } from '@angular/core';
import { AppEscritorio, LineaArranque } from '../models/interfaz.model';
import { EscritorioService } from './escritorio.service';
import { PapeleraService } from './papelera.service';

/** Tiempo que tarda cada paso de la pantalla de arranque del Reboot. */
const PASO_REBOOT_MS = 700;

interface RebootEnCurso {
  copia: Date;
  apps: readonly AppEscritorio[];
  /** Pasos terminados: primero la copia, después una app por paso. */
  pasos: number;
}

/**
 * Reboot del sistema: vuelve a la copia del escritorio de antes de sacar la
 * primera app que falta. Si no falta ninguna, no hace nada. Mientras dura se
 * ve la pantalla de arranque, que encuentra la copia y restaura las apps de a
 * una; al terminar todas vuelven al escritorio. No toca la sesión, las
 * publicaciones ni la música.
 */
@Service()
export class RebootService {
  private readonly papeleraService = inject(PapeleraService);
  private readonly escritorioService = inject(EscritorioService);
  private readonly locale = inject(LOCALE_ID);

  private readonly enCurso = signal<RebootEnCurso | null>(null);
  private temporizador?: ReturnType<typeof setInterval>;

  readonly reiniciando = computed(() => this.enCurso() !== null);

  /** Registro de la pantalla de arranque: lo terminado con [ OK ] y el paso actual con [ .. ]. */
  readonly lineas = computed<LineaArranque[]>(() => {
    const reboot = this.enCurso();
    if (!reboot) return [];
    const fecha = formatDate(reboot.copia, 'dd/MM/yyyy HH:mm', this.locale);
    const lineas: LineaArranque[] = [
      reboot.pasos === 0
        ? { texto: `Buscando la copia del ${fecha}`, lista: false }
        : { texto: `Copia del ${fecha} encontrada`, lista: true },
    ];
    reboot.apps.slice(0, reboot.pasos).forEach((app, indice) => {
      const lista = indice + 2 <= reboot.pasos;
      lineas.push({
        texto: `${lista ? 'Restaurado' : 'Restaurando'} ${app.archivo}`,
        lista,
      });
    });
    return lineas;
  });

  /** Porcentaje de pasos terminados. */
  readonly progreso = computed(() => {
    const reboot = this.enCurso();
    return reboot ? Math.round((reboot.pasos / (reboot.apps.length + 1)) * 100) : 0;
  });

  readonly etiquetaProgreso = computed(() => {
    const reboot = this.enCurso();
    return reboot ? `Restaurando ${reboot.pasos} de ${reboot.apps.length + 1}…` : '';
  });

  /** Empieza el Reboot. Si no falta ninguna app o ya hay uno en curso, no hace nada. */
  iniciar(): void {
    const copia = this.papeleraService.copia();
    if (!copia || this.enCurso()) return;
    this.enCurso.set({ copia, apps: this.escritorioService.faltantes(), pasos: 0 });
    this.temporizador = setInterval(() => this.avanzar(), PASO_REBOOT_MS);
  }

  /** Termina un paso; después del último deja ver el 100 % un paso más y restaura. */
  private avanzar(): void {
    const reboot = this.enCurso();
    if (!reboot) return;
    if (reboot.pasos <= reboot.apps.length) {
      this.enCurso.set({ ...reboot, pasos: reboot.pasos + 1 });
      return;
    }
    clearInterval(this.temporizador);
    this.papeleraService.reiniciar();
    this.enCurso.set(null);
  }
}
