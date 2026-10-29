import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RoundService } from './round.service';
import { GameService } from './game.service';
import { makeValidGame } from '../../../../testing/game-fixture';

describe('RoundService', () => {
  let service: RoundService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    TestBed.inject(GameService).create(makeValidGame());
    service = TestBed.inject(RoundService);
  });

  it('getRound() returns the round by id', () => {
    expect(service.getRound('1', 'r1')?.name).toBe('Round 1');
  });

  it('getRound() returns undefined for an unknown round', () => {
    expect(service.getRound('1', 'nope')).toBeUndefined();
  });

  it('getSuperRound() returns the super round', () => {
    expect(service.getSuperRound('1')?.questions.length).toBe(1);
  });
});
