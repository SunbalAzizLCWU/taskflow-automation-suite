// Pure functions for evaluating rule conditions against an incoming payload.
// Kept dependency-free so they are trivial to unit test.

// Reads a possibly-nested field from an object using dot notation.
// getField({ a: { b: 1 } }, 'a.b') === 1
export function getField(obj, path) {
  return String(path)
    .split('.')
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

// Evaluates a single condition. Returns a boolean.
export function evalCondition(condition, payload) {
  const actual = getField(payload, condition.field);
  const expected = condition.value;
  switch (condition.op) {
    case 'eq':
      return actual === expected;
    case 'ne':
      return actual !== expected;
    case 'contains':
      return typeof actual === 'string' && actual.includes(String(expected));
    case 'gt':
      return Number(actual) > Number(expected);
    case 'lt':
      return Number(actual) < Number(expected);
    case 'exists':
      return actual !== undefined && actual !== null;
    default:
      return false;
  }
}

// A rule matches when ALL conditions pass (logical AND).
// An empty condition list always matches.
export function ruleMatches(rule, payload) {
  if (!rule.conditions || rule.conditions.length === 0) return true;
  return rule.conditions.every((c) => evalCondition(c, payload));
}
