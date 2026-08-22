import { describe, it, expect } from 'vitest';
import { SignupFormSchema, LoginFormSchema, ProfileUpdateSchema } from '../lib/definitions';
import { checkRateLimit, validateCsrf } from '../lib/security';
import { NextRequest } from 'next/server';

describe('Phase 17 — Unit Tests (Validation & Security)', () => {
  describe('Form Input Validation Schemas', () => {
    it('validates correct user signup data', () => {
      const result = SignupFormSchema.safeParse({
        name: 'Nathan',
        email: 'nathan@example.com',
        password: 'securepassword123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email formats on signup', () => {
      const result = SignupFormSchema.safeParse({
        name: 'Nathan',
        email: 'invalid-email',
        password: 'securepassword123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects short passwords', () => {
      const result = SignupFormSchema.safeParse({
        name: 'Nathan',
        email: 'nathan@example.com',
        password: '123',
      });
      expect(result.success).toBe(false);
    });

    it('validates user login credentials', () => {
      const result = LoginFormSchema.safeParse({
        email: 'nathan@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('validates profile update payloads', () => {
      const result = ProfileUpdateSchema.safeParse({
        name: 'Nathan Updated',
        email: 'nathan.new@example.com',
        bio: 'Developer building ReTasks',
        timezone: 'America/New_York',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Security Utilities', () => {
    it('enforces rate limiting counters per IP', () => {
      const testIp = `192.168.1.${Math.floor(Math.random() * 1000)}`;
      const res1 = checkRateLimit(testIp);
      expect(res1.success).toBe(true);
      expect(res1.remaining).toBe(119);

      const res2 = checkRateLimit(testIp);
      expect(res2.remaining).toBe(118);
    });

    it('validates CSRF origin for GET request', () => {
      const req = new NextRequest('http://localhost:3000/api/tasks', { method: 'GET' });
      expect(validateCsrf(req)).toBe(true);
    });

    it('validates same-origin CSRF headers for POST request', () => {
      const req = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
          host: 'localhost:3000',
        },
      });
      expect(validateCsrf(req)).toBe(true);
    });
  });
});
