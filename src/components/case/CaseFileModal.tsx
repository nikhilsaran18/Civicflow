import React, { useState } from 'react';
import { X, Printer, Download, Copy, Check, FileText } from 'lucide-react';
import { CivicCase } from '../../types/civicIntelligence';
import { defaultCivicIntelligenceEngine } from '../../services/ai/civicIntelligenceEngine';

interface CaseFileModalProps {
  civicCase: CivicCase;
  onClose: () => void;
}

export const CaseFileModal: React.FC<CaseFileModalProps> = ({ civicCase, onClose }) => {
  const [copied, setCopied] = useState(false);

  const markdownContent = civicCase.caseFileMarkdown || defaultCivicIntelligenceEngine.generateCaseFile(civicCase);

  const handleCopy = async () => {
    const text = typeof markdownContent === 'string' ? markdownContent : await markdownContent;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = async () => {
    const text = typeof markdownContent === 'string' ? markdownContent : await markdownContent;
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `CivicFlow_CaseFile_${civicCase.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl max-w-4xl w-full my-8 flex flex-col max-h-[90vh] print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Official Case Document</span>
              <h2 className="text-xl font-extrabold text-white">CivicFlow AI Professional Case File</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Case File'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-sm flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={handleDownloadTxt}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Text</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 border border-slate-700 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Render Case File Markdown */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 font-mono text-xs leading-relaxed whitespace-pre-wrap text-slate-200 print:text-black print:overflow-visible">
          {typeof markdownContent === 'string' ? markdownContent : 'Generating Case File...'}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between print:hidden">
          <span>Case File ID: {civicCase.id} — Preserved in CivicFlow My Cases</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
