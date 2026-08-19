import { ActionStep, CivicCategory } from '../types';
import { getWorkflowByCategory } from './rulesEngine';

export interface ActionPlanResult {
  actionPlan: ActionStep[];
  nextBestAction: string;
  currentStage: string;
}

export function generateActionPlan(
  category: CivicCategory,
  answers: Record<string, any>,
  completedStepIds: string[] = []
): ActionPlanResult {
  const wf = getWorkflowByCategory(category);
  const rawSteps = JSON.parse(JSON.stringify(wf.actionSteps)) as ActionStep[];

  let firstUncompletedIndex = -1;

  rawSteps.forEach((step, idx) => {
    if (completedStepIds.includes(step.id)) {
      step.status = 'completed';
    } else if (firstUncompletedIndex === -1) {
      step.status = 'current';
      firstUncompletedIndex = idx;
    } else {
      step.status = 'not_started';
    }
  });

  // Check rule overrides for custom next best action
  let customNextAction = '';
  wf.rules.forEach(rule => {
    if (rule.condition(answers) && rule.recommendedNextAction) {
      customNextAction = rule.recommendedNextAction;
    }
  });

  const currentStep = rawSteps.find(s => s.status === 'current') || rawSteps[rawSteps.length - 1];
  const nextBestAction = customNextAction || (currentStep ? currentStep.title : 'Review evidence and track case.');
  const currentStage = currentStep ? currentStep.title : 'Case Resolved';

  return {
    actionPlan: rawSteps,
    nextBestAction,
    currentStage
  };
}
