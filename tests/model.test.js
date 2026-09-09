import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FINAL_GAME,
  diceTheoretical,
  gameExpectations,
  rollDie,
  seededRng,
  simulateCoin,
  simulateDice,
  simulateFinalGame,
  simulateGame
} from '../src/model.js';

test('seeded randomness is reproducible', () => {
  const first = simulateCoin(100, 0.5, seededRng(2026));
  const second = simulateCoin(100, 0.5, seededRng(2026));
  assert.deepEqual(first, second);
});

test('coin counts sum to trials and proportions match counts', () => {
  const result = simulateCoin(1000, 0.5, seededRng(12));
  assert.equal(result.heads + result.tails, 1000);
  assert.equal(result.headsProportion, result.heads / 1000);
  assert.equal(result.tailsProportion, result.tails / 1000);
});

test('p=0 and p=1 coins behave exactly as configured', () => {
  assert.deepEqual(simulateCoin(100, 0, seededRng(3)), {
    trials: 100, pHeads: 0, heads: 0, tails: 100,
    headsProportion: 0, tailsProportion: 1,
    theoreticalHeads: 0, theoreticalTails: 1
  });
  assert.equal(simulateCoin(100, 1, seededRng(3)).heads, 100);
});

test('fair coin theoretical chance stays one half regardless of observations', () => {
  const streakLikeRun = simulateCoin(5, 0.5, () => 0.01);
  assert.equal(streakLikeRun.heads, 5);
  assert.equal(streakLikeRun.theoreticalHeads, 0.5);
});

test('different sample sizes are generated rather than forced to perfect balance', () => {
  const ten = simulateCoin(10, 0.5, seededRng(1));
  const hundred = simulateCoin(100, 0.5, seededRng(1));
  assert.notEqual(ten.heads, 5);
  assert.notEqual(hundred.heads, 50);
});

test('die rolls always stay from 1 through 6', () => {
  const rng = seededRng(99);
  for (let i = 0; i < 10000; i += 1) {
    const value = rollDie(rng);
    assert.ok(value >= 1 && value <= 6);
  }
});

test('two-dice sums stay from 2 through 12 and counts sum to trials', () => {
  const result = simulateDice(6000, 'sum', seededRng(7));
  assert.equal(Object.values(result.counts).reduce((a, b) => a + b, 0), 6000);
  assert.deepEqual(Object.keys(result.counts).map(Number), [2,3,4,5,6,7,8,9,10,11,12]);
});

test('two-dice theoretical sum distribution has 36 routes and six routes to seven', () => {
  const rows = diceTheoretical('sum');
  assert.equal(rows.reduce((sum, row) => sum + row.ways, 0), 36);
  assert.equal(rows.find((row) => row.outcome === 7).ways, 6);
  assert.equal(rows.find((row) => row.outcome === 2).ways, 1);
});

test('game fairness follows exact expected-point arithmetic', () => {
  const fair = gameExpectations({ aFaces: 2, aReward: 2, bReward: 1 });
  assert.equal(fair.expectedA, 2 / 3);
  assert.equal(fair.expectedB, 2 / 3);
  assert.equal(fair.verdict, 'fair');
  const aAdvantage = gameExpectations({ aFaces: 3, aReward: 2, bReward: 1 });
  assert.equal(aAdvantage.verdict, 'A');
});

test('game simulation points agree with displayed win counts and rewards', () => {
  const result = simulateGame(1000, { aFaces: 2, aReward: 2, bReward: 1 }, seededRng(5));
  assert.equal(result.aWins + result.bWins, 1000);
  assert.equal(result.aPoints, result.aWins * 2);
  assert.equal(result.bPoints, result.bWins * 1);
});

test('final challenge is theoretically fair by the published rules', () => {
  assert.equal(FINAL_GAME.expectedA, 1 / 6);
  assert.equal(FINAL_GAME.expectedB, 1 / 6);
  const result = simulateFinalGame(2000, seededRng(44));
  assert.equal(result.verdict, 'fair');
  assert.equal(result.aPoints, result.aHits);
  assert.equal(result.bPoints, result.bHits * 3);
});

