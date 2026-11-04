/**
 * Ruta de la app a la que pertenece una pantalla. Cada app es el primer tramo
 * de la dirección y sus pantallas internas cuelgan de ella:
 * `/publicaciones/nueva` es de `/publicaciones`.
 */
export const rutaDeApp = (rutaPantalla: string): string => `/${rutaPantalla.split('/')[1]}`;
