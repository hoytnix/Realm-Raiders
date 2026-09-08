// ==========================================
// 2.5D ISOMETRIC CARTOGRAPHY CONSTANTS & MATH
// ==========================================
export const ISO_W = 68;
export const ISO_H = 34;

export function gridToParchmentIso(gx, gy, originX = 270, originY = 75) {
  return {
    x: (gx - gy) * (ISO_W / 2) + originX,
    y: (gx + gy) * (ISO_H / 2) + originY
  };
}
