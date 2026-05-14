/**
 * Math utilities
 *
 * lcm — least common multiple of two integers (used to compute how many
 *        loop repetitions it takes for both pizzas to realign).
 * gcd — greatest common divisor, used internally by lcm.
 */

export function gcd(x, y) {
  x = Math.abs(x);
  y = Math.abs(y);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function lcm(x, y) {
  if (typeof x !== 'number' || typeof y !== 'number') return false;
  return !x || !y ? 0 : Math.abs((x * y) / gcd(x, y));
}
