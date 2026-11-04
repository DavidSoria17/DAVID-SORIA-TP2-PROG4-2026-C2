import { Component, computed, forwardRef, input, OnDestroy, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TIPOS_IMAGEN_PERMITIDOS } from '../../../core/utils/imagenes.constants';
import { formatearTamano } from '../../../core/utils/imagenes.utils';
import { Icono } from '../icono/icono';

/**
 * Selector de imagen con vista previa. Se usa con `formControlName`; el valor
 * es el archivo elegido o `null`.
 */
@Component({
  selector: 'app-campo-imagen',
  imports: [Icono],
  templateUrl: './campo-imagen.html',
  styleUrl: './campo-imagen.css',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CampoImagen), multi: true },
  ],
})
export class CampoImagen implements ControlValueAccessor, OnDestroy {
  /** `id` del input de archivo, para asociarle la etiqueta. */
  readonly idControl = input.required<string>();

  protected readonly tiposAceptados = TIPOS_IMAGEN_PERMITIDOS.join(',');
  protected readonly archivo = signal<File | null>(null);
  protected readonly vistaPrevia = signal<string | null>(null);

  protected readonly detalle = computed(() => {
    const archivo = this.archivo();
    return archivo ? `${archivo.name} · ${formatearTamano(archivo.size)}` : null;
  });

  private alCambiar: (archivo: File | null) => void = () => undefined;
  private alTocar: () => void = () => undefined;

  writeValue(archivo: File | null): void {
    this.mostrar(archivo);
  }

  registerOnChange(funcion: (archivo: File | null) => void): void {
    this.alCambiar = funcion;
  }

  registerOnTouched(funcion: () => void): void {
    this.alTocar = funcion;
  }

  protected elegir(selector: HTMLInputElement): void {
    this.cambiar(selector.files?.[0] ?? null);
  }

  protected quitar(selector: HTMLInputElement): void {
    selector.value = '';
    this.cambiar(null);
  }

  /** La URL temporal de la vista previa se libera al salir del formulario. */
  ngOnDestroy(): void {
    this.liberarVistaPrevia();
  }

  private cambiar(archivo: File | null): void {
    this.mostrar(archivo);
    this.alCambiar(archivo);
    this.alTocar();
  }

  /** Muestra el archivo y reemplaza la URL temporal de la vista previa, liberando la anterior. */
  private mostrar(archivo: File | null): void {
    this.liberarVistaPrevia();
    this.archivo.set(archivo);
    this.vistaPrevia.set(archivo ? URL.createObjectURL(archivo) : null);
  }

  private liberarVistaPrevia(): void {
    const url = this.vistaPrevia();
    if (url) URL.revokeObjectURL(url);
  }
}
