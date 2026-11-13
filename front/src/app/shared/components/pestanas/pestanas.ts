import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PestanaVentana } from '../../../core/models/interfaz.model';
import { Icono } from '../icono/icono';

/** Pestañas de una ventana con varias secciones. Cada una navega a su pantalla; la activa queda al frente. */
@Component({
  selector: 'app-pestanas',
  imports: [Icono, RouterLink, RouterLinkActive],
  templateUrl: './pestanas.html',
  styleUrl: './pestanas.css',
})
export class Pestanas {
  readonly pestanas = input.required<readonly PestanaVentana[]>();
  /** Nombre del grupo para los lectores de pantalla. */
  readonly etiqueta = input.required<string>();
}
