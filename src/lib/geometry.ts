/* ------------------------------------------------------------------ */
/*  Feasible-region geometry for 2-variable linear inequalities        */
/*  (pure client-safe math — no Node dependencies)                     */
/* ------------------------------------------------------------------ */

export type Pt = { x: number; y: number };
export type Constraint = { a: number; b: number; c: number };

const EPS = 1e-9;

/** Clip polygon by half-plane a*x + b*y <= c (Sutherland–Hodgman). */
function clipHalfPlane(poly: Pt[], con: Constraint): Pt[] {
  const out: Pt[] = [];
  const inside = (p: Pt) => con.a * p.x + con.b * p.y - con.c <= 1e-6;
  const intersect = (p1: Pt, p2: Pt): Pt => {
    const d1 = con.a * p1.x + con.b * p1.y - con.c;
    const d2 = con.a * p2.x + con.b * p2.y - con.c;
    const t = d1 / (d1 - d2 + EPS);
    return { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) };
  };
  for (let i = 0; i < poly.length; i++) {
    const cur = poly[i];
    const prev = poly[(i + poly.length - 1) % poly.length];
    const curIn = inside(cur);
    const prevIn = inside(prev);
    if (curIn) {
      if (!prevIn) out.push(intersect(prev, cur));
      out.push(cur);
    } else if (prevIn) {
      out.push(intersect(prev, cur));
    }
  }
  return out;
}

/**
 * Compute the feasible region of constraints ax+by<=c with x>=0, y>=0,
 * clipped to a [0,range] square viewport.
 */
export function feasiblePolygon(cons: Constraint[], range: number): Pt[] {
  let poly: Pt[] = [
    { x: 0, y: 0 },
    { x: range, y: 0 },
    { x: range, y: range },
    { x: 0, y: range },
  ];
  for (const con of cons) {
    poly = clipHalfPlane(poly, con);
    if (poly.length === 0) break;
  }
  return poly;
}

/** Evaluate the objective z = ax + by at each vertex; return enriched points. */
export function cornerPoints(
  poly: Pt[],
  objA: number,
  objB: number
): { pt: Pt; z: number; isMax: boolean }[] {
  const pts = poly.map((pt) => ({ pt, z: objA * pt.x + objB * pt.y, isMax: false }));
  if (pts.length === 0) return pts;
  let max = -Infinity;
  for (const p of pts) max = Math.max(max, p.z);
  for (const p of pts) p.isMax = Math.abs(p.z - max) < 1e-6;
  return pts;
}

/** Line segment endpoints within the viewport for drawing ax + by = c. */
export function lineEnds(con: Constraint, range: number): [Pt, Pt] | null {
  const pts: Pt[] = [];
  if (Math.abs(con.b) > EPS) {
    const y0 = con.c / con.b;
    const yR = (con.c - con.a * range) / con.b;
    if (y0 >= -range * 0.5) pts.push({ x: 0, y: y0 });
    if (yR >= -range * 0.5) pts.push({ x: range, y: yR });
  }
  if (Math.abs(con.a) > EPS) {
    const x0 = con.c / con.a;
    const xR = (con.c - con.b * range) / con.a;
    if (x0 >= -range * 0.5 && pts.length < 2) pts.push({ x: x0, y: 0 });
    if (xR >= -range * 0.5 && pts.length < 2) pts.push({ x: xR, y: range });
  }
  if (pts.length < 2) return null;
  return [pts[0], pts[1]];
}
