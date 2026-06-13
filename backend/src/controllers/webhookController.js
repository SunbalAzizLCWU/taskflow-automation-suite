import { Rule } from '../models/Rule.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ruleMatches } from '../services/ruleEvaluator.js';
import { runActions } from '../services/actionRunner.js';
import { writeLog } from '../services/logService.js';

// Public endpoint. No JWT: authentication is the secret webhookToken in the URL.
// External systems (Slack, Sheets, curl, etc.) POST arbitrary JSON here.
export const ingestWebhook = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const rule = await Rule.findOne({ webhookToken: token });
  if (!rule) throw new ApiError(404, 'Unknown webhook');

  const payload = req.body || {};

  if (!rule.enabled) {
    await writeLog({
      owner: rule.owner,
      rule: rule._id,
      level: 'warn',
      message: 'webhook received but rule is disabled',
      meta: { payload },
    });
    return res.status(202).json({ status: 'ignored', reason: 'rule disabled' });
  }

  await writeLog({
    owner: rule.owner,
    rule: rule._id,
    level: 'info',
    message: `webhook received for rule '${rule.name}'`,
    meta: { payload },
  });

  if (!ruleMatches(rule, payload)) {
    await writeLog({
      owner: rule.owner,
      rule: rule._id,
      level: 'info',
      message: 'conditions did not match; no actions run',
      meta: { payload },
    });
    return res.json({ status: 'no_match' });
  }

  const results = await runActions(rule, payload);
  res.json({ status: 'processed', results });
});
