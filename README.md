# CivicFlow AI

> **From Confusion to Clear Action.**
> 
> *A decision-support and civic-navigation platform that converts complex citizen grievances into structured case classifications, explainable priority scores, evidence readiness assessments, and adaptive step-by-step action pathways.*

---

## 🚀 Problem Statement

Citizens facing civic, consumer, municipal, or rental grievances struggle because:
- Information is scattered across confusing department portals.
- Bureaucratic and legal terminology is intimidating.
- Citizens don't know what evidence or documents are required.
- They are unsure whether their case is sufficiently prepared for formal escalation.

---

##💡 The CivicFlow AI Solution

CivicFlow AI converts a citizen's situation into a guided, explainable pathway:
1. **Case Classification**: Natural language NLP issue classification.
2. **Priority Assessment**: Explainable 0–100 urgency score with contributing factor signals.
3. **Evidence Readiness Score**: 0–100% document readiness indicator with live checklist recalculation.
4. **Missing-Document Checklist**: Interactive document checklist.
5. **Personalized Action Path**: Step-by-step resolution steps.
6. **Next Best Action**: Prominent recommendation to advance stage.
7. **Action Timeline**: Responsive stage progression timeline.
8. **Explainable Reasoning**: Clear "Why CivicFlow recommended this" breakdown.
9. **Interactive RTI Builder**: Structured RTI template draft generator with Copy & Print support.

---

## 🛠️ Tech Stack & Zero-Cost Local AI Architecture

CivicFlow AI operates **without external paid API subscriptions** (No OpenAI, Gemini, or Claude APIs required).

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS (with Dark/Light Mode & custom brand palette)
- **Routing**: React Router 7
- **State & i18n**: React Context API, Multilingual i18n (English, Tamil, Hindi)
- **Local AI & NLP**: Client-side Naive Bayes / Token similarity classifier (`src/engine/classifier.ts`)
- **Decision Logic**: Modular Rule Engine (`priorityEngine.ts`, `readinessEngine.ts`, `actionEngine.ts`)
- **Analytics**: Recharts
- **Persistence**: LocalStorage with fallback wrapper (`storageService.ts`)
- **Deployment**: Vercel-ready SPA (`vercel.json`)

---

## 🧠 Local AI & Engine Architecture

```
src/
├── engine/
│   ├── classifier.ts       # Local NLP Naive Bayes token classifier
│   ├── rulesEngine.ts      # Dynamic question dependency resolver
│   ├── priorityEngine.ts   # 0-100 Priority score algorithm with reasoning signals
│   ├── readinessEngine.ts  # 0-100% Evidence readiness algorithm
│   └── actionEngine.ts     # Adaptive stage progression & Next Best Action
├── data/
│   ├── classifierTraining.ts # Token weightings for 4 supported categories
│   └── workflows/
│       ├── consumer.ts     # Consumer dispute workflows & rules
│       ├── municipal.ts    # Public service grievance workflows
│       ├── rti.ts          # Information request workflows
│       └── tenant.ts       # Rental deposit & agreement dispute workflows
```

---

## 📱 Features

1. **Instant Demo Account Mode**: Quick login as **Arun Kumar** (`demo@civicflow.ai` / `demo123`).
2. **Natural Language Classifier**: Type plain text issues or pick category manually.
3. **Dynamic Question Wizard**: Question branching based on user responses.
4. **Interactive Evidence Checklist**: Check off available documents to recalculate readiness score in real-time.
5. **What-If Simulator**: Preview potential readiness score gains before gathering missing documents.
6. **Case Path Comparison**: Compare standard direct resolution route against escalated formal forum routes.
7. **Interactive RTI Builder**: Formatted Section 6(1) RTI draft generator with instant Copy to Clipboard and high-quality Print / Save-as-PDF CSS styles.
8. **Multilingual Support**: Instant switching between English, Tamil (தமிழ்), and Hindi (हिन्दी).
9. **Visual Analytics**: Interactive Recharts graphs for category distributions, readiness, and completion progress.

---

## 💻 Running Locally

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### 1. Clone & Install
```bash
git clone <repository-url>
cd civicflow-ai
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Unit Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## 🛡️ Privacy & Compliance Notice

CivicFlow AI provides general civic information and decision-support guidance. It does not replace professional legal representation or official government instructions.

Data privacy is strictly maintained: all case data is persisted client-side in browser LocalStorage. No confidential credentials or sensitive government identity cards are requested or transmitted.

---

## 🏆 Hackathon Presentation Value

- **Zero API Dependency**: Completely self-contained offline-first architecture.
- **Explainable AI**: transparent rule breakdown ("Why CivicFlow recommended this").
- **Start-to-Finish Workflow**: From initial issue description to printed RTI draft and marked completed timeline stages.
