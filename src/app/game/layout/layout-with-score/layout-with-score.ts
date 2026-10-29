import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { PlayerService } from '../../../_services/data/local-storage/player.service';
import { ScoreUpdateService } from '../../../_services/component-communication/score-update.service';
import { Layout } from '../layout';

@Component({
  selector: 'app-layout-with-score',
  imports: [Layout, RouterLink, RouterLinkActive],
  templateUrl: './layout-with-score.html',
  styleUrl: './layout-with-score.scss',
})
export class LayoutWithScore {
  private readonly route = inject(ActivatedRoute);
  private readonly playerService = inject(PlayerService);
  private readonly scoreUpdateService = inject(ScoreUpdateService);

  private readonly gameId = this.route.snapshot.paramMap.get('gameId');

  // Re-runs on every score update bump — this is what refreshes the score column
  // without a reload under zoneless change detection.
  public readonly players = computed(() => {
    this.scoreUpdateService.version();
    return this.playerService.getPlayersByGameId(this.gameId ?? '');
  });
}
