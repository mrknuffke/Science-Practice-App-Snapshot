# Simulations Testing Walkthrough

**Last Updated:** 2026-03-23
**Build Status:** ✅ Production build passing
**Simulations Status:** 3 simulations live (Periodic Table, Covalent Bonding v0.3, Ionic Bonding)

---

## 📋 Pre-Testing Checklist

Before starting manual tests, verify:

- [ ] Build passes: `npm run build` (no TypeScript or Vite errors)
- [ ] Dev server running: `npm run dev`
- [ ] Incognito window open for gatekeeper test
- [ ] Browser console open (F12) to catch errors
- [ ] Test in both Chrome/Edge AND Safari/Firefox if possible
- [ ] Test on mobile device or responsive mode (375px width minimum)

---

## 🎯 Test Suite 1: Simulations Hub

### Test 1.1: Navigation to Hub
**Path:** Landing Page → "Interactive Simulations" card

**Steps:**
1. Open app and sign in with an approved Google Workspace account
2. Scroll to bottom of landing page
3. Look for "Interactive Simulations" card (should have atom/beaker icon)
4. Click card to enter Simulations Hub

**Expected Result:**
- Hub loads with gradient background (slate-50 → blue-50 → purple-50)
- Header shows "Science Simulations" title with graduation cap icon
- "Back to Home" button visible top-left
- Three simulation cards displayed in grid:
  1. **Interactive Periodic Table** (violet/purple gradient, Beginner, BETA badge)
  2. **Covalent Bonding** (blue/cyan gradient, Intermediate, BETA badge)
  3. **Ionic Bonding** (amber/orange gradient, Intermediate, BETA badge)
- Each card shows: title, description, difficulty, topics covered, gradient header, "Launch Simulation" button
- Feedback section at bottom with "Submit Feedback" button

**Pass Criteria:**
- ✅ All 3 cards render without errors
- ✅ Gradients display correctly (not plain colors)
- ✅ BETA badges visible on all cards
- ✅ "Back to Home" button returns to landing page

**Known Issues:** None

---

## 🧪 Test Suite 2: Periodic Table Simulation

### Test 2.1: Basic Navigation
**Path:** Simulations Hub → "Interactive Periodic Table"

**Steps:**
1. From Simulations Hub, click "Interactive Periodic Table" card
2. Verify page loads

**Expected Result:**
- Header: "Interactive Periodic Table" with beaker icon
- "Back to Simulations" button visible
- Search bar at top
- View mode selector: Standard / Temperature / Property
- Filter buttons: All / Metals / Nonmetals / Metalloids / Solids / Liquids / Gases
- Legend showing element categories with color codes
- Periodic table grid (18 columns × 7 rows) with all elements

**Pass Criteria:**
- ✅ Table renders without overlapping elements
- ✅ Element cells have correct colors
- ✅ Element symbols, names, atomic numbers visible
- ✅ "Back to Simulations" button works

### Test 2.2: Search Functionality
**Steps:**
1. Type "oxygen" in search bar
2. Type "O" in search bar
3. Type "8" in search bar
4. Clear search

**Expected Result:**
- "oxygen" → Only oxygen (O) highlighted, rest grayed out
- "O" → Oxygen (O) highlighted
- "8" → Oxygen (O) highlighted (atomic number 8)
- Clear → All elements visible again

**Pass Criteria:**
- ✅ Search is case-insensitive
- ✅ Matches name, symbol, and atomic number
- ✅ Non-matching elements fade to 20% opacity and grayscale

### Test 2.3: Element Details Modal
**Steps:**
1. Click any element (e.g., Carbon)
2. Review modal content
3. Click "Close" button
4. Click another element (e.g., Sodium)
5. Click "Compare" button
6. Select a third element (e.g., Chlorine)

**Expected Result:**
- Modal opens with element details:
  - Element symbol and name in large text
  - Category label (e.g., "nonmetal")
  - Properties: Atomic mass, state at STP, period, group, electron configuration
  - Electronegativity, ionization energy, atomic radius, density
  - Melting/boiling points, oxidation states, discovery year
- "Compare" button available
- After clicking "Compare", original element persists, can select another
- Comparison table shows differences with percentage calculations

**Pass Criteria:**
- ✅ Modal data is accurate (spot-check 3-5 elements)
- ✅ Comparison mode shows percentage differences
- ✅ Comparison highlights higher value in green, lower in red

### Test 2.4: Temperature Mode
**Steps:**
1. Switch to "Temperature" view mode
2. Drag temperature slider to 0K (absolute zero)
3. Drag to 298K (room temperature)
4. Drag to 400K
5. Drag to 6000K

**Expected Result:**
- **0K:** Most elements blue (solid)
- **298K:** Mix of blue (solids), orange (liquids like Hg, Br), red (gases like H, He, N, O, F, Cl, noble gases)
- **400K:** More orange (liquids) as more elements melt
- **6000K:** Most elements red (gas)
- Temperature displays update: Kelvin, Celsius, Fahrenheit
- Legend shows: Blue = Solid, Orange = Liquid, Red = Gas

**Pass Criteria:**
- ✅ Element colors change correctly with temperature
- ✅ Slider is smooth and responsive
- ✅ Temperature conversions are accurate (298K = 25°C = 77°F)
- ✅ Hover tooltips show current state at temperature

### Test 2.5: Property Visualization Mode
**Steps:**
1. Switch to "Property" view mode
2. Select "Atomic Radius"
3. Select "Electronegativity"
4. Select "Ionization Energy"
5. Select "Density"

**Expected Result:**
- Elements with higher property values appear darker/more opaque
- Elements with lower values appear lighter/more transparent
- Elements without data (N/A) show at 30% opacity
- Visual gradient from 0.3 to 1.0 opacity

**Pass Criteria:**
- ✅ Opacity changes correctly for each property
- ✅ Trends visible (e.g., electronegativity increases left-to-right, top-to-bottom)
- ✅ Noble gases show low/no electronegativity (faint)

### Test 2.6: Filtering
**Steps:**
1. Click "Metals" filter
2. Click "Nonmetals" filter
3. Click "Metalloids" filter
4. Click "Solids" filter (in Standard mode)
5. Click "Liquids" filter (in Standard mode)
6. Click "Gases" filter (in Standard mode)
7. Switch to Temperature mode at 400K, click "Liquids" filter

**Expected Result:**
- **Metals:** Highlights alkali, alkaline earth, transition, post-transition, lanthanides, actinides
- **Nonmetals:** Highlights nonmetals, halogens, noble gases
- **Metalloids:** Highlights B, Si, Ge, As, Sb, Te
- **Solids (Standard):** Highlights most elements (room temp solid state)
- **Liquids (Standard):** Highlights Hg, Br
- **Gases (Standard):** Highlights H, He, N, O, F, Ne, Cl, Ar, Kr, Xe, Rn
- **Liquids (Temperature 400K):** More elements highlighted based on melting points

**Pass Criteria:**
- ✅ Filters correctly highlight/dim elements
- ✅ Temperature mode filters use dynamic state calculation
- ✅ "All" filter resets to show all elements

---

## 🧬 Test Suite 3: Covalent Bonding Simulation (v0.3)

### Test 3.1: Initial Setup & UI
**Path:** Simulations Hub → "Covalent Bonding"

**Steps:**
1. Launch Covalent Bonding simulation
2. Observe interface layout

**Expected Result:**
- Dark gradient background (slate-900 → purple-900)
- Header: "Covalent Bonding Simulator" with back button
- **Left Panel - Atom Palette:**
  - Available elements: H, C, N, O, F, Cl
  - "Add Atom" buttons for each
  - Element colors visible
  - "Clear Canvas" button
  - "Preset Molecules" collapsible section
- **Center - Canvas Area:**
  - SVG canvas (800×520)
  - Empty initially
  - Grid/workspace visible
- **Right Panel - Analysis:**
  - Molecule Info section
  - Validation section
  - Properties section
- **Top-Right - Visualization Tabs:**
  - "Builder" and "Lewis Diagram" tabs
- **Bottom - Bonding Toolbar:**
  - "Single Bond", "Double Bond", "Triple Bond" buttons
  - "Break Bond" button
  - All disabled initially (no atoms selected)

**Pass Criteria:**
- ✅ No console errors on load
- ✅ All UI elements render correctly
- ✅ Dark theme applied throughout
- ✅ Buttons have hover states

### Test 3.2: Adding Atoms
**Steps:**
1. Click "Add H" button 2 times
2. Click "Add O" button 1 time
3. Click "Add C" button 1 time

**Expected Result:**
- Atoms appear on canvas in circular arrangement
- Each atom shows:
  - Element symbol in center
  - Colored circle (H=white, O=red, C=gray)
  - Electron count badge (H: 1, O: 6, C: 4 available)
  - No glow initially (octet not satisfied)
- Atoms are draggable (8px activation distance)
- Molecule info updates: Formula shows "C H₂ O" (Hill notation)

**Pass Criteria:**
- ✅ Atoms positioned in circle around center
- ✅ Atom colors match database
- ✅ Electron counts correct
- ✅ Can add up to ~10 atoms without overlap

### Test 3.3: Drag-and-Drop
**Steps:**
1. Click and hold on one atom
2. Drag it to a new position
3. Release
4. Drag another atom
5. Try dragging with small movement (< 8px)

**Expected Result:**
- Atom follows cursor smoothly during drag
- Atom has higher z-index while dragging (appears on top)
- After release, atom stays at new position
- Bonded atoms move together as a fragment
- Small movements (<8px) don't trigger drag (allows for click selection)

**Pass Criteria:**
- ✅ Drag activates after 8px movement
- ✅ Smooth dragging performance (60fps)
- ✅ Whole molecule moves together if atoms bonded

### Test 3.4: Creating Bonds
**Steps:**
1. Add 2 hydrogen atoms (H)
2. Click first H atom (should highlight yellow)
3. Click second H atom (both selected)
4. Click "Single Bond" button
5. Observe result
6. Add 2 oxygen atoms (O)
7. Select both O atoms
8. Click "Double Bond" button

**Expected Result:**
- **After H-H single bond:**
  - Bond line appears connecting atoms (gray SVG line)
  - Both H atoms glow green (octet satisfied for H = 2 electrons)
  - Molecule formula: "H₂"
  - Validation: "✅ All atoms satisfy octet rule"
  - Bond count badges: "1" on each H
  - Geometry: "Linear"
  - Polarity: "Nonpolar"
- **After O=O double bond:**
  - Two parallel bond lines (8px apart)
  - Both O atoms glow green (octet satisfied)
  - Formula: "O₂"
  - Validation: ✅
  - Bond count: "2" on each O
  - Lone pairs auto-assigned: 4 electrons on each O

**Pass Criteria:**
- ✅ Visual bond lines render correctly
- ✅ Octet glow (green) appears when satisfied
- ✅ Formula updates instantly
- ✅ Bond count badges accurate
- ✅ Lone pairs auto-assigned

### Test 3.5: Bond Breaking
**Steps:**
1. Create H₂ molecule (single bond between 2 H)
2. Click on the bond line (not the atoms)
3. Verify bond is highlighted/selected
4. Click "Break Bond" button
5. Observe result

**Expected Result:**
- Clicking bond line highlights it (visual feedback)
- Message toast: "Bond selected - click 'Break Bond' to remove it"
- After clicking "Break Bond":
  - Bond line disappears
  - Both H atoms lose green glow (octet no longer satisfied)
  - Electron count resets to available (H: 1 each)
  - Formula updates: "H₂" → separate atoms
  - Validation warns: "⚠️ Some atoms do not satisfy octet rule"
  - Message toast: "Bond broken!"

**Pass Criteria:**
- ✅ Bond lines are clickable and highlight on selection
- ✅ "Break Bond" button enabled only when bond selected
- ✅ Breaking bond correctly updates all state
- ✅ Atoms return to pre-bonded electron counts

### Test 3.6: Preset Molecules
**Steps:**
1. Click "Preset Molecules" to expand
2. Select "Beginner" difficulty filter
3. Click "Water (H₂O)" preset
4. Clear canvas
5. Select "Intermediate" difficulty
6. Click "Carbon Dioxide (CO₂)" preset
7. Select "Advanced" difficulty
8. Click "Nitrogen (N₂)" preset

**Expected Result:**
- **Water (H₂O):**
  - 3 atoms appear: 1 O, 2 H
  - Two O-H single bonds
  - Bent geometry (VSEPR)
  - Polar molecule
  - Formula: "H₂O"
  - All atoms show green glow (octet satisfied)
  - Message: "Loaded Water!"
- **Carbon Dioxide (CO₂):**
  - 3 atoms: 1 C, 2 O
  - Two C=O double bonds
  - Linear geometry
  - Nonpolar (symmetrical)
  - Formula: "CO₂"
- **Nitrogen (N₂):**
  - 2 atoms: 2 N
  - One N≡N triple bond
  - Linear geometry
  - Nonpolar
  - Formula: "N₂"

**Pass Criteria:**
- ✅ All 12+ presets load without errors
- ✅ Presets organized by difficulty
- ✅ Loaded molecules are valid and fully satisfied
- ✅ Can edit loaded presets (add/remove atoms/bonds)

### Test 3.7: Lewis Diagram Visualization
**Steps:**
1. Build water molecule (H₂O)
2. Switch to "Lewis Diagram" tab
3. Observe rendering
4. Switch back to "Builder" tab
5. Build ammonia (NH₃)
6. Switch to "Lewis Diagram" again

**Expected Result:**
- **Lewis Diagram (H₂O):**
  - Dot-cross diagram rendered as SVG
  - Oxygen in center with:
    - 4 bonding electrons (2 pairs, shown as dots/crosses, green color)
    - 4 lone pair electrons (2 pairs, shown as dots/crosses, amber color)
  - Each hydrogen shows 2 bonding electrons
  - Legend: "● Bonding Electrons (green) | ● Lone Pairs (amber)"
  - Clean, readable layout
- **Lewis Diagram (NH₃):**
  - Nitrogen in center
  - 6 bonding electrons (3 N-H bonds, green)
  - 2 lone pair electrons on nitrogen (amber)
  - Hydrogens each show 2 bonding electrons

**Pass Criteria:**
- ✅ Dots vs crosses for different atoms
- ✅ Color coding (green=bonding, amber=lone pairs)
- ✅ Electron positioning follows octet pattern
- ✅ Legend displays correctly

### Test 3.8: Validation Engine
**Steps:**
1. Add 1 carbon atom (C)
2. Observe validation message
3. Add 4 hydrogen atoms
4. Do NOT create any bonds
5. Create 4 C-H single bonds
6. Observe validation after each bond

**Expected Result:**
- **1 C atom alone:**
  - Validation: "⚠️ Some atoms do not satisfy octet rule"
  - Carbon badge shows "4" available electrons
  - No glow
- **1 C + 4 H, no bonds:**
  - Validation: "⚠️ 5 atoms do not satisfy octet rule"
- **After 1st C-H bond:**
  - C: 3 available, amber glow (partial satisfaction)
  - H: 0 available, green glow (satisfied)
  - Validation: "⚠️ 4 atoms..."
- **After 4th C-H bond:**
  - C: 0 available, green glow (octet satisfied)
  - All H: green glow
  - Validation: "✅ All atoms satisfy octet rule"
  - Formula: "CH₄"
  - Geometry: "Tetrahedral"
  - Polarity: "Nonpolar"

**Pass Criteria:**
- ✅ Real-time validation updates after each action
- ✅ Glow color codes: gray (none) → amber (partial) → green (satisfied)
- ✅ Validation messages accurate
- ✅ Course-aware (expanded octet for AP Chemistry)

### Test 3.9: Advanced Features (Formal Charge, Geometry, Polarity)
**Steps:**
1. Build carbon monoxide (CO): C≡O triple bond
2. Check formal charges
3. Build water (H₂O): O with 2 H single bonds
4. Check geometry
5. Build carbon dioxide (CO₂): C with 2 double bonds to O
6. Check polarity

**Expected Result:**
- **CO:**
  - Formula: "CO"
  - Formal charge: C = -1, O = +1 (or total = 0)
  - Polarity: "Polar"
  - Geometry: "Linear"
- **H₂O:**
  - Formula: "H₂O"
  - Geometry: "Bent" (due to 2 lone pairs on O)
  - Polarity: "Polar"
  - Molar mass: ~18 g/mol
- **CO₂:**
  - Formula: "CO₂"
  - Geometry: "Linear"
  - Polarity: "Nonpolar" (symmetrical)
  - Molar mass: ~44 g/mol

**Pass Criteria:**
- ✅ Formal charge calculation accurate
- ✅ VSEPR geometry correct (considers lone pairs)
- ✅ Polarity determination correct (symmetry check)
- ✅ Molar mass accurate to 2 decimal places

### Test 3.10: Edge Cases & Error Handling
**Steps:**
1. Try to create a bond between 2 atoms with insufficient electrons (e.g., 2 H atoms with triple bond)
2. Try to select a bond when none exist
3. Add 10+ atoms to canvas
4. Create complex molecule (e.g., ethanol C₂H₅OH)

**Expected Result:**
- **Insufficient electrons:**
  - Error toast: "Cannot create bond - insufficient valence electrons"
  - Bond not created
  - Atoms deselected
- **No bond to select:**
  - "Break Bond" button disabled
  - No crash if clicked
- **10+ atoms:**
  - Atoms still arranged in circular pattern (may overlap if >12)
  - Performance remains smooth
- **Complex molecule:**
  - All bonds render correctly
  - Formula calculated accurately
  - Validation handles multi-atom structures

**Pass Criteria:**
- ✅ Error messages clear and helpful
- ✅ No crashes or console errors
- ✅ Performance degradation acceptable (>30fps up to 15 atoms)

---

## ⚡ Test Suite 4: Ionic Bonding Simulation

### Test 4.1: Basic Navigation
**Path:** Simulations Hub → "Ionic Bonding"

**Steps:**
1. Launch Ionic Bonding simulation
2. Observe interface

**Expected Result:**
- Header: "Ionic Bonding Simulator" with back button
- **Element Selection Panel:**
  - Metals: Na, K, Mg, Ca, Al, Fe, Cu, Zn, Ag
  - Nonmetals: Cl, O, F, Br, S, N
  - Polyatomic Ions: NO₃⁻, SO₄²⁻, CO₃²⁻, PO₄³⁻, OH⁻, NH₄⁺
- **Canvas Area:**
  - Shows selected cation and anion positions
- **Visualization Modes:**
  - Lewis Transfer
  - Crystal Lattice
  - Bohr Model
  - Bracket Notation
- **Compound Analysis Panel:**
  - Formula display
  - IUPAC name
  - Formula mass
  - Bonding description

**Pass Criteria:**
- ✅ All UI elements render
- ✅ Element buttons have proper colors (metals vs nonmetals)
- ✅ Polyatomic ions show superscript charges

### Test 4.2: Simple Ionic Compound (NaCl)
**Steps:**
1. Click "Na" (sodium) button
2. Click "Cl" (chlorine) button
3. Click "Ionize" or "Form Compound" button
4. Observe visualizations

**Expected Result:**
- **Lewis Transfer Diagram:**
  - Na atom shows 1 valence electron (dot)
  - Cl atom shows 7 valence electrons
  - Animated transfer: electron moves from Na to Cl
  - Na⁺ shown with +1 charge
  - Cl⁻ shown with -1 charge (8 electrons now)
- **Compound Info:**
  - Formula: "NaCl"
  - Name: "Sodium Chloride"
  - Formula mass: ~58.44 g/mol
  - Ratio: 1:1
  - Bonding: "Electrostatic attraction between Na⁺ and Cl⁻"
- **Crystal Lattice:**
  - 3D cube structure
  - Alternating Na+ (smaller, blue) and Cl- (larger, green) ions
  - Lattice lines connecting ions
- **Bohr Model:**
  - Na⁺: 2 electron shells (2, 8) - lost outer electron
  - Cl⁻: 3 electron shells (2, 8, 8) - gained 1 electron
- **Bracket Notation:**
  - [Na]⁺ and [Cl]⁻ with brackets and superscript charges

**Pass Criteria:**
- ✅ Electron transfer animation smooth
- ✅ Charge balancing correct (1:1 ratio)
- ✅ All 4 visualization modes work
- ✅ IUPAC name correct

### Test 4.3: Complex Ionic Compound (CaCl₂)
**Steps:**
1. Select "Ca" (calcium)
2. Select "Cl" (chlorine)
3. Form compound

**Expected Result:**
- **Charge Analysis:**
  - Ca²⁺ (loses 2 electrons)
  - Cl⁻ (gains 1 electron)
  - Ratio required: 1 Ca²⁺ : 2 Cl⁻ for charge balance
- **Formula:** "CaCl₂" (subscript 2)
- **Name:** "Calcium Chloride"
- **Lewis Transfer:**
  - Shows 1 Ca losing 2 electrons to 2 separate Cl atoms
- **Crystal Lattice:**
  - More complex 3D structure
  - Ratio maintains 1:2 (Ca:Cl)

**Pass Criteria:**
- ✅ Subscripts displayed correctly
- ✅ Charge balancing algorithm works (1:2 ratio)
- ✅ Multiple electron transfer animated

### Test 4.4: Variable Oxidation States (Iron)
**Steps:**
1. Select "Fe" (iron)
2. Observe oxidation state selector
3. Select "+2" oxidation state
4. Select "Cl" (chlorine)
5. Form compound
6. Clear
7. Select "Fe" again
8. Select "+3" oxidation state
9. Select "Cl" again
10. Form compound

**Expected Result:**
- **Fe²⁺ + Cl⁻:**
  - Formula: "FeCl₂"
  - Name: "Iron(II) Chloride" (Roman numerals)
  - Ratio: 1:2
- **Fe³⁺ + Cl⁻:**
  - Formula: "FeCl₃"
  - Name: "Iron(III) Chloride"
  - Ratio: 1:3
- Oxidation state selector only appears for Fe, Cu (variable charge metals)

**Pass Criteria:**
- ✅ Oxidation state selector appears for Fe, Cu only
- ✅ Roman numerals in name for variable-charge metals
- ✅ Different formulas for different oxidation states

### Test 4.5: Polyatomic Ions (Sodium Sulfate)
**Steps:**
1. Select "Na" (sodium)
2. Select "SO₄²⁻" (sulfate) from polyatomic ions
3. Form compound

**Expected Result:**
- **Formula:** "Na₂SO₄" (subscript 2 on Na)
- **Name:** "Sodium Sulfate"
- **Ratio:** 2 Na⁺ : 1 SO₄²⁻
- **Lewis Transfer:**
  - Shows 2 Na atoms each losing 1 electron
  - Sulfate ion (as a unit) receiving 2 electrons total
- **Bracket Notation:**
  - [Na]⁺₂ and [SO₄]²⁻ with proper brackets

**Pass Criteria:**
- ✅ Polyatomic ion treated as single unit
- ✅ Subscripts and superscripts display correctly
- ✅ Charge balance correct (2 × +1 = 1 × -2)

### Test 4.6: Edge Cases
**Steps:**
1. Try to form compound with only metal selected (no nonmetal)
2. Try to form compound with only nonmetal selected (no metal)
3. Select two metals (Na, then Ca)
4. Create aluminum oxide (Al₂O₃) - complex ratio

**Expected Result:**
- **Only metal:** Error message "Please select both a metal and a non-metal first"
- **Only nonmetal:** Same error
- **Two metals:** Second metal replaces first (cation)
- **Al₂O₃:**
  - Formula: "Al₂O₃"
  - Name: "Aluminum Oxide"
  - Ratio: 2 Al³⁺ : 3 O²⁻
  - Charge balance: 2×(+3) = 3×(-2) = ±6

**Pass Criteria:**
- ✅ Error handling prevents invalid compounds
- ✅ Complex ratios (2:3) calculated correctly
- ✅ No crashes or infinite loops

---

## 🎮 Test Suite 5: Cross-Cutting Features

### Test 5.1: Mobile Responsiveness
**Steps:**
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M or Cmd+Shift+M)
3. Select iPhone 12 Pro (390×844)
4. Test Simulations Hub
5. Test Covalent Bonding
6. Test Periodic Table
7. Switch to iPad (768×1024)

**Expected Result:**
- **Mobile (390px):**
  - Simulation cards stack vertically (1 column)
  - Text remains readable (font-size ≥14px)
  - Buttons have min 44×44px touch targets
  - Periodic table grid shrinks but remains functional
  - Covalent bonding palette scrolls/collapses
- **Tablet (768px):**
  - Simulations Hub shows 2 cards per row
  - Periodic table grid responsive
  - Covalent bonding side-by-side layout

**Pass Criteria:**
- ✅ No horizontal scroll on mobile
- ✅ All interactive elements tappable (44px+ size)
- ✅ Text readable without zoom
- ✅ Layouts adapt appropriately

### Test 5.2: Performance
**Steps:**
1. Open Chrome Performance tab
2. Start recording
3. Build large molecule (10 atoms, 9 bonds)
4. Drag atoms around
5. Switch visualization modes
6. Stop recording
7. Analyze frame rate

**Expected Result:**
- **Frame Rate:** >30fps (smooth), ideally 60fps
- **Drag Performance:** No stuttering or lag
- **Visualization Switch:** <200ms transition
- **Memory:** No memory leaks (heap doesn't grow continuously)

**Pass Criteria:**
- ✅ Smooth interactions (subjective feel)
- ✅ No dropped frames during drag
- ✅ Fast mode switches

### Test 5.3: Browser Compatibility
**Steps:**
1. Test in Chrome/Edge (Chromium)
2. Test in Firefox
3. Test in Safari (macOS or iOS)
4. Note any differences

**Expected Result:**
- All simulations work in all browsers
- Visual differences minimal (font rendering may vary)
- SVG rendering consistent
- Drag-and-drop works (may feel slightly different)

**Pass Criteria:**
- ✅ Core functionality works in all 3 browsers
- ✅ No critical errors in any browser
- ✅ Visual layout acceptable in all

### Test 5.4: Accessibility (Basic)
**Steps:**
1. Use Tab key to navigate Periodic Table
2. Use Tab key to navigate Covalent Bonding
3. Check screen reader labels (VoiceOver on Mac, NVDA on Windows)
4. Check color contrast (DevTools Lighthouse audit)

**Expected Result:**
- Tab navigation works (buttons focusable)
- Focus indicators visible (blue outline)
- Screen reader announces button labels
- Color contrast ≥4.5:1 (AA standard)

**Pass Criteria:**
- ✅ Tab navigation functional
- ✅ Focus indicators visible
- ✅ No critical accessibility errors in Lighthouse
- ⚠️ Screen reader support basic (not fully optimized yet)

---

## 🐛 Known Issues & Limitations

### Covalent Bonding
1. **Large Molecules (>12 atoms):** Circular positioning may cause overlap
2. **Resonance Structures:** Not yet supported (planned for v1.0)
3. **Expanded Octet:** Supported in validation but no special UI indicators
4. **3D Visualization:** Not yet implemented (dependencies installed, awaiting development)

### Periodic Table
1. **Data Completeness:** Only ~30 elements out of 118 fully populated
2. **Lanthanides/Actinides:** Missing from current dataset
3. **Property Visualization:** Limited to 4 properties (more can be added)

### Ionic Bonding
1. **Animation Performance:** Crystal lattice may lag on older devices
2. **Polyatomic Ion Visuals:** Simplified (doesn't show internal structure)
3. **Lattice Energy:** Not calculated (potential future feature)

### Cross-Cutting
1. **No Gamification Yet:** XP and badges not integrated (constants defined, implementation pending)
2. **No Keyboard Shortcuts:** All interactions mouse/touch only
3. **Limited Accessibility:** Basic support only, needs ARIA labels and keyboard navigation
4. **No Undo/Redo:** Not implemented in any simulation

---

## ✅ Success Criteria Summary

A simulation passes testing if:

1. **Functionality:** All core features work as described
2. **Validation:** Calculations (formulas, masses, charges) are accurate
3. **Performance:** Smooth at 30+ fps with up to 10 atoms/elements
4. **Mobile:** Usable on 375px width screen
5. **Browser:** Works in Chrome, Firefox, Safari
6. **Errors:** No console errors or crashes during normal use
7. **UX:** Interactions feel responsive and intuitive

---

## 📊 Testing Checklist

Use this checklist to track your testing progress:

**Simulations Hub:**
- [ ] Navigation from landing page
- [ ] All 3 cards render correctly
- [ ] Back button works
- [ ] Feedback link works

**Periodic Table:**
- [ ] Table renders completely
- [ ] Search works (name, symbol, number)
- [ ] Element modal opens with accurate data
- [ ] Temperature mode updates element states
- [ ] Property visualization shows opacity gradient
- [ ] Filtering works (metals, nonmetals, etc.)
- [ ] Comparison mode calculates percentages

**Covalent Bonding:**
- [ ] Atoms can be added to canvas
- [ ] Drag-and-drop works smoothly
- [ ] Single/double/triple bonds can be created
- [ ] Bond breaking UI works
- [ ] Preset molecules load correctly
- [ ] Lewis diagram visualization renders
- [ ] Validation updates in real-time
- [ ] Octet glow color codes work
- [ ] Formula generation accurate
- [ ] Geometry/polarity calculations correct

**Ionic Bonding:**
- [ ] Metal and nonmetal selection works
- [ ] Simple compounds form (NaCl)
- [ ] Complex ratios calculated (CaCl₂, Al₂O₃)
- [ ] Variable oxidation states work (Fe²⁺ vs Fe³⁺)
- [ ] Polyatomic ions handled correctly
- [ ] All 4 visualization modes work
- [ ] IUPAC naming correct

**Cross-Cutting:**
- [ ] Mobile responsive (375px+)
- [ ] Performance acceptable (30+ fps)
- [ ] Works in Chrome/Firefox/Safari
- [ ] Basic accessibility (Tab navigation)

---

## 📝 Bug Reporting Template

If you find a bug, please report using this format:

```
**Bug Title:** [Short description]
**Simulation:** [Periodic Table / Covalent Bonding / Ionic Bonding / Hub]
**Severity:** [Critical / High / Medium / Low]
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [etc.]

**Expected Result:** [What should happen]
**Actual Result:** [What actually happens]
**Browser:** [Chrome 120 / Firefox 121 / Safari 17]
**Device:** [Desktop / Mobile / Tablet]
**Screenshot:** [If applicable]
**Console Errors:** [Copy/paste any console errors]
```

---

## 🚀 Next Steps After Testing

After completing this testing walkthrough:

1. **Log Issues:** Document any bugs found using the template above
2. **Prioritize Fixes:** Critical bugs block release, high/medium can be addressed in v1.0
3. **Update Documentation:** If behavior differs from docs, update SIMULATION_TODO.md
4. **Plan v1.0 Features:** Based on testing feedback, prioritize remaining features
5. **Performance Optimization:** If performance issues found, profile and optimize

---

**Testing completed by:** [Your Name]
**Date:** [Date]
**Build Version:** v0.3 (2026-03-23)
**Overall Status:** [ ] Pass / [ ] Pass with minor issues / [ ] Fail - see bugs
