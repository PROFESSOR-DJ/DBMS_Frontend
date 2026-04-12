export const cleanDisplayName = (value) =>
  String(value || '')
    .trim()
    .replace(/^[\s'"\[\]]+|[\s'"\[\]]+$/g, '')
    .replace(/\s{2,}/g, ' ');
