import { FormTemplate, FORMS_TEMPLATES } from '../data/forms/formsData';
import { storageService } from './storageService';

const FORM_DRAFTS_KEY = 'civicflow_form_drafts';

export interface FormDraft {
  id: string;
  templateId: string;
  title: string;
  updatedAt: string;
  data: Record<string, any>;
}

export const formService = {
  getTemplates(): FormTemplate[] {
    return FORMS_TEMPLATES;
  },

  getTemplateById(id: string): FormTemplate | null {
    return FORMS_TEMPLATES.find(t => t.id === id) || FORMS_TEMPLATES[0];
  },

  getDrafts(): FormDraft[] {
    return storageService.getItem<FormDraft[]>(FORM_DRAFTS_KEY, []);
  },

  saveDraft(templateId: string, data: Record<string, any>): FormDraft {
    const drafts = this.getDrafts();
    const template = this.getTemplateById(templateId);
    const existingIndex = drafts.findIndex(d => d.templateId === templateId);

    const updatedDraft: FormDraft = {
      id: existingIndex !== -1 ? drafts[existingIndex].id : `draft_${Date.now()}`,
      templateId,
      title: template?.title || 'Form Application Draft',
      updatedAt: new Date().toISOString(),
      data
    };

    if (existingIndex !== -1) {
      drafts[existingIndex] = updatedDraft;
    } else {
      drafts.unshift(updatedDraft);
    }

    storageService.setItem(FORM_DRAFTS_KEY, drafts);
    return updatedDraft;
  }
};
