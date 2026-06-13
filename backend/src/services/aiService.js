// AI features built on top of the Groq client:
//  1. Natural language -> structured automation rule (JSON)
//  2. Smart task suggestions from existing tasks
//  3. Log summarization

import { groqChat, parseModelJSON } from './groqClient.js';
import { ApiError } from '../utils/ApiError.js';

// Describes the exact rule shape we want back, so the model can't freelance.
const RULE_SCHEMA_HINT = `Return ONLY a JSON object with this exact shape:
{
  "name": string,
  "conditions": [ { "field": string, "op": "eq"|"ne"|"contains"|"gt"|"lt"|"exists", "value": any } ],
  "actions": [ { "type": "create_task"|"slack"|"sheets"|"email", "params": object } ]
}
Rules:
- conditions may be an empty array if none are implied.
- create_task params: { "title": string, "priority": "low"|"medium"|"high" }
- slack params: { "text": string }
- email params: { "to": string, "subject": string, "text": string }
- sheets params: { "columns": string[] }
- Use {{field}} placeholders in params to reference incoming webhook data.`;

// Validates the AI's rule object against our allowed enums before we trust it.
const VALID_OPS = new Set(['eq', 'ne', 'contains', 'gt', 'lt', 'exists']);
const VALID_ACTIONS = new Set(['create_task', 'slack', 'sheets', 'email']);

function validateRule(rule) {
  if (!rule || typeof rule !== 'object') throw new ApiError(502, 'AI rule is not an object');
  if (!rule.name || typeof rule.name !== 'string') rule.name = 'AI generated rule';
  rule.conditions = Array.isArray(rule.conditions) ? rule.conditions : [];
  rule.actions = Array.isArray(rule.actions) ? rule.actions : [];
  rule.conditions = rule.conditions.filter(
    (c) => c && typeof c.field === 'string' && VALID_OPS.has(c.op)
  );
  rule.actions = rule.actions.filter((a) => a && VALID_ACTIONS.has(a.type));
  if (rule.actions.length === 0) {
    throw new ApiError(422, 'AI could not derive a valid action from that description');
  }
  // Drop any keys the model invented.
  return {
    name: rule.name,
    conditions: rule.conditions.map((c) => ({ field: c.field, op: c.op, value: c.value })),
    actions: rule.actions.map((a) => ({ type: a.type, params: a.params || {} })),
  };
}

// Feature 1: turn "When I get a webhook, create a high priority task" into a rule.
export async function nlToRule(description) {
  if (!description || !description.trim()) {
    throw new ApiError(400, 'description is required');
  }
  const content = await groqChat(
    [
      {
        role: 'system',
        content: `You convert plain-English automation descriptions into TaskFlow rules. ${RULE_SCHEMA_HINT}`,
      },
      { role: 'user', content: description },
    ],
    { json: true, temperature: 0.1 }
  );
  return validateRule(parseModelJSON(content));
}

// Feature 2: suggest new tasks given the user's existing tasks.
export async function suggestTasks(existingTasks) {
  const titles = (existingTasks || []).map((t) => `- ${t.title} (${t.status})`).join('\n') || '(none yet)';
  const content = await groqChat(
    [
      {
        role: 'system',
        content:
          'You are a productivity assistant. Suggest 3 concise, actionable next tasks. ' +
          'Return ONLY JSON: { "suggestions": [ { "title": string, "priority": "low"|"medium"|"high" } ] }',
      },
      { role: 'user', content: `My current tasks:\n${titles}` },
    ],
    { json: true, temperature: 0.5 }
  );
  const parsed = parseModelJSON(content);
  const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
  return suggestions
    .filter((s) => s && typeof s.title === 'string')
    .slice(0, 5)
    .map((s) => ({ title: s.title, priority: ['low', 'medium', 'high'].includes(s.priority) ? s.priority : 'medium' }));
}

// Feature 3: summarize recent logs into a short human-readable insight.
export async function summarizeLogs(logs) {
  if (!logs || logs.length === 0) {
    return 'No activity to summarize yet.';
  }
  const lines = logs
    .map((l) => `[${l.level}] ${new Date(l.createdAt).toISOString()} ${l.message}`)
    .join('\n');
  const content = await groqChat(
    [
      {
        role: 'system',
        content:
          'Summarize these automation logs in 2-4 sentences. Highlight errors, ' +
          'how many actions ran, and any patterns. Plain text only.',
      },
      { role: 'user', content: lines.slice(0, 6000) },
    ],
    { temperature: 0.3 }
  );
  return content.trim();
}
