import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ComentariosPorPublicacionDto } from './dto/comentarios-por-publicacion.dto.js';
import { RangoFechasDto } from './dto/rango-fechas.dto.js';
import { Comentario } from './entities/comentario.entity.js';
import { Publicacion } from './entities/publicacion.entity.js';

/** Los días de las estadísticas se cortan a la medianoche de Argentina. */
const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';
/** Argentina no tiene horario de verano: la medianoche es siempre a las 03:00 UTC. */
const DESFASE_ZONA_HORARIA = '-03:00';
const DIA_MS = 24 * 60 * 60 * 1000;

export interface PublicacionesPorUsuario {
  _id: Types.ObjectId;
  nombreUsuario: string;
  cantidad: number;
}

export interface ComentariosPorDia {
  /** Día AAAA-MM-DD en la hora de Argentina. */
  fecha: string;
  cantidad: number;
}

export interface ComentariosPorPublicacion {
  _id: Types.ObjectId;
  titulo: string;
  cantidad: number;
}

interface FiltroRango {
  $gte: Date;
  $lt: Date;
}

/**
 * Datos de los gráficos del panel de administración. Cuentan lo creado en el
 * lapso aunque después se haya dado de baja: es actividad que existió.
 */
@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<Comentario>,
  ) {}

  /**
   * Cuántas publicaciones hizo cada usuario en el lapso, de quien más publicó
   * a quien menos. Los usuarios sin publicaciones no aparecen. Si `desde` es
   * posterior a `hasta`, 400.
   */
  publicacionesPorUsuario(
    rango: RangoFechasDto,
  ): Promise<PublicacionesPorUsuario[]> {
    return this.publicacionModel
      .aggregate<PublicacionesPorUsuario>([
        { $match: { createdAt: this.filtroRango(rango) } },
        {
          $group: {
            _id: '$autor._id',
            nombreUsuario: { $first: '$autor.nombreUsuario' },
            cantidad: { $sum: 1 },
          },
        },
        { $sort: { cantidad: -1, nombreUsuario: 1 } },
      ])
      .exec();
  }

  /**
   * Cuántos comentarios se hicieron cada día del lapso, del primero al
   * último. Los días sin comentarios no aparecen. Si `desde` es posterior a
   * `hasta`, 400.
   */
  comentariosPorDia(rango: RangoFechasDto): Promise<ComentariosPorDia[]> {
    return this.comentarioModel
      .aggregate<ComentariosPorDia>([
        { $match: { createdAt: this.filtroRango(rango) } },
        {
          $group: {
            _id: {
              $dateTrunc: {
                date: '$createdAt',
                unit: 'day',
                timezone: ZONA_HORARIA,
              },
            },
            cantidad: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            fecha: {
              $dateToString: {
                date: '$_id',
                format: '%Y-%m-%d',
                timezone: ZONA_HORARIA,
              },
            },
            cantidad: 1,
          },
        },
      ])
      .exec();
  }

  /**
   * Las publicaciones con más comentarios en el lapso, con su título. Si
   * `desde` es posterior a `hasta`, 400.
   * @param filtros lapso y cuántas publicaciones devolver (`limite`)
   */
  comentariosPorPublicacion({
    limite,
    ...rango
  }: ComentariosPorPublicacionDto): Promise<ComentariosPorPublicacion[]> {
    return this.comentarioModel
      .aggregate<ComentariosPorPublicacion>([
        { $match: { createdAt: this.filtroRango(rango) } },
        { $group: { _id: '$publicacion', cantidad: { $sum: 1 } } },
        { $sort: { cantidad: -1, _id: -1 } },
        { $limit: limite },
        {
          $lookup: {
            from: 'publicaciones',
            localField: '_id',
            foreignField: '_id',
            pipeline: [{ $project: { titulo: 1 } }],
            as: 'publicacion',
          },
        },
        {
          $project: {
            titulo: { $first: '$publicacion.titulo' },
            cantidad: 1,
          },
        },
      ])
      .exec();
  }

  /**
   * Convierte el lapso en el filtro `[desde 00:00, hasta + 1 día 00:00)` en
   * la hora de Argentina. Si `desde` es posterior a `hasta`, 400.
   */
  private filtroRango({ desde, hasta }: RangoFechasDto): FiltroRango {
    const inicio = new Date(`${desde}T00:00:00${DESFASE_ZONA_HORARIA}`);
    const ultimoDia = new Date(`${hasta}T00:00:00${DESFASE_ZONA_HORARIA}`);
    if (inicio > ultimoDia) {
      throw new BadRequestException(
        'La fecha desde no puede ser posterior a la fecha hasta',
      );
    }
    return { $gte: inicio, $lt: new Date(ultimoDia.getTime() + DIA_MS) };
  }
}
