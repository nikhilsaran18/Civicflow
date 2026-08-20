# CivicFlow AI — From Problem to Action

> **Open-Ended AI Civic & Legal Empowerment Platform for Indian Citizens**

---

## 📌 Problem Statement

Citizens often have legitimate rights and entitlements — consumer protections, tenant rights, RTI access, welfare eligibility, and municipal service guarantees — that go unused because navigating bureaucratic and legal language is intimidating and time-consuming.

A citizen should **NOT** need to know:
* Which legal domain their issue belongs to,
* Which government department is responsible,
* Which law applies,
* Which grievance portal to use,
* Whether they need an RTI or formal representation,
* Or what legal terminology describes their situation.

---

## 🚀 Our Solution: CivicFlow AI

**CivicFlow AI** is built on a fundamental product philosophy: **NO PREDEFINED DOMAINS. NO FIXED QUESTIONNAIRES.**

Instead of routing users through hardcoded category decision trees (e.g. `if (category === "consumer") askConsumerQuestions()`), CivicFlow AI analyzes each citizen's narrative independently using a 9-stage **Civic Intelligence Engine**.

```text
CITIZEN NARRATIVE
        ↓
STAGE 1: CASE UNDERSTANDING (Fact Extraction)
        ↓
STAGE 2: DYNAMIC CLARIFICATION ENGINE (1–4 High-Value Questions)
        ↓
STAGE 2.5: FOLLOW-UP QUESTION VALIDATOR (Relevance Verification)
        ↓
STAGE 3: OPEN-ENDED ISSUE UNDERSTANDING (Dynamic Labeling)
        ↓
STAGE 4: DESIRED OUTCOME ENGINE (Goal Identification)
        ↓
STAGE 5: INFORMATION / RIGHTS RETRIEVAL (Authoritative Sources)
        ↓
STAGE 6: RIGHTS & OPTIONS ANALYZER (Plain-Language Explanation)
        ↓
STAGE 7: ACTION PLAN GENERATOR (Interactive Vertical Timeline)
        ↓
STAGE 8: AUTHORITY RESOLVER (Nodal Office & Portal Links)
        ↓
STAGE 9: ACTION STUDIO (Draft RTI, Complaint, Appeal, Email)
```

---

## 🔥 Critical Acceptance Tests Passed

CivicFlow AI includes automated Vitest acceptance tests verifying that system logic never reverts to fixed-domain mistakes:

| Scenario | Input Narrative | Verification | Status |
| :--- | :--- | :--- | :---: |
| **Street Light** | *"The street light outside my house hasn't worked for 10 days."* | Asks location & prior reports; **rejects** receipt/invoice/seller questions! | `PASSED` |
| **University Certificates** | *"My university won't return my original certificates."* | Cites UGC 2023 Student Grievance Regulations; **rejects** landlord/receipt questions! | `PASSED` |
| **Father Pension** | *"My father's pension stopped three months ago."* | Identifies pension treasury & Jeevan Pramaan life certificate requirements. | `PASSED` |
| **Road Expenditure** | *"I want to know how much the municipality spent repairing my road."* | Identifies RTI Information Request pathway & prepares 6-point query draft. | `PASSED` |
| **Ambiguous Case** | *"They haven't paid me."* | Recognizes ambiguity and dynamically asks who was supposed to pay. | `PASSED` |
| **Novel Issue** | *"The local public library in my ward has been closed for 4 months."* | Dynamic understanding with **zero** "unsupported domain" errors. | `PASSED` |

---

## 🛠️ Key Features

* **Multi-Stage Civic Intelligence Engine**: Multi-pass AI orchestration providing situation summaries, known facts, missing information, and analysis confidence.
* **Stage 2.5 Follow-Up Question Validator**: Secondary verification pass ensuring every asked question strictly improves the specific case.
* **Action Studio Document Generator**: Live formatted preview and field editor for RTI Applications, Municipal Complaints, University Representations, and Appeals.
* **Simple-Language Translator ("Explain Simply")**: Converts intimidating bureaucratic text into plain citizen-friendly language.
* **Full Multilingual Support**: 100% interface and AI response translation in **English**, **தமிழ் (Tamil)**, and **हिन्दी (Hindi)**.
* **Authoritative Retrieval Architecture**: Integrated citations for RTI Act 2005, CPGRAMS, UGC 2023 Regulations, Municipal Corporation Acts, and Consumer Protection Act 2019.

---

## 💻 Tech Stack

* **Frontend**: React 19, TypeScript, Vite
* **Styling**: Tailwind CSS, Lucide React Icons
* **Routing**: React Router v7
* **AI Orchestration**: Google Gemini 2.5 Flash / 1.5 Flash API (`@google/genai` / REST) + Ruleless Dynamic Reasoning Engine
* **Testing**: Vitest (`npx vitest run`)

---

## ⚙️ Installation & Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nikhilsaran18/Civicflow.git
   cd Civicflow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables (Optional)**:
   ```bash
   cp .env.example .env
   # Optionally add VITE_GEMINI_API_KEY=your_key
   ```

4. **Start local dev server**:
   ```bash
   npm run dev
   ```

5. **Run test suite**:
   ```bash
   npx vitest run
   ```

6. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📄 License

MIT License © 2026 CivicFlow AI Team.
