import { describe, it, expect } from 'vitest';
import { classifyIssue } from '../engine/classifier';

describe('Local NLP Issue Classifier', () => {
  it('classifies consumer refund issue correctly', () => {
    const text = 'I bought a defective phone and the seller refuses to refund my payment invoice.';
    const result = classifyIssue(text);
    expect(result.category).toBe('consumer');
    expect(result.confidence).toBeGreaterThanOrEqual(70);
  });

  it('classifies streetlight municipal issue correctly', () => {
    const text = 'Broken streetlight on main street road causing darkness near the municipal park.';
    const result = classifyIssue(text);
    expect(result.category).toBe('municipal_utility');
  });

  it('classifies RTI request correctly', () => {
    const text = 'Seeking RTI application information on budget allocated for public road tender records.';
    const result = classifyIssue(text);
    expect(result.category).toBe('rti_information');
  });

  it('classifies tenant deposit issue correctly', () => {
    const text = 'My landlord refuses to return my security deposit refund after I vacated the rental flat.';
    const result = classifyIssue(text);
    expect(result.category).toBe('housing_tenant');
  });
});
