import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { TemplateView } from './template-view';
import { GameTemplateService } from '../../_services/data/local-storage/game-template.service';
import { makeGameTemplate } from '../../../testing/game-fixture';

describe('TemplateView', () => {
  let router: Router;
  /** The mutable param the ActivatedRoute stub serves to the component. */
  let routeTemplateId: string | null;

  beforeEach(async () => {
    localStorage.clear();
    routeTemplateId = null;
    await TestBed.configureTestingModule({
      imports: [TemplateView],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'templateId' ? routeTemplateId : null),
              },
            },
          },
        },
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  function create(templateId: string | null) {
    routeTemplateId = templateId;
    const fixture = TestBed.createComponent(TemplateView);
    fixture.detectChanges();
    return fixture;
  }

  it('redirects to the library when the id is unknown', () => {
    create(null);
    expect(router.navigate).toHaveBeenCalledWith(['templates']);
  });

  it('renders the round list with a super-round row', () => {
    TestBed.inject(GameTemplateService).create(makeGameTemplate());
    const fixture = create('t-1');
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Раунд1:');
    expect(text).toContain('Round 1');
    expect(text).toContain('Супер раунд');
    expect(text).toContain('только просмотр');
  });

  it('carries the global header («Мои игры» | «Шаблоны»)', () => {
    TestBed.inject(GameTemplateService).create(makeGameTemplate());
    const fixture = create('t-1');
    const header = fixture.nativeElement.querySelector('header');
    expect(header?.textContent).toContain('Мои игры');
    expect(header?.textContent).toContain('Шаблоны');
  });

  it('the grid shows derived prices (minPrice × position)', () => {
    TestBed.inject(GameTemplateService).create(makeGameTemplate());
    const fixture = create('t-1');
    const seeButtons = [...fixture.nativeElement.querySelectorAll('button')].filter((button) =>
      button.textContent?.includes('Смотреть'),
    );
    seeButtons[0]!.click();
    fixture.detectChanges();
    const prices = [...fixture.nativeElement.querySelectorAll('.template-price-num')].map((cell) =>
      cell.textContent?.trim(),
    );
    // minPrice 100: first question ×1×1, second ×2×1.
    expect(prices).toEqual(['100', '200']);
  });

  it('the question opens with the answer visible immediately', () => {
    TestBed.inject(GameTemplateService).create(makeGameTemplate());
    const fixture = create('t-1');
    [...fixture.nativeElement.querySelectorAll('button')]
      .filter((button) => button.textContent?.includes('Смотреть'))[0]!
      .click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.template-price-btn')!.click();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Q1');
    expect(text).toContain('Ответ: A1');
  });

  it('the super round opens as flat rows', () => {
    TestBed.inject(GameTemplateService).create(makeGameTemplate());
    const fixture = create('t-1');
    [...fixture.nativeElement.querySelectorAll('button')]
      .filter((button) => button.textContent?.includes('Смотреть'))
      .at(-1)!
      .click();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Super topic');
    expect(text).toContain('SQ1');
    expect(text).toContain('SA1');
  });

  it('the super row is keyboard-activatable (role="button")', () => {
    TestBed.inject(GameTemplateService).create(makeGameTemplate());
    const fixture = create('t-1');
    [...fixture.nativeElement.querySelectorAll('button')]
      .filter((button) => button.textContent?.includes('Смотреть'))
      .at(-1)!
      .click();
    fixture.detectChanges();
    const row = fixture.nativeElement.querySelector('.template-super-row') as HTMLElement;
    expect(row.getAttribute('role')).toBe('button');
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('SQ1');
  });

  it('«К шаблонам» navigates back to the library', () => {
    TestBed.inject(GameTemplateService).create(makeGameTemplate());
    const fixture = create('t-1');
    [...fixture.nativeElement.querySelectorAll('button')]
      .find((button) => button.textContent?.includes('К шаблонам'))!
      .click();
    expect(router.navigate).toHaveBeenCalledWith(['templates']);
  });
});
