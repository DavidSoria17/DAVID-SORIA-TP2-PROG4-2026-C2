import { Component, input } from '@angular/core';

/** Spinner pixel que gira en 8 pasos. Lo anuncia a los lectores de pantalla con su `etiqueta`. */
@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.html',
  styleUrl: './spinner.css',
  host: {
    role: 'status',
    '[attr.aria-label]': 'etiqueta()',
    '[class.grande]': "tamano() === 'grande'",
  },
})
export class Spinner {
  readonly tamano = input<'normal' | 'grande'>('normal');
  readonly etiqueta = input('Cargando');
}
