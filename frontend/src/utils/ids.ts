export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateRequestId(year: number, counter: number): string {
  const padded = String(counter).padStart(5, '0');
  return `RQ-${year}-${padded}`;
}

export function generateIncidentId(year: number, counter: number): string {
  const padded = String(counter).padStart(4, '0');
  return `INC-${year}-${padded}`;
}
