import { Routes } from '@angular/router';
import { Home } from './home/home';
import { GameList } from './game/layout/game-list/game-list';
import { GameComponent } from './game/layout/layout-with-score/game/game';
import { SuperRoundComponent } from './game/layout/layout-with-score/super-round/super-round';
import { RoundComponent } from './game/layout/layout-with-score/round/round';
import { QuestionComponent } from './game/layout/layout-with-score/question/question';

// `super` must stay before `:roundId` — the static path wins only by order.
export const routes: Routes = [
  {
    path: '',
    component: Home,
    pathMatch: 'full',
  },
  {
    path: 'game',
    component: GameList,
  },
  {
    path: 'game/:gameId',
    component: GameComponent,
  },
  {
    path: 'game/:gameId/round/super',
    component: SuperRoundComponent,
  },
  {
    path: 'game/:gameId/round/:roundId',
    component: RoundComponent,
  },
  {
    path: 'game/:gameId/round/:roundId/question/:questionId',
    component: QuestionComponent,
  },
];
