# Covalent Bonding Simulation - TODO List

## Current Status: v0.3 (Near Production-Ready)

The Covalent Bonding Simulator has progressed from **beta v0.1** → **v0.2** → **v0.3** with major UI/UX improvements including drag-and-drop, visual bond lines, Lewis diagram visualization, **bond breaking UI**, and **preset molecules library**. This document tracks remaining work to reach full v1.0 release.

### Recent Additions (v0.3 - 2026-03-23)
- ✅ **Shared Simulation Components Created**: `MessageToast`, `VisualizationModeTabs`, `SimulationHeader`, `useSimulationMessage` hook
- ✅ **Centralized Constants**: `SIMULATION_CONSTANTS.ts` for magic numbers and configuration
- ✅ **Unicode Formatting Utilities**: `utils/unicodeFormatting.ts` for subscripts/superscripts
- ✅ **Bond Breaking UI**: Fully implemented with click-to-select and "Break Bond" button
- ✅ **Preset Molecules UI**: Integrated with collapsible panel and difficulty filtering

---

## ✅ Completed (v0.2)

### Beta v0.1 Features
- [x] Core engine with electron apportionment logic
- [x] Formula generation (Hill notation)
- [x] Molecule identification (common molecules database)
- [x] Validation system (octet rule, course-aware)
- [x] Molar mass calculation
- [x] Formal charge calculation
- [x] Basic VSEPR geometry calculation
- [x] Polarity determination
- [x] Simplified UI with click-to-select bonding
- [x] Real-time validation feedback panel
- [x] Atom status tracking (available electrons display)
- [x] Integration with landing page and routing

### v0.2 Improvements (Just Completed!)
- [x] **Drag-and-Drop Atom Placement** with @dnd-kit
  - Smooth atom dragging with 8px activation distance
  - Atoms can be repositioned anywhere on canvas
  - Touch-friendly with PointerSensor
- [x] **Visual Bond Lines**
  - SVG bond rendering connecting atoms
  - Single/double/triple bond visualization with proper spacing
  - Bonds update dynamically as atoms move
- [x] **Dot-Cross Lewis Diagram Visualization**
  - SVG-based Lewis structure renderer
  - Dots for first atom's electrons, crosses for others
  - Bonding electrons (green) vs lone pairs (amber)
  - Dynamic legend and viewBox sizing
- [x] **Visualization Mode Switcher**
  - Tab interface to toggle between Builder and Lewis Diagram
  - Smooth mode transitions
  - Mode-specific UI (Builder shows palette, Lewis shows structure)
- [x] **Improved Atom Layout**
  - Circular positioning algorithm instead of linear
  - Atoms arranged evenly around center
  - Better starting positions for molecules
- [x] **Enhanced Visual Feedback**
  - Octet satisfaction glow (green = satisfied, amber = partial, gray = none)
  - Selected atoms highlighted with yellow border and scale
  - Bond count badges on atoms

---

## 🚧 In Progress / High Priority

### UI/UX Improvements

- [ ] **Bond Creator Modal** (Optional Enhancement)
  - Polished modal for selecting bond type
  - Visual preview of electron requirements
  - Validation messages before bond creation
  - **Files**: `BondCreatorModal.tsx` (new)
  - **Status**: Current implementation uses toolbar buttons which works well

- [x] **Bond Breaking UI** ✅ COMPLETED
  - Click on bond lines to select them
  - "Break Bond" button when bond is selected
  - Visual feedback on bond hover
  - **Files**: `CovalentBondingView.tsx` (lines 191-214, 512)

### Visualization Modes

- [ ] **Structural Formula Visualization**
  - 2D line-bond diagrams
  - Single/double/triple bond notation
  - Element symbols positioned correctly
  - **Files**: `StructuralFormula.tsx` (new)

- [ ] **3D Model Viewer** (Lower Priority)
  - react-three-fiber integration
  - Ball-and-stick representation
  - Mouse drag to rotate, scroll to zoom
  - CPK coloring standard
  - **Files**: `Model3DViewer.tsx` (new)
  - **Dependencies**: Already installed (`@react-three/fiber`, `three`, `@react-three/drei`)

- [ ] **Improve Lewis Diagram**
  - Better electron positioning algorithm (consider bond angles)
  - Support for resonance structures (toggle arrows)
  - Formal charge indicators on individual atoms
  - Dashed lines for coordinate covalent bonds

---

## 📋 Medium Priority

### Feature Enhancements

- [x] **Preset Molecules Library** ✅ COMPLETED
  - Quick-load common molecules (H2O, CO2, NH3, CH4, etc.)
  - Categorized by difficulty (Beginner, Intermediate, Advanced)
  - Collapsible preset panel with difficulty filter
  - **Files**: `presetMolecules.ts` (data), `CovalentBondingView.tsx` (lines 181-189, 417-465)

- [ ] **Undo/Redo System**
  - History stack for molecule changes
  - Undo button (Cmd/Ctrl+Z)
  - Redo button (Cmd/Ctrl+Shift+Z)
  - **Files**: `moleculeEngine.ts` (add history tracking)

- [ ] **Save/Share Functionality**
  - Export molecule as JSON
  - Import molecule from JSON
  - URL encoding for sharing
  - localStorage persistence of user-built molecules
  - **Files**: `CovalentBondingView.tsx` (add save handlers)

- [ ] **Mobile Optimization**
  - Simplified tap-to-place mode (alternative to drag-and-drop)
  - Larger touch targets (60px+)
  - Vertical layout for small screens
  - Swipe gestures for mode switching

### Advanced Chemistry Features

- [ ] **Resonance Structures** (AP Chemistry)
  - Toggle between resonance forms
  - Visual indicator for resonance hybrid
  - Formal charge display on individual atoms
  - **Files**: `moleculeEngine.ts` (add resonance logic)

- [ ] **Expanded Octet Validation** (AP Chemistry)
  - Already supported in validation logic
  - Add visual explanations for P, S, Cl, Xe compounds
  - Warnings vs errors distinction

- [ ] **Formal Charge Display**
  - Show formal charge on each atom (not just total)
  - Visual markers (+ or - symbols)
  - Color coding for charge distribution

- [ ] **Electronegativity Scale Reference**
  - Sidebar panel with Pauling scale
  - Highlight selected elements
  - Bond polarity indicators (δ+ and δ-)

---

## 🎯 Low Priority / Future Enhancements

### Educational Features

- [ ] **Tutorial Mode**
  - Step-by-step guided walkthrough
  - "Build water" challenge
  - Tooltips and hints system

- [ ] **Challenge Mode**
  - "Build this molecule" puzzles
  - Timer-based challenges
  - Leaderboard integration

- [ ] **Molecule Gallery**
  - User-created molecule showcase
  - Vote on creative structures
  - Share with classroom

### Gamification

- [ ] **Badges for Simulations**
  - "First Molecule" badge
  - "Expanded Octet Master" badge (SF6, PCl5)
  - "Polar vs Nonpolar" badge
  - **Files**: `services/storageService.ts` (add new badge types)

- [ ] **XP for Molecule Building**
  - Award XP for valid structures
  - Bonus for complex molecules
  - Trophy room integration

### Additional Simulations (Future Modules)

- [ ] **Ionic Bonding Simulator**
  - Electron transfer visualization
  - Lattice structure builder
  - Coulombic attraction

- [ ] **Acid-Base pH Simulator**
  - Titration curves
  - pH calculator
  - Buffer capacity visualization

- [ ] **Circuit Builder** (Physics)
  - Ohm's law calculations
  - Series/parallel circuits
  - Voltage/current measurements

- [ ] **Newton's Laws Simulator** (Physics)
  - Force diagrams
  - Projectile motion
  - Collisions

---

## 🐛 Known Issues

### Current v0.2 Limitations

1. ~~**No visual bonds between atoms**~~ ✅ FIXED in v0.2

2. ~~**Manual atom positioning**~~ ✅ FIXED in v0.2 (drag-and-drop + circular layout)

3. **No bond breaking UI** - Can only remove entire atoms
   - **Fix**: Add "Break Bond" button when bond is clicked
   - **Status**: High priority for v0.3

4. **Lewis diagram electron positioning is basic** - Uses fixed 8-position circle
   - **Fix**: Calculate actual bond angles from VSEPR geometry
   - **Status**: Medium priority

5. **No support for ions** - Only neutral molecules
   - **Fix**: Add charge input and ionic bonding logic
   - **Status**: Future feature

6. **Geometry calculation is simplified** - Only considers central atom
   - **Fix**: Improve VSEPR algorithm for complex molecules
   - **Status**: Medium priority

---

## 📝 Documentation Needs

- [ ] Update `MODE_REFERENCE.md` with Covalent Bonding Simulation entry
- [ ] Add "How to Use" guide in simulation (help button)
- [ ] Teacher guide with classroom activity ideas
- [ ] Troubleshooting section for common errors
- [ ] Video walkthrough for YouTube/help page

---

## 🔧 Technical Debt

- [ ] Extract repeated SVG patterns into utility components
- [ ] Create custom hooks for molecule state management
- [ ] Add comprehensive TypeScript types for geometry calculations
- [ ] Unit tests for chemistry engine functions
- [ ] E2E tests for simulation workflows
- [ ] Performance optimization (memoization for heavy calculations)
- [ ] Accessibility audit (ARIA labels, keyboard navigation, screen readers)

---

## 📊 Metrics to Track

Once full version is live, track:
- Number of molecules built
- Most common molecules created
- Average time spent in simulation
- Completion rate for tutorial mode
- Error patterns (where students get stuck)

---

## 🎓 Pedagogical Goals

The simulation should help students:
1. **Understand electron apportionment** - Explicit allocation teaches sharing concept
2. **Master octet rule** - Visual feedback reinforces target electron counts
3. **Recognize bonding patterns** - See why carbon forms 4 bonds, oxygen 2
4. **Connect 2D and 3D** - Multiple visualizations bridge abstract and concrete
5. **Build confidence** - Immediate validation prevents misconceptions

---

## Priority Matrix

| Feature | Impact | Effort | Priority | Status |
|---------|--------|--------|----------|--------|
| ~~Drag-and-drop~~ | High | Medium | ~~**P0**~~ | ✅ v0.2 |
| ~~Dot-cross visualization~~ | High | Medium | ~~**P0**~~ | ✅ v0.2 |
| ~~Visual bond lines~~ | High | Low | ~~**P0**~~ | ✅ v0.2 |
| Bond breaking UI | High | Low | **P0** | Next |
| Bond creator modal | Medium | Low | **P1** | Next |
| Preset molecules | Medium | Low | **P1** | Planned |
| Structural formula view | Medium | Medium | **P1** | Planned |
| 3D viewer | Medium | High | **P2** | Future |
| Resonance structures | Low | High | **P3** | Future |
| Tutorial mode | Medium | Medium | **P2** | Future |

**P0** = Next sprint (v0.3)
**P1** = This quarter
**P2** = Future release
**P3** = Nice to have

---

**Last Updated**: 2026-03-23
**Status**: v0.3 near production-ready (drag-and-drop, Lewis diagrams, visual bonds, bond breaking, presets ✅)
**Next Milestone**: v1.0 production release with gamification, accessibility, and mobile optimization
