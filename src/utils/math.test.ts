import { describe, it, expect } from 'vitest';
import { gcd, lcm } from './math';

describe('gcd', () => {
  it('returns the greatest common divisor of two positive integers', () => {
    expect(gcd(12, 8)).toBe(4);
    expect(gcd(9, 6)).toBe(3);
    expect(gcd(7, 13)).toBe(1);
  });

  it('handles one input being zero', () => {
    expect(gcd(0, 5)).toBe(5);
    expect(gcd(5, 0)).toBe(5);
  });

  it('handles negative inputs via abs', () => {
    expect(gcd(-12, 8)).toBe(4);
    expect(gcd(12, -8)).toBe(4);
  });

  it('returns the number itself when both inputs are equal', () => {
    expect(gcd(6, 6)).toBe(6);
  });
});

describe('lcm', () => {
  it('returns the least common multiple of two positive integers', () => {
    expect(lcm(4, 6)).toBe(12);
    expect(lcm(3, 7)).toBe(21);
    expect(lcm(5, 10)).toBe(10);
  });

  it('returns 0 when either input is 0', () => {
    expect(lcm(0, 5)).toBe(0);
    expect(lcm(5, 0)).toBe(0);
  });

  it('returns the number itself when both inputs are equal', () => {
    expect(lcm(8, 8)).toBe(8);
  });

  it('computes the lcm needed for full-cycle alignment (the core use case)', () => {
    // 16 teeth vs 12 teeth realign after lcm(16,12) = 48 time units
    expect(lcm(16, 12)).toBe(48);
    // two pizzas with the same tooth count realign every loop
    expect(lcm(16, 16)).toBe(16);
  });
});
