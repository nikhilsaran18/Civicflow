import { CivicCategory, PriorityLevel, ReasoningItem } from '../types';
import { getWorkflowByCategory } from './rulesEngine';

export interface PriorityScoreResult {
  score: number;
  level: PriorityLevel;
  reasoning: ReasoningItem[];
}

export function calculatePriority(category: CivicCategory, answers: Record<string, any>): PriorityScoreResult {
  const wf = getWorkflowByCategory(category);
  let score = 40; // Base score
  const reasoning: ReasoningItem[] = [];

  // Default baseline signal
  reasoning.push({
    id: 'base_signal',
    type: 'info',
    text: `Initial civic grievance classification: ${wf.title}.`
  });

  // Evaluate custom workflow rules
  wf.rules.forEach(rule => {
    if (rule.condition(answers)) {
      score += rule.priorityAdjustment;
      reasoning.push({
        id: rule.id,
        type: rule.reasoningSignal.type,
        text: rule.reasoningSignal.text
      });
    }
  });

  // Generic answer-based scoring boosts
  if (answers['cons_financial_impact'] === '50k_5l') {
    score += 15;
    reasoning.push({ id: 'fin_mid', type: 'info', text: 'Significant financial impact reported (₹50,000 - ₹500,000).' });
  } else if (answers['cons_financial_impact'] === 'above_5l') {
    score += 25;
    reasoning.push({ id: 'fin_high', type: 'warning', text: 'High financial impact reported (Above ₹500,000).' });
  }

  if (answers['muni_duration'] === 'more_1m') {
    score += 15;
    reasoning.push({ id: 'dur_high', type: 'warning', text: 'Issue has remained unresolved for over 30 days.' });
  }

  if (answers['muni_hazard_level'] === 'high_hazard') {
    score += 25;
    reasoning.push({ id: 'hazard_high', type: 'warning', text: 'Active safety or public health hazard reported.' });
  }

  if (answers['cons_seller_response'] === 'refused' || answers['tenant_issue_type'] === 'deposit_withheld') {
    score += 20;
    reasoning.push({ id: 'refused_direct', type: 'positive', text: 'Direct resolution attempt failed or was explicitly rejected by opposing party.' });
  }

  // Clamp 0 - 100
  const finalScore = Math.min(98, Math.max(15, Math.round(score)));

  let level: PriorityLevel = 'low';
  if (finalScore >= 70) {
    level = 'high';
  } else if (finalScore >= 45) {
    level = 'medium';
  }

  return {
    score: finalScore,
    level,
    reasoning
  };
}
