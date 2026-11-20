import { Component, computed, input, output, signal } from '@angular/core';
import { StubGame, StubQuestion, StubTemplate } from './prototype-stub-data';

// PROTOTYPE (decision ticket 04, throwaway): game-shaped read-only template
// view, shared by all IA variants — the maintainer steered "a template should
// look like the game does today, read-only, structured so editing can bolt on
// later". Mirrors the play flow: round list -> round grid -> question ->
// answer, minus scoring, stakes and splash sounds. The sidebar is where
// per-variant extras and (later) editing would attach.
type View = 'rounds' | 'grid' | 'super' | 'question';

@Component({
  selector: 'app-proto-template-view',
  templateUrl: './template-view.html',
  styleUrl: './template-view.scss',
})
export class ProtoTemplateView {
  public readonly template = input.required<StubTemplate>();
  public readonly games = input<readonly StubGame[]>([]);
  /** Variant key — drives the sidebar extras (export for A, nested games for B). */
  public readonly mode = input.required<'A' | 'B' | 'C'>();

  public readonly create = output<void>();
  public readonly close = output<void>();
  public readonly exportRequest = output<void>();
  public readonly note = output<string>();

  protected readonly view = signal<View>('rounds');
  protected readonly roundIndex = signal(0);
  protected readonly question = signal<StubQuestion | null>(null);
  private readonly fromSuper = signal(false);

  protected readonly rounds = computed(() => {
    const template = this.template();
    return [...template.rounds, ...(template.superRound ? [template.superRound] : [])];
  });

  protected readonly currentRound = computed(() => this.rounds()[this.roundIndex()] ?? null);

  protected openRound(index: number): void {
    this.roundIndex.set(index);
    this.view.set('grid');
  }

  protected openSuper(): void {
    this.fromSuper.set(false);
    this.view.set('super');
  }

  protected openQuestion(question: StubQuestion): void {
    this.question.set(question);
    this.view.set('question');
  }

  protected openSuperQuestion(question: StubQuestion): void {
    this.fromSuper.set(true);
    this.question.set(question);
    this.view.set('question');
  }

  protected backToQuestions(): void {
    this.question.set(null);
    this.view.set(this.fromSuper() ? 'super' : 'grid');
  }

  protected backToRounds(): void {
    this.question.set(null);
    this.fromSuper.set(false);
    this.view.set('rounds');
  }

  protected continueStub(game: StubGame): void {
    this.note.emit(
      `«${game.name}»: продолжить открывает существующий экран игры /games/:gameId — в прототипе не играем.`,
    );
  }

  protected exportStub(): void {
    this.exportRequest.emit();
    this.note.emit(
      'Экспорт шаблона в zip — заглушка (в этом варианте экспорт живёт у шаблонов, ticket 06).',
    );
  }

  protected roster(game: StubGame): string {
    return game.players.map((player) => `${player.name} ${player.score}`).join(' · ');
  }
}
