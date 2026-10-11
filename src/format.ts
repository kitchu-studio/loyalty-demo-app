const thaiDate = new Intl.DateTimeFormat('th-TH', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** "12 ต.ค. 17:05" */
export function formatWhen(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : thaiDate.format(d);
}

export function formatPoints(n: number): string {
  return n.toLocaleString('en-US');
}
