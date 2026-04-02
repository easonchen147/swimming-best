export function formatTimeMS(timeMS: number) {
  return `${(timeMS / 1000).toFixed(2)}s`;
}

export function formatProgress(progress: number) {
  return `${Math.round(progress * 100)}%`;
}

