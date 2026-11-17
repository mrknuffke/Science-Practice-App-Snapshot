# 🧩 New Mode Design Criteria

**STOP!** Before writing a single line of code for a new mode, answer these questions. This ensures the new feature aligns with the product's goals, technical architecture, and design system.

## 1. Core Identity & User Value
- **Feature Name:** (Proposed name)
- **Target Audience:** Student? Teacher? Both?
- **The "Verb":** What is the user *doing*? (e.g., "Drilling", "Discussing", "Designing", "Reading").
- **The Payoff:** What do they get at the end? (A grade? A PDF? A badge? Understanding?).
- **Unique Selling Point:** Why does this need to be a new mode? Can it be a feature of an existing mode?

## 2. Interaction Model
- **Input Type:**
    - [ ] Text (Chat/Form)
    - [ ] Voice (Dictation)
    - [ ] File Upload (Image/PDF)
    - [ ] Click/Selection (Quiz)
- **Output Style:**
    - [ ] Conversation (Streamed chat)
    - [ ] Static Document (Generated once)
    - [ ] Dashboard/Report (Data visualization)
    - [ ] Interactive Canvas (Drag & drop, diagrams)
- **Pacing:**
    - [ ] **Synchronous:** User waits for AI response immediately (Chat).
    - [ ] **Asynchronous/Batch:** User does a lot of work, then submits (Worksheet).
    - [ ] **Reflective:** User reads, thinks, then acts (Slow).

## 3. Technical Requirements
- **State Management:**
    - Does this mode need to remember history after a page refresh? (Local Storage vs. Ephemeral).
- **AI Tooling:**
    - Does it need Vision capabilities?
    - Does it need specific JSON structuring? (Strict schemas).
    - Does it need Context from other modes? (e.g., "Use my notes from Smart Scanner").
- **External Dependencies:**
    - Charts/Graphing libraries?
    - PDF Generation?
    - Math/LaTeX rendering?

## 4. Feature Parity Check
*Does this mode require the "Standard Kit"?*
- [ ] **Text-to-Speech** (Listen to AI)
- [ ] **Dictation** (Talk to AI)
- [ ] **Simplify / Explain Like I'm 5**
- [ ] **Difficulty Toggles** (Harder/Easier)
- [ ] **Refresh / Regenerate** (New content without restart)
- [ ] **Theme Integration** (Subject Colors)

## 5. Mockup / Mental Model
*(Briefly describe or sketch the layout)*
- **Header:** Title + Back Button + Settings?
- **Main Stage:** Split screen? Single column? Card stack?
- **Controls:** Bottom bar? Sidebar? Floating action button?

---

### ✅ Approval Checklist
- [ ] Criteria Document Completed
- [ ] Technical Feasibility Confirmed
- [ ] UX/Design Checklist Reviewed (Pre-Implementation)
