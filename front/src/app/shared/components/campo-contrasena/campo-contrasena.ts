import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { REQUISITOS_CONTRASENA } from '../../../core/utils/contrasena.utils';
import { Icono } from '../icono/icono';

/**
 * Campo de contraseña con botón para mostrarla y, opcionalmente, la lista de
 * requisitos. Se usa con `formControlName` como cualquier input.
 */
@Component({
  selector: 'app-campo-contrasena',
  imports: [Icono],
  templateUrl: './campo-contrasena.html',
  styleUrl: './campo-contrasena.css',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CampoContrasena), multi: true },
  ],
})
export class CampoContrasena implements ControlValueAccessor {
  /** `id` del input, para asociarle la etiqueta. */
  readonly idControl = input.required<string>();
  readonly autocompletar = input<'current-password' | 'new-password'>('current-password');
  readonly mostrarRequisitos = input(false);

  protected readonly valor = signal('');
  protected readonly deshabilitado = signal(false);
  protected readonly visible = signal(false);

  protected readonly requisitos = computed(() =>
    REQUISITOS_CONTRASENA.map((requisito) => ({
      descripcion: requisito.descripcion,
      cumple: requisito.cumple(this.valor()),
    })),
  );

  private alCambiar: (valor: string) => void = () => undefined;
  private alTocar: () => void = () => undefined;

  writeValue(valor: string | null): void {
    this.valor.set(valor ?? '');
  }

  registerOnChange(funcion: (valor: string) => void): void {
    this.alCambiar = funcion;
  }

  registerOnTouched(funcion: () => void): void {
    this.alTocar = funcion;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado.set(deshabilitado);
  }

  protected escribir(valor: string): void {
    this.valor.set(valor);
    this.alCambiar(valor);
  }

  protected tocar(): void {
    this.alTocar();
  }
}
