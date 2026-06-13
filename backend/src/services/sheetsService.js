// Google Sheets integration: appends a row to a spreadsheet using a service
// account (free). The service account email must have edit access to the sheet.
//
// Setup (see backend/README.md):
//  1. Create a Google Cloud project, enable the Google Sheets API.
//  2. Create a service account, download its JSON key.
//  3. Put the client_email in GOOGLE_SERVICE_ACCOUNT_EMAIL and private_key in
//     GOOGLE_PRIVATE_KEY (keep the \n escapes).
//  4. Share the target sheet with the service account email (Editor).

import { google } from 'googleapis';
import { ApiError } from '../utils/ApiError.js';

// Lazily builds an authorized Sheets client. Cached across calls.
let sheetsClient = null;

function getSheetsClient() {
  if (sheetsClient) return sheetsClient;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !rawKey) {
    throw new ApiError(400, 'Google Sheets not configured (GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY)');
  }
  // Env vars store newlines as literal \n; restore real newlines for the PEM key.
  const privateKey = rawKey.replace(/\\n/g, '\n');
  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

// Appends a single row (array of cell values) to the given sheet/range.
export async function appendSheetRow({ values, spreadsheetId, range = 'Sheet1!A1' } = {}) {
  const id = spreadsheetId || process.env.GOOGLE_SHEET_ID;
  if (!id) {
    throw new ApiError(400, 'No spreadsheetId configured (GOOGLE_SHEET_ID or action params.spreadsheetId)');
  }
  if (!Array.isArray(values) || values.length === 0) {
    throw new ApiError(400, 'values must be a non-empty array');
  }
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: id,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
  return { ok: true };
}
