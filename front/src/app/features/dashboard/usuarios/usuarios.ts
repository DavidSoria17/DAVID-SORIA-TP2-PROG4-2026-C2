import { DatePipe } from '@angular/common';
import { Component, effect, inject, OnDestroy, OnInit, signal, untracked } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { EstadoUsuarios, PaginaUsuarios, Usuario } from '../../../core/models/usuario.model';
import { AuthService } from '../../../core/services/auth.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { PESTANAS_DASHBOARD, USUARIOS_POR_PAGINA } from '../../../core/utils/dashboard.constants';
import { mensajeDeError } from '../../../core/utils/errores.utils';
import { nombreCompleto } from '../../../core/utils/formato.utils';
import { offsetDePagina } from '../../../core/utils/paginacion.utils';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { Aviso } from '../../../shared/components/aviso/aviso';
import { EstadoVacio } from '../../../shared/components/estado-vacio/estado-vacio';
import { Icono } from '../../../shared/components/icono/icono';
import { Modal } from '../../../shared/components/modal/modal';
import { Paginador } from '../../../shared/components/paginador/paginador';
import { Pestanas } from '../../../shared/components/pestanas/pestanas';
import { ArrobaPipe } from '../../../shared/pipes/arroba/arroba';
import { UsuariosService } from '../services/usuarios.service';

/** Valor del filtro de estado: los dos estados de la API o todos. */
type FiltroEstado = EstadoUsuarios | 'todos';

/**
 * Dashboard › Usuarios: todas las cuentas, de las más nuevas a las más
 * viejas, con su perfil y su estado. Se filtran por estado, se deshabilitan
 * (con confirmación) y se vuelven a habilitar. Desde acá se pasa al alta de
 * un usuario nuevo.
 */
@Component({
  selector: 'app-usuarios',
  imports: [
    ArrobaPipe,
    Avatar,
    Aviso,
    DatePipe,
    EstadoVacio,
    Icono,
    Modal,
    Paginador,
    Pestanas,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
  host: { class: 'pantalla-con-secciones' },
})
export class Usuarios implements OnInit, OnDestroy {
  private readonly usuariosService = inject(UsuariosService);
  private readonly notificacionService = inject(NotificacionService);

  protected readonly sesion = inject(AuthService).usuario;
  protected readonly pestanas = PESTANAS_DASHBOARD;
  protected readonly porPagina = USUARIOS_POR_PAGINA;
  protected readonly nombreCompleto = nombreCompleto;
  protected readonly filtro = new FormControl<FiltroEstado>('todos', { nonNullable: true });
  protected readonly pagina = signal(1);
  protected readonly datos = signal<PaginaUsuarios | null>(null);
  protected readonly error = signal<string | null>(null);
  /** Usuario que se está por deshabilitar, mientras se ve la confirmación. */
  protected readonly porDeshabilitar = signal<Usuario | null>(null);
  /** Id del usuario que espera la respuesta de un cambio de estado. */
  protected readonly procesando = signal<string | null>(null);

  private cambiosDeFiltro?: Subscription;
  /** Número del último pedido: si llega la respuesta de uno anterior, se descarta. */
  private ultimoPedido = 0;
  private altasVistas = this.usuariosService.altas();

  /**
   * El listado queda guardado mientras se usa la pantalla del alta; cuando se
   * crea un usuario, vuelve a la primera página de todos para mostrarlo.
   */
  private readonly seguirAltas = effect(() => {
    const altas = this.usuariosService.altas();
    if (altas === this.altasVistas) return;
    this.altasVistas = altas;
    untracked(() => {
      if (this.filtro.value === 'todos') void this.irAPagina(1, true);
      else this.filtro.setValue('todos');
    });
  });

  ngOnInit(): void {
    this.cambiosDeFiltro = this.filtro.valueChanges.subscribe(() => this.irAPagina(1, true));
    void this.cargar();
  }

  ngOnDestroy(): void {
    this.cambiosDeFiltro?.unsubscribe();
  }

  /** Va a otra página; con `forzar`, recarga aunque sea la misma. */
  protected async irAPagina(pagina: number, forzar = false): Promise<void> {
    if (pagina === this.pagina() && !forzar) return;
    this.pagina.set(pagina);
    await this.cargar();
  }

  protected async deshabilitar(): Promise<void> {
    const usuario = this.porDeshabilitar();
    this.porDeshabilitar.set(null);
    if (!usuario) return;
    await this.cambiarEstado(usuario, false);
  }

  protected async habilitar(usuario: Usuario): Promise<void> {
    await this.cambiarEstado(usuario, true);
  }

  /** Avisa el resultado y recarga la página, porque cambian las cantidades (y la fila puede salir del filtro). */
  private async cambiarEstado(usuario: Usuario, habilitar: boolean): Promise<void> {
    const nombre = nombreCompleto(usuario);
    this.procesando.set(usuario._id);
    try {
      if (habilitar) {
        await this.usuariosService.habilitar(usuario);
      } else {
        await this.usuariosService.deshabilitar(usuario);
      }
      this.notificacionService.mostrar({
        tipo: 'exito',
        titulo: habilitar ? `Habilitaste a ${nombre}` : `Deshabilitaste a ${nombre}`,
        texto: habilitar
          ? 'Ya puede volver a iniciar sesión.'
          : 'No va a poder iniciar sesión hasta que vuelvas a habilitar su cuenta.',
      });
      await this.cargar();
    } catch (error) {
      this.notificacionService.mostrar({
        tipo: 'peligro',
        titulo: habilitar
          ? `No se pudo habilitar a ${nombre}`
          : `No se pudo deshabilitar a ${nombre}`,
        texto: mensajeDeError(error),
      });
    } finally {
      this.procesando.set(null);
    }
  }

  private async cargar(): Promise<void> {
    const pedido = ++this.ultimoPedido;
    const filtro = this.filtro.value;
    try {
      const datos = await this.usuariosService.listar({
        estado: filtro === 'todos' ? null : filtro,
        offset: offsetDePagina(this.pagina(), USUARIOS_POR_PAGINA),
        limit: USUARIOS_POR_PAGINA,
      });
      if (pedido !== this.ultimoPedido) return;
      // Si se deshabilitó o habilitó el último de una página, va a la anterior.
      if (datos.usuarios.length === 0 && this.pagina() > 1) {
        await this.irAPagina(this.pagina() - 1);
        return;
      }
      this.datos.set(datos);
      this.error.set(null);
    } catch (error) {
      if (pedido === this.ultimoPedido) this.error.set(mensajeDeError(error));
    }
  }
}
