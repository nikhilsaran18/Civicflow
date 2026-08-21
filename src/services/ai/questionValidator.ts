import { ClarificationQuestion } from '../../types/civicIntelligence';
import { defaultGeminiClient } from './geminiClient';

export interface QuestionValidationResult {
  relevant: boolean;
  duplicate?: boolean;
  assumesUnsupportedFact?: boolean;
  reason: string;
}

export class QuestionValidator {
  /**
   * Evaluates whether a candidate follow-up question is strictly relevant to the current case.
   */
  public async validateQuestion(
    caseNarrative: string,
    question: ClarificationQuestion
  ): Promise<QuestionValidationResult> {
    const qText = question.question.toLowerCase();
    const narrativeLower = caseNarrative.toLowerCase();

    // 1. Mandatory Heuristic Negative Rule Checks
    const isTransactionTerm =
      qText.includes('receipt') ||
      qText.includes('invoice') ||
      qText.includes('seller') ||
      qText.includes('purchase date') ||
      qText.includes('warranty') ||
      qText.includes('product price') ||
      qText.includes('refund amount');

    const narrativeIsNonTransactionCivic =
      narrativeLower.includes('street light') ||
      narrativeLower.includes('lamp') ||
      narrativeLower.includes('pothole') ||
      narrativeLower.includes('road') ||
      narrativeLower.includes('drainage') ||
      narrativeLower.includes('pension');

    if (isTransactionTerm && narrativeIsNonTransactionCivic) {
      return {
        relevant: false,
        assumesUnsupportedFact: true,
        reason: 'Question asks for purchase/receipt data on a non-transaction civic issue.',
      };
    }

    const isCertificateTerm = qText.includes('original certificates') || qText.includes('ugc') || qText.includes('marksheet');
    if (isCertificateTerm && !narrativeLower.includes('certificate') && !narrativeLower.includes('marksheet')) {
      return {
        relevant: false,
        assumesUnsupportedFact: true,
        reason: 'Question asks for educational certificate data when certificates are not involved in narrative.',
      };
    }

    // 2. Call backend for AI question validation if backend Gemini is active
    if (defaultGeminiClient.hasKey()) {
      const aiResult = await defaultGeminiClient.callBackend<QuestionValidationResult>(
        'validate-question',
        { caseNarrative, question }
      );
      if (aiResult) return aiResult;
    }

    return { relevant: true, reason: 'Valid case-specific question.' };
  }

  public async filterQuestions(
    caseNarrative: string,
    questions: ClarificationQuestion[]
  ): Promise<ClarificationQuestion[]> {
    const validated: ClarificationQuestion[] = [];
    for (const q of questions) {
      const result = await this.validateQuestion(caseNarrative, q);
      if (result.relevant && !result.duplicate && !result.assumesUnsupportedFact) {
        validated.push(q);
      }
    }
    return validated;
  }
}

export const defaultQuestionValidator = new QuestionValidator();
