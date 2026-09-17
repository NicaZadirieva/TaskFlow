export interface LabelColors {
  bg: string;
  text: string;
  border: string;
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r: number, g: number, b: number) {
  const f = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, '0');
  return `${f(r)}${f(g)}${f(b)}`;
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

/** Сдвигает яркость: amount < 0 — темнее, amount > 0 — светлее. */
function shade(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const f = (v: number) =>
    amount < 0
      ? v * (1 + amount)
      : v + (255 - v) * amount;
  return rgbToHex(f(r), f(g), f(b));
}

/**
 * Возвращает согласованные цвета для GitHub-метки:
 * - мягкий фон (alpha),
 * - чуть плотнее граница,
 * - читаемый текст (при необходимости затемнённый/осветлённый).
 */
export function labelColors(rawHex: string): LabelColors {
  const hex = rawHex.replace('#', '').toLowerCase();
  const lum = luminance(hex);

  // Тёмный оттенок — оставляем как есть для текста,
  // фон делаем плотнее, чтобы читалось.
  // Светлый — текст затемняем, фон почти прозрачный.
  const text =
    lum > 0.6
      ? shade(hex, -0.35) // слишком светлый → темнее
      : lum < 0.15
        ? shade(hex, 0.25) // почти чёрный → чуть светлее
        : hex;

  const bgAlpha = lum < 0.25 ? '33' : '1F';
  const borderAlpha = lum < 0.25 ? '88' : '66';

  return {
    bg: `#${hex}${bgAlpha}`,
    border: `#${hex}${borderAlpha}`,
    text: `#${text}`,
  };
}