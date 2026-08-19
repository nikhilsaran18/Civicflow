import { CaseAnalysis, CivicCategory } from '../types';
import { calculatePriority } from '../engine/priorityEngine';
import { calculateReadiness } from '../engine/readinessEngine';
import { generateActionPlan } from '../engine/actionEngine';

export const analysisService = {
  analyseCase(
    category: CivicCategory,
    answers: Record<string, any>,
    completedSteps: string[] = [],
    evidenceChecked?: Record<string, boolean>
  ): CaseAnalysis {
    const priority = calculatePriority(category, answers);
    const readiness = calculateReadiness(category, answers, evidenceChecked);
    const actionPlan = generateActionPlan(category, answers, completedSteps);

    return {
      category,
      priorityScore: priority.score,
      priorityLevel: priority.level,
      readinessScore: readiness.score,
      strengths: readiness.strengths,
      missingItems: readiness.missingItems,
      nextBestAction: actionPlan.nextBestAction,
      actionPlan: actionPlan.actionPlan,
      reasoning: priority.reasoning,
      pathwayStage: actionPlan.currentStage,
    };
  }
};
