import { CATCH_ZONE } from './movement.js';

const EPSILON = 1e-7;

function overlapInterval(from, to, min, max) {
  const delta = to - from;
  if (Math.abs(delta) < EPSILON) return from >= min && from <= max ? [0, 1] : null;
  const a = (min - from) / delta;
  const b = (max - from) / delta;
  const enter = Math.max(0, Math.min(a, b));
  const exit = Math.min(1, Math.max(a, b));
  return enter <= exit + EPSILON ? [enter, exit] : null;
}

// A catch needs overlap on both axes during the same part of the movement step.
export function sweptCatch(item, previousY, nextY, previousX, nextX) {
  const horizontal = overlapInterval(item.x - previousX, item.x - nextX,
    -CATCH_ZONE.halfWidth - item.halfWidth, CATCH_ZONE.halfWidth + item.halfWidth);
  const vertical = overlapInterval(previousY, nextY, CATCH_ZONE.y - item.halfHeight,
    CATCH_ZONE.y + CATCH_ZONE.height + item.halfHeight);
  if (!horizontal || !vertical) return null;
  const enter = Math.max(horizontal[0], vertical[0]);
  return enter <= Math.min(horizontal[1], vertical[1]) + EPSILON ? enter : null;
}
