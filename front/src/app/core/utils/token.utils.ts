/**
 * Momento en que vence un JWT (milisegundos desde 1970), leído del campo
 * `exp` de su payload. No verifica la firma: eso lo hace el servidor. Si el
 * token no tiene el formato esperado, devuelve `null`.
 */
export function vencimientoDelToken(token: string): number | null {
  try {
    const [, payload = ''] = token.split('.');
    const datos: unknown = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof datos !== 'object' || datos === null || !('exp' in datos)) return null;
    return typeof datos.exp === 'number' ? datos.exp * 1000 : null;
  } catch {
    return null;
  }
}
