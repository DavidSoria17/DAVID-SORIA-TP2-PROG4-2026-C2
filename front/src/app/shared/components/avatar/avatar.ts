import { Component, computed, input } from '@angular/core';
import { TamanoAvatar } from '../../../core/models/interfaz.model';
import { Icono } from '../icono/icono';

const ESCALA_SILUETA: Record<TamanoAvatar, number> = { chico: 1, normal: 2, grande: 6, xl: 8 };

/** Foto de perfil cuadrada; sin foto muestra un avatar genérico con la inicial del usuario. */
@Component({
  selector: 'app-avatar',
  imports: [Icono],
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
  host: {
    '[class]': "'avatar--' + tamano()",
    '[class.avatar--defecto]': '!urlImagen()',
  },
})
export class Avatar {
  readonly nombreUsuario = input.required<string>();
  readonly urlImagen = input<string>();
  readonly tamano = input<TamanoAvatar>('normal');

  protected readonly inicial = computed(() => this.nombreUsuario().charAt(0).toUpperCase());
  protected readonly escalaSilueta = computed(() => ESCALA_SILUETA[this.tamano()]);
}
