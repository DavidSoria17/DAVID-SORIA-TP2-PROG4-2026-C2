import { Directive, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { aplicarMascaraFecha } from '../../../core/utils/fechas.utils';

/**
 * Máscara DD/MM/AAAA para un input de texto: agrega las barras, mantiene el cursor
 * y acepta pegar. Se usa en vez de un date picker.
 */
@Directive({
  selector: 'input[appFechaMask]',
  host: {
    inputmode: 'numeric',
    maxlength: '10',
    '(input)': 'alEscribir($event)',
  },
})
export class FechaMaskDirective {
  // opcional: la directiva también sirve en un input sin formulario reactivo.
  private readonly ngControl = inject(NgControl, { optional: true });

  alEscribir(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const borrando = (evento as InputEvent).inputType === 'deleteContentBackward';
    // Cuántos dígitos había antes del cursor: es la posición "real",
    // la que no se corre cuando la máscara agrega o saca una barra.
    const posicion = input.selectionStart ?? input.value.length;
    const digitosAntes = input.value.slice(0, posicion).replace(/\D/g, '').length;

    let formateado = aplicarMascaraFecha(input.value);
    // Si venía de borrar y quedó una barra colgando, se va con el dígito.
    if (borrando && formateado.endsWith('/')) formateado = formateado.slice(0, -1);
    if (formateado === input.value) return;

    input.value = formateado;
    let indice = 0;
    for (let vistos = 0; indice < formateado.length && vistos < digitosAntes; indice++) {
      if (/\d/.test(formateado[indice])) vistos++;
    }
    input.setSelectionRange(indice, indice);
    this.ngControl?.control?.setValue(formateado);
  }
}
