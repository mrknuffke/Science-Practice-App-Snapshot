/* ============================================================
   GENERAL PHYSICS INTERACTIVES: REFERENCE CENTER DRAWER
   Global slide-out drawer providing:
   1. Physics Equation Sheet (by Level)
   2. Physical Constants & Metric Prefixes
   3. Graphing Patterns & Linearization Matrix
   4. Scientific Calculator
   Strict Zero Em-Dashes Invariant Enforced.
   ============================================================ */

(function () {
  'use strict';

  function buildDrawerDOM() {
    if (document.getElementById('refDrawer')) return;

    const drawerHTML = `
      <div id="refDrawerBackdrop" class="ref-drawer-backdrop"></div>
      <aside id="refDrawer" class="ref-drawer" aria-label="Physics Reference Center">
        <div class="ref-header">
          <div class="ref-title">Physics Reference Center</div>
          <button id="refCloseBtn" class="ref-close-btn" aria-label="Close Reference Center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="ref-tabs">
          <button class="ref-tab active" data-tab="tab-equations">Equations</button>
          <button class="ref-tab" data-tab="tab-constants">Constants</button>
          <button class="ref-tab" data-tab="tab-graphs">Graphing</button>
          <button class="ref-tab" data-tab="tab-calc">Calculator</button>
        </div>
        <div class="ref-body">
          <!-- TAB 1: EQUATIONS -->
          <div id="tab-equations" class="ref-tab-panel active">
            <h4 class="ref-h">Level 1: Kinematics & Motion</h4>
            <table class="ref-table">
              <thead>
                <tr>
                  <th>Equation</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>&Delta;<em>x</em> = <em>x</em><sub>f</sub> &minus; <em>x</em><sub>i</sub></code></td>
                  <td>Displacement (change in position)</td>
                </tr>
                <tr>
                  <td><code><em>v</em><sub>avg</sub> = &Delta;<em>x</em> / &Delta;<em>t</em></code></td>
                  <td>Average velocity (constant velocity)</td>
                </tr>
                <tr>
                  <td><code><em>v</em><sub>avg</sub> = (<em>v</em><sub>i</sub> + <em>v</em><sub>f</sub>) / 2</code></td>
                  <td>Average velocity with uniform acceleration</td>
                </tr>
                <tr>
                  <td><code><em>a</em> = (<em>v</em><sub>f</sub> &minus; <em>v</em><sub>i</sub>) / &Delta;<em>t</em></code></td>
                  <td>Acceleration (rate of velocity change)</td>
                </tr>
                <tr>
                  <td><code><em>v</em><sub>f</sub> = <em>v</em><sub>i</sub> + <em>a</em>&middot;<em>t</em></code></td>
                  <td>Kinematics equation: velocity without distance</td>
                </tr>
                <tr>
                  <td><code>&Delta;<em>x</em> = <em>v</em><sub>i</sub>&middot;<em>t</em> + ½&middot;<em>a</em>&middot;<em>t</em>&sup2;</code></td>
                  <td>Kinematics equation: position without final velocity</td>
                </tr>
                <tr>
                  <td><code><em>v</em><sub>f</sub>&sup2; = <em>v</em><sub>i</sub>&sup2; + 2&middot;<em>a</em>&middot;&Delta;<em>x</em></code></td>
                  <td>Kinematics equation: velocity without time</td>
                </tr>
                <tr>
                  <td><code><em>t</em><sub>fall</sub> = &radic;(2&middot;&Delta;<em>y</em> / <em>g</em>)</code></td>
                  <td>Free fall time from rest (<em>v</em><sub>iy</sub> = 0)</td>
                </tr>
                <tr>
                  <td><code>&Delta;<em>x</em> = <em>v</em><sub>x</sub> &middot; <em>t</em><sub>fall</sub></code></td>
                  <td>Horizontal projectile range</td>
                </tr>
              </tbody>
            </table>

            <h4 class="ref-h ref-h--next">Level 2: Dynamics &amp; Forces</h4>
            <table class="ref-table">
              <thead>
                <tr>
                  <th>Equation</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>&Sigma;<em>F</em> = 0</code></td>
                  <td>Translational equilibrium (Newton's 1st Law, zero acceleration)</td>
                </tr>
                <tr>
                  <td><code>&Sigma;<em>F</em> = <em>m</em>&middot;<em>a</em></code></td>
                  <td>Newton's 2nd Law (net force produces acceleration)</td>
                </tr>
                <tr>
                  <td><code><em>F</em><sub>g</sub> = <em>m</em>&middot;<em>g</em></code></td>
                  <td>Gravitational force (weight near planetary surface)</td>
                </tr>
                <tr>
                  <td><code><em>f</em><sub>s</sub> &le; &mu;<sub>s</sub>&middot;<em>F</em><sub>N</sub></code></td>
                  <td>Static friction force (opposes impending slip)</td>
                </tr>
                <tr>
                  <td><code><em>f</em><sub>k</sub> = &mu;<sub>k</sub>&middot;<em>F</em><sub>N</sub></code></td>
                  <td>Kinetic friction force (opposes sliding motion)</td>
                </tr>
                <tr>
                  <td><code><em>F</em><sub>A on B</sub> = &minus;<em>F</em><sub>B on A</sub></code></td>
                  <td>Newton's 3rd Law (action-reaction interaction pair)</td>
                </tr>
              </tbody>
            </table>

            <h4 class="ref-h ref-h--next ref-h--mute">Upcoming Levels (Preview)</h4>
            <p class="ref-note ref-note--mute">
              Level 3 (Circular Motion, Gravitation &amp; Momentum: <em>a</em><sub>c</sub> = <em>v</em>&sup2;/<em>r</em>, <em>p</em> = <em>m</em>&middot;<em>v</em>) unlocks in future mission operations.
            </p>
          </div>

          <!-- TAB 2: CONSTANTS & PREFIXES -->
          <div id="tab-constants" class="ref-tab-panel">
            <h4 class="ref-h">Fundamental Physical Constants</h4>
            <table class="ref-table">
              <thead>
                <tr>
                  <th>Quantity</th>
                  <th>Symbol</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Acceleration of Gravity (Earth, Lab)</td>
                  <td><code><em>g</em></code></td>
                  <td>9.8 m/s² (downward)</td>
                </tr>
                <tr>
                  <td>Acceleration of Gravity (Earth, Practice)</td>
                  <td><code><em>g</em><sub>approx</sub></code></td>
                  <td>10 m/s² (quick estimates)</td>
                </tr>
                <tr>
                  <td>Gravity on Mars</td>
                  <td><code><em>g</em><sub>Mars</sub></code></td>
                  <td>3.7 m/s²</td>
                </tr>
                <tr>
                  <td>Gravity on the Moon</td>
                  <td><code><em>g</em><sub>Moon</sub></code></td>
                  <td>1.6 m/s²</td>
                </tr>
                <tr>
                  <td>Gravity on Vortex Prime Base</td>
                  <td><code><em>g</em><sub>VP</sub></code></td>
                  <td>14.2 m/s²</td>
                </tr>
                <tr>
                  <td>Speed of Light (vacuum)</td>
                  <td><code><em>c</em></code></td>
                  <td>3.00 × 10⁸ m/s</td>
                </tr>
              </tbody>
            </table>

            <h4 class="ref-h">Metric Prefixes</h4>
            <table class="ref-table">
              <thead>
                <tr>
                  <th>Prefix</th>
                  <th>Symbol</th>
                  <th>Factor</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>nano</td><td>n</td><td>10⁻⁹</td></tr>
                <tr><td>micro</td><td>μ</td><td>10⁻⁶</td></tr>
                <tr><td>milli</td><td>m</td><td>10⁻³</td></tr>
                <tr><td>centi</td><td>c</td><td>10⁻²</td></tr>
                <tr><td>kilo</td><td>k</td><td>10³</td></tr>
                <tr><td>mega</td><td>M</td><td>10⁶</td></tr>
                <tr><td>giga</td><td>G</td><td>10⁹</td></tr>
              </tbody>
            </table>
          </div>

          <!-- TAB 3: GRAPHING PATTERNS MATRIX -->
          <div id="tab-graphs" class="ref-tab-panel">
            <h4 class="ref-h">Graphing Patterns & Linearization Matrix</h4>
            <p class="ref-note">
              Use this matrix from the Mission Logbook to identify cause-and-effect relationships and linearize nonlinear experimental data:
            </p>
            <table class="ref-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Equation</th>
                  <th>Meaning & Linearization</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Horizontal</b></td>
                  <td><code>y = const</code></td>
                  <td>No relationship. Variable change has no effect on dependent readout.</td>
                </tr>
                <tr>
                  <td><b>Linear</b></td>
                  <td><code>y = m·x + b</code></td>
                  <td>Constant rate of change. Slope (m) represents rate (e.g. velocity = slope of x-t).</td>
                </tr>
                <tr>
                  <td><b>Quadratic</b></td>
                  <td><code>y = a·x² + b</code></td>
                  <td>Direct square relationship. Linearize by plotting <b>y versus x²</b> (slope = a = ½·acceleration).</td>
                </tr>
                <tr>
                  <td><b>Power (1.5)</b></td>
                  <td><code>y = a·x¹·⁵</code></td>
                  <td>Power series relationship. Linearize by plotting <b>y versus x¹·⁵</b>.</td>
                </tr>
                <tr>
                  <td><b>Inverse</b></td>
                  <td><code>y = a·x⁻¹</code></td>
                  <td>Inversely proportional. Linearize by plotting <b>y versus 1/x</b>.</td>
                </tr>
                <tr>
                  <td><b>Inverse Square</b></td>
                  <td><code>y = a·x⁻²</code></td>
                  <td>Inverse square. Linearize by plotting <b>y versus 1/x²</b> (e.g. gravity and electric fields).</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- TAB 4: SCIENTIFIC CALCULATOR -->
          <div id="tab-calc" class="ref-tab-panel">
            <h4 class="ref-h">Quick Physics Calculator</h4>
            <div class="calc-box">
              <input type="text" id="calcDisplay" class="calc-display" readonly value="0" aria-label="Calculator display">
              <div class="calc-grid">
                <button class="calc-btn calc-btn--clear" data-val="C">C</button>
                <button class="calc-btn" data-val="sqrt">√</button>
                <button class="calc-btn" data-val="sq">x²</button>
                <button class="calc-btn calc-btn--op" data-val="/">÷</button>

                <button class="calc-btn" data-val="7">7</button>
                <button class="calc-btn" data-val="8">8</button>
                <button class="calc-btn" data-val="9">9</button>
                <button class="calc-btn calc-btn--op" data-val="*">×</button>

                <button class="calc-btn" data-val="4">4</button>
                <button class="calc-btn" data-val="5">5</button>
                <button class="calc-btn" data-val="6">6</button>
                <button class="calc-btn calc-btn--op" data-val="-">−</button>

                <button class="calc-btn" data-val="1">1</button>
                <button class="calc-btn" data-val="2">2</button>
                <button class="calc-btn" data-val="3">3</button>
                <button class="calc-btn calc-btn--op" data-val="+">+</button>

                <button class="calc-btn" data-val="0">0</button>
                <button class="calc-btn" data-val=".">.</button>
                <button class="calc-btn" data-val="pi">π</button>
                <button class="calc-btn calc-btn--eq" data-val="=">=</button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    `;

    document.body.insertAdjacentHTML('beforeend', drawerHTML);
  }

  function initDrawerInteractions() {
    buildDrawerDOM();

    const drawer = document.getElementById('refDrawer');
    const backdrop = document.getElementById('refDrawerBackdrop');
    const closeBtn = document.getElementById('refCloseBtn');

    function openDrawer() {
      drawer.classList.add('open');
      backdrop.classList.add('open');
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
    }

    // book.js lists the Reference Center as a top-bar tool and calls this.
    window.TB_REFERENCE_CENTER = { open: openDrawer, close: closeDrawer };

    document.querySelectorAll('[data-open-drawer]').forEach((btn) => {
      btn.addEventListener('click', openDrawer);
    });

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    // Tab switching
    const tabs = document.querySelectorAll('.ref-tab');
    const panels = document.querySelectorAll('.ref-tab-panel');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        panels.forEach((p) => p.classList.remove('active'));

        tab.classList.add('active');
        const targetId = tab.getAttribute('data-tab');
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });

    // Calculator Logic
    let currentInput = '0';
    const display = document.getElementById('calcDisplay');

    document.querySelectorAll('.calc-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-val');
        if (val === 'C') {
          currentInput = '0';
        } else if (val === '=') {
          try {
            // Replace displayed operators with JS math
            const sanitized = currentInput.replace(/×/g, '*').replace(/÷/g, '/');
            currentInput = String(Function(`'use strict'; return (${sanitized})`)());
          } catch (e) {
            currentInput = 'Error';
          }
        } else if (val === 'sqrt') {
          try {
            const num = parseFloat(currentInput);
            currentInput = num >= 0 ? String(Math.sqrt(num)) : 'Error';
          } catch (e) {
            currentInput = 'Error';
          }
        } else if (val === 'sq') {
          try {
            const num = parseFloat(currentInput);
            currentInput = String(num * num);
          } catch (e) {
            currentInput = 'Error';
          }
        } else if (val === 'pi') {
          currentInput = currentInput === '0' ? String(Math.PI) : currentInput + '*' + Math.PI;
        } else {
          if (currentInput === '0' || currentInput === 'Error') {
            currentInput = val;
          } else {
            currentInput += val;
          }
        }
        if (display) display.value = currentInput;
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initDrawerInteractions);
})();
