import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getField, evalCondition, ruleMatches } from '../src/services/ruleEvaluator.js';

test('getField reads nested fields via dot notation', () => {
  assert.equal(getField({ a: { b: 7 } }, 'a.b'), 7);
  assert.equal(getField({ a: 1 }, 'a'), 1);
  assert.equal(getField({}, 'x.y'), undefined);
  assert.equal(getField(null, 'x'), undefined);
});

test('evalCondition eq / ne', () => {
  assert.equal(evalCondition({ field: 'p', op: 'eq', value: 'high' }, { p: 'high' }), true);
  assert.equal(evalCondition({ field: 'p', op: 'eq', value: 'high' }, { p: 'low' }), false);
  assert.equal(evalCondition({ field: 'p', op: 'ne', value: 'high' }, { p: 'low' }), true);
});

test('evalCondition contains', () => {
  assert.equal(evalCondition({ field: 't', op: 'contains', value: 'bug' }, { t: 'fix bug now' }), true);
  assert.equal(evalCondition({ field: 't', op: 'contains', value: 'bug' }, { t: 'feature' }), false);
  // non-string actual should not throw, just be false
  assert.equal(evalCondition({ field: 't', op: 'contains', value: 'x' }, { t: 5 }), false);
});

test('evalCondition gt / lt coerce numbers', () => {
  assert.equal(evalCondition({ field: 'n', op: 'gt', value: 3 }, { n: 5 }), true);
  assert.equal(evalCondition({ field: 'n', op: 'lt', value: 3 }, { n: 5 }), false);
});

test('evalCondition exists', () => {
  assert.equal(evalCondition({ field: 'a', op: 'exists' }, { a: 0 }), true);
  assert.equal(evalCondition({ field: 'a', op: 'exists' }, { a: null }), false);
  assert.equal(evalCondition({ field: 'a', op: 'exists' }, {}), false);
});

test('ruleMatches ANDs all conditions; empty matches everything', () => {
  const rule = {
    conditions: [
      { field: 'priority', op: 'eq', value: 'high' },
      { field: 'title', op: 'contains', value: 'urgent' },
    ],
  };
  assert.equal(ruleMatches(rule, { priority: 'high', title: 'urgent fix' }), true);
  assert.equal(ruleMatches(rule, { priority: 'high', title: 'minor' }), false);
  assert.equal(ruleMatches({ conditions: [] }, { anything: 1 }), true);
  assert.equal(ruleMatches({}, { anything: 1 }), true);
});
