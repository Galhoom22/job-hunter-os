export function countWords(text) { return text.trim() ? text.trim().split(/\s+/u).length : 0; }
export function outreachAllowed(text) { return countWords(text) > 0 && countWords(text) <= 75; }
