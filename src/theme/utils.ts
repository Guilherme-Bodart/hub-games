export function withAlpha(hexColor: string, alpha: number): string {
  const normalized = hexColor.replace('#', '');
  const safeAlpha = Math.max(0, Math.min(1, alpha));
  const alphaHex = Math.round(safeAlpha * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();

  if (normalized.length === 3) {
    const expanded = normalized
      .split('')
      .map((part) => part + part)
      .join('');
    return `#${expanded}${alphaHex}`;
  }

  if (normalized.length === 6) {
    return `#${normalized}${alphaHex}`;
  }

  return hexColor;
}
