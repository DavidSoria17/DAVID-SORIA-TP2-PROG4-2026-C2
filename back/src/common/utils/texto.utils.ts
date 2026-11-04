import { TransformFnParams } from 'class-transformer';

/** Para `@Transform`: recorta los espacios de los extremos si el valor es texto. */
export const recortar = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;
