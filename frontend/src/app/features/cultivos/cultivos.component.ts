import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CropService } from '../../core/services/crop.service';
import { Crop } from '../../core/models/crop.model';

@Component({
  selector: 'app-cultivos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cultivos.component.html',
  styleUrls: ['./cultivos.component.css']
})
export class CultivosComponent implements OnInit {
  private cropService = inject(CropService);

  crops: Crop[] = [];
  selectedCrop: Crop | null = null;

  ngOnInit(): void {
    this.cropService.getCrops().subscribe(list => {
      this.crops = list;
      if (this.crops.length > 0) {
        this.selectedCrop = this.crops[0]; // Seleccionar Papa por defecto
      }
    });
  }

  selectCrop(crop: Crop): void {
    this.selectedCrop = crop;
  }
}
