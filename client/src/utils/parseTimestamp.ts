export function parseTimestamp(ts: string): number {
  const [h, m, s] = ts.replace(',', '.').split(':');
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}
