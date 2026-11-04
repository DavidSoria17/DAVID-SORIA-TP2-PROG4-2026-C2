import { IconoPixel } from '../models/icono.model';

/**
 * Íconos pixel de la interfaz. Cada trazo es una lista de rectángulos de 1 px
 * de alto sobre la grilla del `viewBox`; sin `color` usa el color del texto.
 */
export const ICONOS = {
  cerrar: {
    ancho: 8,
    alto: 7,
    trazos: [
      {
        d: 'M0 0h2v1h-2zM6 0h2v1h-2zM1 1h2v1h-2zM5 1h2v1h-2zM2 2h4v1h-4zM3 3h2v1h-2zM2 4h4v1h-4zM1 5h2v1h-2zM5 5h2v1h-2zM0 6h2v1h-2zM6 6h2v1h-2z',
      },
    ],
  },
  minimizar: {
    ancho: 8,
    alto: 7,
    trazos: [{ d: 'M0 5h8v1h-8zM0 6h8v1h-8z' }],
  },
  maximizar: {
    ancho: 8,
    alto: 7,
    trazos: [
      {
        d: 'M0 0h8v1h-8zM0 1h8v1h-8zM0 2h1v1h-1zM7 2h1v1h-1zM0 3h1v1h-1zM7 3h1v1h-1zM0 4h1v1h-1zM7 4h1v1h-1zM0 5h1v1h-1zM7 5h1v1h-1zM0 6h8v1h-8z',
      },
    ],
  },
  ojo: {
    ancho: 11,
    alto: 7,
    trazos: [
      {
        d: 'M3 0h5v1h-5zM1 1h2v1h-2zM8 1h2v1h-2zM0 2h1v1h-1zM4 2h3v1h-3zM10 2h1v1h-1zM0 3h1v1h-1zM3 3h5v1h-5zM10 3h1v1h-1zM0 4h1v1h-1zM4 4h3v1h-3zM10 4h1v1h-1zM1 5h2v1h-2zM8 5h2v1h-2zM3 6h5v1h-5z',
      },
    ],
  },
  error: {
    ancho: 9,
    alto: 9,
    trazos: [
      {
        d: 'M2 0h5v1h-5zM1 1h7v1h-7zM0 2h2v1h-2zM3 2h3v1h-3zM7 2h2v1h-2zM0 3h3v1h-3zM4 3h1v1h-1zM6 3h3v1h-3zM0 4h4v1h-4zM5 4h4v1h-4zM0 5h3v1h-3zM4 5h1v1h-1zM6 5h3v1h-3zM0 6h2v1h-2zM3 6h3v1h-3zM7 6h2v1h-2zM1 7h7v1h-7zM2 8h5v1h-5z',
      },
    ],
  },
  ok: {
    ancho: 9,
    alto: 7,
    trazos: [
      {
        d: 'M8 0h1v1h-1zM7 1h2v1h-2zM0 2h1v1h-1zM6 2h2v1h-2zM0 3h2v1h-2zM5 3h2v1h-2zM1 4h2v1h-2zM4 4h2v1h-2zM2 5h3v1h-3zM3 6h1v1h-1z',
      },
    ],
  },
  alerta: {
    ancho: 11,
    alto: 10,
    trazos: [
      {
        d: 'M5 0h1v1h-1zM4 1h3v1h-3zM4 2h3v1h-3zM3 3h2v1h-2zM6 3h2v1h-2zM3 4h2v1h-2zM6 4h2v1h-2zM2 5h3v1h-3zM6 5h3v1h-3zM2 6h3v1h-3zM6 6h3v1h-3zM1 7h9v1h-9zM1 8h4v1h-4zM6 8h4v1h-4zM0 9h11v1h-11z',
      },
    ],
  },
  info: {
    ancho: 9,
    alto: 9,
    trazos: [
      {
        d: 'M0 0h9v1h-9zM0 1h1v1h-1zM8 1h1v1h-1zM0 2h1v1h-1zM4 2h1v1h-1zM8 2h1v1h-1zM0 3h1v1h-1zM8 3h1v1h-1zM0 4h1v1h-1zM3 4h2v1h-2zM8 4h1v1h-1zM0 5h1v1h-1zM4 5h1v1h-1zM8 5h1v1h-1zM0 6h1v1h-1zM4 6h1v1h-1zM8 6h1v1h-1zM0 7h1v1h-1zM3 7h3v1h-3zM8 7h1v1h-1zM0 8h9v1h-9z',
      },
    ],
  },
  imagen: {
    ancho: 10,
    alto: 8,
    trazos: [
      {
        d: 'M0 0h10v1h-10zM0 1h1v1h-1zM9 1h1v1h-1zM0 2h1v1h-1zM7 2h1v1h-1zM9 2h1v1h-1zM0 3h1v1h-1zM9 3h1v1h-1zM0 4h1v1h-1zM4 4h1v1h-1zM9 4h1v1h-1zM0 5h1v1h-1zM3 5h3v1h-3zM7 5h1v1h-1zM9 5h1v1h-1zM0 6h1v1h-1zM2 6h7v1h-7zM0 7h10v1h-10z',
      },
    ],
  },
  subir: {
    ancho: 7,
    alto: 7,
    trazos: [{ d: 'M3 0h1v1h-1zM2 1h3v1h-3zM1 2h5v1h-5zM3 3h1v1h-1zM3 4h1v1h-1zM0 6h7v1h-7z' }],
  },
  usuario: {
    ancho: 12,
    alto: 10,
    trazos: [
      {
        d: 'M4 0h4v1h-4zM3 1h6v1h-6zM3 2h6v1h-6zM3 3h6v1h-6zM4 4h4v1h-4zM5 5h2v1h-2zM2 6h8v1h-8zM1 7h10v1h-10zM0 8h12v1h-12zM0 9h12v1h-12z',
      },
    ],
  },
  basura: {
    ancho: 9,
    alto: 9,
    trazos: [
      {
        d: 'M3 0h3v1h-3zM0 1h9v1h-9zM1 3h7v1h-7zM1 4h1v1h-1zM3 4h1v1h-1zM5 4h1v1h-1zM7 4h1v1h-1zM1 5h1v1h-1zM3 5h1v1h-1zM5 5h1v1h-1zM7 5h1v1h-1zM1 6h1v1h-1zM3 6h1v1h-1zM5 6h1v1h-1zM7 6h1v1h-1zM1 7h1v1h-1zM3 7h1v1h-1zM5 7h1v1h-1zM7 7h1v1h-1zM1 8h7v1h-7z',
      },
    ],
  },
  restaurar: {
    ancho: 9,
    alto: 7,
    trazos: [
      {
        d: 'M2 0h1v1h-1zM1 1h2v1h-2zM0 2h7v1h-7zM1 3h2v1h-2zM7 3h1v1h-1zM2 4h1v1h-1zM8 4h1v1h-1zM8 5h1v1h-1zM7 6h1v1h-1z',
      },
    ],
  },
  reiniciar: {
    ancho: 9,
    alto: 8,
    trazos: [
      {
        d: 'M2 0h5v1h-5zM1 1h1v1h-1zM7 1h2v1h-2zM0 2h1v1h-1zM6 2h3v1h-3zM0 3h1v1h-1zM0 4h1v1h-1zM0 5h1v1h-1zM8 5h1v1h-1zM1 6h1v1h-1zM7 6h1v1h-1zM2 7h5v1h-5z',
      },
    ],
  },
  prohibido: {
    ancho: 9,
    alto: 9,
    trazos: [
      {
        d: 'M2 0h5v1h-5zM1 1h2v1h-2zM6 1h2v1h-2zM0 2h2v1h-2zM6 2h3v1h-3zM0 3h1v1h-1zM5 3h2v1h-2zM8 3h1v1h-1zM0 4h1v1h-1zM4 4h2v1h-2zM8 4h1v1h-1zM0 5h1v1h-1zM3 5h2v1h-2zM8 5h1v1h-1zM0 6h3v1h-3zM7 6h2v1h-2zM1 7h2v1h-2zM6 7h2v1h-2zM2 8h5v1h-5z',
      },
    ],
  },
  escAlerta: {
    ancho: 16,
    alto: 15,
    trazos: [
      {
        color: 'var(--color-borde)',
        d: 'M7 0h2v1h-2zM6 1h1v1h-1zM9 1h1v1h-1zM6 2h1v1h-1zM9 2h1v1h-1zM5 3h1v1h-1zM10 3h1v1h-1zM5 4h1v1h-1zM7 4h2v1h-2zM10 4h1v1h-1zM4 5h1v1h-1zM7 5h2v1h-2zM11 5h1v1h-1zM4 6h1v1h-1zM7 6h2v1h-2zM11 6h1v1h-1zM3 7h1v1h-1zM7 7h2v1h-2zM12 7h1v1h-1zM3 8h1v1h-1zM7 8h2v1h-2zM12 8h1v1h-1zM2 9h1v1h-1zM13 9h1v1h-1zM2 10h1v1h-1zM7 10h2v1h-2zM13 10h1v1h-1zM1 11h1v1h-1zM7 11h2v1h-2zM14 11h1v1h-1zM1 12h1v1h-1zM14 12h1v1h-1zM0 13h16v1h-16z',
      },
      {
        color: 'var(--color-franja-ventana-marca)',
        d: 'M7 1h2v1h-2zM7 2h2v1h-2zM6 3h4v1h-4zM6 4h1v1h-1zM9 4h1v1h-1zM5 5h2v1h-2zM9 5h2v1h-2zM5 6h2v1h-2zM9 6h2v1h-2zM4 7h3v1h-3zM9 7h3v1h-3zM4 8h3v1h-3zM9 8h3v1h-3zM3 9h10v1h-10zM3 10h4v1h-4zM9 10h4v1h-4zM2 11h5v1h-5zM9 11h5v1h-5zM2 12h12v1h-12z',
      },
      { color: 'var(--color-sombra)', d: 'M1 14h15v1h-15z' },
    ],
  },
  escError: {
    ancho: 16,
    alto: 16,
    trazos: [
      {
        color: 'var(--color-borde)',
        d: 'M5 0h6v1h-6zM3 1h2v1h-2zM11 1h2v1h-2zM2 2h1v1h-1zM13 2h1v1h-1zM1 3h1v1h-1zM14 3h1v1h-1zM1 4h1v1h-1zM14 4h1v1h-1zM0 5h1v1h-1zM15 5h1v1h-1zM0 6h1v1h-1zM15 6h1v1h-1zM0 7h1v1h-1zM15 7h1v1h-1zM0 8h1v1h-1zM15 8h1v1h-1zM0 9h1v1h-1zM15 9h1v1h-1zM0 10h1v1h-1zM15 10h1v1h-1zM1 11h1v1h-1zM14 11h1v1h-1zM1 12h1v1h-1zM14 12h1v1h-1zM2 13h1v1h-1zM13 13h1v1h-1zM3 14h2v1h-2zM11 14h2v1h-2zM5 15h6v1h-6z',
      },
      {
        color: 'var(--color-peligro)',
        d: 'M5 1h6v1h-6zM3 2h10v1h-10zM2 3h12v1h-12zM2 4h2v1h-2zM6 4h4v1h-4zM12 4h2v1h-2zM1 5h3v1h-3zM7 5h2v1h-2zM12 5h3v1h-3zM1 6h4v1h-4zM11 6h4v1h-4zM1 7h5v1h-5zM10 7h5v1h-5zM1 8h5v1h-5zM10 8h5v1h-5zM1 9h4v1h-4zM11 9h4v1h-4zM1 10h3v1h-3zM7 10h2v1h-2zM12 10h3v1h-3zM2 11h2v1h-2zM6 11h4v1h-4zM12 11h2v1h-2zM2 12h12v1h-12zM3 13h10v1h-10zM5 14h6v1h-6z',
      },
      {
        color: 'var(--color-ventana)',
        d: 'M4 4h2v1h-2zM10 4h2v1h-2zM4 5h3v1h-3zM9 5h3v1h-3zM5 6h6v1h-6zM6 7h4v1h-4zM6 8h4v1h-4zM5 9h6v1h-6zM4 10h3v1h-3zM9 10h3v1h-3zM4 11h2v1h-2zM10 11h2v1h-2z',
      },
    ],
  },
  corazon: {
    ancho: 9,
    alto: 8,
    trazos: [
      {
        d: 'M1 0h2v1h-2zM6 0h2v1h-2zM0 1h4v1h-4zM5 1h4v1h-4zM0 2h9v1h-9zM0 3h9v1h-9zM1 4h7v1h-7zM2 5h5v1h-5zM3 6h3v1h-3zM4 7h1v1h-1z',
      },
    ],
  },
  corazonVacio: {
    ancho: 9,
    alto: 8,
    trazos: [
      {
        d: 'M1 0h2v1h-2zM6 0h2v1h-2zM0 1h1v1h-1zM3 1h1v1h-1zM5 1h1v1h-1zM8 1h1v1h-1zM0 2h1v1h-1zM4 2h1v1h-1zM8 2h1v1h-1zM0 3h1v1h-1zM8 3h1v1h-1zM1 4h1v1h-1zM7 4h1v1h-1zM2 5h1v1h-1zM6 5h1v1h-1zM3 6h1v1h-1zM5 6h1v1h-1zM4 7h1v1h-1z',
      },
    ],
  },
  comentario: {
    ancho: 10,
    alto: 9,
    trazos: [
      {
        d: 'M1 0h8v1h-8zM0 1h1v1h-1zM9 1h1v1h-1zM0 2h1v1h-1zM2 2h2v1h-2zM5 2h3v1h-3zM9 2h1v1h-1zM0 3h1v1h-1zM9 3h1v1h-1zM0 4h1v1h-1zM2 4h4v1h-4zM9 4h1v1h-1zM0 5h1v1h-1zM9 5h1v1h-1zM1 6h3v1h-3zM5 6h4v1h-4zM3 7h2v1h-2zM3 8h1v1h-1z',
      },
    ],
  },
  mas: {
    ancho: 7,
    alto: 7,
    trazos: [
      { d: 'M2 0h3v1h-3zM2 1h3v1h-3zM0 2h7v1h-7zM0 3h7v1h-7zM0 4h7v1h-7zM2 5h3v1h-3zM2 6h3v1h-3z' },
    ],
  },
  anterior: {
    ancho: 4,
    alto: 7,
    trazos: [
      { d: 'M3 0h1v1h-1zM2 1h2v1h-2zM1 2h3v1h-3zM0 3h4v1h-4zM1 4h3v1h-3zM2 5h2v1h-2zM3 6h1v1h-1z' },
    ],
  },
  siguiente: {
    ancho: 4,
    alto: 7,
    trazos: [
      { d: 'M0 0h1v1h-1zM0 1h2v1h-2zM0 2h3v1h-3zM0 3h4v1h-4zM0 4h3v1h-3zM0 5h2v1h-2zM0 6h1v1h-1z' },
    ],
  },
  reloj: {
    ancho: 9,
    alto: 9,
    trazos: [
      {
        d: 'M2 0h5v1h-5zM1 1h1v1h-1zM7 1h1v1h-1zM0 2h1v1h-1zM4 2h1v1h-1zM8 2h1v1h-1zM0 3h1v1h-1zM4 3h1v1h-1zM8 3h1v1h-1zM0 4h1v1h-1zM4 4h3v1h-3zM8 4h1v1h-1zM0 5h1v1h-1zM8 5h1v1h-1zM0 6h1v1h-1zM8 6h1v1h-1zM1 7h1v1h-1zM7 7h1v1h-1zM2 8h5v1h-5z',
      },
    ],
  },
  lapiz: {
    ancho: 9,
    alto: 8,
    trazos: [
      {
        d: 'M6 0h2v1h-2zM5 1h1v1h-1zM8 1h1v1h-1zM4 2h1v1h-1zM7 2h1v1h-1zM3 3h1v1h-1zM6 3h1v1h-1zM2 4h1v1h-1zM5 4h1v1h-1zM1 5h1v1h-1zM4 5h1v1h-1zM0 6h2v1h-2zM3 6h1v1h-1zM0 7h3v1h-3z',
      },
    ],
  },
} satisfies Record<string, IconoPixel>;
