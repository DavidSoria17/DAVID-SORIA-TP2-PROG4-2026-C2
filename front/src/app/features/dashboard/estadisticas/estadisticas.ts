import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DatoGrafico,
  LapsoRapido,
  RangoFechas,
  ResumenEstadisticas,
} from '../../../core/models/estadistica.model';
import {
  LAPSO_INICIAL,
  LAPSOS_RAPIDOS,
  PESTANAS_DASHBOARD,
} from '../../../core/utils/dashboard.constants';
import { mensajeDeError } from '../../../core/utils/errores.utils';
import {
  diasDelLapso,
  fechaIsoATexto,
  fechaIsoCorta,
  hoyComoFechaIso,
  lapsoRapido,
  listarDias,
  textoAFechaIso,
} from '../../../core/utils/fechas.utils';
import { cantidadCon, conArroba, conUnDecimal } from '../../../core/utils/formato.utils';
import { totalDe } from '../../../core/utils/graficos.utils';
import { sumar } from '../../../core/utils/numeros.utils';
import { fechaValida, rangoDeFechas } from '../../../core/validators/formularios.validators';
import { Aviso } from '../../../shared/components/aviso/aviso';
import { CampoFormulario } from '../../../shared/components/campo-formulario/campo-formulario';
import { GraficoBarras } from '../../../shared/components/grafico-barras/grafico-barras';
import { GraficoLineas } from '../../../shared/components/grafico-lineas/grafico-lineas';
import { GraficoTorta } from '../../../shared/components/grafico-torta/grafico-torta';
import { Icono } from '../../../shared/components/icono/icono';
import { PanelGrafico } from '../../../shared/components/panel-grafico/panel-grafico';
import { Pestanas } from '../../../shared/components/pestanas/pestanas';
import { FechaMaskDirective } from '../../../shared/directives/fecha-mask/fecha-mask';
import { EstadisticasService } from '../services/estadisticas.service';

/** Diferencia con el lapso anterior: «▲ 12», «▼ 3» o «= 0». */
const variacion = (actual: number, anterior: number) => {
  const diferencia = actual - anterior;
  if (diferencia === 0) return { texto: '= 0', baja: false };
  return { texto: `${diferencia > 0 ? '▲' : '▼'} ${Math.abs(diferencia)}`, baja: diferencia < 0 };
};

/**
 * Dashboard › Estadísticas: para el lapso elegido (con un atajo o con las
 * dos fechas), las cifras del período comparadas con el anterior del mismo
 * largo y tres gráficos: publicaciones por usuario (barras), comentarios por
 * publicación (torta) y comentarios por día (líneas). Cada gráfico se puede
 * ver como tabla.
 */
@Component({
  selector: 'app-estadisticas',
  imports: [
    Aviso,
    CampoFormulario,
    FechaMaskDirective,
    GraficoBarras,
    GraficoLineas,
    GraficoTorta,
    Icono,
    PanelGrafico,
    Pestanas,
    ReactiveFormsModule,
  ],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
  host: { class: 'pantalla-con-secciones' },
})
export class Estadisticas implements OnInit {
  private readonly estadisticasService = inject(EstadisticasService);

  protected readonly pestanas = PESTANAS_DASHBOARD;
  protected readonly lapsos = LAPSOS_RAPIDOS;

  protected readonly filtro = new FormGroup(
    {
      desde: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, fechaValida()],
      }),
      hasta: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, fechaValida()],
      }),
    },
    { validators: [rangoDeFechas('desde', 'hasta')] },
  );

  /** Lapso que muestran las cifras y los gráficos. */
  protected readonly rango = signal<RangoFechas>(lapsoRapido(LAPSO_INICIAL, hoyComoFechaIso()));
  protected readonly resumen = signal<ResumenEstadisticas | null>(null);
  protected readonly error = signal<string | null>(null);

  /** Número del último pedido: si llega la respuesta de uno anterior, se descarta. */
  private ultimoPedido = 0;

  /** Atajo que coincide con el lapso aplicado, si hay alguno. */
  protected readonly lapsoActivo = computed(() => {
    const { desde, hasta } = this.rango();
    const hoy = hoyComoFechaIso();
    return this.lapsos.find(({ lapso }) => {
      const candidato = lapsoRapido(lapso, hoy);
      return candidato.desde === desde && candidato.hasta === hasta;
    })?.lapso;
  });

  protected readonly dias = computed(() => diasDelLapso(this.rango()));

  /** «28/09 al 27/10», para los subtítulos de los gráficos. */
  protected readonly lapsoCorto = computed(() => {
    const { desde, hasta } = this.rango();
    return `${fechaIsoATexto(desde).slice(0, 5)} al ${fechaIsoATexto(hasta).slice(0, 5)}`;
  });

  protected readonly lapsoCompleto = computed(() => {
    const { desde, hasta } = this.rango();
    return `del ${fechaIsoATexto(desde)} al ${fechaIsoATexto(hasta)}`;
  });

  protected readonly cifras = computed(() => {
    const resumen = this.resumen();
    if (!resumen) return null;
    const publicaciones = sumar(resumen.publicacionesPorUsuario.map(({ cantidad }) => cantidad));
    const comentarios = sumar(resumen.comentariosPorDia.map(({ cantidad }) => cantidad));
    return {
      publicaciones,
      comentarios,
      autores: resumen.publicacionesPorUsuario.length,
      registrados: resumen.usuariosRegistrados,
      variacionPublicaciones: variacion(publicaciones, resumen.anterior.publicaciones),
      variacionComentarios: variacion(comentarios, resumen.anterior.comentarios),
      promedioComentarios: conUnDecimal(comentarios / this.dias()),
    };
  });

  protected readonly barras = computed<DatoGrafico[]>(() =>
    (this.resumen()?.publicacionesPorUsuario ?? []).map(({ nombreUsuario, cantidad }) => ({
      etiqueta: conArroba(nombreUsuario),
      valor: cantidad,
    })),
  );

  protected readonly porciones = computed<DatoGrafico[]>(() =>
    (this.resumen()?.comentariosPorPublicacion ?? []).map(({ titulo, cantidad }) => ({
      etiqueta: titulo,
      valor: cantidad,
    })),
  );

  /** Comentarios de las publicaciones que no entran en la torta con nombre propio. */
  protected readonly otras = computed<DatoGrafico>(() => ({
    etiqueta: 'Otras publicaciones',
    valor: (this.cifras()?.comentarios ?? 0) - totalDe(this.porciones()),
  }));

  /** Un punto por día del lapso, con cero en los días sin comentarios. */
  protected readonly lineas = computed<DatoGrafico[]>(() => {
    const porDia = new Map(
      (this.resumen()?.comentariosPorDia ?? []).map(({ fecha, cantidad }) => [fecha, cantidad]),
    );
    return listarDias(this.rango()).map((dia) => ({
      etiqueta: fechaIsoATexto(dia),
      etiquetaCorta: fechaIsoCorta(dia),
      valor: porDia.get(dia) ?? 0,
    }));
  });

  protected readonly cantidadCon = cantidadCon;

  ngOnInit(): void {
    this.mostrarRangoEnFiltro();
    void this.cargar();
  }

  protected async elegirLapso(lapso: LapsoRapido): Promise<void> {
    this.rango.set(lapsoRapido(lapso, hoyComoFechaIso()));
    this.mostrarRangoEnFiltro();
    await this.cargar();
  }

  protected async aplicar(): Promise<void> {
    if (this.filtro.invalid) {
      this.filtro.markAllAsTouched();
      return;
    }
    const { desde, hasta } = this.filtro.getRawValue();
    this.rango.set({ desde: textoAFechaIso(desde) ?? '', hasta: textoAFechaIso(hasta) ?? '' });
    await this.cargar();
  }

  private mostrarRangoEnFiltro(): void {
    const { desde, hasta } = this.rango();
    this.filtro.setValue({ desde: fechaIsoATexto(desde), hasta: fechaIsoATexto(hasta) });
  }

  private async cargar(): Promise<void> {
    const pedido = ++this.ultimoPedido;
    try {
      const resumen = await this.estadisticasService.resumen(this.rango());
      if (pedido !== this.ultimoPedido) return;
      this.resumen.set(resumen);
      this.error.set(null);
    } catch (error) {
      if (pedido === this.ultimoPedido) this.error.set(mensajeDeError(error));
    }
  }
}
