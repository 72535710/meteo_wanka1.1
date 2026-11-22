import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LocalityService } from '../../../core/services/locality.service';
import { Locality } from '../../../core/models/locality.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  protected localityService = inject(LocalityService);
  protected localities: Locality[] = [];
  protected isMenuCollapsed = true;
  protected localityError: string | null = null;

  ngOnInit(): void {
    this.localityService.getLocalities().subscribe({
      next: list => {
        this.localities = list;
        this.localityError = null;
      },
      error: error => {
        this.localityError = error instanceof Error ? error.message : 'No se pudieron cargar las localidades.';
      }
    });
  }

  toggleMenu(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  closeMenu(): void {
    this.isMenuCollapsed = true;
  }

  onLocalityChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      this.localityService.setSelectedLocalityById(target.value);
    }
  }
}
