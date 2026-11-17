/* ============================================================
   1-2c LESSON INTERACTIVES: Chemical Nomenclature
   Contains:
   1. Branch Expansion (inspect nomenclature branches in reading view)
   2. Ionic Charge Balancer (a DOM tool in a .sim-box; the building is the attempt,
      so it has no prediction lock)

   The decision-tree classifier and the four checkpoint blocks that used to
   live here are now shared-framework widgets declared in the lesson HTML
   (sort-classify / commit-reveal), so they gate, persist, count toward
   progress, and print. Don't re-add bespoke gates here.
   ============================================================ */

(function () {
  'use strict';

  // Helper functions
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ============================================================
     INTERACTION 1: BRANCH CARD ENLARGEMENT
     ============================================================ */
  (function initBranchExpansion() {
    const cards = $$('.nomen-branch-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const isExp = card.classList.toggle('expanded');
        card.setAttribute('aria-expanded', isExp ? 'true' : 'false');
        const cue = card.querySelector('.branch-expand-cue');
        if (cue) cue.textContent = isExp ? 'Collapse ↙' : 'Enlarge ↗';
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  })();

  /* ============================================================
     WIDGET 2: IONIC CHARGE BALANCER
     ============================================================ */
  (function initChargeBalancer() {
    const cationSelect = $('#cationSelect');
    const anionSelect = $('#anionSelect');

    const cationPill = $('#cationPill');
    const anionPill = $('#anionPill');
    const cationCountSpan = $('#cationCount');
    const anionCountSpan = $('#anionCount');

    const decCation = $('#decCation');
    const incCation = $('#incCation');
    const decAnion = $('#decAnion');
    const incAnion = $('#incAnion');

    const netChargeDisplay = $('#netChargeDisplay');
    const formulaOutput = $('#ionicFormulaOutput');
    const nameOutput = $('#ionicNameOutput');

    if (!cationSelect || !anionSelect) return;

    let cCount = 1;
    let aCount = 1;

    // Subscript helper
    function toSubscript(num) {
      const subs = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
      return String(num).split('').map(char => subs[char] || char).join('');
    }

    // 2 gives ², and a sign gives ⁺ or ⁻ (a charge of 1 shows only the sign)
    function ionCharge(q) {
      const sup = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
      const n = Math.abs(q);
      return (n > 1 ? String(n).split('').map((d) => sup[d]).join('') : '') + (q > 0 ? '⁺' : '⁻');
    }

    function updateBalancer() {
      // Parse cation: Symbol|Charge|Name
      const [cSym, cChargeStr, cName] = cationSelect.value.split('|');
      const cCharge = parseInt(cChargeStr, 10);

      // Parse anion: Symbol|Charge|Name
      const [aSym, aChargeStr, aName] = anionSelect.value.split('|');
      const aCharge = parseInt(aChargeStr, 10);

      // Update pills
      cationPill.textContent = cSym + ionCharge(cCharge);
      anionPill.textContent = aSym + ionCharge(aCharge);

      cationCountSpan.textContent = cCount;
      anionCountSpan.textContent = aCount;

      const totalPositive = cCount * cCharge;
      const totalNegative = aCount * aCharge;
      const netCharge = totalPositive + totalNegative;

      const status = $('#balanceStatus');
      if (netCharge === 0) {
        netChargeDisplay.textContent = '0';
        status.dataset.state = 'ok';
        status.textContent = 'Balanced';
      } else {
        netChargeDisplay.textContent = (netCharge > 0 ? '+' : '\u2212') + Math.abs(netCharge);
        status.dataset.state = 'warn';
        status.textContent = netCharge > 0 ? 'Too positive' : 'Too negative';
      }

      // Format formula
      let cSub = cCount > 1 ? toSubscript(cCount) : '';
      let aSub = aCount > 1 ? toSubscript(aCount) : '';
      formulaOutput.textContent = `${cSym}${cSub}${aSym}${aSub}`;

      // Format name (capitalize first letter of anion name)
      const formattedAnion = aName.charAt(0).toLowerCase() + aName.slice(1);
      nameOutput.textContent = `${cName} ${formattedAnion}`;
    }

    decCation.addEventListener('click', () => { if (cCount > 1) { cCount--; updateBalancer(); } });
    incCation.addEventListener('click', () => { if (cCount < 5) { cCount++; updateBalancer(); } });
    decAnion.addEventListener('click', () => { if (aCount > 1) { aCount--; updateBalancer(); } });
    incAnion.addEventListener('click', () => { if (aCount < 5) { aCount++; updateBalancer(); } });

    cationSelect.addEventListener('change', () => { cCount = 1; aCount = 1; updateBalancer(); });
    anionSelect.addEventListener('change', () => { cCount = 1; aCount = 1; updateBalancer(); });

    updateBalancer();
  })();

})();
