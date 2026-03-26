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

export function shiftHexColor(hexColor: string, amount: number): string {
  const normalized = hexColor.replace('#', '');
  const safeAmount = Math.max(-1, Math.min(1, amount));

  const expand = (value: string) =>
    value
      .split('')
      .map((part) => part + part)
      .join('');

  const source = normalized.length === 3 ? expand(normalized) : normalized;
  if (source.length !== 6) {
    return hexColor;
  }

  const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));
  const shift = safeAmount * 255;
  const r = clamp(parseInt(source.slice(0, 2), 16) + shift);
  const g = clamp(parseInt(source.slice(2, 4), 16) + shift);
  const b = clamp(parseInt(source.slice(4, 6), 16) + shift);
  const toHex = (value: number) => value.toString(16).padStart(2, '0').toUpperCase();

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
