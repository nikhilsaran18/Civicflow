export interface FormField {
  id: string;
  label: string;
  conversationalPrompt: string;
  type: 'text' | 'textarea' | 'select';
  options?: string[];
  value: string;
  isFilled: boolean;
}

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
}

export class FormAssistantService {
  public static getSampleFormTemplates(): FormTemplate[] {
    return [
      {
        id: 'rti_form',
        title: 'RTI Standard Application Form',
        description: 'Standard format for filing Right to Information requests under Section 6(1).',
        fields: [
          {
            id: 'applicant_name',
            label: 'Applicant Full Name',
            conversationalPrompt: 'What is your full official name?',
            type: 'text',
            value: '',
            isFilled: false,
          },
          {
            id: 'contact_address',
            label: 'Communication Address',
            conversationalPrompt: 'Where should the official reply be mailed to?',
            type: 'textarea',
            value: '',
            isFilled: false,
          },
          {
            id: 'public_authority',
            label: 'Public Authority / Department',
            conversationalPrompt: 'Which government office or department holds the records?',
            type: 'text',
            value: '',
            isFilled: false,
          },
          {
            id: 'information_details',
            label: 'Particulars of Information Sought',
            conversationalPrompt: 'What specific information or records do you want to inspect or receive copies of?',
            type: 'textarea',
            value: '',
            isFilled: false,
          },
        ],
      },
      {
        id: 'municipal_grievance_form',
        title: 'Municipal Public Infrastructure Grievance Form',
        description: 'Form for registering complaints about street lights, roads, garbage, and civic amenities.',
        fields: [
          {
            id: 'complainant_name',
            label: 'Complainant Name',
            conversationalPrompt: 'Who is registering this grievance?',
            type: 'text',
            value: '',
            isFilled: false,
          },
          {
            id: 'locality_ward',
            label: 'Locality & Ward Number',
            conversationalPrompt: 'What is the street address, ward number, or landmark?',
            type: 'text',
            value: '',
            isFilled: false,
          },
          {
            id: 'grievance_nature',
            label: 'Nature of Inconvenience',
            conversationalPrompt: 'What happened and how long has it been an issue?',
            type: 'textarea',
            value: '',
            isFilled: false,
          },
        ],
      },
    ];
  }
}
