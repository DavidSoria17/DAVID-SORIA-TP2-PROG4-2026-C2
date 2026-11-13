import { Directive, effect, inject, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Directiva estructural: muestra el elemento solo si la sesión es de un
 * administrador (`*appSiAdmin`). Sigue a la sesión: si cambia el perfil, el
 * elemento aparece o desaparece solo.
 */
@Directive({ selector: '[appSiAdmin]' })
export class SiAdminDirective {
  private readonly esAdmin = inject(AuthService).esAdmin;
  private readonly plantilla = inject(TemplateRef);
  private readonly contenedor = inject(ViewContainerRef);

  private readonly mostrarSegunPerfil = effect(() => {
    this.contenedor.clear();
    if (this.esAdmin()) this.contenedor.createEmbeddedView(this.plantilla);
  });
}
