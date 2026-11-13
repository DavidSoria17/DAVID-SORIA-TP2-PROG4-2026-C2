import { Directive, output } from '@angular/core';

/**
 * Para imágenes que vienen de afuera (Cloudinary): si no cargan, avisa con
 * `sinImagen` para que el componente muestre su respaldo (la silueta del
 * avatar, nada en una publicación) en vez del ícono de imagen rota.
 */
@Directive({
  selector: 'img[appImagenRespaldo]',
  host: { '(error)': 'sinImagen.emit()' },
})
export class ImagenRespaldoDirective {
  readonly sinImagen = output<void>();
}
