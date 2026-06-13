import { Task } from '../models/Task.js';
import { writeLog } from './logService.js';
import { sendSlackMessage } from './slackService.js';
import { appendSheetRow } from './sheetsService.js';
import { sendEmail } from './emailService.js';
import { interpolate } from './interpolate.js';

// Executes a single action. Returns a short result string for logging.
// New action types (slack/sheets/email) plug in here in a later increment.
async function runAction(action, { rule, payload }) {
  switch (action.type) {
    case 'create_task': {
      const p = action.params || {};
      const task = await Task.create({
        owner: rule.owner,
        title: p.title || payload.title || 'Automated task',
        description: p.description || '',
        priority: p.priority || 'medium',
        source: 'automation',
      });
      return `created task ${task._id}`;
    }
    case 'slack': {
      const p = action.params || {};
      const text = interpolate(p.text || 'TaskFlow automation fired', payload);
      await sendSlackMessage({ text, webhookUrl: p.webhookUrl });
      return 'slack message sent';
    }
    case 'sheets': {
      const p = action.params || {};
      // params.columns is an array of templates, e.g. ['{{title}}', '{{priority}}'].
      const columns = Array.isArray(p.columns) ? p.columns : ['{{title}}'];
      const values = columns.map((c) => interpolate(c, payload));
      await appendSheetRow({ values, spreadsheetId: p.spreadsheetId, range: p.range });
      return 'row appended to sheet';
    }
    case 'email': {
      const p = action.params || {};
      await sendEmail({
        to: interpolate(p.to, payload),
        subject: interpolate(p.subject || 'TaskFlow alert', payload),
        text: interpolate(p.text || 'An automation rule fired.', payload),
      });
      return 'email sent';
    }
    default:
      return `unknown action '${action.type}'`;
  }
}

// Runs every action of a rule sequentially. One failing action is logged but
// does not stop the others. Returns an array of per-action outcomes.
export async function runActions(rule, payload) {
  const results = [];
  for (const action of rule.actions) {
    try {
      const result = await runAction(action, { rule, payload });
      results.push({ type: action.type, ok: true, result });
      await writeLog({
        owner: rule.owner,
        rule: rule._id,
        level: 'info',
        message: `action '${action.type}' ok: ${result}`,
        meta: { action },
      });
    } catch (err) {
      results.push({ type: action.type, ok: false, error: err.message });
      await writeLog({
        owner: rule.owner,
        rule: rule._id,
        level: 'error',
        message: `action '${action.type}' failed: ${err.message}`,
        meta: { action },
      });
    }
  }
  return results;
}
