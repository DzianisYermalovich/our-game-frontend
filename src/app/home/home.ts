import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GameImportService } from '../_services/import/game-import.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly importService = inject(GameImportService);
  private readonly router = inject(Router);

  public onPackSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const pack = input.files?.[0];
    input.value = ''; // let the same pack be re-picked after a failed import
    if (pack) {
      this.importService.importPack(pack);
    }
  }

  public toGameList(): void {
    this.router.navigate(['game']);
  }
}
