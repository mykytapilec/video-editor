// /client/src/utils/formatDuration.ts
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const paddedSecs = secs.toString().padStart(2, "0");
  return `${mins}:${paddedSecs}`;
}
