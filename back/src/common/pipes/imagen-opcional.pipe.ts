import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';

const TAMANO_MAXIMO_IMAGEN = 2 * 1024 * 1024;

/**
 * Valida la imagen opcional de un formulario multipart: JPG, PNG o WebP (por
 * su contenido, no solo por la extensión) de hasta 2 MB. Si no cumple, 400.
 */
export const validarImagenOpcional = (): ParseFilePipe =>
  new ParseFilePipe({
    fileIsRequired: false,
    validators: [
      new FileTypeValidator({
        fileType: /^image\/(jpeg|png|webp)$/,
        errorMessage: 'La imagen tiene que ser JPG, PNG o WebP',
      }),
      new MaxFileSizeValidator({
        maxSize: TAMANO_MAXIMO_IMAGEN,
        errorMessage: 'La imagen no puede superar los 2 MB',
      }),
    ],
  });
