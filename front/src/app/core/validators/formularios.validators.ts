import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { errorDeContrasena } from '../utils/contrasena.utils';
import { hoyComoFechaIso, textoAFechaIso } from '../utils/fechas.utils';
import { errorDeImagen } from '../utils/imagenes.utils';

/*
 * Validadores propios. Cada error lleva su `mensaje`, que `CampoFormulario`
 * muestra debajo del campo. Los campos vacíos se dejan pasar: de eso se
 * encarga `Validators.required`.
 */

const error = (clave: string, mensaje: string): ValidationErrors => ({ [clave]: { mensaje } });

/** Letras (con tildes y ñ) separadas por un espacio, apóstrofo o guion. Sin números ni símbolos. */
const SOLO_LETRAS = /^\p{L}+(?:[ '-]\p{L}+)*$/u;
const NOMBRE_USUARIO = /^[a-zA-Z0-9._]{3,20}$/;

/** Rechaza un texto hecho solo de espacios, que el servidor recorta y toma como vacío. */
export function sinSoloEspacios(): ValidatorFn {
  return ({ value }: AbstractControl<string>) =>
    !value || value.trim() ? null : error('soloEspacios', 'Escribí algo más que espacios.');
}

export function soloLetras(): ValidatorFn {
  return ({ value }: AbstractControl<string>) =>
    !value || SOLO_LETRAS.test(value.trim())
      ? null
      : error('soloLetras', 'Usá solo letras; se permiten espacios, apóstrofos y guiones.');
}

export function nombreUsuarioValido(): ValidatorFn {
  return ({ value }: AbstractControl<string>) =>
    !value || NOMBRE_USUARIO.test(value.trim())
      ? null
      : error(
          'nombreUsuario',
          'Usá de 3 a 20 letras, números, puntos o guiones bajos, sin espacios.',
        );
}

/** Al menos 8 caracteres, una mayúscula y un número. */
export function contrasenaSegura(): ValidatorFn {
  return ({ value }: AbstractControl<string>) => {
    const mensaje = value ? errorDeContrasena(value) : null;
    return mensaje ? error('contrasenaSegura', mensaje) : null;
  };
}

/**
 * Validador de `FormGroup`: los campos `campo` y `repeticion` tienen que ser
 * iguales. Como se aplica al grupo, se vuelve a evaluar cuando cambia
 * cualquiera de los dos. El error queda en el grupo con la clave `coincidencia`;
 * para mostrarlo en un campo, `<app-campo-formulario errorDelGrupo="coincidencia">`.
 */
export function camposIguales(campo: string, repeticion: string, mensaje: string): ValidatorFn {
  return (grupo: AbstractControl) => {
    const valor = grupo.get(campo)?.value;
    const repetido = grupo.get(repeticion)?.value;
    return !repetido || valor === repetido ? null : error('coincidencia', mensaje);
  };
}

/** Fecha DD/MM/AAAA completa, existente y anterior a hoy. */
export function fechaPasada(): ValidatorFn {
  return ({ value }: AbstractControl<string>) => {
    if (!value) return null;
    const fecha = textoAFechaIso(value);
    if (!fecha) return error('fecha', 'Escribí una fecha válida con el formato DD/MM/AAAA.');
    return fecha < hoyComoFechaIso()
      ? null
      : error('fechaPasada', 'La fecha tiene que ser anterior a hoy.');
  };
}

/** Fecha DD/MM/AAAA completa y existente. */
export function fechaValida(): ValidatorFn {
  return ({ value }: AbstractControl<string>) =>
    !value || textoAFechaIso(value)
      ? null
      : error('fecha', 'Escribí una fecha válida con el formato DD/MM/AAAA.');
}

/**
 * Validador de `FormGroup`: la fecha de `desde` no puede ser posterior a la
 * de `hasta` (las dos DD/MM/AAAA). Si alguna no es válida no opina: de eso se
 * encarga `fechaValida`. El error queda en el grupo con la clave `rango`.
 */
export function rangoDeFechas(desde: string, hasta: string): ValidatorFn {
  return (grupo: AbstractControl) => {
    const inicio = textoAFechaIso(grupo.get(desde)?.value ?? '');
    const fin = textoAFechaIso(grupo.get(hasta)?.value ?? '');
    return !inicio || !fin || inicio <= fin
      ? null
      : error('rango', 'Tiene que ser igual o posterior a la fecha desde.');
  };
}

/** JPG, PNG o WebP de hasta 2 MB. */
export function imagenPermitida(): ValidatorFn {
  return ({ value }: AbstractControl<File | null>) => {
    const mensaje = errorDeImagen(value);
    return mensaje ? error('imagen', mensaje) : null;
  };
}
