import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, FileText, Clock, ShieldCheck, ExternalLink, Edit3, Bookmark, Download, CheckCircle, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CivicCase, ActionPlanStep } from '../types/civicIntelligence';
import { CaseStorageService } from '../services/caseStorageService';
import { CaseFileModal } from '../components/case/CaseFileModal';

export const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [civicCase, setCivicCase] = useState<CivicCase | null>(null);
  const [showCaseFileModal, setShowCaseFileModal] = useState(false);

  useEffect(() => {
    // Check if passed via state
    const stateCase = (location.state as any)?.caseData;
    if (stateCase) {
      setCivicCase(stateCase);
      return;
    }

    if (id) {
      const found = CaseStorageService.getCaseById(id);
      if (found) {
        setCivicCase(found);
      }
    }
  }, [id, location.state]);

  if (!civicCase || !civicCase.solution) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Case Loading or Not Found</h2>
        <p className="text-slate-600 text-sm">We couldn't retrieve the analysis for this case.</p>
        <button
          onClick={() => navigate('/cases')}
          className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl"
        >
          Return to My Cases
        </button>
      </div>
    );
  }

  const { solution, understanding, qAndA } = civicCase;

  const handleStepStatusToggle = (stepOrder: number) => {
    if (!civicCase || !civicCase.solution) return;
    const updatedSteps = civicCase.solution.actionPlan.map(s => {
      if (s.order === stepOrder) {
        const nextStatus: ActionPlanStep['status'] =
          s.status === 'completed'
            ? 'not_started'
            : s.status === 'not_started'
            ? 'in_progress'
            : 'completed';
        return { ...s, status: nextStatus };
      }
      return s;
    });

    const updatedCase: CivicCase = {
      ...civicCase,
      solution: { ...civicCase.solution, actionPlan: updatedSteps },
    };

    setCivicCase(updatedCase);
    CaseStorageService.saveCase(updatedCase);
  };

  const handleOpenActionStudio = (docType: string) => {
    if (docType === 'rti') {
      navigate('/rti', { state: { caseData: civicCase } });
    } else {
      navigate(`/case/${civicCase.id}/document/${docType}`, {
        state: { caseData: civicCase, docType },
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Case File Modal */}
      {showCaseFileModal && (
        <CaseFileModal civicCase={civicCase} onClose={() => setShowCaseFileModal(false)} />
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-extrabold px-3 py-1 rounded-full border border-indigo-400/30">
              📌 {civicCase.title || understanding.caseTitle}
            </span>
            <span className="text-xs text-slate-400">
              ID: {civicCase.id}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCaseFileModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl hover:from-teal-300 hover:to-emerald-400 shadow-md transition-all flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Case File</span>
            </button>

            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ● Analysis Complete
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {civicCase.title}
          </h1>
          <p className="text-sm text-slate-300">
            Original Statement: "{civicCase.originalProblem}"
          </p>
        </div>
      </div>

      {/* SECTION 1 — YOUR SITUATION */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg border-b border-slate-100 pb-3">
          <FileText className="w-5 h-5" />
          <h2>{t('situationTitle')}</h2>
        </div>
        <p className="text-slate-800 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/60 font-medium">
          {solution.situationSummary || understanding.situationSummary}
        </p>
      </section>

      {/* SECTION 2 — CONFIRMED FACTS & CLARIFICATION Q&A */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg border-b border-slate-100 pb-3">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <h2>2. Confirmed Facts & Clarification Answers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Confirmed Facts List */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Confirmed Case Facts ({understanding.confirmedFacts?.length || 0})
            </span>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {understanding.confirmedFacts.map((fact, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-800">
                  <span className="font-bold text-emerald-700">✓ Fact:</span> {fact.fact}
                </div>
              ))}
            </div>
          </div>

          {/* Sequential 3 Clarification Questions & Answers */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              AI Clarification Record ({qAndA ? qAndA.length : 0} Questions)
            </span>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {qAndA && qAndA.length > 0 ? (
                qAndA.map((item, idx) => (
                  <div key={idx} className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-xs space-y-1">
                    <div className="font-bold text-indigo-900">
                      Q{item.questionNumber}: {item.question.question}
                    </div>
                    <div className="text-slate-700">
                      Answer: <span className="font-bold text-slate-900">{Array.isArray(item.answer) ? item.answer.join(', ') : item.answer}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-200">
                  No clarification questions required for this initial statement.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — WHAT CIVICFLOW FOUND */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg border-b border-slate-100 pb-3">
          <Sparkles className="w-5 h-5" />
          <h2>{t('whatCivicFlowFoundTitle')}</h2>
        </div>
        <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/60 font-medium">
          {solution.whatCivicFlowFound || solution.explanation}
        </p>

        {solution.rightsAndConsiderations && solution.rightsAndConsiderations.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Rights & Considerations:</span>
            <ul className="space-y-1.5">
              {solution.rightsAndConsiderations.map((r, i) => (
                <li key={i} className="text-xs text-indigo-900 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100 font-semibold flex items-center gap-2">
                  <span>⚖️</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* SECTION 4 — YOUR OPTIONS */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg border-b border-slate-100 pb-3">
          <ShieldCheck className="w-5 h-5" />
          <h2>{t('yourOptionsTitle')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {solution.options.map((opt, idx) => (
            <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-base">{opt.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{opt.description}</p>
              {opt.considerations && opt.considerations.length > 0 && (
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Key Considerations:</span>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 mt-1">
                    {opt.considerations.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5 — RECOMMENDED NEXT STEP */}
      <section className="bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 text-slate-950 p-6 sm:p-8 rounded-3xl shadow-lg space-y-3">
        <div className="flex items-center gap-2 font-black uppercase tracking-wider text-xs bg-slate-950/20 text-slate-950 px-3 py-1 rounded-full w-fit">
          ⭐ {t('recommendedNextStepTitle')}
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold">{solution.recommendedNextStep.title}</h3>
        <p className="text-sm font-medium leading-relaxed max-w-3xl">
          {solution.recommendedNextStep.explanation}
        </p>
      </section>

      {/* SECTION 6 — YOUR DYNAMIC ACTION PLAN (INTERACTIVE STATUS TIMELINE) */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
            <Clock className="w-5 h-5" />
            <h2>{t('yourActionPlanTitle')}</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Click step badge to change status</span>
        </div>

        <div className="space-y-6 relative pl-6 border-l-2 border-indigo-100 ml-4">
          {solution.actionPlan.map((step) => (
            <div key={step.order} className="relative space-y-3 group">
              {/* Interactive Timeline marker node */}
              <button
                onClick={() => handleStepStatusToggle(step.order)}
                className={`absolute -left-[35px] top-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                  step.status === 'completed'
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                    : step.status === 'in_progress'
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse'
                    : 'bg-slate-200 text-slate-700 hover:bg-indigo-100'
                }`}
                title="Click to toggle status"
              >
                {step.status === 'completed' ? '✓' : step.order}
              </button>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-base">
                    Step {step.order}: {step.title}
                  </h3>
                  <button
                    onClick={() => handleStepStatusToggle(step.order)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                      step.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : step.status === 'in_progress'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {step.status === 'completed'
                      ? t('statusCompleted')
                      : step.status === 'in_progress'
                      ? t('statusInProgress')
                      : t('statusNotStarted')}
                  </button>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{step.description}</p>

                {step.whyItMatters && (
                  <p className="text-xs text-indigo-900 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100/80 font-medium">
                    💡 <span className="font-bold">Why this step matters:</span> {step.whyItMatters}
                  </p>
                )}

                {step.evidenceNeeded && step.evidenceNeeded.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Required Evidence / Items:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {step.evidenceNeeded.map((ev, i) => (
                        <span key={i} className="text-xs bg-white text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                          📄 {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7 — RESPONSIBLE AUTHORITY */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg border-b border-slate-100 pb-3">
          <Bookmark className="w-5 h-5" />
          <h2>{t('responsibleAuthorityTitle')}</h2>
        </div>

        {solution.responsibleAuthority && solution.responsibleAuthority.name ? (
          <div className="bg-indigo-50/60 border border-indigo-200/80 p-6 rounded-2xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {solution.responsibleAuthority.name}
              </h3>
              {solution.responsibleAuthority.type && (
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                  {solution.responsibleAuthority.type}
                </span>
              )}
            </div>

            {solution.responsibleAuthority.relevance && (
              <p className="text-xs text-slate-700 leading-relaxed">
                <span className="font-bold">Relevance:</span> {solution.responsibleAuthority.relevance}
              </p>
            )}

            {solution.responsibleAuthority.actionableInfo && (
              <p className="text-xs text-slate-700 leading-relaxed">
                <span className="font-bold">How to Contact / Submit:</span> {solution.responsibleAuthority.actionableInfo}
              </p>
            )}

            {solution.responsibleAuthority.officialLink && (
              <div className="pt-2">
                <a
                  href={solution.responsibleAuthority.officialLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  <span>Official Portal / Information Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-amber-50/80 border border-amber-200 p-5 rounded-2xl text-xs text-amber-900 space-y-1">
            <span className="font-bold block">Verification Needed</span>
            <p>The appropriate authority requires verification based on location and case details. CivicFlow will not invent an authority name without sufficient verification.</p>
          </div>
        )}
      </section>

      {/* SECTION 8 — AUTHORITATIVE SOURCES */}
      {solution.sources && solution.sources.length > 0 && (
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg border-b border-slate-100 pb-3">
            <ExternalLink className="w-5 h-5" />
            <h2>{t('sourcesTitle')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {solution.sources.map((src, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">{src.title}</h4>
                {src.authority && <p className="text-xs text-slate-500">{src.authority}</p>}
                <p className="text-xs text-slate-700">{src.relevance}</p>
                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline pt-1"
                  >
                    <span>Visit Source Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 9 — ACTION STUDIO (DOCUMENT GENERATION BAR) */}
      <section className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-teal-300 font-bold text-lg">
            <Edit3 className="w-5 h-5" />
            <h2>{t('actionStudioTitle')}</h2>
          </div>
          <p className="text-xs text-slate-400">
            Generate customized legal representations, RTI applications, and formal complaints tailored to your case.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {solution.suggestedDocuments && solution.suggestedDocuments.length > 0 ? (
            solution.suggestedDocuments.map((doc, idx) => (
              <button
                key={idx}
                onClick={() => handleOpenActionStudio(doc.documentType || doc.type || 'complaint')}
                className="px-6 py-3.5 bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 font-extrabold text-sm rounded-xl hover:from-teal-300 hover:to-emerald-400 shadow-md transition-all flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>{doc.title}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            ))
          ) : (
            <button
              onClick={() => handleOpenActionStudio('complaint')}
              className="px-6 py-3.5 bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 font-extrabold text-sm rounded-xl hover:from-teal-300 hover:to-emerald-400 shadow-md transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Formal Complaint Draft</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
