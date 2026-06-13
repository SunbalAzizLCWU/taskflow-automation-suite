// Slack integration: posts a message to an Incoming Webhook URL.
// No SDK needed; Slack incoming webhooks accept a simple JSON POST.
// Uses the global fetch available in Node 20+.

import { ApiError } from '../utils/ApiError.js';

// Sends `text` to the given Slack incoming webhook URL.
// Falls back to SLACK_WEBHOOK_URL from the environment if none is provided.
export async function sendSlackMessage({ text, webhookUrl } = {}) {
  const url = webhookUrl || process.env.SLACK_WEBHOOK_URL;
  if (!url) {
    throw new ApiError(400, 'No Slack webhook URL configured (SLACK_WEBHOOK_URL or action params.webhookUrl)');
  }
  if (!text) {
    throw new ApiError(400, 'Slack message text is required');
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Slack responded ${res.status}: ${body}`);
  }
  return { ok: true };
}
