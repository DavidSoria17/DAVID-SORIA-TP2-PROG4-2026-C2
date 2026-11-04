import { HttpContextToken } from '@angular/common/http';

/**
 * Marca un pedido a la API que no lleva el token aunque haya sesión (login y
 * registro: se hacen justamente para conseguirlo).
 */
export const SIN_TOKEN = new HttpContextToken(() => false);
