import { Component, computed, signal } from '@angular/core';
import { STUB_GAMES, STUB_TEMPLATES, StubGame, StubTemplate } from './prototype-stub-data';
import { ProtoTemplateView } from './template-view';

// PROTOTYPE (decision ticket 04, throwaway): variant C «Игровая» — games
// first: Home is "continue playing" with progress cards; the template library
// is a collapsed <details> section on the same page with import tucked inside.
// The template view is the shared game-shaped read-only component.
type Screen = 'home' | 'templates' | 'template' | 'create' | 'play';

@Component({
  selector: 'app-prototype-variant-c',
  imports: [ProtoTemplateView],
  templateUrl: './variant-c.html',
  styleUrl: './variant-c.scss',
})
export class PrototypeVariantC {
  protected readonly screen = signal<Screen>('home');
  protected readonly templates = signal<StubTemplate[]>([...STUB_TEMPLATES]);
  protected readonly games = signal<StubGame[]>([...STUB_GAMES]);
  private readonly templateId = signal<string | null>(null);
  protected readonly note = signal('');
  // Create-game flow draft state (ticket 05): fresh roster per game.
  protected readonly draftPlayers = signal<string[]>([]);
  protected readonly gameName = signal('');
  protected readonly lastGame = signal<StubGame | null>(null);

  protected readonly selectedTemplate = computed(
    () => this.templates().find((template) => template.id === this.templateId()) ?? null,
  );

  protected readonly templateOfGame = computed(() => {
    const byId = new Map(this.templates().map((template) => [template.id, template]));
    return (game: StubGame) => byId.get(game.templateId) ?? null;
  });

  protected readonly canStart = computed(() => this.draftPlayers().length >= 1);

  protected goTo(screen: Screen): void {
    this.screen.set(screen);
    this.note.set('');
  }

  protected openTemplate(templateId: string): void {
    this.templateId.set(templateId);
    this.screen.set('template');
  }

  protected openCreate(templateId: string): void {
    // Fresh draft every time — nothing leaks between games from the same template.
    this.templateId.set(templateId);
    this.draftPlayers.set([]);
    this.gameName.set('');
    this.screen.set('create');
  }

  protected createFromSelected(): void {
    const id = this.templateId();
    if (id) {
      this.openCreate(id);
    }
  }

  protected addPlayer(raw: string): void {
    const name = raw.trim();
    if (!name) {
      this.note.set('Введите имя игрока.');
      return;
    }
    const duplicate = this.draftPlayers().some(
      (candidate) => candidate.trim().toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) {
      this.note.set(`Игрок «${name}» уже в ростере.`);
      return;
    }
    this.draftPlayers.update((players) => [...players, name]);
    this.note.set('');
  }

  protected removePlayer(index: number): void {
    this.draftPlayers.update((players) => players.filter((_, i) => i !== index));
  }

  protected startGame(): void {
    const template = this.selectedTemplate();
    if (!template || !this.canStart()) {
      return;
    }
    const stamp = this.todayStamp();
    const game: StubGame = {
      id: 'game-' + Date.now(),
      templateId: template.id,
      name: this.gameName().trim() || `Игра от ${stamp}`,
      players: this.draftPlayers().map((name) => ({ name, score: 0 })),
      created: `создана ${stamp}`,
    };
    // New game first on Home; straight into the play screen after creation.
    this.games.update((all) => [game, ...all]);
    this.lastGame.set(game);
    this.screen.set('play');
  }

  private todayStamp(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}`;
  }

  protected removeTemplate(templateId: string): void {
    const template = this.templates().find((candidate) => candidate.id === templateId);
    this.templates.update((all) => all.filter((candidate) => candidate.id !== templateId));
    const cascade = this.games().filter((game) => game.templateId === templateId).length;
    this.games.update((all) => all.filter((game) => game.templateId !== templateId));
    this.note.set(
      `Шаблон «${template?.name}» удалён вместе с ${cascade} игрой/играми (каскад).`,
    );
    this.screen.set('templates');
  }

  protected removeGame(gameId: string): void {
    this.games.update((all) => all.filter((game) => game.id !== gameId));
    this.note.set('Игра удалена (медиа шаблона не тронуто).');
  }

  protected countQuestions(template: StubTemplate): number {
    const rounds = [...template.rounds, ...(template.superRound ? [template.superRound] : [])];
    return rounds.reduce(
      (total, round) =>
        total + round.topics.reduce((sum, topic) => sum + topic.questions.length, 0),
      0,
    );
  }

  protected roster(game: StubGame): string {
    return game.players.map((player) => `${player.name} ${player.score}`).join(' · ');
  }
}
