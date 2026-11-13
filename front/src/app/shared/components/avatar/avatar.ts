import { Component, computed, input, linkedSignal } from '@angular/core';
import { TamanoAvatar } from '../../../core/models/interfaz.model';
import { ImagenRespaldoDirective } from '../../directives/imagen-respaldo/imagen-respaldo';
import { ArrobaPipe } from '../../pipes/arroba/arroba';
import { Icono } from '../icono/icono';

const ESCALA_SILUETA: Record<TamanoAvatar, number> = { chico: 1, normal: 2, grande: 6, xl: 8 };

/**
 * Foto de perfil cuadrada. Sin foto, o si la foto no carga, muestra un avatar
 * genérico con la inicial del usuario.
 */
@Component({
  selector: 'app-avatar',
  imports: [ArrobaPipe, Icono, ImagenRespaldoDirective],
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
  host: {
    '[class]': "'avatar--' + tamano()",
    '[class.avatar--defecto]': '!mostrarFoto()',
  },
})
export class Avatar {
  readonly nombreUsuario = input.required<string>();
  readonly urlImagen = input<string>();
  readonly tamano = input<TamanoAvatar>('normal');

  /** Si la foto actual no cargó; vuelve a `false` cuando cambia la URL. */
  protected readonly fotoRota = linkedSignal({ source: this.urlImagen, computation: () => false });
  protected readonly mostrarFoto = computed(() => !!this.urlImagen() && !this.fotoRota());

  protected readonly inicial = computed(() => this.nombreUsuario().charAt(0).toUpperCase());
  protected readonly escalaSilueta = computed(() => ESCALA_SILUETA[this.tamano()]);
}
