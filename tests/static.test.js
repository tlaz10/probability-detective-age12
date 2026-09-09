import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8').catch(() => '');
const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8').catch(() => '');

test('learner shell contains all three required activity regions', () => {
  for (const id of ['coin-lab', 'dice-lab', 'game-lab']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
});

test('page provides privacy/reset language and no external runtime scripts', () => {
  assert.match(html, /Reset all progress/i);
  assert.match(html, /stays only in this browser/i);
  assert.doesNotMatch(html, /<script[^>]+src=["']https?:/i);
});

test('reduced-motion and visible focus rules exist', () => {
  assert.match(css, /prefers-reduced-motion:\s*reduce/i);
  assert.match(css, /:focus-visible/i);
});
