import { Component, computed, signal } from '@angular/core';
import { STUB_GAMES, STUB_TEMPLATES, StubGame, StubTemplate } from './prototype-stub-data';
import { ProtoTemplateView } from './template-view';

// PROTOTYPE (decision ticket 04, throwaway): variant B «Картотека» — templates
// first: Home IS the templates list with import as the hero button; games are
// grouped behind the nav and nested in the template view's sidebar; no export
// on templates (export stays game-side in this variant). The template view is
// the shared game-shaped read-only component.
type Screen = 'home' | 'template' | 'games' | 'create';

@Component({
  selector: 'app-prototype-variant-b',
  imports: [ProtoTemplateView],
  templateUrl: './variant-b.html',
  styleUrl: './variant-b.scss',
})
export class PrototypeVariantB {
  protected readonly screen = signal<Screen>('home');
  protected readonly templates = signal<StubTemplate[]>([...STUB_TEMPLATES]);
  protected readonly games = signal<StubGame[]>([...STUB_GAMES]);
  private readonly templateId = signal<string | null>(null);
  protected readonly note = signal('');

  protected readonly selectedTemplate = computed(
    () => this.templates().find((template) => template.id === this.templateId()) ?? null,
  );

  protected readonly gamesOfTemplate = computed(() =>
    this.games().filter((game) => game.templateId === this.templateId()),
  );

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
    this.screen.set('home');
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
