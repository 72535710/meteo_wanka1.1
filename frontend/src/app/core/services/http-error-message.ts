import { HttpErrorResponse } from '@angular/common/http';

export function getHttpErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const detail = error.error?.detail;
    return typeof detail === 'string' ? detail : error.message;
  }
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}
