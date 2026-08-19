import { describe, it, expect } from 'vitest';
import { calculateReadiness } from '../engine/readinessEngine';

describe('Evidence Readiness Engine', () => {
  it('increases readiness score when evidence items are checked', () => {
    const category = 'consumer';
    const answers = {};

    const initial = calculateReadiness(category, answers, {
      cons_invoice: false,
      cons_bank_record: false
    });

    const updated = calculateReadiness(category, answers, {
      cons_invoice: true,
      cons_bank_record: true
    });

    expect(updated.score).toBeGreaterThan(initial.score);
    expect(updated.availableItems.length).toBeGreaterThan(initial.availableItems.length);
  });
});
