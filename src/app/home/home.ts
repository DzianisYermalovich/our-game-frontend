import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../_services/data/local-storage/game.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly gameService = inject(GameService);
  private readonly router = inject(Router);

  public newGame(): void {
    this.gameService.initGameFromJson();
  }

  public toGameList(): void {
    this.router.navigate(['game']);
  }
}
