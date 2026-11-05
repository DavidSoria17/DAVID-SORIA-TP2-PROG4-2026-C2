import { HttpClient, HttpContext } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DatosLogin,
  DatosRegistro,
  RespuestaAuth,
  TokenRefrescado,
  Usuario,
} from '../models/usuario.model';
import { SIN_TOKEN } from '../utils/http.constants';

const CLAVE_TOKEN = 'token';
const CLAVE_USUARIO = 'usuario';

/**
 * Sesión del usuario: login, registro, validación y refresco del token, y
 * cierre, con el token y el usuario guardados en el navegador.
 */
@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly urlAuth = `${environment.urlApi}/auth`;
  private readonly sinToken = { context: new HttpContext().set(SIN_TOKEN, true) };

  private readonly usuarioSesion = signal<Usuario | null>(this.leerUsuarioGuardado());
  private readonly tokenSesion = signal<string | null>(localStorage.getItem(CLAVE_TOKEN));

  readonly usuario = this.usuarioSesion.asReadonly();
  /** Token de la sesión guardada, o `null` si no hay sesión. Lo usan `tokenInterceptor` y `SesionService`. */
  readonly token = this.tokenSesion.asReadonly();
  readonly haySesion = computed(() => this.usuarioSesion() !== null);

  /**
   * Inicia sesión con correo o nombre de usuario y guarda la sesión.
   * @returns el usuario logueado; rechaza con el `HttpErrorResponse` si las credenciales no son válidas
   */
  async iniciarSesion(datos: DatosLogin): Promise<Usuario> {
    const respuesta = await firstValueFrom(
      this.http.post<RespuestaAuth>(`${this.urlAuth}/login`, datos, this.sinToken),
    );
    return this.guardarSesion(respuesta);
  }

  /**
   * Crea la cuenta (multipart, con la foto opcional) y deja la sesión iniciada.
   * @returns el usuario creado; rechaza con el `HttpErrorResponse` si la API lo rechaza
   */
  async registrar(datos: DatosRegistro): Promise<Usuario> {
    const respuesta = await firstValueFrom(
      this.http.post<RespuestaAuth>(
        `${this.urlAuth}/registro`,
        this.armarFormData(datos),
        this.sinToken,
      ),
    );
    return this.guardarSesion(respuesta);
  }

  /**
   * Valida el token guardado contra la API y actualiza los datos del usuario.
   * @returns el usuario de la sesión; rechaza con el `HttpErrorResponse` si el token no es válido
   */
  async autorizar(): Promise<Usuario> {
    const usuario = await firstValueFrom(
      this.http.post<Usuario>(`${this.urlAuth}/autorizar`, null),
    );
    this.guardarUsuario(usuario);
    return usuario;
  }

  /**
   * Cambia el token por uno nuevo con otros 15 minutos de validez.
   * Rechaza con el `HttpErrorResponse` si el token actual ya no es válido.
   */
  async refrescar(): Promise<void> {
    const { token } = await firstValueFrom(
      this.http.post<TokenRefrescado>(`${this.urlAuth}/refrescar`, null),
    );
    this.guardarToken(token);
  }

  /** Borra el token y el usuario del navegador. */
  cerrarSesion(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    this.tokenSesion.set(null);
    this.usuarioSesion.set(null);
  }

  private guardarSesion({ usuario, token }: RespuestaAuth): Usuario {
    this.guardarToken(token);
    this.guardarUsuario(usuario);
    return usuario;
  }

  private guardarToken(token: string): void {
    localStorage.setItem(CLAVE_TOKEN, token);
    this.tokenSesion.set(token);
  }

  private guardarUsuario(usuario: Usuario): void {
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    this.usuarioSesion.set(usuario);
  }

  private leerUsuarioGuardado(): Usuario | null {
    const guardado = localStorage.getItem(CLAVE_USUARIO);
    return guardado ? (JSON.parse(guardado) as Usuario) : null;
  }

  private armarFormData({ imagen, descripcion, ...campos }: DatosRegistro): FormData {
    const formData = new FormData();
    for (const [campo, valor] of Object.entries(campos)) {
      formData.append(campo, valor);
    }
    if (descripcion.trim()) formData.append('descripcion', descripcion);
    if (imagen) formData.append('imagen', imagen);
    return formData;
  }
}
