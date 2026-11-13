import { Component, input, model } from '@angular/core';
import { NombreIcono } from '../../../core/models/icono.model';
import { Icono } from '../icono/icono';

/**
 * Ventanita interna de un gráfico: cabecera con título y el botón «Ver como
 * tabla», subtítulo, cuerpo (el gráfico proyectado) y pie (lo que lleve el
 * atributo `pie`). El gráfico lee `comoTabla` para mostrarse como tabla.
 */
@Component({
  selector: 'app-panel-grafico',
  imports: [Icono],
  templateUrl: './panel-grafico.html',
  styleUrl: './panel-grafico.css',
})
export class PanelGrafico {
  readonly titulo = input.required<string>();
  readonly icono = input.required<NombreIcono>();
  readonly subtitulo = input('');
  readonly comoTabla = model(false);
}
