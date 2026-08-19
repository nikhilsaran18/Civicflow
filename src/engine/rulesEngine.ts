import { CivicCategory, CivicWorkflow, CivicQuestion } from '../types';
import { consumerWorkflow } from '../data/workflows/consumer';
import { municipalWorkflow } from '../data/workflows/municipal';
import { rtiWorkflow } from '../data/workflows/rti';
import { tenantWorkflow } from '../data/workflows/tenant';

const workflows: Record<CivicCategory, CivicWorkflow> = {
  consumer: consumerWorkflow,
  municipal: municipalWorkflow,
  rti: rtiWorkflow,
  tenant: tenantWorkflow,
};

export function getWorkflowByCategory(category: CivicCategory): CivicWorkflow {
  return workflows[category] || consumerWorkflow;
}

/**
 * Filter questions dynamically based on dependencies and prior answers
 */
export function getActiveQuestions(category: CivicCategory, answers: Record<string, any>): CivicQuestion[] {
  const wf = getWorkflowByCategory(category);
  return wf.questions.filter(q => {
    if (!q.dependsOn) return true;
    const parentAnswer = answers[q.dependsOn.questionId];
    if (!parentAnswer) return false;
    if (Array.isArray(q.dependsOn.value)) {
      return q.dependsOn.value.includes(parentAnswer);
    }
    return parentAnswer === q.dependsOn.value;
  });
}
