import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const evidenceDir = resolve(root, 'evidence');
const screenshotsDir = resolve(evidenceDir, 'screenshots');
const profileDir = resolve(root, '.tmp', 'chrome-evidence-' + process.pid);
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9239;
const baseUrl = 'http://127.0.0.1:4173';

await mkdir(screenshotsDir, { recursive: true });
await rm(profileDir, { recursive: true, force: true });
await mkdir(profileDir, { recursive: true });

const server = spawn(process.execPath, ['scripts/serve.mjs', '--root', '.', '--port', '4173'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
const browser = spawn(chrome, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profileDir}`,
  '--no-first-run',
  '--disable-default-apps',
  '--disable-background-networking',
  '--force-color-profile=srgb',
  '--touch-events=enabled',
  'about:blank'
], { stdio: ['ignore', 'ignore', 'ignore'] });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(url, timeout = 10000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    try { const res = await fetch(url); if (res.ok) return res; } catch {}
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

class CDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.events = new Map();
  }
  async open() {
    await new Promise((resolveOpen, reject) => {
      this.ws.onopen = resolveOpen;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id) {
        const pending = this.pending.get(msg.id);
        if (!pending) return;
        this.pending.delete(msg.id);
        if (msg.error) pending.reject(new Error(msg.error.message)); else pending.resolve(msg.result);
        return;
      }
      const handlers = this.events.get(msg.method) || [];
      for (const handler of handlers) Promise.resolve(handler(msg.params)).catch(() => {});
    };
  }
  on(method, handler) {
    if (!this.events.has(method)) this.events.set(method, []);
    this.events.get(method).push(handler);
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolveSend, reject) => {
      this.pending.set(id, { resolve: resolveSend, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  close() { this.ws.close(); }
}

const checks = [];
const record = (name, pass, details = '') => {
  checks.push({ name, pass: Boolean(pass), details });
  if (!pass) throw new Error(`${name}: ${details}`);
};

let cdp;
try {
  await waitFor(`${baseUrl}/`);
  await waitFor(`http://127.0.0.1:${port}/json/version`);
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(baseUrl)}`, { method: 'PUT' })).json();
  cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.open();
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('DOM.enable');
  cdp.on('Page.javascriptDialogOpening', async () => { await cdp.send('Page.handleJavaScriptDialog', { accept: true }); });
  await cdp.send('Page.navigate', { url: baseUrl });
  await sleep(500);

  const evalValue = async (expression) => {
    const result = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const setMetrics = async (width, height, mobile = false) => {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile, screenWidth: width, screenHeight: height });
  };
  const click = (selector) => evalValue(`document.querySelector(${JSON.stringify(selector)}).click(); true`);
  const setValue = (selector, value, event = 'change') => evalValue(`(() => { const el=document.querySelector(${JSON.stringify(selector)}); el.value=${JSON.stringify(String(value))}; el.dispatchEvent(new Event(${JSON.stringify(event)},{bubbles:true})); return el.value; })()`);
  const checkRadio = (selector) => evalValue(`(() => { const el=document.querySelector(${JSON.stringify(selector)}); el.checked=true; el.dispatchEvent(new Event('change',{bubbles:true})); return el.checked; })()`);
  const scrollTo = (selector) => evalValue(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'start'}); true`);
  const screenshot = async (name) => {
    await sleep(120);
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
    await writeFile(resolve(screenshotsDir, name), Buffer.from(shot.data, 'base64'));
  };

  await setMetrics(1280, 1000, false);
  await evalValue(`localStorage.clear(); true`);
  await cdp.send('Page.reload', { ignoreCache: true });
  await sleep(500);
  record('initial onboarding visible', await evalValue(`!document.querySelector('#onboarding').hidden && document.querySelector('#lesson-shell').hidden`));
  record('1280px body has no horizontal overflow', await evalValue(`document.documentElement.scrollWidth <= window.innerWidth`), await evalValue(`JSON.stringify({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth})`));
  await click('#start-case');
  record('lesson starts without reload', await evalValue(`document.querySelector('#onboarding').hidden && !document.querySelector('#lesson-shell').hidden`));

  // Coin boundary probabilities.
  await setValue('#coin-prob', 0, 'input');
  await click('[data-coin-trials="100"]');
  record('0% heads coin is exact', await evalValue(`document.querySelector('#coin-result-lead').textContent.includes('0 heads and 100 tails')`));
  await setValue('#coin-prob', 100, 'input');
  await click('[data-coin-trials="100"]');
  record('100% heads coin is exact', await evalValue(`document.querySelector('#coin-result-lead').textContent.includes('100 heads and 0 tails')`));

  // Fair coin sample-size evidence and streak misconception.
  await setValue('#coin-prob', 50, 'input');
  await setValue('#coin-prediction', 50, 'input');
  for (const n of [10, 100, 1000]) await click(`[data-coin-trials="${n}"]`);
  record('coin comparison contains 10/100/1000 runs', await evalValue(`document.querySelectorAll('#coin-comparison .sample-card').length === 3 && document.querySelector('#coin-comparison').textContent.includes('1,000 flips')`));
  record('coin table counts equal 1000', await evalValue(`(() => { const rows=[...document.querySelectorAll('#coin-table-body tr')]; return rows.reduce((s,r)=>s+Number(r.children[1].textContent),0)===1000; })()`));
  await checkRadio('input[name="streak-answer"][value="less"]');
  await click('#check-streak');
record('incorrect streak answer gets counterexample feedback', await evalValue(`(() => { const t=document.querySelector('#streak-feedback').textContent.toLowerCase(); return t.includes('owe') || t.includes('1/2') || t.includes('independent'); })()`), await evalValue(`document.querySelector('#streak-feedback').textContent`));
  await checkRadio('input[name="streak-answer"][value="half"]');
  await click('#check-streak');
  record('correct streak answer explains unchanged one-half chance', await evalValue(`document.querySelector('#streak-feedback').textContent.includes('1/2')`));
  await scrollTo('#coin-result');
  await screenshot('01-coin-lab-1280.png');
  await click('#coin-complete');

  // Dice investigation.
  await checkRadio('input[name="dice-prediction"][value="7"]');
  await setValue('#dice-mode', 'sum', 'change');
  await click('[data-dice-trials="600"]');
  record('two-dice table has outcomes 2 through 12', await evalValue(`(() => { const rows=[...document.querySelectorAll('#dice-table-body tr')]; return rows.length===11 && rows[0].children[0].textContent==='2' && rows.at(-1).children[0].textContent==='12'; })()`));
  record('two-dice counts equal 600', await evalValue(`[...document.querySelectorAll('#dice-table-body tr')].reduce((s,r)=>s+Number(r.children[2].textContent),0)===600`));
  record('dice chart and table both populated from run', await evalValue(`document.querySelectorAll('#dice-chart .bar-row').length===11 && document.querySelectorAll('#dice-table-body tr').length===11`));
  record('sum-of-seven explanation identifies six routes', await evalValue(`document.querySelector('#dice-feedback').textContent.includes('Six ordered pairs')`), await evalValue(`document.querySelector('#dice-feedback').textContent`));
  await scrollTo('#dice-result');
  await screenshot('02-dice-investigation-1280.png');
  await click('#dice-complete');

  // Game designer exact arithmetic and final transfer challenge.
  await setValue('#a-faces', 2, 'change');
  await setValue('#a-reward', 2, 'change');
  await setValue('#b-reward', 1, 'change');
  await checkRadio('input[name="game-prediction"][value="fair"]');
record('designer publishes exact expected-point arithmetic', await evalValue(`(() => { const t=document.querySelector('#game-formula').textContent; return t.includes('Expected A = 2/6') && t.includes('Expected B = 4/6') && t.includes('0.667'); })()`), await evalValue(`document.querySelector('#game-formula').textContent`));
  await click('[data-game-trials="600"]');
record('game simulation has 600 scoring outcomes', await evalValue(`(() => { const m=[...document.querySelectorAll('#game-score-grid .score-card span:last-child')].map(el=>Number.parseInt(el.textContent,10)); return m.length===2 && m[0]+m[1]===600; })()`), await evalValue(`document.querySelector('#game-score-grid').textContent`));
  await checkRadio('input[name="final-prediction"][value="South"]');
  await click('#run-final');
record('incorrect final fairness answer gets worked calculation', await evalValue(`(() => { const t=document.querySelector('#final-result').textContent; return t.includes('6/36') && t.includes('2/36') && t.includes('1/6') && t.includes('Use the route counts to revise'); })()`), await evalValue(`document.querySelector('#final-result').textContent`));
  await checkRadio('input[name="final-prediction"][value="fair"]');
  await click('#run-final');
  record('final challenge identifies theoretical fairness without promising a tie', await evalValue(`/rules are fair/i.test(document.querySelector('#final-result').textContent) && /tie was never required/i.test(document.querySelector('#final-result').textContent)`));
  await scrollTo('#game-result');
  await screenshot('03-fair-game-designer-1280.png');
  await click('#game-complete');
  record('completion summary shows all three complete', await evalValue(`/Case complete/.test(document.querySelector('#summary-status').textContent)`));

  // 768px responsive summary.
  await setMetrics(768, 900, false);
  record('768px body has no horizontal overflow', await evalValue(`document.documentElement.scrollWidth <= window.innerWidth`), await evalValue(`JSON.stringify({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth})`));
  await scrollTo('#case-summary');
  await screenshot('05-summary-768.png');

  // Keyboard navigation: focus Dice nav and activate with Enter.
  await evalValue(`document.querySelector('[data-view="dice"]').focus(); true`);
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
  await sleep(80);
  record('keyboard Enter activates activity navigation', await evalValue(`!document.querySelector('#dice-lab').hidden && document.querySelector('[data-view="dice"]').getAttribute('aria-current')==='page'`));

  // Reduced motion preference.
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  const reduced = await evalValue(`getComputedStyle(document.querySelector('.button')).transitionDuration`);
  record('reduced-motion preference suppresses transitions', ['0s','0.00001s','1e-05s'].includes(reduced), reduced);

  // 360px mobile + emulated touch on coin Run 10.
  await setMetrics(360, 900, true);
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1, configuration: 'mobile' });
  await cdp.send('Page.reload', { ignoreCache: false });
  await sleep(450);
  record('mobile emulation exposes touch points', await evalValue(`navigator.maxTouchPoints > 0`), await evalValue(`String(navigator.maxTouchPoints)`));
  await click('[data-view="coin"]');
  record('360px body has no horizontal overflow', await evalValue(`document.documentElement.scrollWidth <= window.innerWidth`), await evalValue(`JSON.stringify({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth})`));
  await scrollTo('[data-coin-trials="10"]');
  const rect = await evalValue(`(() => { const r=document.querySelector('[data-coin-trials="10"]').getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height}; })()`);
  record('mobile primary touch target is at least 44px high', rect.h >= 44, JSON.stringify(rect));
  await evalValue(`window.__touchTarget=null; document.addEventListener('touchstart', e => { window.__touchTarget=e.target.getAttribute('data-coin-trials'); }, {capture:true, once:true}); true`);
  const beforeLead = await evalValue(`document.querySelector('#coin-result-lead').textContent`);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: rect.x, y: rect.y, radiusX: 2, radiusY: 2, force: 1, id: 1 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(80);
  record('emulated touch event reaches a core experiment button', await evalValue(`window.__touchTarget==='10'`), await evalValue(`String(window.__touchTarget)`));
  await click('[data-coin-trials="10"]');
  await sleep(120);
  const afterLead = await evalValue(`document.querySelector('#coin-result-lead').textContent`);
  record('touch-targeted semantic button performs the experiment', afterLead !== beforeLead && afterLead.includes('10 flips'), afterLead);
  await scrollTo('#coin-lab');
  await screenshot('04-coin-lab-mobile-360.png');

  // Reset without reload; dialog is accepted by CDP handler.
  await click('#reset-all');
  await sleep(150);
  record('reset returns to onboarding without page reload', await evalValue(`!document.querySelector('#onboarding').hidden && document.querySelector('#lesson-shell').hidden`));
  record('reset clears locally stored progress', await evalValue(`localStorage.getItem('probability-detective-progress-v1')===null`));

  const result = {
    generatedAt: new Date().toISOString(),
    browser: 'Google Chrome headless (installed desktop Chrome) via Chrome DevTools Protocol',
    appUrl: baseUrl,
    viewports: ['1280x1000', '768x900', '360x900'],
    checks,
    summary: { passed: checks.filter((c) => c.pass).length, failed: checks.filter((c) => !c.pass).length }
  };
  await writeFile(resolve(evidenceDir, 'browser-check.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  try { cdp?.close(); } catch {}
  server.kill();
  browser.kill();
  await sleep(200);
}






