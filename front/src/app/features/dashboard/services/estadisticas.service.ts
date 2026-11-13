import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ComentariosPorDia,
  ComentariosPorPublicacion,
  PublicacionesPorUsuario,
  RangoFechas,
  ResumenEstadisticas,
} from '../../../core/models/estadistica.model';
import { PUBLICACIONES_EN_TORTA } from '../../../core/utils/dashboard.constants';
import { lapsoAnterior } from '../../../core/utils/fechas.utils';
import { sumar } from '../../../core/utils/numeros.utils';
import { UsuariosService } from './usuarios.service';

/**
 * Estadísticas del panel de administración contra la API. Rechaza con el
 * `HttpErrorResponse` si algún pedido falla.
 */
@Service()
export class EstadisticasService {
  private readonly http = inject(HttpClient);
  private readonly usuariosService = inject(UsuariosService);
  private readonly url = `${environment.urlApi}/estadisticas`;

  /**
   * Todo lo que muestra la pantalla para un lapso: los datos de los tres
   * gráficos, los totales del lapso anterior del mismo largo (para comparar)
   * y cuántas cuentas hay registradas. Los pedidos salen en paralelo.
   */
  async resumen(rango: RangoFechas): Promise<ResumenEstadisticas> {
    const anterior = lapsoAnterior(rango);
    const [
      publicacionesPorUsuario,
      comentariosPorDia,
      comentariosPorPublicacion,
      publicacionesAnteriores,
      comentariosAnteriores,
      usuarios,
    ] = await Promise.all([
      this.publicacionesPorUsuario(rango),
      this.comentariosPorDia(rango),
      this.comentariosPorPublicacion(rango, PUBLICACIONES_EN_TORTA),
      this.publicacionesPorUsuario(anterior),
      this.comentariosPorDia(anterior),
      this.usuariosService.listar({ estado: null, offset: 0, limit: 1 }),
    ]);
    return {
      publicacionesPorUsuario,
      comentariosPorDia,
      comentariosPorPublicacion,
      anterior: {
        publicaciones: sumar(publicacionesAnteriores.map(({ cantidad }) => cantidad)),
        comentarios: sumar(comentariosAnteriores.map(({ cantidad }) => cantidad)),
      },
      usuariosRegistrados: usuarios.cantidades.todos,
    };
  }

  private publicacionesPorUsuario(rango: RangoFechas): Promise<PublicacionesPorUsuario[]> {
    return firstValueFrom(
      this.http.get<PublicacionesPorUsuario[]>(`${this.url}/publicaciones-por-usuario`, {
        params: this.parametrosRango(rango),
      }),
    );
  }

  private comentariosPorDia(rango: RangoFechas): Promise<ComentariosPorDia[]> {
    return firstValueFrom(
      this.http.get<ComentariosPorDia[]>(`${this.url}/comentarios-por-dia`, {
        params: this.parametrosRango(rango),
      }),
    );
  }

  private comentariosPorPublicacion(
    rango: RangoFechas,
    limite: number,
  ): Promise<ComentariosPorPublicacion[]> {
    return firstValueFrom(
      this.http.get<ComentariosPorPublicacion[]>(`${this.url}/comentarios-por-publicacion`, {
        params: this.parametrosRango(rango).set('limite', limite),
      }),
    );
  }

  private parametrosRango({ desde, hasta }: RangoFechas): HttpParams {
    return new HttpParams().set('desde', desde).set('hasta', hasta);
  }
}
