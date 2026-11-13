import { DatePipe } from '@angular/common';
import { Component, input, linkedSignal, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Publicacion } from '../../../core/models/publicacion.model';
import { ImagenRespaldoDirective } from '../../directives/imagen-respaldo/imagen-respaldo';
import { AbreviarNumeroPipe } from '../../pipes/abreviar-numero/abreviar-numero';
import { ArrobaPipe } from '../../pipes/arroba/arroba';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo/tiempo-relativo';
import { Avatar } from '../avatar/avatar';
import { Icono } from '../icono/icono';
import { Modal } from '../modal/modal';

/**
 * Tarjeta de una publicación: autor, fecha, título, mensaje, imagen, me gusta
 * y cantidad de comentarios. Con `enlace`, el título y los comentarios abren
 * el detalle. Las propias llevan borde grueso. Si es `eliminable` (la propia,
 * o cualquiera para un administrador), tiene un botón de borrar que pide
 * confirmación. Lo proyectado
 * (por ejemplo, los comentarios) va al final de la tarjeta.
 */
@Component({
  selector: 'app-publicacion-card',
  imports: [
    AbreviarNumeroPipe,
    ArrobaPipe,
    Avatar,
    DatePipe,
    Icono,
    ImagenRespaldoDirective,
    Modal,
    RouterLink,
    TiempoRelativoPipe,
  ],
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.css',
})
export class PublicacionCard {
  readonly publicacion = input.required<Publicacion>();
  readonly propia = input(false);
  readonly eliminable = input(false);
  /** Versión más chica, sin sombra, para listas dentro de otra pantalla. */
  readonly compacta = input(false);
  /** Ruta del detalle: con valor, el título y los comentarios llevan ahí. */
  readonly enlace = input<string>();

  readonly alternarMeGusta = output<void>();
  readonly eliminar = output<void>();

  /**
   * Mientras espera la respuesta del me gusta, los clicks se ignoran para no
   * mandar dos pedidos. Se libera cuando llega la publicación actualizada (o
   * la misma, si falló).
   */
  protected readonly esperandoMeGusta = linkedSignal({
    source: this.publicacion,
    computation: () => false,
  });
  protected readonly confirmando = signal(false);
  /** Si la imagen no cargó, la tarjeta se muestra sin ella. */
  protected readonly imagenRota = linkedSignal({
    source: () => this.publicacion().urlImagen,
    computation: () => false,
  });

  protected pedirMeGusta(): void {
    if (this.esperandoMeGusta()) return;
    this.esperandoMeGusta.set(true);
    this.alternarMeGusta.emit();
  }

  protected confirmarEliminacion(): void {
    this.confirmando.set(false);
    this.eliminar.emit();
  }
}
