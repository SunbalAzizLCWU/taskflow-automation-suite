// Fills {{path}} placeholders in a template string from a data object.
// Extracted into its own module so it can be unit tested and reused.
// Example: interpolate('Hi {{user.name}}', { user: { name: 'Sam' } }) -> 'Hi Sam'
export function interpolate(template, data) {
  if (typeof template !== 'string') return template;
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, path) => {
    const val = path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), data);
    return val == null ? '' : String(val);
  });
}
