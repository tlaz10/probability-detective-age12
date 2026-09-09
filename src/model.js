export function clampProbability(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}

export function seededRng(seed = 1) {
  let state = (Number(seed) >>> 0) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

export function simulateCoin(trials, pHeads = 0.5, rng = Math.random) {
  const n = Math.max(0, Math.floor(Number(trials)));
  const p = clampProbability(pHeads);
  let heads = 0;
  for (let i = 0; i < n; i += 1) {
    if (p === 1 || (p > 0 && rng() < p)) heads += 1;
  }
  const tails = n - heads;
  return {
    trials: n,
    pHeads: p,
    heads,
    tails,
    headsProportion: n ? heads / n : 0,
    tailsProportion: n ? tails / n : 0,
    theoreticalHeads: p,
    theoreticalTails: 1 - p
  };
}

export function rollDie(rng = Math.random) {
  return Math.floor(rng() * 6) + 1;
}

export function diceTheoretical(mode = 'single') {
  if (mode === 'sum') {
    const ways = [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1];
    return ways.map((count, index) => ({ outcome: index + 2, probability: count / 36, ways: count }));
  }
  return Array.from({ length: 6 }, (_, index) => ({ outcome: index + 1, probability: 1 / 6, ways: 1 }));
}

export function simulateDice(trials, mode = 'single', rng = Math.random) {
  const n = Math.max(0, Math.floor(Number(trials)));
  const validMode = mode === 'sum' ? 'sum' : 'single';
  const min = validMode === 'sum' ? 2 : 1;
  const max = validMode === 'sum' ? 12 : 6;
  const counts = Object.fromEntries(Array.from({ length: max - min + 1 }, (_, index) => [String(min + index), 0]));
  for (let i = 0; i < n; i += 1) {
    const outcome = validMode === 'sum' ? rollDie(rng) + rollDie(rng) : rollDie(rng);
    counts[String(outcome)] += 1;
  }
  return {
    trials: n,
    mode: validMode,
    counts,
    rows: diceTheoretical(validMode).map(({ outcome, probability, ways }) => ({
      outcome,
      count: counts[String(outcome)],
      proportion: n ? counts[String(outcome)] / n : 0,
      theoretical: probability,
      ways
    }))
  };
}

export function gameExpectations({ aFaces = 2, aReward = 2, bReward = 1 } = {}) {
  const faces = Math.min(5, Math.max(1, Math.floor(Number(aFaces))));
  const rewardA = Math.min(9, Math.max(1, Number(aReward)));
  const rewardB = Math.min(9, Math.max(1, Number(bReward)));
  const pA = faces / 6;
  const pB = (6 - faces) / 6;
  const expectedA = pA * rewardA;
  const expectedB = pB * rewardB;
  const difference = expectedA - expectedB;
  return {
    aFaces: faces,
    aReward: rewardA,
    bReward: rewardB,
    pA,
    pB,
    expectedA,
    expectedB,
    difference,
    verdict: Math.abs(difference) < 1e-12 ? 'fair' : difference > 0 ? 'A' : 'B'
  };
}

export function simulateGame(trials, config = {}, rng = Math.random) {
  const n = Math.max(0, Math.floor(Number(trials)));
  const theory = gameExpectations(config);
  let aWins = 0;
  let bWins = 0;
  for (let i = 0; i < n; i += 1) {
    const roll = rollDie(rng);
    if (roll <= theory.aFaces) aWins += 1;
    else bWins += 1;
  }
  return {
    ...theory,
    trials: n,
    aWins,
    bWins,
    aPoints: aWins * theory.aReward,
    bPoints: bWins * theory.bReward
  };
}

export const FINAL_GAME = Object.freeze({
  aLabel: 'North',
  bLabel: 'South',
  description: 'Roll two fair dice. North scores 1 point on a sum of 7. South scores 3 points on a sum of 2 or 12. Other sums score 0.',
  expectedA: 6 / 36,
  expectedB: (2 / 36) * 3,
  verdict: 'fair'
});

export function simulateFinalGame(trials, rng = Math.random) {
  const n = Math.max(0, Math.floor(Number(trials)));
  let aHits = 0;
  let bHits = 0;
  for (let i = 0; i < n; i += 1) {
    const sum = rollDie(rng) + rollDie(rng);
    if (sum === 7) aHits += 1;
    else if (sum === 2 || sum === 12) bHits += 1;
  }
  return {
    trials: n,
    aHits,
    bHits,
    aPoints: aHits,
    bPoints: bHits * 3,
    expectedA: FINAL_GAME.expectedA,
    expectedB: FINAL_GAME.expectedB,
    verdict: FINAL_GAME.verdict
  };
}

export function formatPercent(value, digits = 1) {
  return `${(Number(value) * 100).toFixed(digits)}%`;
}

