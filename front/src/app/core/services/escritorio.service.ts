import { computed, effect, inject, Service, signal, untracked } from '@angular/core';
import {
  AccesoApp,
  AppEnPapelera,
  AppEscritorio,
  Celda,
  Grilla,
  IconoUbicado,
} from '../models/interfaz.model';
import { Usuario } from '../models/usuario.model';
import { esRegistroDe, guardar, leerGuardado } from '../utils/almacenamiento.utils';
import { APPS_ESCRITORIO, ORDEN_INICIAL_LUGARES } from '../utils/escritorio.constants';
import {
  ajustarAGrilla,
  celdaDeIndice,
  celdaLibreMasCercana,
  claveCelda,
  esCelda,
  estaEnGrilla,
  ubicarIconos,
} from '../utils/grilla.utils';
import { AuthService } from './auth.service';
import { PantallaService } from './pantalla.service';
import { PapeleraService } from './papelera.service';

const CLAVE_UBICACIONES = 'ubicaciones-iconos';

/**
 * Estado del escritorio: qué apps hay según la sesión y la papelera, y en qué
 * casillero está cada ícono.
 *
 * Las posiciones se guardan por `lugar`, no por app, así Cerrar sesión aparece
 * donde estaba Iniciar sesión. Se recuerda la celda que eligió el usuario
 * aunque hoy no entre en la pantalla: si la ventana del navegador se achica,
 * el ícono se acomoda al borde, y cuando se agranda vuelve a su lugar.
 */
@Service()
export class EscritorioService {
  private readonly authService = inject(AuthService);
  private readonly papeleraService = inject(PapeleraService);
  private readonly esCelular = inject(PantallaService).esCelular;

  /** Celda elegida para cada lugar. Las claves van de la más vieja a la más reciente. */
  private readonly preferidas = signal<Record<string, Celda>>(
    leerGuardado(CLAVE_UBICACIONES, (valor) => esRegistroDe(valor, esCelda), {}),
  );
  private readonly grillaMedida = signal<Grilla | null>(null);

  /** En celular los íconos van en una grilla fija, sin casilleros. */
  private readonly grilla = computed(() => (this.esCelular() ? null : this.grillaMedida()));

  /** Apps que corresponden a la sesión actual, estén o no en el escritorio. */
  private readonly appsDeSesion = computed(() => {
    const usuario = this.authService.usuario();
    return APPS_ESCRITORIO.filter((app) => this.corresponde(app.acceso, usuario));
  });

  /** Apps con ícono en el escritorio: las de la sesión que no se tiraron ni se eliminaron. */
  readonly apps = computed(() =>
    this.appsDeSesion().filter((app) => this.papeleraService.estaInstalada(app.id)),
  );

  /**
   * Apps en la papelera, en el orden en que se tiraron. Están todas, sean de
   * la sesión actual o no: una restaurada vuelve cuando su sesión corresponda.
   */
  readonly enPapelera = computed<AppEnPapelera[]>(() =>
    this.papeleraService.enPapelera().flatMap(({ id, borrada }) => {
      const app = this.appDeId(id);
      return app ? [{ app, borrada }] : [];
    }),
  );

  /** Apps que devuelve el Reboot: las de la papelera y las eliminadas. */
  readonly faltantes = computed(() =>
    this.papeleraService.faltantes().flatMap((id) => this.appDeId(id) ?? []),
  );

  /**
   * Íconos con su casillero. Ante dos que quieren el mismo, gana el que se
   * movió más recientemente; los que nunca se movieron van últimos.
   */
  readonly iconos = computed<IconoUbicado[]>(() => {
    const apps = this.apps();
    const grilla = this.grilla();
    if (!grilla) return apps.map((app) => ({ app, celda: null }));

    const preferidas = this.preferidas();
    const recientes = Object.keys(preferidas);
    const prioridad = (app: AppEscritorio) => recientes.indexOf(app.lugar);
    const pedidos = [...apps]
      .sort((una, otra) => prioridad(otra) - prioridad(una))
      .map((app) => ({
        id: app.id,
        preferida: preferidas[app.lugar] ?? null,
        inicial: celdaDeIndice(ORDEN_INICIAL_LUGARES.indexOf(app.lugar), grilla),
      }));

    const ubicadas = ubicarIconos(pedidos, grilla);
    return apps.map((app) => ({ app, celda: ubicadas.get(app.id) ?? null }));
  });

  /**
   * Fija como preferida la celda en la que quedó cada ícono que no tenía una
   * o que perdió la suya contra otro (una app restaurada cuyo casillero ya
   * estaba ocupado, o la que aparece al iniciar sesión). Así ningún ícono
   * salta de lugar cuando aparece o desaparece otro. Las preferidas que hoy
   * no entran en la grilla no se tocan.
   */
  private readonly fijarUbicaciones = effect(() => {
    const grilla = this.grilla();
    const iconos = this.iconos();
    if (!grilla) return;
    untracked(() => {
      const preferidas = this.preferidas();
      const nuevas: Record<string, Celda> = {};
      for (const { app, celda } of iconos) {
        if (!celda || !estaEnGrilla(celda, grilla)) continue;
        const preferida = preferidas[app.lugar];
        const conservar =
          preferida &&
          (!estaEnGrilla(preferida, grilla) || claveCelda(preferida) === claveCelda(celda));
        if (!conservar) nuevas[app.lugar] = celda;
      }
      if (Object.keys(nuevas).length > 0) this.guardarPreferidas(nuevas);
    });
  });

  /** App del escritorio que abre una ruta, o `undefined` si la ruta no es de ninguna. */
  appDeRuta(ruta: string): AppEscritorio | undefined {
    return APPS_ESCRITORIO.find((app) => app.ruta === ruta);
  }

  private appDeId(id: string): AppEscritorio | undefined {
    return APPS_ESCRITORIO.find((app) => app.id === id);
  }

  /** Informa cuántos casilleros entran en el escritorio (cambia con el tamaño de la pantalla). */
  actualizarGrilla(grilla: Grilla): void {
    const actual = this.grillaMedida();
    if (actual?.columnas !== grilla.columnas || actual.filas !== grilla.filas) {
      this.grillaMedida.set(grilla);
    }
  }

  /**
   * Mueve un ícono a un casillero. Si estaba ocupado, el que estaba ahí se
   * corre al casillero libre más cercano, como en el escritorio de Windows.
   */
  moverIcono(app: AppEscritorio, destino: Celda): void {
    const grilla = this.grilla();
    if (!grilla) return;
    const celdaDestino = ajustarAGrilla(destino, grilla);
    const iconos = this.iconos();
    const ocupante = iconos.find(
      ({ app: otra, celda }) =>
        otra.id !== app.id && celda && claveCelda(celda) === claveCelda(celdaDestino),
    );

    const nuevas: Record<string, Celda> = {};
    if (ocupante) {
      const ocupadas = new Set(
        iconos
          .filter(({ app: otra }) => otra.id !== app.id && otra.id !== ocupante.app.id)
          .flatMap(({ celda }) => (celda ? [claveCelda(celda)] : [])),
      );
      ocupadas.add(claveCelda(celdaDestino));
      nuevas[ocupante.app.lugar] = celdaLibreMasCercana(celdaDestino, ocupadas, grilla);
    }
    nuevas[app.lugar] = celdaDestino;
    this.guardarPreferidas(nuevas);
  }

  private corresponde(acceso: AccesoApp, usuario: Usuario | null): boolean {
    switch (acceso) {
      case 'siempre':
        return true;
      case 'sin-sesion':
        return usuario === null;
      case 'con-sesion':
        return usuario !== null;
      case 'administrador':
        return usuario?.perfil === 'administrador';
    }
  }

  /** Guarda celdas preferidas; las que se pasan quedan como las más recientes. */
  private guardarPreferidas(nuevas: Record<string, Celda>): void {
    this.preferidas.update((preferidas) => ({
      ...Object.fromEntries(Object.entries(preferidas).filter(([lugar]) => !(lugar in nuevas))),
      ...nuevas,
    }));
    guardar(CLAVE_UBICACIONES, this.preferidas());
  }
}
