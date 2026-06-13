import { test } from 'node:test';
import assert from 'node:assert/strict';
import { interpolate } from '../src/services/interpolate.js';

test('interpolate replaces placeholders from payload', () => {
  assert.equal(interpolate('New: {{title}}', { title: 'Ship it' }), 'New: Ship it');
});

test('interpolate supports nested paths and whitespace', () => {
  assert.equal(interpolate('{{ user.name }}', { user: { name: 'Sam' } }), 'Sam');
});

test('interpolate renders missing values as empty string', () => {
  assert.equal(interpolate('x={{nope}}', {}), 'x=');
});

test('interpolate passes through non-strings unchanged', () => {
  assert.equal(interpolate(42, {}), 42);
});
