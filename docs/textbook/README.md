# Interactive Textbooks

> **This folder documents three books.** It grew up around the chemistry
> text, so anything that does not say otherwise is about `public/chem/`.
>
> | Document | Covers |
> | --- | --- |
> | `TEXTBOOK_DEV_GUIDE.md` | `public/chem/` — the contract for that subtree |
> | `PHYSICS_DEV_GUIDE.md` | `public/physics/` — the contract for that subtree |
> | `BIOLOGY_DEV_GUIDE.md` | `public/bio/` — the contract for that subtree |
> | `CHANGELOG.md` | all books, newest first |
> | `VOICE.md`, `DIAGRAM_*.md`, `INTERACTION_SPEC.md`, `BUILDING.md` | shared principles |
> | `../../FUTURE_FEATURES.md` | open work for all books ("Curriculum & Textbook Content") |
> | this README | chemistry |
>
> Content and rendering invariants for all books, and for the React app, live in
> one place: [`../RENDERING_GOTCHAS.md`](../RENDERING_GOTCHAS.md).

## Chemistry Interactive Text (Semester 1)

An interactive, web-based textbook designed for high-school General Chemistry students. These review pages are built for **retrieval practice, re-narration, and self-explanation** after initial in-class exposure to the material.

The project is structured as a zero-build, pure static HTML/CSS/JS application that loads directly in a web browser.

---

## 🌐 Live Access

The live interactive text is served from the Science Practice Partner app at:
**[https://sciencepractice.app/chem/](https://sciencepractice.app/chem/)**

It moved here from GitHub Pages on 2026-08-31 (`53c7c5f`). The old
`mrknuffke.github.io/chemistry-interactive-notes/` URL is no longer the source
of truth, and there is no longer a separate deploy workflow — the textbook ships
with the main app's Vercel deploy, because it now lives in that repo under
`public/chem/`.

A public colophon (how the book was built, the constraints it follows, and a
reader-facing version history) lives at
[`public/chem/about.html`](../../public/chem/about.html), linked from the
dashboard topbar as **How It Was Built**. Keep its version-history section in
step with [`CHANGELOG.md`](CHANGELOG.md) — the changelog is the engineering
record, `about.html` is the plain-language one for students and teachers.

---

## 🔮 Development Note: AI-Assisted Vibe-Coding

This project is built and maintained using **vibe-coding** workflows combining human pedagogical expertise with AI assistant agents. 

In this partnership:
*   **The Educator (Human Developer):** Directs the pedagogical design, establishes learning targets, authors the core chemistry text and explanations, acts as the primary curator of content and source-of-truth review sheets, and provides rigorous manual verification and final quality control.
*   **The AI Coding Assistant:** Acts as the primary implementation builder—interpreting the educator's high-level specifications to generate HTML structure, CSS layouts, interactive JavaScript simulations (e.g. Bohr model and particle diagrams), and automated retrieval validation logic.

By offloading direct code generation and layout assembly to the AI, this workflow enables rapid, design-forward iteration while ensuring that pedagogical integrity and chemical correctness remain firmly guided by the human educator.

To maintain high development quality and limit AI-introduced bugs, we follow strict [Behavioral Guidelines](TEXTBOOK_DEV_GUIDE.md#1-behavioral-guidelines-reduce-common-llm-coding-mistakes) covering simplicity, surgical edits, and verification loops.

---

## 🚀 Quick Start (Local Development)

The textbook is zero-build static HTML/CSS/JS — no bundler, no framework. Serve
it from a static server (opening the files directly with `file://` breaks the
relative asset paths):

```bash
# From the repo root
python3 -m http.server 8000
```
Then open **[http://localhost:8000/public/chem/](http://localhost:8000/public/chem/)**.

Running the main app with `npm run dev` also serves it, at `/chem/`, since
`public/` is Vite's static directory.

---

## 📂 Project Structure

Textbook developer documentation lives in `docs/textbook/` (this directory).
The deployed site is `public/chem/`.

```
docs/textbook/            # Docs only — nothing here is served
├── TEXTBOOK_DEV_GUIDE.md # Guidelines, golden rules, coding conventions (the CLAUDE.md of this subtree)
├── CHANGELOG.md          # Dated, one-line engineering log — update on every push
├── BUILDING.md           # Step-by-step checklist for building a lesson
├── VOICE.md              # Tone and widget feedback writing contract
├── INTERACTION_SPEC.md   # Specifications for widgets & interactive behaviors
├── DIAGRAM_*.md          # Diagram contract and workflow (the standardization plan is in docs/archive/)
├── LICENSE               # CC BY-NC-SA 4.0 License Text
└── README.md             # This file

public/chem/              # The deployed site, served at /chem/
├── assets/               # tokens.css, components.css, core.js, reference-center.js,
│                         #   glossary.js, elements.js, molecule/particle renderers
├── lessons/              # One HTML page + one JS file per lesson (27 lessons across 5 units)
├── diagram-generator/    # Teacher-facing SVG diagram tool (standalone assets)
├── index.html            # Student home dashboard & search index
├── about.html            # Public colophon + reader-facing version history
└── lessons.json          # Lesson manifest (see the three-manifest warning in the dev guide)
```

---

## 📝 Editing & Developing Lessons

Please consult **[BUILDING.md](BUILDING.md)** and **[TEXTBOOK_DEV_GUIDE.md](TEXTBOOK_DEV_GUIDE.md)** for detailed rules on styling, writing voice, and pedagogical rules before adding or modifying lessons.

*   **Pedagogy First:** Weave diagrams, active recall, self-explain prompts, and exam questions directly into sections.
*   **Chemistry Integrity:** Never trust memory; cross-reference calculations against the review sheets in `docs/textbook/references/chem/` (moved out of `public/` 2026-11-08 so they are not served).
*   **No LaTeX:** Format equations and math using standard semantic HTML tags like `<sub>`, `<sup>`, and entities (`&Delta;`).
*   **Rendering Checks:** Verify both light and dark modes before submitting changes.

---

## 🌐 Automated Publishing

The textbook has no deploy workflow of its own any more. It is static content
under `public/` in the Science Practice Partner repo, so it ships whenever the main app
deploys to Vercel — a merge to `main` publishes it at
**[https://sciencepractice.app/chem/](https://sciencepractice.app/chem/)**.

*   **Add a dated one-line entry to [`CHANGELOG.md`](CHANGELOG.md) with every push** summarizing what shipped — it's the skimmable historical record so a new session doesn't have to read raw git log.
*   **If the change is one a student or teacher would notice, add a plain-language entry to `public/chem/about.html` §06 as well.** That page is the public version history; the changelog is the engineering one.

---

## 🙏 Acknowledgments

The pedagogical structure and design (predict-reveal, active recall, self-explanation, and exam practice) of this interactive text is inspired by the work at [Biology by Bradford](https://www.biologybybradford.com).

---

## 📄 License

This work is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](LICENSE) (CC BY-NC-SA 4.0).

You are free to:
*   **Share** — copy and redistribute the material in any medium or format.
*   **Adapt** — remix, transform, and build upon the material.

Under the following terms:
*   **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made.
*   **NonCommercial** — You may not use the material for commercial purposes.
*   **ShareAlike** — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.
