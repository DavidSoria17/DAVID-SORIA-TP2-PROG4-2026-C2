import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { NombreIcono } from '../../../core/models/icono.model';
import { LineaArranque } from '../../../core/models/interfaz.model';
import { Icono } from '../icono/icono';

/**
 * Pantalla de arranque del sistema: tapa todo con el fondo azul, el nombre
 * en grande (con el ícono indicado o, sin ícono, el logo de Windose), un
 * registro de pasos ([ OK ] o [ .. ]) y una barra de progreso de 0 a 100. Lo
 * proyectado va debajo de la barra.
 */
@Component({
  selector: 'app-arranque',
  imports: [Icono, NgOptimizedImage],
  templateUrl: './arranque.html',
  styleUrl: './arranque.css',
  host: {
    role: 'status',
    'aria-live': 'polite',
  },
})
export class Arranque {
  readonly titulo = input.required<string>();
  readonly icono = input<NombreIcono>();
  readonly subtitulo = input('');
  readonly lineas = input<readonly LineaArranque[]>([]);
  readonly etiquetaProgreso = input('');
  readonly progreso = input(0);
}
