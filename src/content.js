export const DEFINITIONS = Object.freeze({
  theoretical: 'Theoretical probability is the chance predicted by a mathematical model before an experiment is run.',
  experimental: 'Experimental proportion is the share actually observed in a particular set of trials.',
  sample: 'A sample is the group of trials you actually ran.',
  expected: 'Expected points are the average points per round predicted by the rules and probabilities, not a promise for one short run.'
});

export const OBJECTIVES = Object.freeze([
  'Tell theoretical probability apart from an observed experimental proportion.',
  'Explain why small samples can vary and compare evidence from different sample sizes.',
  'Use probabilities and point rules to decide whether a simple game is fair.'
]);

export const MISCONCEPTION = Object.freeze({
  question: 'A fair coin has just landed heads five times in a row. What is the theoretical chance of heads on the next flip?',
  correct: 'half',
  feedback: {
    half: 'Correct. A fair coin still has a 1/2 chance of heads on the next independent flip. The streak describes the past; it does not change the coin.',
    more: 'Not quite. A streak does not make heads more likely. For an independent fair flip, P(heads) = 1/2 every time.',
    less: 'Not quite. Randomness does not “owe” a tail. A fair coin has P(heads) = 1/2 even after five heads.'
  }
});

export const DICE_PREDICTION = Object.freeze({
  question: 'With two fair dice, which sum should appear most often over many rolls?',
  correct: '7',
  feedback: {
    '2': 'A sum of 2 has only one route: 1+1. A sum of 7 has six routes, so 7 is more likely.',
    '7': 'Correct. Six ordered pairs make 7: 1+6, 2+5, 3+4, 4+3, 5+2 and 6+1.',
    '12': 'A sum of 12 has only one route: 6+6. A sum of 7 has six routes, so 7 is more likely.'
  }
});

export const NEXT_PRACTICE = 'Invent a two-dice points game, write the exact probability and reward arithmetic first, then simulate it. Compare the model with the observed results without expecting a perfect match.';
