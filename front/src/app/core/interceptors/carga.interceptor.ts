import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { CargaService } from '../services/carga.service';
import { VentanasService } from '../services/ventanas.service';

/**
 * Cuenta los pedidos en vuelo junto con la ventana que estaba activa al
 * salir, para que esa ventana muestre su spinner. El `finalize` corre salga
 * bien, falle o se cancele; sin él, un error deja el contador arriba y el
 * spinner colgado para siempre.
 */
export const cargaInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const carga = inject(CargaService);
  const origen = inject(VentanasService).activa();
  carga.comenzar(origen);
  return siguiente(peticion).pipe(finalize(() => carga.terminar(origen)));
};
