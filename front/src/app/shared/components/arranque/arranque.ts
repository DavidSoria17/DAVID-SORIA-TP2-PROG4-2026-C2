import { Component, input } from '@angular/core';
import { NombreIcono } from '../../../core/models/icono.model';
import { LineaArranque } from '../../../core/models/interfaz.model';
import { Icono } from '../icono/icono';

/**
 * Pantalla de arranque del sistema: tapa todo con el fondo azul, el nombre
 * en grande, un registro de pasos ([ OK ] o [ .. ]) y una barra de progreso
 * de 0 a 100.
 */
@Component({
  selector: 'app-arranque',
  imports: [Icono],
  templateUrl: './arranque.html',
  styleUrl: './arranque.css',
  host: {
    role: 'status',
    'aria-live': 'polite',
  },
})
export class Arranque {
  readonly titulo = input.required<string>();
  readonly icono = input.required<NombreIcono>();
  readonly subtitulo = input('');
  readonly lineas = input<readonly LineaArranque[]>([]);
  readonly etiquetaProgreso = input('');
  readonly progreso = input(0);
}
