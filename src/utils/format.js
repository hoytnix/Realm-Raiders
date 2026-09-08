/**
 * Compact numeric formatter for mobile HUD (e.g., 1250 -> '1.3k', 1200000 -> '1.2M')
 */
export function formatCompactNumber(num) {
  if (num === null || num === undefined) return '0';
  const val = Math.floor(num);
  if (val >= 1000000) {
    return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (val >= 1000) {
    return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return val.toString();
}
