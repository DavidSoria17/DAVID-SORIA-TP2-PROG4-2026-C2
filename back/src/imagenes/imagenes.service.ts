import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

export interface ImagenSubida {
  url: string;
  idPublico: string;
}

@Injectable()
export class ImagenesService {
  constructor(config: ConfigService) {
    cloudinary.config({
      cloud_name: config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  /**
   * Sube a Cloudinary una imagen recibida en memoria.
   * @param archivo archivo de multer con el contenido en `buffer`
   * @param carpeta carpeta de Cloudinary donde se guarda
   * @returns la URL pública (https) y el id con el que se puede borrar
   */
  subir(archivo: Express.Multer.File, carpeta: string): Promise<ImagenSubida> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: `red-social/${carpeta}`, resource_type: 'image' },
          (error, resultado?: UploadApiResponse) => {
            if (error || !resultado) {
              reject(
                new Error(error?.message ?? 'Cloudinary no devolvió resultado'),
              );
              return;
            }
            resolve({
              url: resultado.secure_url,
              idPublico: resultado.public_id,
            });
          },
        )
        .end(archivo.buffer);
    });
  }

  /**
   * Borra una imagen de Cloudinary. Se usa para no dejar imágenes huérfanas
   * cuando falla el guardado del documento que la referenciaba.
   */
  async eliminar(idPublico: string): Promise<void> {
    await cloudinary.uploader.destroy(idPublico);
  }
}
