import { Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatosAltaUsuario, Perfil } from '../../../core/models/usuario.model';
import { textoAFechaIso } from '../../../core/utils/fechas.utils';
import {
  LARGO_MAXIMO_DESCRIPCION,
  LARGO_MAXIMO_NOMBRE,
} from '../../../core/utils/usuarios.constants';
import {
  camposIguales,
  contrasenaSegura,
  fechaPasada,
  imagenPermitida,
  nombreUsuarioValido,
  soloLetras,
} from '../../../core/validators/formularios.validators';
import { FechaMaskDirective } from '../../directives/fecha-mask/fecha-mask';
import { CampoContrasena } from '../campo-contrasena/campo-contrasena';
import { CampoFormulario } from '../campo-formulario/campo-formulario';
import { CampoImagen } from '../campo-imagen/campo-imagen';
import { Icono } from '../icono/icono';

/**
 * Formulario con los datos de una cuenta nueva: el del registro y el del alta
 * que hace un administrador (que además elige el perfil, `conPerfil`). Lo que
 * lleve el atributo `encabezado` se proyecta arriba de los campos; el resto
 * (los botones) va al final, dentro del formulario. Si los datos son válidos,
 * emite `enviar`; si no, marca los errores.
 */
@Component({
  selector: 'app-formulario-usuario',
  imports: [
    CampoContrasena,
    CampoFormulario,
    CampoImagen,
    FechaMaskDirective,
    Icono,
    ReactiveFormsModule,
  ],
  templateUrl: './formulario-usuario.html',
  styleUrl: './formulario-usuario.css',
})
export class FormularioUsuario {
  /** Prefijo de los `id` de los controles, para que no se repitan entre pantallas. */
  readonly prefijo = input.required<string>();
  readonly conPerfil = input(false);

  readonly enviar = output<DatosAltaUsuario>();

  protected readonly largoMaximoDescripcion = LARGO_MAXIMO_DESCRIPCION;

  protected readonly formulario = new FormGroup(
    {
      nombre: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(LARGO_MAXIMO_NOMBRE), soloLetras()],
      }),
      apellido: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(LARGO_MAXIMO_NOMBRE), soloLetras()],
      }),
      correo: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      nombreUsuario: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, nombreUsuarioValido()],
      }),
      contrasena: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, contrasenaSegura()],
      }),
      repetirContrasena: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      fechaNacimiento: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, fechaPasada()],
      }),
      descripcion: new FormControl('', {
        nonNullable: true,
        validators: [Validators.maxLength(LARGO_MAXIMO_DESCRIPCION)],
      }),
      perfil: new FormControl<Perfil>('usuario', { nonNullable: true }),
      imagen: new FormControl<File | null>(null, { validators: [imagenPermitida()] }),
    },
    {
      validators: [
        camposIguales('contrasena', 'repetirContrasena', 'Las contraseñas no coinciden.'),
      ],
    },
  );

  /** Deja el formulario vacío, como recién abierto (después de crear una cuenta). */
  reiniciar(): void {
    this.formulario.reset();
  }

  protected enviarSiValido(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const {
      repetirContrasena: _repetida,
      fechaNacimiento,
      ...datos
    } = this.formulario.getRawValue();
    this.enviar.emit({ ...datos, fechaNacimiento: textoAFechaIso(fechaNacimiento) ?? '' });
  }
}
