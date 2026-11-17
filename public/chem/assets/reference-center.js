/* ============================================================
   GEN CHEM : REFERENCE CENTER DRAWER
   The slide-out student study drawer: Periodic Table ·
   Formulas & Tables · Calculator.

   Loaded by every lesson page AND by the textbook dashboard so
   there is exactly one implementation of the drawer (golden
   rule 17 in TEXTBOOK_DEV_GUIDE.md: global study helpers live
   in this drawer, never as standalone widgets). Injects a
   "References" button into .topbar-right on any page that has
   one; does nothing on pages that don't.
   ============================================================ */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);

  // Resolve elements.js relative to THIS script so the drawer works
  // from /chem/index.html and /chem/lessons/*.html alike.
  const ELEMENTS_SRC = (function () {
    const self = document.currentScript && document.currentScript.src;
    return self ? self.replace(/reference-center\.js(\?.*)?$/, 'elements.js') : 'assets/elements.js';
  })();

  /* ---- the drawer ----
     book.js lists "References" as a top-bar tool, and the shared top bar renders the
     button. Its click calls window.TB_REFERENCE_CENTER.open(), defined below. */
  (function () {
    let elementsScript = null;
    if (!window.GC_ELEMENTS) {
      elementsScript = document.createElement('script');
      elementsScript.src = ELEMENTS_SRC;
      elementsScript.async = true;
      document.head.appendChild(elementsScript);
    }

    let drawerOverlay = null;
    let drawer = null;
    let initialized = false;

    function open() {
      if (!initialized) {
        initPeriodicTableDrawer();
        initialized = true;
      }
      openDrawer();
    }
    window.TB_REFERENCE_CENTER = { open: open, close: closeDrawer };

    function openDrawer() {
      if (drawerOverlay && drawer) {
        drawerOverlay.classList.add('open');
        drawer.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeDrawer() {
      if (drawerOverlay && drawer) {
        drawerOverlay.classList.remove('open');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      }
    }

    function initPeriodicTableDrawer() {
      // 1. Create overlay & drawer elements in DOM
      drawerOverlay = document.createElement('div');
      drawerOverlay.className = 'ptable-drawer-overlay';
      document.body.appendChild(drawerOverlay);

      drawer = document.createElement('div');
      drawer.className = 'ptable-drawer';
      drawer.id = 'ptableDrawer';
      
      drawer.innerHTML = `
        <div class="ptable-drawer-header">
          <h3>Reference Center</h3>
          <button class="ptable-close-btn" aria-label="Close reference drawer">&times;</button>
        </div>
        <div class="ptable-drawer-tabs">
          <button class="ptable-drawer-tab active" data-panel="ptable">Periodic Table</button>
          <button class="ptable-drawer-tab" data-panel="formulas">Formulas &amp; Tables</button>
          <button class="ptable-drawer-tab" data-panel="calc">Calculator</button>
        </div>
        <div class="ptable-drawer-body">
          <!-- Panel 1: Periodic Table -->
          <div class="ptable-panel active" id="panelPtable">
            <div class="ptable-controls">
              <div class="ptable-control-row">
                <span class="label">Display Mode:</span>
                <label class="ptable-toggle-label">
                  <input type="checkbox" id="ptableTransitionToggle" checked>
                  Show Transition Metals
                </label>
              </div>
              <div class="ptable-tabs">
                <button class="ptable-tab active" data-mode="default">Default</button>
                <button class="ptable-tab" data-mode="radius">Radius</button>
                <button class="ptable-tab" data-mode="ie">IE</button>
                <button class="ptable-tab" data-mode="en">EN</button>
              </div>
            </div>
            <div class="ptable-grid-container">
              <div class="ptable-grid"></div>
            </div>
            <div class="ptable-legend" id="ptableLegend"></div>
            <div class="ptable-detail-panel" id="ptableDetailPanel">
              <div class="ptable-detail-placeholder">
                Select an element to view Bohr atomic model, configuration, and periodic properties.
              </div>
              <div class="ptable-detail-content" style="display: none;">
                <div class="ptable-detail-main">
                  <div class="ptable-detail-atom-header">
                    <span class="ptable-detail-sym">H</span>
                    <span class="ptable-detail-z">Z=1</span>
                  </div>
                  <div class="ptable-detail-name">Hydrogen</div>
                  <div class="ptable-detail-kind-tag">Nonmetal</div>
                  <div class="ptable-detail-stats">
                    <div class="ptable-detail-stat-row">
                      <span class="ptable-detail-stat-label">Group Name</span>
                      <span class="ptable-detail-stat-val val-group">Group 1</span>
                    </div>
                    <div class="ptable-detail-stat-row">
                      <span class="ptable-detail-stat-label">Shell Config</span>
                      <span class="ptable-detail-stat-val val-shells">1</span>
                    </div>
                    <div class="ptable-detail-stat-row">
                      <span class="ptable-detail-stat-label">Valence e⁻</span>
                      <span class="ptable-detail-stat-val val-valence">1</span>
                    </div>
                    <div class="ptable-detail-stat-row">
                      <span class="ptable-detail-stat-label">Typical Charge</span>
                      <span class="ptable-detail-stat-val val-charge">1+</span>
                    </div>
                    <div class="ptable-detail-stat-row">
                      <span class="ptable-detail-stat-label">Atomic Radius</span>
                      <span class="ptable-detail-stat-val val-radius">53 pm</span>
                    </div>
                    <div class="ptable-detail-stat-row">
                      <span class="ptable-detail-stat-label">Ionization Energy</span>
                      <span class="ptable-detail-stat-val val-ie">1312 kJ/mol</span>
                    </div>
                    <div class="ptable-detail-stat-row">
                      <span class="ptable-detail-stat-label">Electronegativity</span>
                      <span class="ptable-detail-stat-val val-en">2.20</span>
                    </div>
                    <div class="ptable-detail-stat-row">
                      <span class="ptable-detail-stat-label">Tendency</span>
                      <span class="ptable-detail-stat-val val-tendency">gains 1 e⁻ (1−)</span>
                    </div>
                  </div>
                </div>
                <div class="ptable-detail-visual"></div>
              </div>
            </div>
          </div>

          <!-- Panel 2: Formulas & Tables -->
          <div class="ptable-panel" id="panelFormulas">
            <div class="ptable-formulas-container">
              <div class="ptable-ref-section">
                <h4>Mole Conversions</h4>
                <p>Use Avogadro's number (6.022 &times; 10²³) to count particles, and molar mass (g/mol) from the periodic table to weigh them.</p>
                <div class="ptable-bridge-diagram">
                  <div class="ptable-bridge-node">Mass<br><span style="font-size:var(--text-3xs); color:var(--ink-mute);">grams</span></div>
                  <div class="ptable-bridge-arrow">
                    <span>&divide; Molar Mass</span>
                    <span>&rarr;</span>
                    <span>&larr;</span>
                    <span>&times; Molar Mass</span>
                  </div>
                  <div class="ptable-bridge-node">Moles<br><span style="font-size:var(--text-3xs); color:var(--ink-mute);">mol</span></div>
                  <div class="ptable-bridge-arrow">
                    <span>&times; Avogadro's #</span>
                    <span>&rarr;</span>
                    <span>&larr;</span>
                    <span>&divide; Avogadro's #</span>
                  </div>
                  <div class="ptable-bridge-node">Particles<br><span style="font-size:var(--text-3xs); color:var(--ink-mute);">atoms/molecules</span></div>
                </div>
              </div>
              
              <div class="ptable-ref-section">
                <h4>Bonding &amp; Electronegativity Differences</h4>
                <p>The difference in electronegativity (&Delta;EN) between two bonded atoms predicts their bonding character:</p>
                <table class="ptable-ref-table">
                  <thead>
                    <tr>
                      <th>&Delta;EN Range</th>
                      <th>Bond Type</th>
                      <th>Electron Sharing</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>&lt; 0.5</td>
                      <td>Nonpolar Covalent</td>
                      <td>Equally shared</td>
                    </tr>
                    <tr>
                      <td>0.5 &ndash; 1.7</td>
                      <td>Polar Covalent</td>
                      <td>Unequally shared (partial charges &delta;+/&delta;&minus;)</td>
                    </tr>
                    <tr>
                      <td>&gt; 1.7</td>
                      <td>Ionic</td>
                      <td>Transferred completely (ions form)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div class="ptable-ref-section">
                <h4>Common Polyatomic Ions</h4>
                <p>Memorized group ions that stay together as a single charged unit in ionic formulas:</p>
                <table class="ptable-ref-table">
                  <thead>
                    <tr>
                      <th>Ion Name</th>
                      <th>Formula</th>
                      <th>Charge</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Ammonium</td>
                      <td>NH<sub>4</sub><sup>+</sup></td>
                      <td>1+</td>
                    </tr>
                    <tr>
                      <td>Hydroxide</td>
                      <td>OH<sup>&minus;</sup></td>
                      <td>1&minus;</td>
                    </tr>
                    <tr>
                      <td>Nitrate</td>
                      <td>NO<sub>3</sub><sup>&minus;</sup></td>
                      <td>1&minus;</td>
                    </tr>
                    <tr>
                      <td>Carbonate</td>
                      <td>CO<sub>3</sub><sup>2&minus;</sup></td>
                      <td>2&minus;</td>
                    </tr>
                    <tr>
                      <td>Sulfate</td>
                      <td>SO<sub>4</sub><sup>2&minus;</sup></td>
                      <td>2&minus;</td>
                    </tr>
                    <tr>
                      <td>Phosphate</td>
                      <td>PO<sub>4</sub><sup>3&minus;</sup></td>
                      <td>3&minus;</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div class="ptable-ref-section">
                <h4>Thermochemistry &amp; Energy</h4>
                <p>Formulas for sensible heat, phase transitions, and reaction enthalpy:</p>
                <div class="ptable-formula-strip" style="display:flex; flex-direction:column; gap:0.4rem; font-family:var(--mono); font-size:var(--text-2xs); background:var(--paper-2); padding:0.6rem; border-radius:4px; border:1px solid var(--hair-soft); margin-bottom:0.6rem;">
                  <div><strong>q = mc&Delta;T</strong>: Temperature change (no phase change)</div>
                  <div><strong>q = mH<sub>f</sub></strong>: Melting/freezing (Water H<sub>f</sub> = 334 J/g)</div>
                  <div><strong>q = mH<sub>v</sub></strong>: Boiling/condensing (Water H<sub>v</sub> = 2260 J/g)</div>
                  <div><strong>&Delta;H = &Sigma;(broken) &minus; &Sigma;(formed)</strong>: Bond energy enthalpy</div>
                </div>
                <table class="ptable-ref-table">
                  <thead>
                    <tr>
                      <th>Substance</th>
                      <th>State</th>
                      <th>Specific Heat (J/g&middot;&deg;C)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Water (liquid)</td><td>l</td><td>4.18</td></tr>
                    <tr><td>Ice (solid water)</td><td>s</td><td>2.09</td></tr>
                    <tr><td>Steam (water vapor)</td><td>g</td><td>2.01</td></tr>
                    <tr><td>Aluminum</td><td>s</td><td>0.90</td></tr>
                    <tr><td>Iron</td><td>s</td><td>0.45</td></tr>
                    <tr><td>Copper</td><td>s</td><td>0.39</td></tr>
                  </tbody>
                </table>
              </div>

              <div class="ptable-ref-section">
                <h4>Average Bond Energies (kJ/mol)</h4>
                <p>Energy required to break 1 mole of covalent bonds in the gas phase:</p>
                <table class="ptable-ref-table">
                  <thead>
                    <tr>
                      <th>Bond</th>
                      <th>Energy</th>
                      <th>Bond</th>
                      <th>Energy</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>H&minus;H</td><td>432</td><td>C&minus;H</td><td>411</td></tr>
                    <tr><td>C&minus;C</td><td>346</td><td>C=C</td><td>602</td></tr>
                    <tr><td>C&equiv;C</td><td>835</td><td>C&minus;O</td><td>358</td></tr>
                    <tr><td>C=O (CO<sub>2</sub>)</td><td>799</td><td>O&minus;H</td><td>464</td></tr>
                    <tr><td>O=O</td><td>494</td><td>H&minus;Cl</td><td>431</td></tr>
                    <tr><td>N&minus;H</td><td>386</td><td>N&equiv;N</td><td>941</td></tr>
                  </tbody>
                </table>
              </div>

              <div class="ptable-ref-section">
                <h4>Nuclear Particles &amp; Radiation</h4>
                <p>Notation and characteristics of nuclear particles and decay modes:</p>
                <table class="ptable-ref-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Symbol</th>
                      <th>Mass (A)</th>
                      <th>Charge (Z)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Alpha particle</td><td><sup>4</sup><sub>2</sub>He (or &alpha;)</td><td>4</td><td>+2</td></tr>
                    <tr><td>Beta particle</td><td><sup>0</sup><sub>&minus;1</sub>e (or &beta;<sup>&minus;</sup>)</td><td>0</td><td>&minus;1</td></tr>
                    <tr><td>Positron</td><td><sup>0</sup><sub>+1</sub>e (or &beta;<sup>+</sup>)</td><td>0</td><td>+1</td></tr>
                    <tr><td>Gamma ray</td><td><sup>0</sup><sub>0</sub>&gamma;</td><td>0</td><td>0</td></tr>
                    <tr><td>Neutron</td><td><sup>1</sup><sub>0</sub>n</td><td>1</td><td>0</td></tr>
                    <tr><td>Proton</td><td><sup>1</sup><sub>1</sub>p (or <sup>1</sup><sub>1</sub>H)</td><td>1</td><td>+1</td></tr>
                  </tbody>
                </table>
                <p style="font-size:var(--text-3xs); color:var(--ink-mute); margin-top:0.4rem;"><strong>Mass-Energy Equivalence:</strong> E = mc<sup>2</sup> (1 u = 931.5 MeV)</p>
              </div>

              <div class="ptable-ref-section">
                <h4>Electromagnetic Radiation</h4>
                <p>Wave and photon relationships: <strong>c = &lambda;f</strong> &middot; <strong>E = hf = hc/&lambda;</strong></p>
                <p style="font-size:var(--text-3xs); color:var(--ink-mute);">c = 3.00 &times; 10<sup>8</sup> m/s &middot; h = 6.626 &times; 10<sup>&minus;34</sup> J&middot;s</p>
                <div style="font-family:var(--mono); font-size:var(--text-3xs); background:var(--paper-2); padding:0.5rem; border-radius:4px; border:1px solid var(--hair-soft); margin-top:0.4rem;">
                  <span style="color:var(--ink-mute);">Low E, Long &lambda;, Low f</span> &rarr;<br>
                  Radio &bull; Microwave &bull; Infrared &bull; <strong>Visible (400&ndash;700 nm)</strong> &bull; Ultraviolet &bull; X-ray &bull; Gamma<br>
                  <span style="color:var(--accent);">&larr; Ionizing Threshold (UV-C, X-ray, Gamma: knocks e<sup>&minus;</sup> loose)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Panel 3: Calculator -->
          <div class="ptable-panel" id="panelCalc">
            <div class="ptable-calc-container">
              <!-- Math calculator display -->
              <div class="ptable-calc-display-wrap">
                <div class="ptable-calc-expr" id="ptableCalcExpr"></div>
                <div class="ptable-calc-result" id="ptableCalcResult">0</div>
              </div>
              
              <!-- Calculator buttons grid -->
              <div class="ptable-calc-grid">
                <button class="ptable-calc-btn action" data-calc="clear">C</button>
                <button class="ptable-calc-btn action" data-calc="backspace">&larr;</button>
                <button class="ptable-calc-btn op" data-calc="e">EE</button>
                <button class="ptable-calc-btn op" data-calc="/">/</button>
                
                <button class="ptable-calc-btn" data-calc="7">7</button>
                <button class="ptable-calc-btn" data-calc="8">8</button>
                <button class="ptable-calc-btn" data-calc="9">9</button>
                <button class="ptable-calc-btn op" data-calc="*">&times;</button>
                
                <button class="ptable-calc-btn" data-calc="4">4</button>
                <button class="ptable-calc-btn" data-calc="5">5</button>
                <button class="ptable-calc-btn" data-calc="6">6</button>
                <button class="ptable-calc-btn op" data-calc="-">-</button>
                
                <button class="ptable-calc-btn" data-calc="1">1</button>
                <button class="ptable-calc-btn" data-calc="2">2</button>
                <button class="ptable-calc-btn" data-calc="3">3</button>
                <button class="ptable-calc-btn op" data-calc="+">+</button>
                
                <button class="ptable-calc-btn op" data-calc="(">(</button>
                <button class="ptable-calc-btn" data-calc="0">0</button>
                <button class="ptable-calc-btn op" data-calc=")">)</button>
                <button class="ptable-calc-btn op" data-calc="Ans">Ans</button>
                
                <button class="ptable-calc-btn equals" data-calc="equals" style="grid-column: span 4; height: 36px; margin-top: 2px;">=</button>
              </div>
              
              <!-- Molar Mass Converter Helper -->
              <div class="ptable-calc-helper">
                <div class="ptable-calc-helper-title">Mole-Mass Conversion Quick Tool</div>
                <div class="ptable-calc-helper-row">
                  <div class="ptable-calc-helper-field">
                    <span>Molar Mass (g/mol)</span>
                    <input type="number" id="ptableHelperMM" placeholder="e.g. 18.0" step="any">
                  </div>
                </div>
                <div class="ptable-calc-helper-row">
                  <div class="ptable-calc-helper-field">
                    <span>Grams (mass)</span>
                    <input type="number" id="ptableHelperGrams" placeholder="e.g. 36.0" step="any">
                  </div>
                  <div class="ptable-calc-helper-arrow">&harr;</div>
                  <div class="ptable-calc-helper-field">
                    <span>Moles (n)</span>
                    <input type="number" id="ptableHelperMoles" placeholder="e.g. 2.0" step="any">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(drawer);

      // Event listeners for close
      drawerOverlay.addEventListener('click', closeDrawer);
      drawer.querySelector('.ptable-close-btn').addEventListener('click', closeDrawer);

      // 1. Setup Drawer Navigation Tabs
      const drawerTabs = drawer.querySelectorAll('.ptable-drawer-tab');
      const panels = drawer.querySelectorAll('.ptable-panel');
      drawerTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          drawerTabs.forEach(t => t.classList.remove('active'));
          panels.forEach(p => p.classList.remove('active'));
          
          tab.classList.add('active');
          const panelId = `panel${tab.dataset.panel.charAt(0).toUpperCase() + tab.dataset.panel.slice(1)}`;
          const activePanel = drawer.querySelector(`#${panelId}`);
          if (activePanel) activePanel.classList.add('active');
        });
      });

      // 2. Setup Chemistry Math Calculator
      const calcExprEl = drawer.querySelector('#ptableCalcExpr');
      const calcResultEl = drawer.querySelector('#ptableCalcResult');
      let currentExpr = '';
      let lastResult = 0;
      let justEvaluated = false;
      
      const calcButtons = drawer.querySelectorAll('.ptable-calc-btn');
      calcButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          handleCalcInput(btn.dataset.calc);
        });
      });
      
      // Bind keyboard events
      window.addEventListener('keydown', (e) => {
        // Ignore if user is typing in a text input field to prevent display pollution
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

        // Only trigger if calculator panel is visible/active
        const calcPanel = drawer.querySelector('#panelCalc');
        if (!calcPanel || !calcPanel.classList.contains('active')) return;
        
        const key = e.key;
        if (key >= '0' && key <= '9') handleCalcInput(key);
        else if (key === '.') handleCalcInput('.');
        else if (key === '+') handleCalcInput('+');
        else if (key === '-') handleCalcInput('-');
        else if (key === '*') handleCalcInput('*');
        else if (key === '/') handleCalcInput('/');
        else if (key === '(') handleCalcInput('(');
        else if (key === ')') handleCalcInput(')');
        else if (key === 'e' || key === 'E') handleCalcInput('e');
        else if (key === 'a' || key === 'A') handleCalcInput('Ans');
        else if (key === 'Enter' || key === '=') { e.preventDefault(); handleCalcInput('equals'); }
        else if (key === 'Backspace') handleCalcInput('backspace');
        else if (key === 'Escape' || key === 'c' || key === 'C') handleCalcInput('clear');
      });

      function handleCalcInput(input) {
        if (input === 'clear') {
          currentExpr = '';
          calcExprEl.innerHTML = '';
          calcResultEl.textContent = '0';
          justEvaluated = false;
        } else if (input === 'backspace') {
          if (currentExpr.endsWith('Ans')) {
            currentExpr = currentExpr.slice(0, -3);
          } else {
            currentExpr = currentExpr.slice(0, -1);
          }
          justEvaluated = false;
          updateCalcDisplay();
        } else if (input === 'equals') {
          if (!currentExpr) return;
          try {
            // Replace Ans token with the numeric value of the last result before evaluating
            let evalExpr = currentExpr.replace(/Ans/g, String(lastResult));
            // Sanitize string to allow only basic arithmetic + scientific notation "e"
            const sanitized = evalExpr.replace(/[^0-9e+\-*/().\s]/gi, '');
            // Evaluate safely
            const res = Function(`"use strict"; return (${sanitized})`)();
            if (res === undefined || isNaN(res) || !isFinite(res)) {
              calcResultEl.textContent = 'Error';
            } else {
              const rounded = Math.round(res * 1000000) / 1000000;
              calcResultEl.textContent = rounded;
              calcExprEl.innerHTML = getFormattedExpr(currentExpr) + ' =';
              currentExpr = String(rounded);
              lastResult = rounded;
              justEvaluated = true;
            }
          } catch (err) {
            calcResultEl.textContent = 'Error';
          }
        } else {
          if (justEvaluated) {
            // If starting with an operator, prefix with Ans
            if (['+', '-', '*', '/'].includes(input)) {
              currentExpr = 'Ans' + input;
            } else {
              currentExpr = input;
            }
            justEvaluated = false;
          } else {
            currentExpr += input;
          }
          updateCalcDisplay();
        }
      }

      function updateCalcDisplay() {
        calcExprEl.innerHTML = getFormattedExpr(currentExpr);
      }

      function getFormattedExpr(expr) {
        // 1. First run math operator replacements (before HTML tag slashes are introduced)
        let formatted = expr
          .replace(/\*/g, ' × ')
          .replace(/\//g, ' ÷ ')
          .replace(/\+/g, ' + ')
          .replace(/-/g, ' - ');

        // 2. Now run HTML tag insertions safely (no operators left to corrupt tag slashes)
        formatted = formatted
          .replace(/Ans/g, '<span style="color: var(--accent); font-weight: 600;">Ans</span>')
          .replace(/([0-9.]+)\s*e\s*\+?(-?[0-9]+)/gi, '$1 × 10<sup>$2</sup>')
          .replace(/e\s*\+?(-?[0-9]+)/gi, '10<sup>$1</sup>')
          .replace(/([0-9.]+)\s*e/gi, '$1 × 10^')
          .replace(/e/gi, '10^');

        return formatted;
      }

      // 3. Setup Mole-Mass Conversion Helper Tool
      const mmInput = drawer.querySelector('#ptableHelperMM');
      const gramsInput = drawer.querySelector('#ptableHelperGrams');
      const molesInput = drawer.querySelector('#ptableHelperMoles');
      
      mmInput.addEventListener('input', recalculateHelper);
      gramsInput.addEventListener('input', () => {
        recalculateHelper('grams');
      });
      molesInput.addEventListener('input', () => {
        recalculateHelper('moles');
      });

      function recalculateHelper(lastChanged) {
        const mm = parseFloat(mmInput.value);
        if (isNaN(mm) || mm <= 0) return;
        
        if (lastChanged === 'grams') {
          const grams = parseFloat(gramsInput.value);
          if (!isNaN(grams)) {
            molesInput.value = (Math.round((grams / mm) * 10000) / 10000).toString();
          } else {
            molesInput.value = '';
          }
        } else if (lastChanged === 'moles') {
          const moles = parseFloat(molesInput.value);
          if (!isNaN(moles)) {
            gramsInput.value = (Math.round((moles * mm) * 10000) / 10000).toString();
          } else {
            gramsInput.value = '';
          }
        } else {
          const grams = parseFloat(gramsInput.value);
          if (!isNaN(grams)) {
            molesInput.value = (Math.round((grams / mm) * 10000) / 10000).toString();
          }
        }
      }

      // 2. Load window.GC_ELEMENTS dynamically if not present, then build grid
      if (!window.GC_ELEMENTS) {
        if (elementsScript) {
          elementsScript.onload = () => {
            if (window.GC_ELEMENTS) {
              buildPeriodicTableGrid();
            } else {
              console.error('Periodic table reference tool failed: window.GC_ELEMENTS did not populate.');
            }
          };
          elementsScript.onerror = () => {
            console.error('Periodic table reference tool failed: elements.js script load error.');
          };
        } else {
          const script = document.createElement('script');
          script.src = ELEMENTS_SRC;
          script.onload = () => {
            if (window.GC_ELEMENTS) {
              buildPeriodicTableGrid();
            } else {
              console.error('Periodic table reference tool failed: window.GC_ELEMENTS did not populate.');
            }
          };
          script.onerror = () => {
            console.error('Periodic table reference tool failed: elements.js script load error.');
          };
          document.head.appendChild(script);
        }
      } else {
        buildPeriodicTableGrid();
      }

      function buildPeriodicTableGrid() {
        const gridEl = drawer.querySelector('.ptable-grid');
        const elementsList = window.GC_ELEMENTS.list;

        elementsList.forEach(el => {
          const cell = document.createElement('div');
          cell.className = `ptable-cell kind-${el.kind}`;
          cell.dataset.sym = el.sym;
          cell.style.gridRow = el.period;
          cell.style.gridColumn = el.group;

          cell.innerHTML = `
            <span class="cell-z">${el.z}</span>
            <span class="cell-sym">${el.sym}</span>
            <span class="cell-val"></span>
          `;

          cell.addEventListener('click', () => selectElement(el.sym));
          gridEl.appendChild(cell);
        });

        // 3. Setup tabs and mode changing
        let activeMode = 'default';
        const tabs = drawer.querySelectorAll('.ptable-tab');
        tabs.forEach(tab => {
          tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            activeMode = e.target.dataset.mode;
            applyColorShading(activeMode);
          });
        });

        // Show default colors on load
        applyColorShading('default');

        // Setup transition metal toggle listener
        const transToggle = drawer.querySelector('#ptableTransitionToggle');
        transToggle.addEventListener('change', (e) => {
          updateGridVisibility(e.target.checked);
        });
        updateGridVisibility(transToggle.checked);
      }

      function updateGridVisibility(showTransition) {
        const gridEl = drawer.querySelector('.ptable-grid');
        const cells = drawer.querySelectorAll('.ptable-cell');
        
        if (showTransition) {
          gridEl.style.gridTemplateColumns = 'repeat(18, 1fr)';
          gridEl.style.minWidth = '680px';
          cells.forEach(cell => {
            const sym = cell.dataset.sym;
            const el = window.GC_ELEMENTS.bySym[sym];
            cell.style.display = '';
            cell.style.gridColumn = el.group;
          });
        } else {
          gridEl.style.gridTemplateColumns = 'repeat(2, 1fr) 0.45fr repeat(6, 1fr)';
          gridEl.style.minWidth = '420px';
          cells.forEach(cell => {
            const sym = cell.dataset.sym;
            const el = window.GC_ELEMENTS.bySym[sym];
            if (!el.mainGroup) {
              cell.style.display = 'none';
            } else {
              cell.style.display = '';
              if (el.group >= 13) {
                cell.style.gridColumn = el.group - 9;
              } else {
                cell.style.gridColumn = el.group;
              }
            }
          });
        }
      }

      function getGroupName(el) {
        if (el.z === 1) return 'Group 1 (Hydrogen)';
        if (el.group === 1) return 'Alkali Metals (Group 1)';
        if (el.group === 2) return 'Alkaline Earth Metals (Group 2)';
        if (el.group >= 3 && el.group <= 12) return 'Transition Metals (Group ' + el.group + ')';
        if (el.group === 13) return 'Boron Group (Group 13)';
        if (el.group === 14) return 'Carbon Group (Group 14)';
        if (el.group === 15) return 'Nitrogen Group (Group 15)';
        if (el.group === 16) return 'Oxygen Group (Group 16)';
        if (el.group === 17) return 'Halogens (Group 17)';
        if (el.group === 18) return 'Noble Gases (Group 18)';
        return 'Group ' + el.group;
      }

      function getTypicalCharge(el) {
        const tend = window.GC_ELEMENTS.tendency(el);
        if (tend) {
          if (tend.dir === 'inert') return '0 (inert)';
          if (tend.charge) return tend.charge;
          if (el.group === 14) return '±4 (typically covalent)';
        }
        // Transition metals
        const transCharges = {
          Sc: '3+',
          Ti: '4+, 3+',
          V: '5+, 4+, 3+, 2+',
          Cr: '3+, 6+',
          Mn: '2+, 4+, 7+',
          Fe: '3+, 2+',
          Co: '2+, 3+',
          Ni: '2+',
          Cu: '2+, 1+',
          Zn: '2+'
        };
        if (transCharges[el.sym]) return transCharges[el.sym] + ' (variable)';
        return 'Variable';
      }

      // 4. Color Shading helper functions
      function applyColorShading(mode) {
        if (!window.GC_ELEMENTS) return;
        const cells = drawer.querySelectorAll('.ptable-cell');
        const legend = drawer.querySelector('#ptableLegend');
        const elementsList = window.GC_ELEMENTS.list;

        // Color values mix helpers (same as in 1-1b.js)
        const COOL = [62, 111, 165], PALE = [236, 233, 219], HOT = [206, 72, 46];
        const mix = (a, b, t) => [
          Math.round(a[0] + (b[0] - a[0]) * t),
          Math.round(a[1] + (b[1] - a[1]) * t),
          Math.round(a[2] + (b[2] - a[2]) * t)
        ];
        const lum = c => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
        const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;
        const seqColor = t => t < 0.5 ? mix(COOL, PALE, t * 2) : mix(PALE, HOT, (t - 0.5) * 2);

        if (mode === 'default') {
          // Default: Color by classification kind
          legend.innerHTML = `
            <div class="ptable-legend-swatches">
              <span class="ptable-legend-swatch"><span class="ptable-legend-chip" style="background-color: var(--paper-3)"></span>metal</span>
              <span class="ptable-legend-swatch"><span class="ptable-legend-chip" style="background-color: var(--paper-2); border-color: var(--ink-soft)"></span>metalloid</span>
              <span class="ptable-legend-swatch"><span class="ptable-legend-chip" style="background-color: var(--card); border-color: var(--ink-mute)"></span>nonmetal</span>
              <span class="ptable-legend-swatch"><span class="ptable-legend-chip" style="background-color: var(--card); opacity: 0.75; border-color: var(--hair)"></span>noble</span>
            </div>
          `;

          cells.forEach(cell => {
            cell.classList.remove('no-data');
            cell.style.backgroundColor = '';
            cell.style.color = '';
            cell.querySelector('.cell-val').textContent = '';
          });
        } else {
          // Heatmaps: Radius, IE, or EN
          const propMap = { radius: 'radius', ie: 'ie', en: 'en' };
          const propKey = propMap[mode];
          const unitMap = { radius: ' pm', ie: ' kJ', en: '' };

          // Extract values to find min and max for shading range
          const validVals = elementsList.map(el => el[propKey]).filter(val => val != null);
          const min = Math.min(...validVals);
          const max = Math.max(...validVals);

          legend.innerHTML = `
            <span>low (${min}${unitMap[mode]})</span>
            <div class="ptable-legend-gradient" style="background: linear-gradient(90deg, ${rgb(COOL)}, ${rgb(PALE)}, ${rgb(HOT)})"></div>
            <span>high (${max}${unitMap[mode]})</span>
          `;

          cells.forEach(cell => {
            const sym = cell.dataset.sym;
            const el = window.GC_ELEMENTS.bySym[sym];
            const val = el[propKey];
            const valSpan = cell.querySelector('.cell-val');

            if (val == null) {
              cell.classList.add('no-data');
              cell.style.backgroundColor = '';
              cell.style.color = '';
              valSpan.textContent = '-';
            } else {
              cell.classList.remove('no-data');
              const t = (val - min) / (max - min);
              const color = seqColor(t);
              cell.style.backgroundColor = rgb(color);
              cell.style.color = lum(color) > 0.55 ? '#15201C' : '#F4F6F4';
              valSpan.textContent = mode === 'en' ? val.toFixed(1) : val;
            }
          });
        }
      }

      // 5. Select element and populate detail panel
      function selectElement(sym) {
        // Toggle selected styling
        const cells = drawer.querySelectorAll('.ptable-cell');
        cells.forEach(c => c.classList.remove('selected'));
        const cell = drawer.querySelector(`.ptable-cell[data-sym="${sym}"]`);
        if (cell) cell.classList.add('selected');

        const el = window.GC_ELEMENTS.bySym[sym];
        const placeholder = drawer.querySelector('.ptable-detail-placeholder');
        const content = drawer.querySelector('.ptable-detail-content');

        placeholder.style.display = 'none';
        content.style.display = 'flex';

        // Fill detail values
        content.querySelector('.ptable-detail-sym').textContent = el.sym;
        content.querySelector('.ptable-detail-z').textContent = `Z = ${el.z}`;
        content.querySelector('.ptable-detail-name').textContent = el.name;
        
        // Kind formatting
        const kindEl = content.querySelector('.ptable-detail-kind-tag');
        kindEl.textContent = el.kind;

        // Stats text population
        content.querySelector('.val-group').textContent = getGroupName(el);
        content.querySelector('.val-shells').textContent = window.GC_ELEMENTS.config(el);
        content.querySelector('.val-valence').textContent = el.valence !== null ? el.valence : 'N/A';
        content.querySelector('.val-charge').textContent = getTypicalCharge(el);
        content.querySelector('.val-radius').textContent = el.radius !== null ? `${el.radius} pm` : 'N/A';
        content.querySelector('.val-ie').textContent = el.ie !== null ? `${el.ie} kJ/mol` : 'N/A';
        content.querySelector('.val-en').textContent = el.en !== null ? el.en.toFixed(2) : 'N/A';

        // Tendency
        const tendencyEl = content.querySelector('.val-tendency');
        const tend = window.GC_ELEMENTS.tendency(el);
        if (tend) {
          if (tend.dir === 'inert') {
            tendencyEl.textContent = 'inert (noble)';
          } else if (tend.dir === 'lose') {
            tendencyEl.textContent = `loses ${tend.need} e⁻ (${tend.charge})`;
          } else if (tend.dir === 'gain') {
            tendencyEl.textContent = `gains ${tend.need} e⁻ (${tend.charge})`;
          } else {
            tendencyEl.textContent = 'shares/covalent';
          }
        } else {
          tendencyEl.textContent = 'metallic sharing';
        }

        // Render Bohr Model SVG
        const visualContainer = content.querySelector('.ptable-detail-visual');
        visualContainer.innerHTML = ''; // Clear previous

        const bohrSVG = createBohrSVG(el.shells, el.z, el.name);
        visualContainer.appendChild(bohrSVG);
        
        const bohrCap = document.createElement('div');
        bohrCap.className = 'ptable-bohr-cap';
        bohrCap.textContent = `${el.shells.length} shell${el.shells.length > 1 ? 's' : ''}`;
        visualContainer.appendChild(bohrCap);
      }

      function createBohrSVG(shells, z, name) {
        const CX = 65, CY = 65;
        const SVGNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(SVGNS, 'svg');
        svg.setAttribute('viewBox', '0 0 130 130');
        svg.setAttribute('class', 'ptable-bohr-svg');
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', `Bohr model shell diagram for ${name}`);

        // Draw shells
        shells.forEach((cnt, i) => {
          const r = 20 + i * 14;
          const ring = document.createElementNS(SVGNS, 'circle');
          ring.setAttribute('cx', CX);
          ring.setAttribute('cy', CY);
          ring.setAttribute('r', r);
          ring.setAttribute('fill', 'none');
          ring.setAttribute('stroke', 'var(--shell)');
          ring.setAttribute('stroke-width', '0.8');
          svg.appendChild(ring);
          
          for (let e = 0; e < cnt; e++) {
            const angle = (2 * Math.PI / cnt) * e - Math.PI / 2;
            const dot = document.createElementNS(SVGNS, 'circle');
            dot.setAttribute('cx', CX + r * Math.cos(angle));
            dot.setAttribute('cy', CY + r * Math.sin(angle));
            dot.setAttribute('r', '2.2'); // size of electron
            dot.setAttribute('fill', 'var(--electron)');
            dot.setAttribute('stroke', 'var(--ink)');
            dot.setAttribute('stroke-width', '0.6');
            svg.appendChild(dot);
          }
        });
        
        // Draw nucleus
        const nuc = document.createElementNS(SVGNS, 'circle');
        nuc.setAttribute('cx', CX);
        nuc.setAttribute('cy', CY);
        nuc.setAttribute('r', '12');
        nuc.setAttribute('fill', 'var(--nucleus)');
        svg.appendChild(nuc);
        
        const label = document.createElementNS(SVGNS, 'text');
        label.setAttribute('x', CX);
        label.setAttribute('y', CY + 1);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('dominant-baseline', 'middle');
        label.setAttribute('fill', '#fff');
        label.setAttribute('style', 'font-family:var(--mono);font-weight:600;font-size:var(--text-3xs);');
        label.textContent = `${z}+`;
        svg.appendChild(label);
        
        return svg;
      }
    }
  })();
})();
