import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CargaService } from './core/services/carga.service';
import { NotificacionService } from './core/services/notificacion.service';
import { Aviso } from './shared/components/aviso/aviso';
import { SpinnerCursor } from './shared/components/spinner-cursor/spinner-cursor';

@Component({
  selector: 'app-root',
  imports: [Aviso, RouterOutlet, SpinnerCursor],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly notificacionService = inject(NotificacionService);
  protected readonly cargaService = inject(CargaService);
}
