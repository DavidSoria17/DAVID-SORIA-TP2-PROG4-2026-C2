import { DatePipe } from '@angular/common';
import { Component, input, linkedSignal, output, signal } from '@angular/core';
import { Publicacion } from '../../../core/models/publicacion.model';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo/tiempo-relativo';
import { Avatar } from '../avatar/avatar';
import { Icono } from '../icono/icono';
import { Modal } from '../modal/modal';

/**
 * Tarjeta de una publicación: autor, fecha, título, mensaje, imagen, me gusta
 * y cantidad de comentarios. Las propias llevan borde grueso y, si son
 * `eliminable`, un botón de borrar que pide confirmación. Lo proyectado
 * (por ejemplo, los comentarios) va al final de la tarjeta.
 */
@Component({
  selector: 'app-publicacion-card',
  imports: [Avatar, DatePipe, Icono, Modal, TiempoRelativoPipe],
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.css',
})
export class PublicacionCard {
  readonly publicacion = input.required<Publicacion>();
  readonly propia = input(false);
  readonly eliminable = input(false);
  /** Versión más chica, sin sombra, para listas dentro de otra pantalla. */
  readonly compacta = input(false);

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
