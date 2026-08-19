import { CivicCategory } from '../types';
import { getWorkflowByCategory } from './rulesEngine';

export interface ReadinessResult {
  score: number; // 0 - 100%
  availableItems: string[];
  missingItems: string[];
  strengths: string[];
}

export function calculateReadiness(
  category: CivicCategory,
  answers: Record<string, any>,
  evidenceChecked?: Record<string, boolean>
): ReadinessResult {
  const wf = getWorkflowByCategory(category);
  const items = wf.evidenceItems;

  const available: string[] = [];
  const missing: string[] = [];
  const strengths: string[] = [];

  let earnedWeight = 0;
  let totalWeight = 0;

  items.forEach(item => {
    totalWeight += item.weight;

    // Check if manually checked in evidenceChecked map
    let isAvailable = false;
    if (evidenceChecked && evidenceChecked[item.id] !== undefined) {
      isAvailable = evidenceChecked[item.id];
    } else {
      // Deduce from wizard answers options
      wf.questions.forEach(q => {
        const userAns = answers[q.id];
        if (!userAns || !q.options) return;
        const opt = q.options.find(o => o.value === userAns);
        if (opt) {
          if (opt.evidenceProvided?.includes(item.id)) {
            isAvailable = true;
          }
          if (opt.evidenceMissing?.includes(item.id)) {
            isAvailable = false;
          }
        }
      });
    }

    if (isAvailable) {
      available.push(item.title);
      earnedWeight += item.weight;
      strengths.push(`Available: ${item.title}`);
    } else {
      missing.push(item.title);
    }
  });

  const finalScore = totalWeight > 0 ? Math.min(100, Math.round((earnedWeight / totalWeight) * 100)) : 50;

  return {
    score: finalScore,
    availableItems: available,
    missingItems: missing,
    strengths
  };
}
