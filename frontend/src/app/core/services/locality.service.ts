import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, of, tap, throwError } from 'rxjs';
import { Locality } from '../models/locality.model';
import { API_BASE_URL } from '../config/api.config';

interface LocalityResponse {
  id_localidad: number;
  nombre: string;
  provincia: string;
  altitud_msnm: number | null;
}

interface LocalityCreateRequest {
  nombre: string;
  provincia: string;
  altitud_msnm: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class LocalityService {
  private readonly http = inject(HttpClient);
  private localities: Locality[] = [];

  readonly selectedLocality = signal<Locality | null>(null);

  getLocalities(): Observable<Locality[]> {
    return this.http.get<LocalityResponse[]>(`${API_BASE_URL}/localidades`).pipe(
      map(localities => localities.map(locality => this.toLocality(locality))),
      tap(localities => {
        this.localities = localities;
        const selected = this.selectedLocality();
        const selectionExists = selected && localities.some(locality => locality.id === selected.id);
        if (!selectionExists) {
          this.selectedLocality.set(localities[0] ?? null);
        }
      })
    );
  }

  getLocalityById(id: string): Observable<Locality | undefined> {
    if (!/^\d+$/.test(id)) {
      return of(undefined);
    }

    return this.http.get<LocalityResponse>(`${API_BASE_URL}/localidades/${id}`).pipe(
      map(locality => this.toLocality(locality))
    );
  }

  setSelectedLocality(locality: Locality): void {
    this.selectedLocality.set(locality);
  }

  setSelectedLocalityById(id: string): void {
    const found = this.localities.find(l => l.id === id);
    if (found) {
      this.selectedLocality.set(found);
    }
  }

  createLocality(newLocality: Omit<Locality, 'id'>): Observable<Locality> {
    const payload: LocalityCreateRequest = {
      nombre: newLocality.name,
      provincia: newLocality.province,
      altitud_msnm: newLocality.altitudeMeters
    };

    return this.http.post<LocalityResponse>(`${API_BASE_URL}/localidades`, payload).pipe(
      map(locality => this.toLocality(locality))
    );
  }

  updateLocality(id: string, updated: Partial<Locality>): Observable<Locality | null> {
    void id;
    void updated;
    return throwError(() => new Error('La API no dispone de un endpoint para actualizar localidades.'));
  }

  deleteLocality(id: string): Observable<boolean> {
    void id;
    return throwError(() => new Error('La API no dispone de un endpoint para eliminar localidades.'));
  }

  private toLocality(response: LocalityResponse): Locality {
    return {
      id: String(response.id_localidad),
      name: response.nombre,
      province: response.provincia,
      altitudeMeters: response.altitud_msnm
    };
  }
}
