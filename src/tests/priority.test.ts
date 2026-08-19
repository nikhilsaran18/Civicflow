import { describe, it, expect } from 'vitest';
import { calculatePriority } from '../engine/priorityEngine';

describe('Priority Engine', () => {
  it('assigns high priority score for severe hazards and high financial impact', () => {
    const answers = {
      muni_hazard_level: 'high_hazard',
      muni_duration: 'more_1m',
      cons_financial_impact: 'above_5l'
    };
    const result = calculatePriority('municipal', answers);
    expect(result.level).toBe('high');
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.reasoning.length).toBeGreaterThan(1);
  });

  it('assigns lower priority for minor low-impact issues', () => {
    const answers = {
      cons_financial_impact: 'under_5k'
    };
    const result = calculatePriority('consumer', answers);
    expect(result.score).toBeLessThan(70);
  });
});
