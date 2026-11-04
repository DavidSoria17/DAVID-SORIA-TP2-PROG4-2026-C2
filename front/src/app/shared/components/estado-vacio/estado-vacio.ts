import { Component, input } from '@angular/core';

/**
 * Cartel para cuando una sección no tiene nada que mostrar. Lo que lleve el
 * atributo `icono` va arriba del título; las acciones se proyectan debajo del texto.
 */
@Component({
  selector: 'app-estado-vacio',
  templateUrl: './estado-vacio.html',
  styleUrl: './estado-vacio.css',
})
export class EstadoVacio {
  readonly titulo = input.required<string>();
  readonly texto = input<string>();
}
