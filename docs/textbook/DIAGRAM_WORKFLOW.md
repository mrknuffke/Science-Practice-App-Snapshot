# Diagram Development & High-Res Export Workflow

This document outlines the standard workflow and tools for generating, formatting, CPK-coloring, and exporting high-resolution chemistry diagrams and Lewis structures across the SciencePracticeApp.

---

## 1. Directory Structure & File Destinations

Whenever new diagrams are generated or exported:
* **`diagrams/`** (Project Root): High-priority, easily accessible local directory for teacher/user access and downloads.
* **`public/chem/assets/diagrams/`**: Static web assets directory used by lessons, simulations, and the diagram generator.

---

## 2. Rendering CLI Tool (`scripts/render_diagram.swift`)

A native macOS Swift/WebKit utility that renders any HTML/SVG template directly to high-DPI Retina PNG with alpha transparency support and zero external npm/browser driver dependencies.

### Command Syntax
```bash
swift scripts/render_diagram.swift <input.html> <output.png> <width> <height> [scale]
```

### Parameters
* `input.html`: Path to the HTML/SVG source template.
* `output.png`: Destination path for the rendered PNG file.
* `width`: Viewport width in CSS points (e.g. `800`, `920`).
* `height`: Viewport height in CSS points (e.g. `240`, `400`).
* `scale`: Multiplier for Retina/high-res rendering (default: `2.0` for 2× resolution, `3.0` for print-ready 3×).

### Example
```bash
swift scripts/render_diagram.swift templates/water.html diagrams/water_lewis_transparent.png 600 390 2.0
```

---

## 3. Lewis Structure Design Standards

### A. CPK Coloring Rules for Atom Symbols & Lone Pairs
* **Carbon ($\text{C}$)**: `#16201C` (Dark Charcoal / `--ink`)
* **Hydrogen ($\text{H}$)**: `#16201C` (High-contrast Dark Ink for transparency)
* **Oxygen ($\text{O}$)**: `#D6452A` (CPK Vermilion Red / `--accent`)
* **Nitrogen ($\text{N}$)**: `#3E6FA5` (CPK Slate Blue / `--cool`)
* **Chlorine / Halogens ($\text{Cl}, \text{Br}$)**: `#2E7D57` (CPK Muted Green / `--good`)
* **Lone Pair Electron Dots**: Must match the parent atom's CPK fill color (e.g. Oxygen's lone pairs are `#D6452A`).

### B. Geometry & Strokes
* Single bonds: `stroke="#16201C" stroke-width="2.4" stroke-linecap="round"`
* Double bonds: Parallel lines offset by $\pm 4\text{px}$, `stroke-width="2.2"`
* Triple bonds: Central line + 2 outer lines offset by $\pm 5\text{px}$, `stroke-width="2.0"`
* Lone pair dots: `circle r="2.8"` (or `r="2.5"` to `r="3.0"` depending on molecule scale)
* Atom letters: `font-family="'IBM Plex Mono', monospace" font-size="20-24" font-weight="700"`

### C. Transparency & Card Framing
* **Transparent Lewis Assets**:
  ```css
  html, body, svg {
    background: transparent;
  }
  ```
  Omit any outer bounding cards, formulas, or instructional captions. Focus purely on the structural formula.

---

## 4. Concept & Intermolecular Forces (IMF) Diagrams

When creating pedagogical concept diagrams (such as LDF, Dipole-Dipole, and Hydrogen Bonding):
* **Card Frame**: Soft rounded container (`--card: #F5F8F4`, border: `1.5px solid var(--hair)`).
* **Section Badge / Title**: `<text font-family="var(--mono)" font-size="8.5px" font-weight="700" letter-spacing="1" fill="var(--ink-mute)">`
* **Partial Charges**:
  * $\delta^+$: `var(--cool)` (`#3E6FA5`)
  * $\delta^-$: `var(--accent)` (`#D6452A`)
* **Interaction Vectors / Callout Boxes**:
  * Intermolecular forces: Dashed line (`stroke-dasharray="5 3"`) in `var(--accent)` with callout pill container.
  * Dipole vectors: Solid arrows with tail perpendicular crossbars ($\mapsto$).

---

## 5. Verification Checklist

Before finalizing any diagram:
1. **Octet/Duet Conservation**: Check all valence electrons ($2\text{ e}^-$ for H, $8\text{ e}^-$ for C, N, O, F).
2. **CPK Accuracy**: Verify heteroatoms (O, N, halogens) and their respective lone pairs carry accurate CPK colors.
3. **No Clipped Text / Bounding Boxes**: Check that `text-anchor`, coordinates, and `viewBox` ensure no cut-offs.
4. **Clean Alpha Transparency**: Inspect PNG over both light and dark backgrounds to confirm clean edges without white halos.
5. **Dual Destination Placement**: Copy output to both `diagrams/` and `public/chem/assets/diagrams/`.

---

## 6. High-Resolution Photography & Macroscopic Assets

Whenever real-world laboratory photography or macroscopic observation assets are introduced:
* **Directory Structure**:
  * Chemistry assets: `public/chem/assets/photos/`
  * Physics assets: `public/physics/assets/photos/`
* **Resolution & Format**:
  * Export at 2x Retina resolution (minimum 1200px to 1600px width for standard figures).
  * Use WebP or high-quality progressive JPEG with `loading="lazy"` and `decoding="async"`.
* **Semantic Containers**:
  * Standalone figures must use `<figure class="figure figure--full photo">` with a `<figcaption class="diagram-cap">`.
  * Comparative figures must use `.macro-micro-grid` with `.macro-micro-cell`, `.macro-micro-header`, `.macro-micro-body`, and `.macro-micro-caption`.
* **Dark Mode & Styling Fidelity**:
  * Images must carry `.photo-img` or reside inside `.figure.photo` to exempt them from dark mode white-backing padding.
  * Captions must adhere strictly to the zero em-dashes invariant.
