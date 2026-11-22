import { TestBed } from '@angular/core/testing';
import { GameTemplateService } from './game-template.service';
import { BalloonErrorService } from '../../errors/balloon-error.service';
import { makeGameTemplate } from '../../../../testing/game-fixture';

describe('GameTemplateService', () => {
  let service: GameTemplateService;
  let errorService: BalloonErrorService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [],
    });
    service = TestBed.inject(GameTemplateService);
    errorService = TestBed.inject(BalloonErrorService);
  });

  it('getAll() returns [] when storage is empty', () => {
    expect(service.getAll()).toEqual([]);
  });

  it('create() stores the template and getById() finds it', () => {
    const template = makeGameTemplate();
    expect(service.create(template)).toEqual(template);
    expect(service.getById('t-1')).toEqual(template);
    expect(service.getAll().length).toBe(1);
  });

  it('create() assigns a generated uuid when the id is missing', () => {
    const template = makeGameTemplate();
    delete template.id;
    const stored = service.create(template);
    expect(stored?.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(service.getAll()[0]?.id).toBe(stored?.id);
  });

  it('create() refuses a duplicate name and raises a balloon error', () => {
    service.create(makeGameTemplate('t-1'));
    expect(service.create(makeGameTemplate('t-2'))).toBeNull();
    expect(errorService.error()?.description).toContain('уже существует');
    expect(errorService.error()?.description).toContain('Test game template');
  });

  it('name identity compares trimmed + case-insensitively and stores verbatim', () => {
    service.create(makeGameTemplate('t-1', 'Музыка'));
    expect(service.create(makeGameTemplate('t-2', 'музыка '))).toBeNull();
    expect(service.getByName('МУЗЫКА')?.name).toBe('Музыка');
  });

  it('getByName() misses unknown names', () => {
    service.create(makeGameTemplate());
    expect(service.getByName('Нет такого')).toBeUndefined();
  });

  it('delete() removes the template from storage', () => {
    service.create(makeGameTemplate());
    service.delete('t-1');
    expect(service.getAll()).toEqual([]);
  });

  it('delete() leaves storage untouched for an unknown id', () => {
    service.create(makeGameTemplate());
    service.delete('missing');
    expect(service.getAll().length).toBe(1);
  });
});
