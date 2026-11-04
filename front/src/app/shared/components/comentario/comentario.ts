import { Component, input } from '@angular/core';
import { Comentario as DatosComentario } from '../../../core/models/comentario.model';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo/tiempo-relativo';
import { Avatar } from '../avatar/avatar';
import { Icono } from '../icono/icono';

/** Un comentario: avatar, autor, fecha, marca de editado y mensaje. Va dentro de una lista `ul`. */
@Component({
  selector: 'app-comentario',
  imports: [Avatar, Icono, TiempoRelativoPipe],
  templateUrl: './comentario.html',
  styleUrl: './comentario.css',
  host: { role: 'listitem' },
})
export class Comentario {
  readonly comentario = input.required<DatosComentario>();
}
