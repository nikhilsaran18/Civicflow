import React, { useState } from 'react';
import { Copy, Printer, Check, FileText, Sparkles, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Toast } from '../components/common/Toast';

export const RTIBuilder: React.FC = () => {
  const { t } = useLanguage();

  const [applicantName, setApplicantName] = useState('Arun Kumar');
  const [address, setAddress] = useState('123 Gandhi Road, Ward 14, Chennai - 600001');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [authority, setPublicAuthority] = useState('Greater Chennai Corporation');
  const [department, setDepartment] = useState('Public Works & Electrical Division');
  const [infoRequested, setInfoRequested] = useState(
    'Certified copies of tender allocation documents, contractor completion timelines, and total funds sanctioned for streetlight maintenance in Ward 14.'
  );
  const [period, setPeriod] = useState('Jan 2024 to Dec 2024');
  const [isBPL, setIsBPL] = useState(false);
  const [bplCardNo, setBplCardNo] = useState('');
  const [format, setFormat] = useState<'Inspection' | 'Hard Copies' | 'Digital / Email'>('Hard Copies');

  const [showToast, setShowToast] = useState(false);

  const generatedDraftText = `
BEFORE THE PUBLIC INFORMATION OFFICER (PIO)
Under Section 6(1) of the Right to Information Act, 2005

To,
The Central Public Information Officer (CPIO),
${authority.toUpperCase()}
Department / Division: ${department}

1. APPLICANT DETAILS:
   Full Name: ${applicantName}
   Postal Address: ${address}
   Contact Number: ${phone}

2. PARTICULAR OF INFORMATION REQUESTED:
   Subject: Application under Section 6(1) of RTI Act 2005 seeking certified public records.
   
   Specific Details Requested:
   ${infoRequested}

   Period to which information pertains: ${period}

3. FORMAT OF INFORMATION:
   ${format}

4. FEE DETAILS:
   ${isBPL 
     ? `Applicant belongs to Below Poverty Line (BPL) category. BPL Ration Card No: ${bplCardNo || 'Attached'}. Application fee is exempted under Section 7(5).` 
     : `RTI Application Fee of ₹10 attached via Indian Postal Order (IPO) / Court Fee Stamp / Online Ack.`
   }

5. DECLARATION:
   I state that the information sought does not fall under the exemptions contained in Section 8 & 9 of the RTI Act 2005 and pertains to public authority duties.

Place: ____________________
Date: ${new Date().toLocaleDateString('en-IN')}

___________________________
Signature of Applicant (${applicantName})
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDraftText);
    setShowToast(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Toast */}
      {showToast && (
        <Toast
          message={t.rti.copiedToast}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Header */}
      <div className="space-y-2 text-center max-w-2xl mx-auto print:hidden">
        <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-300 dark:border-amber-800">
          <FileText className="w-4 h-4" />
          <span>Structured RTI Application Generator</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t.rti.title}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">{t.rti.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block">
        {/* Form Inputs */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 print:hidden">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Applicant & Department Details</h2>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              {t.rti.applicantName}
            </label>
            <input
              type="text"
              value={applicantName}
              onChange={e => setApplicantName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              {t.rti.applicantAddress}
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                {t.rti.publicAuthority}
              </label>
              <input
                type="text"
                value={authority}
                onChange={e => setPublicAuthority(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                {t.rti.department}
              </label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              {t.rti.informationRequested}
            </label>
            <textarea
              rows={3}
              value={infoRequested}
              onChange={e => setInfoRequested(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                {t.rti.periodYears}
              </label>
              <input
                type="text"
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                {t.rti.format}
              </label>
              <select
                value={format}
                onChange={e => setFormat(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              >
                <option value="Hard Copies">Certified Hard Copies</option>
                <option value="Inspection">Record Inspection</option>
                <option value="Digital / Email">Digital / Soft Copy</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="bpl"
              checked={isBPL}
              onChange={e => setIsBPL(e.target.checked)}
              className="rounded text-brand-600"
            />
            <label htmlFor="bpl" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Claim Below Poverty Line (BPL) Fee Waiver
            </label>
          </div>

          {isBPL && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                BPL Ration Card Number
              </label>
              <input
                type="text"
                value={bplCardNo}
                onChange={e => setBplCardNo(e.target.value)}
                placeholder="BPL-1029384"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          )}
        </div>

        {/* Generated Preview Card */}
        <div className="bg-slate-900 text-slate-100 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between print:bg-white print:text-black print:p-0 print:border-none">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                {t.rti.previewTitle}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-1 border border-slate-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.rti.copy}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white flex items-center space-x-1 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.rti.print}</span>
                </button>
              </div>
            </div>

            <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-slate-200 print:text-black print:text-sm">
              {generatedDraftText}
            </pre>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl text-[11px] text-slate-400 border border-slate-700/60 print:hidden">
            Notice: Please verify exact CPIO postal address and state-specific fee rules before dispatching via Registered AD.
          </div>
        </div>
      </div>
    </div>
  );
};
