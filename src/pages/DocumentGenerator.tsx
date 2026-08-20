import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Copy, Printer, Download, Save, RefreshCw, ArrowLeft, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CivicCase, GeneratedDocument } from '../types/civicIntelligence';
import { defaultCivicIntelligenceEngine } from '../services/ai/civicIntelligenceEngine';
import { CaseStorageService } from '../services/caseStorageService';

export const DocumentGenerator: React.FC = () => {
  const { id, documentId } = useParams<{ id: string; documentId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [civicCase, setCivicCase] = useState<CivicCase | null>(null);
  const [doc, setDoc] = useState<GeneratedDocument | null>(null);

  const [applicantName, setApplicantName] = useState('');
  const [applicantAddress, setApplicantAddress] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let currentCase: CivicCase | null = (location.state as any)?.caseData;
    if (!currentCase && id) {
      currentCase = CaseStorageService.getCaseById(id);
    }

    if (currentCase) {
      setCivicCase(currentCase);
      const docType = documentId || (location.state as any)?.docType || 'complaint';

      const generated = defaultCivicIntelligenceEngine.generateDocumentDraft(
        docType,
        currentCase.title,
        currentCase.originalProblem,
        currentCase.answers,
        currentCase.solution
      );

      setDoc(generated);
      setApplicantName(generated.fields.applicantName || '');
      setApplicantAddress(generated.fields.applicantAddress || '');
      setApplicantPhone(generated.fields.applicantPhone || '');
    }
  }, [id, documentId, location.state]);

  const handleUpdateFields = () => {
    if (!civicCase || !doc) return;
    const updatedAnswers = {
      ...civicCase.answers,
      applicant_name: applicantName,
      applicant_address: applicantAddress,
      applicant_phone: applicantPhone,
    };

    const newDoc = defaultCivicIntelligenceEngine.generateDocumentDraft(
      doc.documentType,
      civicCase.title,
      civicCase.originalProblem,
      updatedAnswers,
      civicCase.solution
    );

    setDoc(newDoc);
  };

  const handleCopyText = () => {
    if (!doc) return;
    navigator.clipboard.writeText(doc.previewMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    if (!doc) return;
    const element = document.createElement('a');
    const file = new Blob([doc.previewMarkdown], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.documentType}_draft_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSaveToCase = () => {
    if (!civicCase || !doc) return;
    const updatedDocs = civicCase.documents ? [...civicCase.documents, doc] : [doc];
    const updatedCase = { ...civicCase, documents: updatedDocs };
    CaseStorageService.saveCase(updatedCase);
    alert('Document saved to case successfully!');
  };

  if (!doc) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Generating document preview...</h2>
        <button onClick={() => navigate('/cases')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">
          Return to Cases
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Action Studio Document Generator</span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{doc.title}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyText}
            className="px-3.5 py-2 bg-white text-slate-700 font-bold text-xs rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : t('copyToClipboard')}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white text-slate-700 font-bold text-xs rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('print')}</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="px-3.5 py-2 bg-white text-slate-700 font-bold text-xs rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('downloadPDF')} / Text</span>
          </button>

          <button
            onClick={handleSaveToCase}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t('saveToCase')}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: LEFT Document Preview + RIGHT Editable Information Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT 2 COLS: Live Formatted Document Preview */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t('docPreview')} (Markdown / Print Ready)
            </span>
            <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full">
              Case-Specific Data Auto-Mapped
            </span>
          </div>

          <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200 font-mono text-xs leading-relaxed whitespace-pre-wrap text-slate-900 shadow-inner">
            {doc.previewMarkdown}
          </div>
        </div>

        {/* RIGHT COL: Editable Information Fields */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 sticky top-24">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">{t('editFields')}</h3>
              <p className="text-[11px] text-slate-500">Modify place, name, address, or details in real-time.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Applicant Full Name</label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={e => setApplicantName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Communication Address</label>
                <textarea
                  value={applicantAddress}
                  onChange={e => setApplicantAddress(e.target.value)}
                  rows={3}
                  placeholder="e.g. No 42, Main Street, Ward 12, Chennai"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Contact Number</label>
                <input
                  type="text"
                  value={applicantPhone}
                  onChange={e => setApplicantPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={handleUpdateFields}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Update Document Preview</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
