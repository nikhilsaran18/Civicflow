import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Copy, Printer, Save, Check, FileText, ArrowRight } from 'lucide-react';
import { formService } from '../services/formService';
import { FormTemplate } from '../data/forms/formsData';
import { Toast } from '../components/common/Toast';
import { useLanguage } from '../context/LanguageContext';

export const FormFill: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!id) return;
    const found = formService.getTemplateById(id);
    if (found) {
      setTemplate(found);
      // Pre-fill initial empty values
      setFormData({
        name: '',
        address: '',
        phone: '',
        authority: ''
      });

    } else {
      navigate('/forms');
    }
  }, [id, navigate]);

  if (!template) return null;

  const currentStep = template.steps[currentStepIndex] || template.steps[0];
  const previewText = template.generatePreview(formData);

  const handleInputChange = (fieldId: string, val: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: val }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(previewText);
    setShowToast(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveDraft = () => {
    formService.saveDraft(template.id, formData);
    setShowToast(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {showToast && (
        <Toast
          message="Application draft saved and copied to clipboard!"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          to="/forms"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-purple-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Form Templates</span>
        </Link>
        <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700">
          Step {currentStepIndex + 1} of {template.steps.length}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block">
        {/* Left Column: Input Form Wizard */}
        <div className="lavender-card p-6 sm:p-8 space-y-6 print:hidden shadow-2xs">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 font-editorial">{currentStep.title}</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">{currentStep.subtitle}</p>
          </div>

          <div className="space-y-4">
            {currentStep.fields.map(field => (
              <div key={field.id}>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  {field.label} {field.required && <span className="text-rose-500">*</span>}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={formData[field.id] || ''}
                    onChange={e => handleInputChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full p-3 rounded-xl border border-purple-200/90 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={formData[field.id] || ''}
                    onChange={e => handleInputChange(field.id, e.target.value)}
                    className="w-full p-3 rounded-xl border border-purple-200/90 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs font-medium"
                  >
                    <option value="">Select option...</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.id] || ''}
                    onChange={e => handleInputChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full p-3 rounded-xl border border-purple-200/90 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-purple-100">
            <button
              type="button"
              disabled={currentStepIndex === 0}
              onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
              className="px-4 py-2.5 btn-lavender-secondary text-xs font-semibold rounded-xl disabled:opacity-40"
            >
              Back
            </button>

            {currentStepIndex + 1 < template.steps.length ? (
              <button
                type="button"
                onClick={() => setCurrentStepIndex(currentStepIndex + 1)}
                className="px-5 py-2.5 btn-royal-primary font-extrabold text-xs rounded-xl flex items-center space-x-1"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1 shadow-md transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Application</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Live Form Preview Sheet */}
        <div className="bg-slate-950 text-slate-100 p-6 sm:p-8 rounded-3xl border border-purple-900/40 shadow-2xl space-y-4 flex flex-col justify-between print:bg-white print:text-black print:p-0 print:border-none">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-purple-900/50 pb-3 print:hidden">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-300">
                Live Completed Application Preview
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-purple-200 flex items-center space-x-1 border border-purple-800/60"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 btn-royal-primary font-extrabold text-xs text-white flex items-center space-x-1 rounded-xl shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PDF</span>
                </button>
              </div>
            </div>

            <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-slate-200 print:text-black print:text-sm">
              {previewText}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

