import {
  AfterContentInit,
  afterRenderEffect,
  Component,
  computed,
  contentChild,
  ElementRef,
  input,
  OnDestroy,
  signal,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { NgControl } from '@angular/forms';
import { mensajeDeValidacion } from '../../../core/utils/validacion.utils';
import { Icono } from '../icono/icono';

/**
 * Envoltorio de un campo de formulario reactivo: etiqueta, ayuda y mensaje de
 * error. Toma el control proyectado (el que tiene `formControlName`) y muestra
 * su primer error, o el error del grupo indicado en `errorDelGrupo`, una vez
 * que el usuario lo tocó o intentó enviar.
 */
@Component({
  selector: 'app-campo-formulario',
  imports: [Icono],
  templateUrl: './campo-formulario.html',
  styleUrl: './campo-formulario.css',
})
export class CampoFormulario implements AfterContentInit, OnDestroy {
  readonly etiqueta = input.required<string>();
  /** `id` del control que etiqueta. */
  readonly para = input.required<string>();
  readonly ayuda = input<string>();
  readonly opcional = input(false);
  /**
   * Clave de un error del `FormGroup` (de un validador que compara varios
   * campos) que también se muestra en este campo, por ejemplo `coincidencia`.
   */
  readonly errorDelGrupo = input<string>();

  private readonly control = contentChild.required(NgControl);
  private readonly elementoControl = contentChild.required(NgControl, { read: ElementRef });

  /** Los controles reactivos no son signals: cada evento del control (valor, estado, tocado) suma uno. */
  private readonly cambios = signal(0);

  protected readonly idError = computed(() => `${this.para()}-error`);
  protected readonly idAyuda = computed(() => `${this.para()}-ayuda`);

  protected readonly mensajeError = computed(() => {
    this.cambios();
    const { touched, errors, control } = this.control();
    if (!touched) return null;
    if (errors) return mensajeDeValidacion(errors);
    const clave = this.errorDelGrupo();
    const errorDelGrupo = clave ? control?.parent?.errors?.[clave] : null;
    return clave && errorDelGrupo ? mensajeDeValidacion({ [clave]: errorDelGrupo }) : null;
  });

  private eventosDelControl?: Subscription;

  /**
   * El control es contenido proyectado: se le asocian la ayuda y el error
   * para que los lectores de pantalla los anuncien al enfocarlo. En los
   * controles propios (contraseña, imagen) se marca el input que tienen adentro.
   */
  private readonly describirControl = afterRenderEffect(() => {
    const anfitrion: HTMLElement = this.elementoControl().nativeElement;
    const elemento = anfitrion.querySelector('input, textarea, select') ?? anfitrion;
    const descripciones = [
      this.ayuda() ? this.idAyuda() : null,
      this.mensajeError() ? this.idError() : null,
    ].filter((id) => id !== null);

    elemento.setAttribute('aria-invalid', String(this.mensajeError() !== null));
    if (descripciones.length > 0) {
      elemento.setAttribute('aria-describedby', descripciones.join(' '));
    } else {
      elemento.removeAttribute('aria-describedby');
    }
  });

  /**
   * El control proyectado recién está disponible cuando se inicializa el contenido.
   * Se escuchan los eventos del grupo, que incluyen los de este control y los
   * de los validadores que comparan varios campos.
   */
  ngAfterContentInit(): void {
    const control = this.control().control;
    this.eventosDelControl = (control?.parent ?? control)?.events.subscribe(() =>
      this.cambios.update((cantidad) => cantidad + 1),
    );
  }

  ngOnDestroy(): void {
    this.eventosDelControl?.unsubscribe();
  }
}
