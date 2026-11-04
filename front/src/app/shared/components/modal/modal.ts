import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  input,
  OnDestroy,
  output,
  viewChild,
} from '@angular/core';
import { NombreIcono } from '../../../core/models/icono.model';
import { TipoAviso } from '../../../core/models/interfaz.model';
import { Icono } from '../icono/icono';
import { Ventana } from '../ventana/ventana';

const ICONO_POR_TIPO: Record<TipoAviso, NombreIcono> = {
  info: 'info',
  exito: 'ok',
  alerta: 'escAlerta',
  peligro: 'escError',
};

/**
 * Cuadro de diálogo modal con forma de ventana. Usa `<dialog>` nativo, que
 * bloquea el resto de la página y mantiene el foco adentro. Lo que lleve el
 * atributo `detalle` se proyecta debajo del texto; el resto son los botones,
 * y el que tenga `autofocus` recibe el foco al abrir. Si no es
 * `cerrable`, Esc no lo cierra y no muestra la ×.
 */
@Component({
  selector: 'app-modal',
  imports: [Icono, Ventana],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal implements AfterViewInit, OnDestroy {
  readonly tituloVentana = input('sistema.msg');
  readonly encabezado = input.required<string>();
  readonly texto = input<string>();
  readonly tipo = input<TipoAviso>('info');
  readonly cerrable = input(true);
  readonly cerrar = output<void>();

  protected readonly icono = computed(() => ICONO_POR_TIPO[this.tipo()]);
  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  /** El `<dialog>` recién existe cuando la vista está creada. */
  ngAfterViewInit(): void {
    this.dialogo().nativeElement.showModal();
  }

  ngOnDestroy(): void {
    this.dialogo().nativeElement.close();
  }

  /** Esc dispara `cancel`: se cierra por el flujo normal o se ignora si no es cerrable. */
  protected alCancelar(evento: Event): void {
    evento.preventDefault();
    if (this.cerrable()) this.cerrar.emit();
  }
}
