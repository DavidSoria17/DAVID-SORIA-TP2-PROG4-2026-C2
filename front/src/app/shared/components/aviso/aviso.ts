import { Component, computed, input, output } from '@angular/core';
import { NombreIcono } from '../../../core/models/icono.model';
import { TipoAviso } from '../../../core/models/interfaz.model';
import { Icono } from '../icono/icono';

const ICONO_POR_TIPO: Record<TipoAviso, NombreIcono> = {
  info: 'info',
  exito: 'ok',
  alerta: 'alerta',
  peligro: 'error',
};

/**
 * Mensaje del sistema con ícono según el tipo y botón para cerrarlo. Si tiene
 * `duracion`, una barra muestra cuánto falta para que se cierre solo.
 */
@Component({
  selector: 'app-aviso',
  imports: [Icono],
  templateUrl: './aviso.html',
  styleUrl: './aviso.css',
  host: {
    '[class]': "'aviso--' + tipo()",
    // Los errores y alertas se anuncian apenas aparecen; el resto, sin interrumpir.
    '[attr.role]': "tipo() === 'peligro' || tipo() === 'alerta' ? 'alert' : 'status'",
  },
})
export class Aviso {
  readonly tipo = input<TipoAviso>('info');
  readonly titulo = input.required<string>();
  readonly texto = input<string>();
  /** Milisegundos hasta que se cierra solo; sin valor, no muestra la barra de tiempo. */
  readonly duracion = input<number>();

  readonly cerrar = output<void>();

  protected readonly icono = computed(() => ICONO_POR_TIPO[this.tipo()]);
}
