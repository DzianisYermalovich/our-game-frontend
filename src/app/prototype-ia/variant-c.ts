import { Component, computed, signal } from '@angular/core';
import { STUB_GAMES, STUB_TEMPLATES, StubGame, StubTemplate } from './prototype-stub-data';
import { ProtoTemplateView } from './template-view';

// PROTOTYPE (decision ticket 04, throwaway): variant C «Игровая» — games
// first: Home is "continue playing" with progress cards; the template library
// is a collapsed <details> section on the same page with import tucked inside.
// The template view is the shared game-shaped read-only component.
type Screen = 'home' | 'templates' | 'template' | 'create';

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

  protected readonly selectedTemplate = computed(
    () => this.templates().find((template) => template.id === this.templateId()) ?? null,
  );

  protected readonly templateOfGame = computed(() => {
    const byId = new Map(this.templates().map((template) => [template.id, template]));
    return (game: StubGame) => byId.get(game.templateId) ?? null;
  });

  protected goTo(screen: Screen): void {
    this.screen.set(screen);
    this.note.set('');
  }

  protected openTemplate(templateId: string): void {
    this.templateId.set(templateId);
    this.screen.set('template');
  }

  protected createFromSelected(): void {
    this.screen.set('create');
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
