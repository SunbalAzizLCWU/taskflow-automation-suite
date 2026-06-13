import { Log } from '../models/Log.js';
// Centralized log writer. Persists to DB and mirrors to stdout. Never throws:
// logging must not break the request pipeline, so failures are swallowed after
// being printed.
export async function writeLog({ owner, rule = null, level = 'info', message, meta = {} }) {
  try {
    const entry = await Log.create({ owner, rule, level, message, meta });
    return entry;
  } catch (err) {
    console.error('[logService] failed to persist log:', err.message);
    return null;
  }
}
