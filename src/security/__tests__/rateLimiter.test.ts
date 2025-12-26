/**
 * 速率限制模組單元測試
 * Rate Limiter Module Unit Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  RateLimiter,
  createRateLimiter,
} from '../rateLimiter';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    vi.useFakeTimers();
    limiter = new RateLimiter({
      windowMs: 60000, // 1 minute
      maxRequests: 5,
      blockDuration: 120000, // 2 minutes
    });
  });

  afterEach(() => {
    limiter.destroy();
    vi.useRealTimers();
  });

  describe('check', () => {
    it('should allow requests under the limit', () => {
      const result1 = limiter.check('user1');
      const result2 = limiter.check('user1');
      const result3 = limiter.check('user1');

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
      expect(result3.allowed).toBe(true);
    });

    it('should track remaining requests', () => {
      const result1 = limiter.check('user1');
      expect(result1.remaining).toBe(4); // 5 - 1 = 4

      const result2 = limiter.check('user1');
      expect(result2.remaining).toBe(3); // 5 - 2 = 3
    });

    it('should block when limit is exceeded', () => {
      // Use up all requests
      for (let i = 0; i < 5; i++) {
        limiter.check('user1');
      }

      const result = limiter.check('user1');
      expect(result.allowed).toBe(false);
      expect(result.blocked).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it('should provide retry after time when blocked', () => {
      // Use up all requests
      for (let i = 0; i < 5; i++) {
        limiter.check('user1');
      }

      const result = limiter.check('user1');
      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should track separate limits per identifier', () => {
      // User 1 uses all requests
      for (let i = 0; i < 5; i++) {
        limiter.check('user1');
      }
      const result1 = limiter.check('user1');
      expect(result1.allowed).toBe(false);

      // User 2 should still have requests
      const result2 = limiter.check('user2');
      expect(result2.allowed).toBe(true);
    });

    it('should reset after window expires', () => {
      // Use up all requests
      for (let i = 0; i < 5; i++) {
        limiter.check('user1');
      }

      // Move time forward past the window
      vi.advanceTimersByTime(61000);

      const result = limiter.check('user1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should skip specified keys', () => {
      const limiterWithSkip = new RateLimiter({
        windowMs: 60000,
        maxRequests: 1,
        skipKeys: ['admin'],
      });

      // Admin should always be allowed
      for (let i = 0; i < 10; i++) {
        const result = limiterWithSkip.check('admin');
        expect(result.allowed).toBe(true);
      }

      // Regular user should be blocked
      limiterWithSkip.check('user');
      const result = limiterWithSkip.check('user');
      expect(result.allowed).toBe(false);

      limiterWithSkip.destroy();
    });
  });

  describe('consume', () => {
    it('should consume specified number of tokens', () => {
      const result = limiter.consume('user1', 3);
      expect(result.remaining).toBe(2); // 5 - 3 = 2
    });

    it('should handle consuming more than remaining', () => {
      limiter.consume('user1', 3);
      const result = limiter.consume('user1', 3);
      expect(result.remaining).toBe(0);
      expect(result.allowed).toBe(false);
    });
  });

  describe('isAllowed', () => {
    it('should check without consuming', () => {
      expect(limiter.isAllowed('user1')).toBe(true);
      expect(limiter.isAllowed('user1')).toBe(true);
      // Check does not consume, so remaining should still be 5
      const result = limiter.check('user1');
      expect(result.remaining).toBe(4);
    });

    it('should return false when blocked', () => {
      for (let i = 0; i < 5; i++) {
        limiter.check('user1');
      }
      limiter.check('user1'); // This triggers the block

      expect(limiter.isAllowed('user1')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset limit for identifier', () => {
      // Use up all requests
      for (let i = 0; i < 5; i++) {
        limiter.check('user1');
      }
      limiter.check('user1'); // Blocked

      // Reset
      limiter.reset('user1');

      const result = limiter.check('user1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });
  });

  describe('block/unblock', () => {
    it('should manually block an identifier', () => {
      limiter.block('user1');
      const result = limiter.check('user1');
      expect(result.allowed).toBe(false);
      expect(result.blocked).toBe(true);
    });

    it('should manually unblock an identifier', () => {
      limiter.block('user1');
      limiter.unblock('user1');
      const result = limiter.check('user1');
      expect(result.allowed).toBe(true);
    });

    it('should block for specified duration', () => {
      limiter.block('user1', 5000); // Block for 5 seconds

      // Still blocked after 4 seconds
      vi.advanceTimersByTime(4000);
      expect(limiter.check('user1').allowed).toBe(false);

      // Unblocked after 5 seconds
      vi.advanceTimersByTime(2000);
      expect(limiter.check('user1').allowed).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return stats for identifier', () => {
      limiter.check('user1');
      limiter.check('user1');

      const stats = limiter.getStats('user1');
      expect(stats).not.toBeNull();
      expect(stats?.totalRequests).toBe(2);
      expect(stats?.recentRequests).toBe(2);
      expect(stats?.isBlocked).toBe(false);
    });

    it('should return null for unknown identifier', () => {
      const stats = limiter.getStats('unknown');
      expect(stats).toBeNull();
    });

    it('should show blocked status', () => {
      for (let i = 0; i < 5; i++) {
        limiter.check('user1');
      }
      limiter.check('user1'); // Triggers block

      const stats = limiter.getStats('user1');
      expect(stats?.isBlocked).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', () => {
      limiter.check('user1');

      // Move past the window
      vi.advanceTimersByTime(61000);

      limiter.cleanup();

      expect(limiter.size).toBe(0);
    });

    it('should keep active entries', () => {
      limiter.check('user1');
      limiter.cleanup();
      expect(limiter.size).toBe(1);
    });
  });

  describe('destroy', () => {
    it('should clear all data', () => {
      limiter.check('user1');
      limiter.check('user2');

      limiter.destroy();

      expect(limiter.size).toBe(0);
    });
  });
});

describe('createRateLimiter', () => {
  it('should create a new rate limiter with custom config', () => {
    const limiter = createRateLimiter({
      windowMs: 30000,
      maxRequests: 10,
    });

    expect(limiter).toBeInstanceOf(RateLimiter);

    // Use 10 requests
    for (let i = 0; i < 10; i++) {
      expect(limiter.check('user').allowed).toBe(true);
    }

    // 11th request should be blocked
    expect(limiter.check('user').allowed).toBe(false);

    limiter.destroy();
  });
});
