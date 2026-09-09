import {
  FINAL_GAME,
  formatPercent,
  gameExpectations,
  simulateCoin,
  simulateDice,
  simulateFinalGame,
  simulateGame
} from './model.js';
import { DICE_PREDICTION, MISCONCEPTION, NEXT_PRACTICE } from './content.js';

const STORAGE_KEY = 'probability-detective-progress-v1';
const defaultState = () => ({
  started: false,
  completed: { coin: false, dice: false, game: false },
  coinRuns: {},
  currentView: 'coin'
});

let state = loadState();

function $(selector, root = document) { return root.querySelector(selector); }
function $$(selector, root = document) { return [...root.querySelectorAll(selector)]; }

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!parsed || typeof parsed !== 'object') return defaultState();
    return {
      ...defaultState(),
      ...parsed,
      completed: { ...defaultState().completed, ...(parsed.completed || {}) },
      coinRuns: parsed.coinRuns || {}
    };
  } catch {
    return defaultState();
  }
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage can be unavailable; lesson still works in memory */ }
}

function setFeedback(element, text, kind = '') {
  element.textContent = text;
  if (kind) element.dataset.kind = kind;
  else delete element.dataset.kind;
}

function startLesson() {
  state.started = true;
  saveState();
  $('#onboarding').hidden = true;
  $('#lesson-shell').hidden = false;
  setView(state.currentView || 'coin', { focus: true });
}

function setView(view, { focus = false } = {}) {
  const allowed = ['coin', 'dice', 'game', 'summary'];
  const next = allowed.includes(view) ? view : 'coin';
  state.currentView = next;
  saveState();
  $$('[data-panel]').forEach((panel) => { panel.hidden = panel.dataset.panel !== next; });
  $$('.nav-button').forEach((button) => {
    const active = button.dataset.view === next;
    button.classList.toggle('is-active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  updateSummary();
  if (focus) {
    const heading = $(`[data-panel="${next}"] h2`);
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
}

function updateProgress() {
  const count = Object.values(state.completed).filter(Boolean).length;
  $('#progress-text').innerHTML = `<strong>${count} of 3 investigations complete</strong>`;
  $('#progress-bar').setAttribute('aria-valuenow', String(count));
  $('#progress-fill').style.width = `${(count / 3) * 100}%`;
  for (const key of ['coin', 'dice', 'game']) {
    const badge = $(`#${key}-status`);
    badge.textContent = state.completed[key] ? 'Complete' : 'Open case';
    badge.classList.toggle('complete', state.completed[key]);
  }
}

function markComplete(key, nextView) {
  state.completed[key] = true;
  saveState();
  updateProgress();
  setView(nextView, { focus: true });
}

function updateSummary() {
  const done = Object.entries(state.completed).filter(([, value]) => value).map(([key]) => key);
  const labels = { coin: 'Coin laboratory', dice: 'Dice investigation', game: 'Fair-game designer' };
  $('#summary-status').innerHTML = done.length === 3
    ? '<p><strong>Case complete.</strong> You finished all three investigations. Replay any section to collect different evidence.</p>'
    : `<p><strong>${done.length} of 3 complete.</strong> Finished: ${done.length ? done.map((key) => labels[key]).join(', ') : 'none yet'}.</p><p>You can visit this summary at any time; unfinished activities stay available.</p>`;
  $('#next-practice').textContent = NEXT_PRACTICE;
}

function updateCoinModelLabel() {
  const percent = Number($('#coin-prob').value);
  $('#coin-prob-output').textContent = `${percent}%`;
  $('#coin-type').innerHTML = percent === 50
    ? '<strong>Fair coin</strong> — heads and tails each have a 50% theoretical chance.'
    : `<strong>Biased coin</strong> — heads has a ${percent}% theoretical chance; tails has ${100 - percent}%.`;
}

function barLine(label, value, theoretical = false, scale = 1) {
  const width = Math.min(1, Math.max(0, value / Math.max(scale, Number.EPSILON)));
  return `<div class="bar-line"><span>${label}</span><span class="bar-track" aria-hidden="true"><span class="bar-fill${theoretical ? ' theory' : ''}" style="width:${width * 100}%"></span></span><span>${formatPercent(value)}</span></div>`;
}

function renderCoin(result) {
  $('#coin-result-empty').hidden = true;
  $('#coin-result-content').hidden = false;
  const predictionText = $('#coin-prediction').value.trim();
  const prediction = predictionText === '' ? null : Math.min(100, Math.max(0, Number(predictionText)));
  const difference = Math.abs(result.headsProportion - result.theoreticalHeads);
  let lead = `${result.heads} heads and ${result.tails} tails in ${result.trials.toLocaleString()} flips. Observed heads: ${formatPercent(result.headsProportion)}; theoretical heads: ${formatPercent(result.theoreticalHeads)}.`;
  if (prediction !== null && Number.isFinite(prediction)) {
    lead += ` Your prediction was ${prediction.toFixed(1)}% heads, ${Math.abs(prediction / 100 - result.headsProportion) < 0.05 ? 'quite close to' : 'different from'} this run.`;
  }
  lead += ` This sample differs from the model by ${(difference * 100).toFixed(1)} percentage points.`;
  $('#coin-result-lead').textContent = lead;
  $('#coin-chart').innerHTML = [
    ['Heads', result.headsProportion, result.theoreticalHeads],
    ['Tails', result.tailsProportion, result.theoreticalTails]
  ].map(([label, observed, theory]) => `<div class="bar-row"><div class="bar-label">${label}</div><div class="bar-pair">${barLine('Observed', observed)}${barLine('Theory', theory, true)}</div></div>`).join('');
  $('#coin-table-body').innerHTML = [
    ['Heads', result.heads, result.headsProportion, result.theoreticalHeads],
    ['Tails', result.tails, result.tailsProportion, result.theoreticalTails]
  ].map(([label, count, observed, theory]) => `<tr><th scope="row">${label}</th><td>${count}</td><td>${formatPercent(observed)}</td><td>${formatPercent(theory)}</td></tr>`).join('');

  state.coinRuns[String(result.trials)] = {
    trials: result.trials,
    pHeads: result.pHeads,
    heads: result.heads,
    proportion: result.headsProportion,
    difference
  };
  saveState();
  renderCoinComparison();
  $('#coin-complete').disabled = false;
}

function renderCoinComparison() {
  const sizes = [10, 100, 1000];
  const any = sizes.some((size) => state.coinRuns[String(size)]);
  if (!any) return;
  $('#coin-comparison').innerHTML = sizes.map((size) => {
    const run = state.coinRuns[String(size)];
    if (!run) return `<article class="sample-card"><strong>${size.toLocaleString()} flips</strong><p class="muted">Not run yet.</p></article>`;
    return `<article class="sample-card"><strong>${size.toLocaleString()} flips</strong><p>Heads: ${run.heads} (${formatPercent(run.proportion)})</p><p>Theory: ${formatPercent(run.pHeads)}</p><p>Distance: ${(run.difference * 100).toFixed(1)} percentage points</p></article>`;
  }).join('');
}

function runCoin(trials) {
  const pHeads = Number($('#coin-prob').value) / 100;
  renderCoin(simulateCoin(trials, pHeads));
}

function checkStreak() {
  const selected = $('input[name="streak-answer"]:checked');
  if (!selected) {
    setFeedback($('#streak-feedback'), 'Choose an answer when you are ready, or keep experimenting first. There is no penalty.', 'revise');
    return;
  }
  const correct = selected.value === MISCONCEPTION.correct;
  setFeedback($('#streak-feedback'), MISCONCEPTION.feedback[selected.value], correct ? 'good' : 'revise');
  $('#coin-complete').disabled = false;
}

function renderDice(result) {
  $('#dice-result-empty').hidden = true;
  $('#dice-result-content').hidden = false;
  const label = result.mode === 'sum' ? 'two-dice sums' : 'single-die faces';
  $('#dice-result-lead').textContent = `${result.trials.toLocaleString()} generated ${label}. Observed bars come from this run; striped bars show the theoretical model.`;
  const maxTheory = Math.max(...result.rows.map((row) => row.theoretical));
  const maxObserved = Math.max(...result.rows.map((row) => row.proportion));
  const scale = Math.max(maxTheory, maxObserved, 0.01);
  $('#dice-chart').innerHTML = result.rows.map((row) => {
    return `<div class="bar-row"><div class="bar-label">${row.outcome}</div><div class="bar-pair">${barLine('Observed', row.proportion, false, scale)}${barLine('Theory', row.theoretical, true, scale)}</div></div>`;
  }).join('');
  $('#dice-table-caption').textContent = result.mode === 'sum'
    ? 'Two-dice sums: each “way” is one ordered pair out of 36 equally likely pairs.'
    : 'Single fair die outcomes: each face has one equally likely way out of 6.';
  $('#dice-table-body').innerHTML = result.rows.map((row) => `<tr><th scope="row">${row.outcome}</th><td>${row.ways}</td><td>${row.count}</td><td>${formatPercent(row.proportion)}</td><td>${formatPercent(row.theoretical)}</td></tr>`).join('');

  const prediction = $('input[name="dice-prediction"]:checked');
  if (result.mode === 'sum' && prediction) {
    const correct = prediction.value === DICE_PREDICTION.correct;
    setFeedback($('#dice-feedback'), DICE_PREDICTION.feedback[prediction.value], correct ? 'good' : 'revise');
  } else if (result.mode === 'sum') {
    setFeedback($('#dice-feedback'), 'Prediction skipped—fine. The table shows the reason: 7 has 6 of 36 routes, while 2 and 12 each have only 1 of 36.', 'good');
  } else {
    setFeedback($('#dice-feedback'), 'For one fair die, each face has the same theoretical probability, 1/6. Observed counts can still differ in any finite sample.', 'good');
  }
  $('#dice-complete').disabled = false;
}

function updateGameFormula() {
  const config = currentGameConfig();
  const theory = gameExpectations(config);
  const aFacesList = Array.from({ length: theory.aFaces }, (_, i) => i + 1).join(', ');
  const bFacesList = Array.from({ length: 6 - theory.aFaces }, (_, i) => i + theory.aFaces + 1).join(', ');
  const verdict = theory.verdict === 'fair' ? 'The rules are theoretically fair.' : `The rules give Side ${theory.verdict} the higher expected points per round.`;
  $('#game-formula').innerHTML = `
    <p><strong>Side A:</strong> faces ${aFacesList} → P(A) = ${theory.aFaces}/6. Expected A = ${theory.aFaces}/6 × ${theory.aReward} = ${theory.expectedA.toFixed(3)} points/round.</p>
    <p><strong>Side B:</strong> faces ${bFacesList} → P(B) = ${6 - theory.aFaces}/6. Expected B = ${6 - theory.aFaces}/6 × ${theory.bReward} = ${theory.expectedB.toFixed(3)} points/round.</p>
    <p class="verdict">${verdict}</p>`;
  return theory;
}

function currentGameConfig() {
  return {
    aFaces: Number($('#a-faces').value),
    aReward: Number($('#a-reward').value),
    bReward: Number($('#b-reward').value)
  };
}

function renderGame(result) {
  $('#game-result-empty').hidden = true;
  $('#game-result-content').hidden = false;
  const theoryText = result.verdict === 'fair'
    ? `The exact rule calculation is fair: both sides expect ${result.expectedA.toFixed(3)} points per round.`
    : `The exact rule calculation favors Side ${result.verdict}: A expects ${result.expectedA.toFixed(3)} and B expects ${result.expectedB.toFixed(3)} points per round.`;
  $('#game-result-lead').textContent = `${theoryText} The ${result.trials.toLocaleString()}-round simulation is evidence from one run, not the definition of fairness.`;
  $('#game-score-grid').innerHTML = `
    <article class="score-card"><span>Side A simulation</span><strong>${result.aPoints.toLocaleString()} points</strong><span>${result.aWins.toLocaleString()} scoring rolls × ${result.aReward} points</span></article>
    <article class="score-card"><span>Side B simulation</span><strong>${result.bPoints.toLocaleString()} points</strong><span>${result.bWins.toLocaleString()} scoring rolls × ${result.bReward} points</span></article>`;
  const prediction = $('input[name="game-prediction"]:checked');
  if (!prediction) {
    setFeedback($('#game-feedback'), `Prediction skipped. Worked calculation: A = ${result.aFaces}/6 × ${result.aReward} = ${result.expectedA.toFixed(3)}; B = ${6 - result.aFaces}/6 × ${result.bReward} = ${result.expectedB.toFixed(3)}.`, 'good');
  } else if (prediction.value === result.verdict) {
    setFeedback($('#game-feedback'), `Your prediction matches the exact expected-point calculation. The simulation totals may still differ because random samples vary.`, 'good');
  } else {
    const verdictWord = result.verdict === 'fair' ? 'equal' : `higher for Side ${result.verdict}`;
    setFeedback($('#game-feedback'), `Revise using the arithmetic, not the simulated winner: A = ${result.aFaces}/6 × ${result.aReward} = ${result.expectedA.toFixed(3)}; B = ${6 - result.aFaces}/6 × ${result.bReward} = ${result.expectedB.toFixed(3)}. Those expected values are ${verdictWord}.`, 'revise');
  }
}

function runFinalChallenge() {
  const result = simulateFinalGame(2000);
  const prediction = $('input[name="final-prediction"]:checked');
  const correctPrediction = !prediction || prediction.value === 'fair';
  const explanation = `North: P(sum 7) = 6/36, so expected points = 6/36 × 1 = 1/6. South: P(sum 2 or 12) = 2/36, so expected points = 2/36 × 3 = 6/36 = 1/6. The rules are fair. In this 2,000-round run North scored ${result.aPoints} and South scored ${result.bPoints}; a tie was never required.`;
  setFeedback($('#final-result'), prediction ? `${correctPrediction ? 'Good reasoning.' : 'Use the route counts to revise.'} ${explanation}` : `Prediction skipped. ${explanation}`, correctPrediction ? 'good' : 'revise');
  $('#game-complete').disabled = false;
}

function resetAll() {
  const confirmed = window.confirm('Reset all locally stored progress and experiment history? The page will stay open.');
  if (!confirmed) return;
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  state = defaultState();
  $('form')?.reset?.();
  $('#coin-prob').value = '50';
  $('#coin-prediction').value = '';
  $$('input[type="radio"]').forEach((radio) => { radio.checked = false; });
  $('#dice-mode').value = 'sum';
  $('#a-faces').value = '2';
  $('#a-reward').value = '2';
  $('#b-reward').value = '1';
  for (const id of ['coin-result-content', 'dice-result-content', 'game-result-content']) $( `#${id}` ).hidden = true;
  for (const id of ['coin-result-empty', 'dice-result-empty', 'game-result-empty']) $( `#${id}` ).hidden = false;
  for (const id of ['streak-feedback', 'dice-feedback', 'final-result']) setFeedback($( `#${id}` ), '');
  $('#coin-comparison').innerHTML = '<p class="muted">Run 10, 100, and 1,000 trials to build your comparison.</p>';
  $('#coin-complete').disabled = true;
  $('#dice-complete').disabled = true;
  $('#game-complete').disabled = true;
  updateCoinModelLabel();
  updateGameFormula();
  updateProgress();
  $('#lesson-shell').hidden = true;
  $('#onboarding').hidden = false;
  $('#start-case').focus();
}

function restoreUi() {
  updateCoinModelLabel();
  renderCoinComparison();
  updateGameFormula();
  updateProgress();
  updateSummary();
  if (state.started) {
    $('#onboarding').hidden = true;
    $('#lesson-shell').hidden = false;
    setView(state.currentView || 'coin');
  }
}

$('#start-case').addEventListener('click', startLesson);
$('#reset-all').addEventListener('click', resetAll);
$$('[data-view]').forEach((button) => button.addEventListener('click', () => setView(button.dataset.view, { focus: true })));
$('#coin-prob').addEventListener('input', updateCoinModelLabel);
$$('[data-coin-preset]').forEach((button) => button.addEventListener('click', () => {
  $('#coin-prob').value = button.dataset.coinPreset;
  updateCoinModelLabel();
}));
$$('[data-coin-trials]').forEach((button) => button.addEventListener('click', () => runCoin(Number(button.dataset.coinTrials))));
$('#check-streak').addEventListener('click', checkStreak);
$('#coin-complete').addEventListener('click', () => markComplete('coin', 'dice'));
$$('[data-dice-trials]').forEach((button) => button.addEventListener('click', () => renderDice(simulateDice(Number(button.dataset.diceTrials), $('#dice-mode').value))));
$('#dice-complete').addEventListener('click', () => markComplete('dice', 'game'));
for (const id of ['a-faces', 'a-reward', 'b-reward']) $(`#${id}`).addEventListener('change', updateGameFormula);
$$('[data-game-trials]').forEach((button) => button.addEventListener('click', () => renderGame(simulateGame(Number(button.dataset.gameTrials), currentGameConfig()))));
$('#run-final').addEventListener('click', runFinalChallenge);
$('#game-complete').addEventListener('click', () => markComplete('game', 'summary'));

restoreUi();

// Expose a tiny read-only inspection hook for adult browser checks; no learner data leaves the page.
window.ProbabilityDetective = Object.freeze({
  getProgress: () => JSON.parse(JSON.stringify(state.completed)),
  getFinalGameModel: () => ({ ...FINAL_GAME })
});

