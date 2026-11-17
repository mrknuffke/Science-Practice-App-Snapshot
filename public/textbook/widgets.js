/* ============================================================
   SHARED TEXTBOOK RUNTIME: widgets.js
   The data-widget framework (8 types), the motion primitives (step, scrub,
   zoom) and widget print rendering. Spec: docs/textbook/RUNTIME_SPEC.md.
   Behaviour: docs/textbook/INTERACTION_SPEC.md.

   PROVENANCE. The framework and the motion primitives are a copy of
   public/chem/assets/core.js at commit 42b1eca (lines 905 to 3517). Chem's
   copy is frozen until session 4c, and any widget fix goes in this file only
   (RUNTIME_SPEC section 6). Four changes were made to the copy, and only
   these four:

     1. The progress hook. A widget no longer reads chem's storage engine. It
        calls TB.progress, which does nothing unless the book registered a
        handler (chem does, bio and physics do not).
     2. The standard's class names. The Check and Reset buttons are now
        .btn and .btn.ghost. The dispatch is a registry (TB.widgets.register),
        so each type brings its own print function.
     3. The gate event. When a widget commits, it fires tb:commit, which the
        sim helper listens for (the prediction gate).
     4. The fixed strings (approved by David, 2026-10-13). No praise, no
        exclamation mark, and a missing feedback string shows nothing.
        Session 4c ports this change into chem's copy.

   The print renderer is split by type to fit the registry. Three types had no
   print renderer in chem (predict-run, diagnose-error, construct-validate);
   they have one here.

   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const TB = (window.TB = window.TB || {});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---- change 1: the progress hook ---- */
  const StorageEngine = {
    isCheckpointCompleted: (type, index) => !!(TB.progress && TB.progress.isDone(type, index)),
    getCheckpointValue: (type, index) => (TB.progress ? TB.progress.value(type, index) : null)
  };

  function markCheckpointCompleted(type, index, value = true) {
    if (TB.progress) TB.progress.mark(type, index, value);
  }

  /* ---- change 3: the gate event ---- */
  function commitDone(el, type, index, value) {
    markCheckpointCompleted(type, index, value);
    el.dispatchEvent(new CustomEvent('tb:commit', { bubbles: true, detail: { type: type, index: index } }));
  }

  /* ---- change 2: the widget registry ---- */
  const registry = {};

  TB.widgets = {
    register(type, init, print) {
      if (typeof init !== 'function') throw new Error('TB.widgets.register: ' + type + ' needs an init function');
      if (typeof print !== 'function') console.error('TB.widgets.register: ' + type + ' has no print function');
      registry[type] = { init: init, print: print };
    },
    types() { return Object.keys(registry); },
    get(type) { return registry[type] || null; },
    print: (el) => renderWidgetPrint(el),
    init: () => initWidgets(),
    initMotion: () => initMotionPrimitives()
  };

  /* ============================================================
     WIDGET FRAMEWORK - DYNAMIC COMPONENT INITIALIZATION
     ============================================================ */

  function initWidgets() {
    $$('[data-widget]').forEach((el, idx) => {
      if (el.dataset.wInitialized) return;
      el.dataset.wInitialized = 'true';

      const configEl = $('.w-config', el);
      if (!configEl) return;
      let config = {};
      try {
        config = JSON.parse(configEl.textContent);
      } catch (e) {
        console.error('Invalid JSON config for widget:', el, e);
        return;
      }

      const entry = registry[el.dataset.widget];
      if (entry) entry.init(el, config, idx);
    });
  }

  // --- Helpers for Controls & Reset ---
  function createWidgetControls(el, onCheck, onReset) {
    const controls = document.createElement('div');
    controls.className = 'w-controls';
    controls.innerHTML = `
      <div class="w-feedback" role="status" aria-live="polite"></div>
      <div class="w-buttons">
        <button class="btn w-btn-check" type="button">Check</button>
        <button class="btn ghost w-btn-reset" type="button" style="display: none;">Reset</button>
      </div>
    `;
    el.appendChild(controls);

    const checkBtn = $('.w-btn-check', controls);
    const resetBtn = $('.w-btn-reset', controls);
    const feedback = $('.w-feedback', controls);

    checkBtn.addEventListener('click', () => onCheck(checkBtn, resetBtn, feedback));
    resetBtn.addEventListener('click', () => {
      onReset(checkBtn, resetBtn, feedback);
      resetBtn.style.display = 'none';
      checkBtn.style.display = '';
      feedback.textContent = '';
      feedback.className = 'w-feedback';
    });

    return { checkBtn, resetBtn, feedback };
  }

  // --- 1. Commit-Reveal Widget ---
  function initCommitReveal(el, config, widgetIdx) {
    const mode = config.mode || 'choice';
    
    // Create prompt
    const promptDiv = document.createElement('div');
    promptDiv.className = 'w-prompt';
    promptDiv.innerHTML = config.prompt || '';
    el.appendChild(promptDiv);

    // Create workspace
    const workspace = document.createElement('div');
    workspace.className = 'w-workspace';
    el.appendChild(workspace);

    // Create reveal area
    const revealArea = document.createElement('div');
    revealArea.className = 'w-reveal-area';
    revealArea.style.display = 'none';
    el.appendChild(revealArea);

    let state = {
      selectedOptIdx: null,
      drillIdx: 0,
      drillCorrectCount: 0,
      drillAnswers: [] // tracks first-try success per drill item
    };

    if (mode === 'choice') {
      const grid = document.createElement('div');
      grid.className = 'w-options-grid';
      config.options.forEach((opt, oIdx) => {
        const btn = document.createElement('button');
        btn.className = 'w-opt';
        btn.type = 'button';
        btn.innerHTML = opt.label;
        btn.addEventListener('click', () => {
          if (el.dataset.committed === 'true') return;
          $$('.w-opt', grid).forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          state.selectedOptIdx = oIdx;
          checkBtn.removeAttribute('disabled');
        });
        grid.appendChild(btn);
      });
      workspace.appendChild(grid);

      const { checkBtn, resetBtn, feedback } = createWidgetControls(el, 
        // onCheck
        (cBtn, rBtn, fb) => {
          if (state.selectedOptIdx === null) return;
          el.dataset.committed = 'true';
          cBtn.style.display = 'none';
          rBtn.style.display = '';

          const chosen = config.options[state.selectedOptIdx];
          const opts = $$('.w-opt', grid);
          opts.forEach(o => o.setAttribute('disabled', 'true'));

          opts[state.selectedOptIdx].classList.add(chosen.correct ? 'correct' : 'wrong');
          
          // Highlight correct one in green
          config.options.forEach((opt, oIdx) => {
            if (opt.correct) opts[oIdx].classList.add('correct');
          });

          fb.innerHTML = chosen.feedback || '';
          fb.className = 'w-feedback ' + (chosen.correct ? 'correct' : 'wrong');

          if (config.reveal) {
            revealArea.innerHTML = config.reveal;
            revealArea.style.display = 'block';
            revealArea.classList.add('show');
            initWidgets();
            initMotionPrimitives();
          }
          commitDone(el, 'commit-reveal', widgetIdx);
        },
        // onReset
        (cBtn, rBtn, fb) => {
          el.removeAttribute('data-committed');
          state.selectedOptIdx = null;
          const opts = $$('.w-opt', grid);
          opts.forEach(o => {
            o.removeAttribute('disabled');
            o.classList.remove('selected', 'correct', 'wrong');
          });
          cBtn.setAttribute('disabled', 'true');
          revealArea.style.display = 'none';
          revealArea.classList.remove('show');
          revealArea.innerHTML = '';
        }
      );
      checkBtn.setAttribute('disabled', 'true');

      if (StorageEngine.isCheckpointCompleted('commit-reveal', widgetIdx)) {
        el.dataset.committed = 'true';
        checkBtn.style.display = 'none';
        resetBtn.style.display = '';

        const correctIdx = config.options.findIndex(opt => opt.correct);
        state.selectedOptIdx = correctIdx >= 0 ? correctIdx : 0;

        const opts = $$('.w-opt', grid);
        opts.forEach(o => o.setAttribute('disabled', 'true'));
        if (correctIdx >= 0 && opts[correctIdx]) {
          opts[correctIdx].classList.add('correct');
        }

        const chosen = config.options[state.selectedOptIdx];
        feedback.innerHTML = chosen.feedback || '';
        feedback.className = 'w-feedback correct';

        if (config.reveal) {
          revealArea.innerHTML = config.reveal;
          revealArea.style.display = 'block';
          revealArea.classList.add('show');
        }
      }

    } else if (mode === 'free') {
      const textarea = document.createElement('textarea');
      textarea.className = 'w-textarea';
      textarea.placeholder = 'Write your answer first (even a rough one)...';
      workspace.appendChild(textarea);

      const minChars = config.minChars || 25;
      const hint = document.createElement('div');
      hint.className = 'w-progress-hint';
      workspace.appendChild(hint);

      textarea.addEventListener('input', () => {
        const len = textarea.value.trim().length;
        if (len === 0) {
          hint.textContent = '';
          hint.classList.remove('ready');
        } else if (len < minChars) {
          hint.textContent = 'Keep going…';
          hint.classList.remove('ready');
        } else {
          hint.textContent = 'Ready';
          hint.classList.add('ready');
        }
        if (len >= minChars) {
          checkBtn.removeAttribute('disabled');
        } else {
          checkBtn.setAttribute('disabled', 'true');
        }
      });

      const { checkBtn, resetBtn, feedback } = createWidgetControls(el,
        // onCheck
        (cBtn, rBtn, fb) => {
          textarea.setAttribute('disabled', 'true');
          cBtn.style.display = 'none';
          rBtn.style.display = '';
          fb.textContent = 'Compare your answer with the model below.';
          fb.className = 'w-feedback correct';

          if (config.reveal) {
            revealArea.innerHTML = `<h4>Model Answer</h4><p>${config.reveal}</p>`;
            revealArea.style.display = 'block';
            revealArea.classList.add('show');
            initWidgets();
            initMotionPrimitives();
          }
          commitDone(el, 'commit-reveal', widgetIdx);
        },
        // onReset
        (cBtn, rBtn, fb) => {
          textarea.removeAttribute('disabled');
          textarea.value = '';
          hint.textContent = '';
          hint.classList.remove('ready');
          cBtn.setAttribute('disabled', 'true');
          revealArea.style.display = 'none';
          revealArea.classList.remove('show');
          revealArea.innerHTML = '';
        }
      );
      checkBtn.textContent = 'Compare with model';
      checkBtn.setAttribute('disabled', 'true');

      if (StorageEngine.isCheckpointCompleted('commit-reveal', widgetIdx)) {
        textarea.setAttribute('disabled', 'true');
        checkBtn.style.display = 'none';
        resetBtn.style.display = '';
        feedback.textContent = 'Compare your answer with the model below.';
        feedback.className = 'w-feedback correct';

        if (config.reveal) {
          revealArea.innerHTML = `<h4>Model Answer</h4><p>${config.reveal}</p>`;
          revealArea.style.display = 'block';
          revealArea.classList.add('show');
        }
      }

    } else if (mode === 'drill') {
      // Classification drill sequence
      const status = document.createElement('div');
      status.className = 'w-drill-status';
      status.innerHTML = `
        <span class="w-drill-progress">Item 1 of ${config.items.length}</span>
        <span class="w-drill-score">Score: 0 / 0</span>
      `;
      workspace.insertBefore(status, workspace.firstChild);

      const qBox = document.createElement('div');
      qBox.className = 'w-drill-question';
      workspace.appendChild(qBox);

      const grid = document.createElement('div');
      grid.className = 'w-options-grid';
      workspace.appendChild(grid);

      const progressEl = $('.w-drill-progress', status);
      const scoreEl = $('.w-drill-score', status);

      const renderDrillItem = () => {
        const item = config.items[state.drillIdx];
        progressEl.textContent = `Item ${state.drillIdx + 1} of ${config.items.length}`;
        qBox.innerHTML = `<p>${item.prompt}</p>`;
        grid.innerHTML = '';
        state.selectedOptIdx = null;
        state.drillAnswers[state.drillIdx] = { attempts: 0, firstTryCorrect: false };

        item.options.forEach((opt, oIdx) => {
          const btn = document.createElement('button');
          btn.className = 'w-opt';
          btn.type = 'button';
          btn.innerHTML = opt.label;
          btn.addEventListener('click', () => {
            if (state.selectedOptIdx !== null) return; // already answered correct
            state.drillAnswers[state.drillIdx].attempts++;
            const ok = opt.correct;
            
            btn.classList.add(ok ? 'correct' : 'wrong');
            feedback.innerHTML = opt.feedback || '';
            feedback.className = 'w-feedback ' + (ok ? 'correct' : 'wrong');

            if (ok) {
              state.selectedOptIdx = oIdx;
              if (state.drillAnswers[state.drillIdx].attempts === 1) {
                state.drillAnswers[state.drillIdx].firstTryCorrect = true;
                state.drillCorrectCount++;
              }
              // disable other choices
              $$('.w-opt', grid).forEach(b => b.setAttribute('disabled', 'true'));
              // update score display
              scoreEl.textContent = `Score: ${state.drillCorrectCount} / ${state.drillIdx + 1}`;

              // check if last
              if (state.drillIdx < config.items.length - 1) {
                checkBtn.style.display = '';
                checkBtn.textContent = 'Next';
              } else {
                checkBtn.style.display = 'none';
                resetBtn.style.display = '';
                feedback.textContent = `You finished. Final score: ${state.drillCorrectCount} of ${config.items.length}`;
                if (config.reveal) {
                  revealArea.innerHTML = config.reveal;
                  revealArea.style.display = 'block';
                  revealArea.classList.add('show');
                  initWidgets();
                  initMotionPrimitives();
                }
                commitDone(el, 'commit-reveal', widgetIdx);
              }
            } else {
              // wrong
              btn.setAttribute('disabled', 'true');
              scoreEl.textContent = `Score: ${state.drillCorrectCount} / ${state.drillIdx + 1}`;
            }
          });
          grid.appendChild(btn);
        });
      };

      const { checkBtn, resetBtn, feedback } = createWidgetControls(el,
        // onCheck (acting as "Next" button here)
        (cBtn, rBtn, fb) => {
          state.drillIdx++;
          cBtn.style.display = 'none';
          fb.textContent = '';
          fb.className = 'w-feedback';
          renderDrillItem();
        },
        // onReset
        (cBtn, rBtn, fb) => {
          state.drillIdx = 0;
          state.drillCorrectCount = 0;
          state.drillAnswers = [];
          scoreEl.textContent = 'Score: 0 / 0';
          revealArea.style.display = 'none';
          revealArea.classList.remove('show');
          revealArea.innerHTML = '';
          renderDrillItem();
        }
      );
      checkBtn.style.display = 'none'; // hidden initially, shown when step completes
      renderDrillItem();

      if (StorageEngine.isCheckpointCompleted('commit-reveal', widgetIdx)) {
        state.drillIdx = config.items.length - 1;
        state.drillCorrectCount = config.items.length;
        progressEl.textContent = `Item ${config.items.length} of ${config.items.length}`;
        scoreEl.textContent = `Score: ${config.items.length} / ${config.items.length}`;

        const item = config.items[state.drillIdx];
        qBox.innerHTML = `<p>${item.prompt}</p>`;
        grid.innerHTML = '';
        item.options.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'w-opt';
          btn.type = 'button';
          btn.innerHTML = opt.label;
          btn.setAttribute('disabled', 'true');
          if (opt.correct) btn.classList.add('correct');
          grid.appendChild(btn);
        });

        checkBtn.style.display = 'none';
        resetBtn.style.display = '';
        feedback.textContent = `You finished. Final score: ${config.items.length} of ${config.items.length}`;
        feedback.className = 'w-feedback correct';

        if (config.reveal) {
          revealArea.innerHTML = config.reveal;
          revealArea.style.display = 'block';
          revealArea.classList.add('show');
        }
      }
    }
  }

  // --- 2. Faded Worked Example Widget ---
  function initFadedExample(el, config, widgetIdx) {
    const layout = document.createElement('div');
    layout.className = 'faded-layout';
    
    // Model panel
    const modelPanel = document.createElement('div');
    modelPanel.className = 'faded-panel faded-model';
    modelPanel.innerHTML = `<h3>${config.model.title}</h3>`;
    const modelSteps = document.createElement('ol');
    modelSteps.className = 'faded-steps';
    config.model.steps.forEach(step => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="step-label">${step.label}</span>
        <div class="step-work">${step.work}</div>
        <div class="step-why">${step.why}</div>
      `;
      modelSteps.appendChild(li);
    });
    modelPanel.appendChild(modelSteps);

    // Mobile wrapper for model
    const mobileCollapsible = document.createElement('details');
    mobileCollapsible.className = 'faded-model-collapsible';
    mobileCollapsible.innerHTML = `<summary>Show Worked Example</summary>`;
    
    // Yours panel
    const yoursPanel = document.createElement('div');
    yoursPanel.className = 'faded-panel faded-yours';
    yoursPanel.innerHTML = `<h3>${config.yours.title}</h3>`;
    const yoursSteps = document.createElement('ol');
    yoursSteps.className = 'faded-steps';
    yoursPanel.appendChild(yoursSteps);

    mobileCollapsible.appendChild(modelPanel);
    layout.appendChild(mobileCollapsible);
    layout.appendChild(yoursPanel);
    el.appendChild(layout);

    let blanksData = [];

    config.yours.steps.forEach((step, sIdx) => {
      const li = document.createElement('li');
      const label = `<span class="step-label">${step.label}</span>`;
      
      if (step.given) {
        li.innerHTML = `${label}<div class="step-work">${step.given}</div>`;
      } else if (step.blank) {
        const blank = step.blank;
        const bIdx = blanksData.length;
        blanksData.push({
          config: blank,
          attempts: 0,
          resolved: false,
          stepIdx: sIdx
        });

        let inputHtml = '';
        if (blank.type === 'numeric' || blank.type === 'text') {
          const promptHtml = blank.prompt ? `<div class="w-blank-prompt">${blank.prompt}</div>` : '';
          inputHtml = `${promptHtml}<input class="w-blank-input" type="text" placeholder="Your answer..." data-blank-idx="${bIdx}">`;
        } else if (blank.type === 'choice') {
          const promptHtml = blank.prompt ? `<div class="w-blank-prompt">${blank.prompt}</div>` : '';
          inputHtml = `${promptHtml}<div class="w-blank-choices" data-blank-idx="${bIdx}">`;
          blank.options.forEach(opt => {
            inputHtml += `<button class="w-blank-opt" type="button">${opt}</button>`;
          });
          inputHtml += `</div>`;
        }

        const checkBtnHtml = config.yours.checkMode === 'all' ? '' : `<button class="w-step-check-btn" type="button" data-blank-idx="${bIdx}">Check</button>`;

        li.innerHTML = `
          ${label}
          <div class="step-work">
            ${inputHtml}
            ${checkBtnHtml}
            <div class="w-step-feedback" id="fb-${widgetIdx}-${bIdx}" role="status" aria-live="polite"></div>
          </div>
        `;

        if (blank.type === 'choice') {
          setTimeout(() => {
            const container = li.querySelector('.w-blank-choices');
            const opts = container.querySelectorAll('.w-blank-opt');
            opts.forEach(btn => btn.addEventListener('click', () => {
              if (blanksData[bIdx].resolved) return;
              opts.forEach(b => b.classList.remove('selected'));
              btn.classList.add('selected');
            }));
          }, 0);
        }
      }
      yoursSteps.appendChild(li);
    });

    const evalBlank = (bIdx, inputVal, elementToStyle, feedbackEl, afterResolve) => {
      const data = blanksData[bIdx];
      const blank = data.config;
      let correct = false;

      if (blank.type === 'numeric') {
        const val = parseFloat(inputVal);
        if (!isNaN(val)) {
          correct = Math.abs(val - blank.answer) <= (blank.tol || 0.001);
        }
      } else if (blank.type === 'text') {
        const normVal = inputVal.trim().toLowerCase();
        const answers = Array.isArray(blank.answer) ? blank.answer : [blank.answer];
        correct = answers.map(a => a.trim().toLowerCase()).includes(normVal);
      } else if (blank.type === 'choice') {
        correct = (inputVal === blank.answer);
      }

      data.attempts++;
      feedbackEl.className = 'w-step-feedback';

      if (correct) {
        data.resolved = true;
        elementToStyle.classList.add('correct');
        elementToStyle.classList.remove('wrong');
        elementToStyle.setAttribute('disabled', 'true');
        feedbackEl.innerHTML = blank.feedback_right || '';
        feedbackEl.classList.add('correct');
        if (afterResolve) afterResolve(true);
      } else {
        elementToStyle.classList.add('wrong');
        feedbackEl.innerHTML = blank.feedback_wrong || 'Not yet. Try again.';
        feedbackEl.classList.add('wrong');
        
        if (data.attempts >= 3) {
          data.resolved = true;
          elementToStyle.classList.remove('wrong');
          elementToStyle.classList.add('correct');
          elementToStyle.setAttribute('disabled', 'true');
          
          if (blank.type === 'numeric' || blank.type === 'text') {
            elementToStyle.value = Array.isArray(blank.answer) ? blank.answer[0] : blank.answer;
          } else if (blank.type === 'choice') {
            const opts = elementToStyle.querySelectorAll('.w-blank-opt');
            opts.forEach(o => {
              o.setAttribute('disabled', 'true');
              if (o.textContent === blank.answer) o.classList.add('correct');
            });
          }
          feedbackEl.innerHTML = `${blank.feedback_wrong} (Correct answer: ${Array.isArray(blank.answer) ? blank.answer[0] : blank.answer})`;
          feedbackEl.className = 'w-step-feedback correct';
          if (afterResolve) afterResolve(true);
        } else {
          if (afterResolve) afterResolve(false);
        }
      }
    };

    if (config.yours.checkMode !== 'all') {
      setTimeout(() => {
        el.querySelectorAll('.w-step-check-btn').forEach(btn => {
          const bIdx = parseInt(btn.dataset.blankIdx);
          const parent = btn.closest('.step-work');
          const feedbackEl = parent.querySelector('.w-step-feedback');
          
          btn.addEventListener('click', () => {
            const blank = blanksData[bIdx].config;
            let val = '';
            let styleTarget = null;
            
            if (blank.type === 'numeric' || blank.type === 'text') {
              styleTarget = parent.querySelector('.w-blank-input');
              val = styleTarget.value;
            } else if (blank.type === 'choice') {
              styleTarget = parent.querySelector('.w-blank-choices');
              const selected = styleTarget.querySelector('.w-blank-opt.selected');
              val = selected ? selected.textContent : '';
            }

            evalBlank(bIdx, val, styleTarget, feedbackEl, (resolved) => {
              if (resolved) {
                btn.style.display = 'none';
              }
              if (blanksData.every(b => b.resolved)) {
                commitDone(el, 'faded-example', widgetIdx);
                const resetBtn = el.querySelector('.w-btn-reset');
                if (resetBtn) resetBtn.style.display = '';
              }
            });
          });
        });
      }, 0);
    }

    const { checkBtn, resetBtn, feedback } = createWidgetControls(el,
      (cBtn, rBtn, fb) => {
        blanksData.forEach((data, bIdx) => {
          if (data.resolved) return;
          const blank = data.config;
          const li = yoursSteps.children[data.stepIdx];
          const feedbackEl = li.querySelector('.w-step-feedback');
          let val = '';
          let styleTarget = null;

          if (blank.type === 'numeric' || blank.type === 'text') {
            styleTarget = li.querySelector('.w-blank-input');
            val = styleTarget.value;
          } else if (blank.type === 'choice') {
            styleTarget = li.querySelector('.w-blank-choices');
            const selected = styleTarget.querySelector('.w-blank-opt.selected');
            val = selected ? selected.textContent : '';
          }

          evalBlank(bIdx, val, styleTarget, feedbackEl, () => {});
        });

        if (blanksData.every(b => b.resolved)) {
          cBtn.style.display = 'none';
          rBtn.style.display = '';
          fb.textContent = 'All steps resolved.';
          fb.className = 'w-feedback correct';
          commitDone(el, 'faded-example', widgetIdx);
        } else {
          fb.textContent = 'Some steps need correction. Check the marked ones.';
          fb.className = 'w-feedback wrong';
        }
      },
      (cBtn, rBtn, fb) => {
        blanksData.forEach(data => {
          data.attempts = 0;
          data.resolved = false;
          const li = yoursSteps.children[data.stepIdx];
          const feedbackEl = li.querySelector('.w-step-feedback');
          if (feedbackEl) {
            feedbackEl.textContent = '';
            feedbackEl.className = 'w-step-feedback';
          }
          const checkBtn = li.querySelector('.w-step-check-btn');
          if (checkBtn) checkBtn.style.display = '';

          const input = li.querySelector('.w-blank-input');
          if (input) {
            input.value = '';
            input.removeAttribute('disabled');
            input.className = 'w-blank-input';
          }
          const choiceContainer = li.querySelector('.w-blank-choices');
          if (choiceContainer) {
            choiceContainer.removeAttribute('disabled');
            const opts = choiceContainer.querySelectorAll('.w-blank-opt');
            opts.forEach(o => {
              o.removeAttribute('disabled');
              o.classList.remove('selected', 'correct', 'wrong');
            });
          }
        });
        if (config.yours.checkMode === 'all') {
          cBtn.style.display = '';
        }
      }
    );

    if (config.yours.checkMode !== 'all') {
      checkBtn.style.display = 'none';
    }

    if (StorageEngine.isCheckpointCompleted('faded-example', widgetIdx)) {
      blanksData.forEach((data, bIdx) => {
        data.resolved = true;
        const blank = data.config;
        const li = yoursSteps.children[data.stepIdx];
        const feedbackEl = li.querySelector('.w-step-feedback');
        const checkBtnStep = li.querySelector('.w-step-check-btn');
        if (checkBtnStep) checkBtnStep.style.display = 'none';

        let styleTarget = null;
        if (blank.type === 'numeric' || blank.type === 'text') {
          styleTarget = li.querySelector('.w-blank-input');
          styleTarget.value = Array.isArray(blank.answer) ? blank.answer[0] : blank.answer;
          styleTarget.classList.add('correct');
          styleTarget.setAttribute('disabled', 'true');
        } else if (blank.type === 'choice') {
          styleTarget = li.querySelector('.w-blank-choices');
          const opts = styleTarget.querySelectorAll('.w-blank-opt');
          opts.forEach(o => {
            o.setAttribute('disabled', 'true');
            if (o.textContent === blank.answer) {
              o.classList.add('correct');
              o.classList.add('selected');
            }
          });
        }
        if (feedbackEl) {
          feedbackEl.innerHTML = blank.feedback_right || '';
          feedbackEl.className = 'w-step-feedback correct';
        }
      });

      checkBtn.style.display = 'none';
      resetBtn.style.display = '';
      feedback.textContent = 'All steps resolved.';
      feedback.className = 'w-feedback correct';
    }
  }

  // --- 3. Fillable Scaffold Widget ---
  function initScaffold(el, config, widgetIdx) {
    const mode = config.mode || 'free';

    const workspace = document.createElement('div');
    workspace.className = 'w-workspace';
    el.appendChild(workspace);

    if (mode === 'bank') {
      const bankDiv = document.createElement('div');
      bankDiv.className = 'w-bank';
      bankDiv.setAttribute('role', 'list');
      bankDiv.setAttribute('aria-label', 'Statement bank');
      workspace.appendChild(bankDiv);

      const slotsContainer = document.createElement('div');
      slotsContainer.className = 'w-slots';
      workspace.appendChild(slotsContainer);

      let activeCardIdx = null;
      let slotAssignments = {};

      const renderBank = () => {
        bankDiv.innerHTML = '';
        config.bank.forEach((item, cIdx) => {
          if (Object.values(slotAssignments).includes(cIdx)) return;

          const card = document.createElement('div');
          card.className = 'w-card';
          card.textContent = item.text;
          card.setAttribute('role', 'listitem');
          card.setAttribute('tabindex', '0');
          if (activeCardIdx === cIdx) card.classList.add('selected');

          card.addEventListener('click', (e) => {
            e.stopPropagation();
            if (activeCardIdx === cIdx) {
              card.classList.remove('selected');
              activeCardIdx = null;
            } else {
              $$('.w-card', bankDiv).forEach(c => c.classList.remove('selected'));
              card.classList.add('selected');
              activeCardIdx = cIdx;
            }
          });
          bankDiv.appendChild(card);
        });
      };

      const renderSlots = () => {
        slotsContainer.innerHTML = '';
        config.slots.forEach((slot, sIdx) => {
          if (sIdx > 0 && config.chain) {
            const arrow = document.createElement('div');
            arrow.innerHTML = `<svg class="w-chain-arrow" viewBox="0 0 24 24"><path d="M12 4v16m0 0l-4-4m4 4l4-4" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
            slotsContainer.appendChild(arrow);
          }

          const row = document.createElement('div');
          row.className = 'w-slot-row';

          const label = document.createElement('span');
          label.className = 'w-slot-label';
          label.textContent = slot.label;
          row.appendChild(label);

          const slotBox = document.createElement('div');
          slotBox.className = 'w-slot';
          slotBox.setAttribute('role', 'region');
          slotBox.setAttribute('aria-label', `Target slot for ${slot.label}`);
          
          const assignedCardIdx = slotAssignments[slot.id];
          if (assignedCardIdx !== undefined && assignedCardIdx !== null) {
            slotBox.textContent = config.bank[assignedCardIdx].text;
            slotBox.style.cursor = 'pointer';
            slotBox.addEventListener('click', () => {
              if (el.dataset.committed === 'true') return;
              delete slotAssignments[slot.id];
              renderBank();
              renderSlots();
            });
          } else {
            slotBox.innerHTML = '<span style="color:var(--ink-mute); font-style:italic; font-size:0.9rem;">Tap a card, then tap here to place</span>';
            slotBox.addEventListener('click', () => {
              if (el.dataset.committed === 'true') return;
              if (activeCardIdx !== null) {
                Object.keys(slotAssignments).forEach(key => {
                  if (slotAssignments[key] === activeCardIdx) delete slotAssignments[key];
                });
                slotAssignments[slot.id] = activeCardIdx;
                activeCardIdx = null;
                renderBank();
                renderSlots();
              }
            });
          }

          row.appendChild(slotBox);
          slotsContainer.appendChild(row);
        });
      };

      const { checkBtn, resetBtn, feedback } = createWidgetControls(el,
        (cBtn, rBtn, fb) => {
          const filled = config.slots.every(slot => slotAssignments[slot.id] !== undefined);
          if (!filled) {
            fb.textContent = 'Place all statements before checking.';
            fb.className = 'w-feedback wrong';
            return;
          }

          el.dataset.committed = 'true';
          cBtn.style.display = 'none';
          rBtn.style.display = '';

          let correctCount = 0;
          config.slots.forEach((slot, sIdx) => {
            const cardIdx = slotAssignments[slot.id];
            const card = config.bank[cardIdx];
            const isCorrect = (card.slot === slot.id);
            const slotEl = slotsContainer.querySelectorAll('.w-slot')[sIdx];
            
            if (isCorrect) {
              slotEl.classList.add('correct');
              correctCount++;
            } else {
              slotEl.classList.add('wrong');
              fb.innerHTML = card.feedback || 'This statement belongs elsewhere.';
              fb.className = 'w-feedback wrong';
              setTimeout(() => {
                if (slotEl) {
                  delete slotAssignments[slot.id];
                  slotEl.classList.remove('wrong');
                  renderBank();
                  renderSlots();
                  rBtn.style.display = 'none';
                  cBtn.style.display = '';
                  el.removeAttribute('data-committed');
                }
              }, 2500);
            }
          });

          if (correctCount === config.slots.length) {
            fb.textContent = 'All statements are in the right place.';
            fb.className = 'w-feedback correct';
            commitDone(el, 'scaffold', widgetIdx);
          }
        },
        (cBtn, rBtn, fb) => {
          el.removeAttribute('data-committed');
          activeCardIdx = null;
          slotAssignments = {};
          renderBank();
          renderSlots();
        }
      );

      renderBank();
      renderSlots();

      if (StorageEngine.isCheckpointCompleted('scaffold', widgetIdx)) {
        el.dataset.committed = 'true';
        checkBtn.style.display = 'none';
        resetBtn.style.display = '';

        config.slots.forEach(slot => {
          const correctCardIdx = config.bank.findIndex(card => card.slot === slot.id);
          if (correctCardIdx >= 0) {
            slotAssignments[slot.id] = correctCardIdx;
          }
        });

        renderBank();
        renderSlots();

        const slotEls = slotsContainer.querySelectorAll('.w-slot');
        slotEls.forEach(slotEl => {
          slotEl.classList.add('correct');
          slotEl.style.cursor = 'default';
        });

        feedback.textContent = 'All statements are in the right place.';
        feedback.className = 'w-feedback correct';
      }

    } else if (mode === 'free') {
      const slotsContainer = document.createElement('div');
      slotsContainer.className = 'w-slots';
      workspace.appendChild(slotsContainer);

      config.slots.forEach((slot, sIdx) => {
        const item = document.createElement('div');
        item.className = 'w-scaffold-free-slot';
        item.innerHTML = `
          <label>${slot.label}</label>
          <textarea class="w-textarea" placeholder="Write your explanation segment..."></textarea>
          <div class="w-reveal-area" style="display: none;"></div>
        `;
        slotsContainer.appendChild(item);
      });

      const textareas = $$('.w-textarea', slotsContainer);

      const { checkBtn, resetBtn, feedback } = createWidgetControls(el,
        (cBtn, rBtn, fb) => {
          let filled = true;
          textareas.forEach(ta => {
            if (ta.value.trim().length < 10) filled = false;
          });
          if (!filled) {
            fb.textContent = 'Write a complete response in all boxes before comparing.';
            fb.className = 'w-feedback wrong';
            return;
          }

          cBtn.style.display = 'none';
          rBtn.style.display = '';
          fb.textContent = 'Compare each of your points with the model answers below.';
          fb.className = 'w-feedback correct';

          config.slots.forEach((slot, sIdx) => {
            const ta = textareas[sIdx];
            ta.setAttribute('disabled', 'true');
            const reveal = ta.nextElementSibling;
            reveal.innerHTML = `<h4>Model Answer</h4><p>${slot.model}</p>`;
            reveal.style.display = 'block';
            reveal.classList.add('show');
          });
          commitDone(el, 'scaffold', widgetIdx);
        },
        (cBtn, rBtn, fb) => {
          textareas.forEach(ta => {
            ta.removeAttribute('disabled');
            ta.value = '';
            const reveal = ta.nextElementSibling;
            reveal.style.display = 'none';
            reveal.classList.remove('show');
            reveal.innerHTML = '';
          });
        }
      );
      checkBtn.textContent = 'Compare with model';

      if (StorageEngine.isCheckpointCompleted('scaffold', widgetIdx)) {
        checkBtn.style.display = 'none';
        resetBtn.style.display = '';
        feedback.textContent = 'Compare each of your points with the model answers below.';
        feedback.className = 'w-feedback correct';

        config.slots.forEach((slot, sIdx) => {
          const ta = textareas[sIdx];
          ta.setAttribute('disabled', 'true');
          const reveal = ta.nextElementSibling;
          reveal.innerHTML = `<h4>Model Answer</h4><p>${slot.model}</p>`;
          reveal.style.display = 'block';
          reveal.classList.add('show');
        });
      }

    } else if (mode === 'table') {
      const wrapper = document.createElement('div');
      wrapper.className = 'w-table-wrapper';
      
      const tbl = document.createElement('table');
      tbl.className = 'w-table';
      wrapper.appendChild(tbl);
      workspace.appendChild(wrapper);

      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      config.table.headers.forEach(h => {
        headerRow.innerHTML += `<th>${h}</th>`;
      });
      thead.appendChild(headerRow);
      tbl.appendChild(thead);

      const tbody = document.createElement('tbody');
      tbl.appendChild(tbody);

      let tableBlanks = [];

      config.table.rows.forEach((row, rIdx) => {
        const tr = document.createElement('tr');
        row.forEach((cell, cIdx) => {
          const td = document.createElement('td');
          if (cell.given !== undefined) {
            td.innerHTML = cell.given;
          } else if (cell.blank) {
            const bIdx = tableBlanks.length;
            tableBlanks.push({
              config: cell.blank,
              attempts: 0,
              resolved: false,
              tdElement: td
            });
            td.innerHTML = `<input class="w-blank-input" type="text" style="width: 100%;" data-tbl-blank-idx="${bIdx}">`;
          }
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });

      const { checkBtn, resetBtn, feedback } = createWidgetControls(el,
        (cBtn, rBtn, fb) => {
          tableBlanks.forEach((data, bIdx) => {
            if (data.resolved) return;
            const blank = data.config;
            const input = data.tdElement.querySelector('.w-blank-input');
            const val = input.value;
            let correct = false;

            if (blank.type === 'numeric') {
              const fVal = parseFloat(val);
              if (!isNaN(fVal)) {
                correct = Math.abs(fVal - blank.answer) <= (blank.tol || 0.001);
              }
            } else if (blank.type === 'text') {
              const normVal = val.trim().toLowerCase();
              const answers = Array.isArray(blank.answer) ? blank.answer : [blank.answer];
              correct = answers.map(a => a.trim().toLowerCase()).includes(normVal);
            }

            data.attempts++;
            input.className = 'w-blank-input';

            if (correct) {
              data.resolved = true;
              input.classList.add('correct');
              input.setAttribute('disabled', 'true');
            } else {
              input.classList.add('wrong');

              if (data.attempts >= 3) {
                data.resolved = true;
                input.classList.remove('wrong');
                input.classList.add('correct');
                input.setAttribute('disabled', 'true');
                input.value = Array.isArray(blank.answer) ? blank.answer[0] : blank.answer;
              }
            }
          });

          if (tableBlanks.every(b => b.resolved)) {
            cBtn.style.display = 'none';
            rBtn.style.display = '';
            fb.textContent = 'The table is complete.';
            fb.className = 'w-feedback correct';
            commitDone(el, 'scaffold', widgetIdx);
          } else {
            fb.textContent = 'Correct the highlighted cells and try again.';
            fb.className = 'w-feedback wrong';
          }
        },
        (cBtn, rBtn, fb) => {
          tableBlanks.forEach(data => {
            data.attempts = 0;
            data.resolved = false;
            const input = data.tdElement.querySelector('.w-blank-input');
            input.value = '';
            input.removeAttribute('disabled');
            input.className = 'w-blank-input';
          });
        }
      );

      if (StorageEngine.isCheckpointCompleted('scaffold', widgetIdx)) {
        tableBlanks.forEach((data, bIdx) => {
          data.resolved = true;
          const blank = data.config;
          const input = data.tdElement.querySelector('.w-blank-input');
          if (input) {
            input.value = Array.isArray(blank.answer) ? blank.answer[0] : blank.answer;
            input.classList.add('correct');
            input.setAttribute('disabled', 'true');
          }
        });

        checkBtn.style.display = 'none';
        resetBtn.style.display = '';
        feedback.textContent = 'The table is complete.';
        feedback.className = 'w-feedback correct';
      }
    }
  }

  // --- 4. Step-Through Builder Widget ---
  function initStepBuilder(el, config, widgetIdx) {
    const workspace = document.createElement('div');
    workspace.className = 'w-workspace';
    el.appendChild(workspace);

    const qBox = document.createElement('div');
    qBox.className = 'w-step-builder-prompt';
    workspace.appendChild(qBox);

    const grid = document.createElement('div');
    grid.className = 'w-options-grid';
    workspace.appendChild(grid);

    const revealArea = document.createElement('div');
    revealArea.className = 'w-reveal-area';
    revealArea.style.display = 'none';
    el.appendChild(revealArea);

    let currentStep = 0;
    let attempts = 0;

    const svgContainer = config.diagramId ? document.getElementById(config.diagramId) : el.closest('section').querySelector('.diagram');
    const updateSVGState = (stateId) => {
      if (!svgContainer) return;
      const layers = svgContainer.querySelectorAll('[data-step], .svg-step-layer');
      layers.forEach(l => {
        l.style.display = 'none';
        l.style.opacity = '0';
      });

      if (stateId) {
        const target = svgContainer.querySelector(`#${stateId}`) || svgContainer.querySelector(`.${stateId}`);
        if (target) {
          target.style.display = '';
          target.style.opacity = '1';
        }
      }
    };

    const renderStep = () => {
      const step = config.steps[currentStep];
      updateSVGState(step.state);
      attempts = 0;

      qBox.innerHTML = `
        <div class="w-drill-status">
          <span class="w-drill-progress">Step ${currentStep + 1} of ${config.steps.length}</span>
        </div>
        <p>${step.question}</p>
      `;

      grid.innerHTML = '';
      step.options.forEach((opt, oIdx) => {
        const btn = document.createElement('button');
        btn.className = 'w-opt';
        btn.type = 'button';
        btn.innerHTML = opt.label;
        btn.addEventListener('click', () => {
          const ok = opt.correct;
          btn.className = 'w-opt';
          
          if (ok) {
            btn.classList.add('correct');
            feedback.innerHTML = opt.feedback || '';
            feedback.className = 'w-feedback correct';
            $$('.w-opt', grid).forEach(b => b.setAttribute('disabled', 'true'));
            
            if (currentStep < config.steps.length - 1) {
              checkBtn.style.display = '';
              checkBtn.textContent = 'Continue';
            } else {
              checkBtn.style.display = 'none';
              resetBtn.style.display = '';
              if (config.finale) {
                revealArea.innerHTML = config.finale;
                revealArea.style.display = 'block';
                revealArea.classList.add('show');
              }
              commitDone(el, 'step-builder', widgetIdx);
            }
          } else {
            btn.classList.add('wrong');
            feedback.innerHTML = opt.feedback || '';
            feedback.className = 'w-feedback wrong';
            attempts++;

            if (attempts >= 2) {
              step.options.forEach((o, idx) => {
                if (o.correct) {
                  grid.children[idx].classList.add('correct');
                  feedback.innerHTML = `${opt.feedback} Let's move forward.`;
                  feedback.className = 'w-feedback correct';
                }
              });
              $$('.w-opt', grid).forEach(b => b.setAttribute('disabled', 'true'));
              
              if (currentStep < config.steps.length - 1) {
                checkBtn.style.display = '';
                checkBtn.textContent = 'Continue';
              } else {
                checkBtn.style.display = 'none';
                resetBtn.style.display = '';
                if (config.finale) {
                  revealArea.innerHTML = config.finale;
                  revealArea.style.display = 'block';
                  revealArea.classList.add('show');
                }
                commitDone(el, 'step-builder', widgetIdx);
              }
            }
          }
        });
        grid.appendChild(btn);
      });
    };

    const { checkBtn, resetBtn, feedback } = createWidgetControls(el,
      (cBtn, rBtn, fb) => {
        currentStep++;
        cBtn.style.display = 'none';
        fb.textContent = '';
        fb.className = 'w-feedback';
        renderStep();
      },
      (cBtn, rBtn, fb) => {
        currentStep = 0;
        attempts = 0;
        revealArea.style.display = 'none';
        revealArea.classList.remove('show');
        revealArea.innerHTML = '';
        renderStep();
      }
    );
    checkBtn.style.display = 'none';
    renderStep();

    if (StorageEngine.isCheckpointCompleted('step-builder', widgetIdx)) {
      currentStep = config.steps.length - 1;
      renderStep();

      const opts = $$('.w-opt', grid);
      opts.forEach((btn, idx) => {
        btn.setAttribute('disabled', 'true');
        if (config.steps[currentStep].options[idx].correct) {
          btn.classList.add('correct');
          feedback.innerHTML = config.steps[currentStep].options[idx].feedback || '';
        }
      });
      feedback.className = 'w-feedback correct';

      checkBtn.style.display = 'none';
      resetBtn.style.display = '';

      if (config.finale) {
        revealArea.innerHTML = config.finale;
        revealArea.style.display = 'block';
        revealArea.classList.add('show');
      }
    }
  }

  // --- 5. Sort & Classify Widget ---
  function initSortClassify(el, config, widgetIdx) {
    if (!config.items || !config.items.length || !config.categories) return;

    // State
    const state = {
      currentIndex: 0,
      correctCount: 0,
      attempts: 0,
      firstTryCorrect: Array(config.items.length).fill(true)
    };

    // Create DOM structure
    const container = document.createElement('div');
    container.className = 'w-sort-container';
    el.appendChild(container);

    const header = document.createElement('div');
    header.className = 'w-sort-header';
    container.appendChild(header);

    const progressEl = document.createElement('span');
    progressEl.className = 'w-sort-status';
    header.appendChild(progressEl);

    const scoreEl = document.createElement('span');
    scoreEl.className = 'w-sort-status';
    header.appendChild(scoreEl);

    const sortBody = document.createElement('div');
    sortBody.className = 'w-sort-body';
    container.appendChild(sortBody);

    const cardStage = document.createElement('div');
    cardStage.className = 'w-sort-card-stage';
    sortBody.appendChild(cardStage);

    const binsGrid = document.createElement('div');
    binsGrid.className = 'w-sort-bins';
    sortBody.appendChild(binsGrid);

    const revealArea = document.createElement('div');
    revealArea.className = 'w-reveal-area';
    revealArea.style.display = 'none';
    el.appendChild(revealArea);

    const updateStatus = () => {
      progressEl.textContent = `Item ${state.currentIndex + 1} of ${config.items.length}`;
      scoreEl.textContent = `Correct: ${state.correctCount} / ${config.items.length}`;
    };

    const renderCard = () => {
      cardStage.innerHTML = '';
      if (state.currentIndex >= config.items.length) return;

      const item = config.items[state.currentIndex];
      const card = document.createElement('div');
      card.className = 'w-sort-card';
      let html = item.text || '';
      html = html.replace(/<\/strong>\s*:\s*/i, '</strong><span class="w-sort-desc">');
      if (html.includes('<span class="w-sort-desc">')) {
        html += '</span>';
        card.classList.add('has-desc');
      } else if (html.includes('<strong') || html.includes('class="chem"') || html.includes("class='chem'")) {
        card.classList.add('is-formula-only');
      } else {
        card.classList.add('is-prose-only');
      }
      card.innerHTML = `<div class="w-sort-card-content">${html}</div>`;
      cardStage.appendChild(card);
    };

    const renderBins = () => {
      binsGrid.innerHTML = '';
      config.categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'w-sort-bin';
        btn.type = 'button';
        btn.textContent = cat.label;
        btn.dataset.catId = cat.id;

        btn.addEventListener('click', () => {
          if (el.dataset.committed === 'true') return;
          classifyItem(cat.id, btn);
        });

        binsGrid.appendChild(btn);
      });
    };

    const classifyItem = (catId, clickedBtn) => {
      const item = config.items[state.currentIndex];
      const isCorrect = (item.category === catId);

      // Disable other buttons during animations or checking state
      const bins = $$('.w-sort-bin', binsGrid);

      if (isCorrect) {
        // Success flow
        el.dataset.committed = 'true';
        bins.forEach(b => b.setAttribute('disabled', 'true'));
        clickedBtn.removeAttribute('disabled');
        clickedBtn.classList.add('correct');

        feedback.innerHTML = item.feedback_right || '';
        feedback.className = 'w-feedback correct';

        if (state.firstTryCorrect[state.currentIndex]) {
          state.correctCount++;
        }
        updateStatus();

        if (state.currentIndex < config.items.length - 1) {
          checkBtn.style.display = '';
          checkBtn.textContent = 'Next';
        } else {
          checkBtn.style.display = 'none';
          resetBtn.style.display = '';
          feedback.textContent = `Sorting is complete. Score: ${state.correctCount} of ${config.items.length}`;
          if (config.reveal) {
            revealArea.innerHTML = config.reveal;
            revealArea.style.display = 'block';
            revealArea.classList.add('show');
            initWidgets();
            initMotionPrimitives();
          }
          commitDone(el, 'sort-classify', widgetIdx, { completed: true, score: state.correctCount });
        }
      } else {
        // Error flow
        state.firstTryCorrect[state.currentIndex] = false;
        clickedBtn.classList.add('wrong');
        clickedBtn.setAttribute('disabled', 'true');

        feedback.innerHTML = item.feedback_wrong || 'Try another category.';
        feedback.className = 'w-feedback wrong';

        // Clear wrong class after animation completes so it can shake again
        setTimeout(() => {
          clickedBtn.classList.remove('wrong');
        }, 400);
      }
    };

    const { checkBtn, resetBtn, feedback } = createWidgetControls(el,
      // onCheck (Next)
      (cBtn, rBtn, fb) => {
        el.removeAttribute('data-committed');
        state.currentIndex++;
        state.attempts = 0;
        cBtn.style.display = 'none';
        fb.textContent = '';
        fb.className = 'w-feedback';
        updateStatus();
        renderCard();
        renderBins();
      },
      // onReset
      (cBtn, rBtn, fb) => {
        el.removeAttribute('data-committed');
        state.currentIndex = 0;
        state.correctCount = 0;
        state.attempts = 0;
        state.firstTryCorrect = Array(config.items.length).fill(true);
        cBtn.style.display = 'none';
        fb.textContent = '';
        fb.className = 'w-feedback';
        revealArea.style.display = 'none';
        revealArea.classList.remove('show');
        revealArea.innerHTML = '';
        updateStatus();
        renderCard();
        renderBins();
      }
    );

    // Initial setup
    checkBtn.style.display = 'none';
    // createWidgetControls' own reset handler re-shows the Check button after
    // onReset runs; here Check doubles as "Next" and must stay hidden until an
    // item is answered, or clicking it skips items. This listener runs last.
    resetBtn.addEventListener('click', () => { checkBtn.style.display = 'none'; });
    updateStatus();
    renderCard();
    renderBins();

    // Restore state from persistence layer
    if (StorageEngine.isCheckpointCompleted('sort-classify', widgetIdx)) {
      const saved = StorageEngine.getCheckpointValue('sort-classify', widgetIdx);
      state.currentIndex = config.items.length - 1;
      
      const hasScore = saved && typeof saved === 'object' && saved.score !== undefined;
      state.correctCount = hasScore ? saved.score : 0;
      
      updateStatus();
      cardStage.innerHTML = '<div class="w-sort-card"><p>Sorting is complete.</p></div>';
      renderBins();
      $$('.w-sort-bin', binsGrid).forEach(b => {
        b.setAttribute('disabled', 'true');
        const item = config.items[state.currentIndex];
        if (b.dataset.catId === item.category) {
          b.classList.add('correct');
        }
      });
      
      if (hasScore) {
        feedback.textContent = `Sorting is complete. Score: ${state.correctCount} of ${config.items.length}`;
        feedback.className = 'w-feedback correct';
      } else {
        feedback.textContent = `Sorting is complete.`;
        feedback.className = 'w-feedback correct';
        scoreEl.textContent = ''; // Clear the default score status line
      }
      
      checkBtn.style.display = 'none';
      resetBtn.style.display = '';
      if (config.reveal) {
        revealArea.innerHTML = config.reveal;
        revealArea.style.display = 'block';
        revealArea.classList.add('show');
      }
    }
  }

  // --- 6. Predict & Run Widget ---
  function initPredictRun(el, config, widgetIdx) {
    const predictionType = config.predictionType || 'choice';

    // Create prompt
    const promptDiv = document.createElement('div');
    promptDiv.className = 'w-prompt';
    promptDiv.innerHTML = config.prompt || '';
    el.appendChild(promptDiv);

    // Create workspace
    const workspace = document.createElement('div');
    workspace.className = 'w-workspace';
    el.appendChild(workspace);

    // Create reveal area
    const revealArea = document.createElement('div');
    revealArea.className = 'w-reveal-area';
    revealArea.style.display = 'none';
    el.appendChild(revealArea);

    let state = {
      selectedOptIdx: null,
      committed: false,
      simRunning: false,
      simCompleted: false
    };

    let grid, textarea, hint;

    if (predictionType === 'choice') {
      grid = document.createElement('div');
      grid.className = 'w-options-grid';
      config.options.forEach((opt, oIdx) => {
        const btn = document.createElement('button');
        btn.className = 'w-opt';
        btn.type = 'button';
        btn.innerHTML = opt.label;
        btn.addEventListener('click', () => {
          if (state.committed) return;
          $$('.w-opt', grid).forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          state.selectedOptIdx = oIdx;
          checkBtn.removeAttribute('disabled');
        });
        grid.appendChild(btn);
      });
      workspace.appendChild(grid);
    } else if (predictionType === 'free') {
      textarea = document.createElement('textarea');
      textarea.className = 'w-textarea';
      textarea.placeholder = 'Write your prediction first...';
      workspace.appendChild(textarea);

      const minChars = config.minChars || 25;
      hint = document.createElement('div');
      hint.className = 'w-progress-hint';
      workspace.appendChild(hint);

      textarea.addEventListener('input', () => {
        const len = textarea.value.trim().length;
        if (len === 0) {
          hint.textContent = '';
          hint.classList.remove('ready');
        } else if (len < minChars) {
          hint.textContent = 'Keep going…';
          hint.classList.remove('ready');
        } else {
          hint.textContent = 'Ready';
          hint.classList.add('ready');
        }
        if (len >= minChars) {
          checkBtn.removeAttribute('disabled');
        } else {
          checkBtn.setAttribute('disabled', 'true');
        }
      });
    }

    const startSimulation = (onDone) => {
      state.simRunning = true;
      const stepEl = el.querySelector('[data-motion="step"]');
      if (stepEl) {
        const firstDot = stepEl.querySelector('.step-dot[data-step-dot-idx="1"]');
        if (firstDot) firstDot.click();

        const prevBtn = stepEl.querySelector('.step-prev');
        const nextBtn = stepEl.querySelector('.step-next');
        const dots = stepEl.querySelectorAll('.step-dot');
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        dots.forEach(d => d.style.pointerEvents = 'none');

        const interval = setInterval(() => {
          const nextBtnLive = stepEl.querySelector('.step-next');
          if (nextBtnLive && !nextBtnLive.disabled) {
            nextBtnLive.click();
          } else {
            clearInterval(interval);
            dots.forEach(d => d.style.pointerEvents = '');
            state.simRunning = false;
            state.simCompleted = true;
            onDone();
          }
        }, 900);
      } else if (config.simName && window.GC_SIMULATIONS && window.GC_SIMULATIONS[config.simName]) {
        window.GC_SIMULATIONS[config.simName](el, () => {
          state.simRunning = false;
          state.simCompleted = true;
          onDone();
        });
      } else {
        setTimeout(() => {
          state.simRunning = false;
          state.simCompleted = true;
          onDone();
        }, 500);
      }
    };

    const { checkBtn, resetBtn, feedback } = createWidgetControls(el,
      (cBtn, rBtn, fb) => {
        if (!state.committed) {
          state.committed = true;
          el.dataset.committed = 'true';
          if (predictionType === 'choice') {
            const chosen = config.options[state.selectedOptIdx];
            const opts = $$('.w-opt', grid);
            opts.forEach(o => o.setAttribute('disabled', 'true'));
            opts[state.selectedOptIdx].classList.add(chosen.correct ? 'correct' : 'wrong');
            
            config.options.forEach((opt, oIdx) => {
              if (opt.correct) opts[oIdx].classList.add('correct');
            });
            fb.innerHTML = chosen.feedback + ' <br><b>Now, run the simulation to see the molecular behavior.</b>';
            fb.className = 'w-feedback ' + (chosen.correct ? 'correct' : 'wrong');
          } else {
            textarea.setAttribute('disabled', 'true');
            if (hint) hint.style.display = 'none';
            fb.innerHTML = 'Prediction committed. <br><b>Now, run the simulation to observe the outcome.</b>';
            fb.className = 'w-feedback correct';
          }
          cBtn.textContent = 'Run Simulation';
        } else if (!state.simCompleted && !state.simRunning) {
          cBtn.setAttribute('disabled', 'true');
          cBtn.textContent = 'Simulating...';
          startSimulation(() => {
            cBtn.style.display = 'none';
            rBtn.style.display = '';
            
            fb.innerHTML = (predictionType === 'choice') 
              ? config.options[state.selectedOptIdx].feedback 
              : 'Simulation complete. Compare your prediction with the molecular outcome.';
            fb.className = 'w-feedback correct';

            if (config.reveal) {
              revealArea.innerHTML = config.reveal;
              revealArea.style.display = 'block';
              revealArea.classList.add('show');
              initWidgets();
              initMotionPrimitives();
            }
            commitDone(el, 'predict-run', widgetIdx);
          });
        }
      },
      (cBtn, rBtn, fb) => {
        el.removeAttribute('data-committed');
        state.committed = false;
        state.simRunning = false;
        state.simCompleted = false;
        cBtn.textContent = 'Check';
        cBtn.setAttribute('disabled', 'true');
        revealArea.style.display = 'none';
        revealArea.classList.remove('show');
        revealArea.innerHTML = '';

        if (predictionType === 'choice') {
          state.selectedOptIdx = null;
          const opts = $$('.w-opt', grid);
          opts.forEach(o => {
            o.removeAttribute('disabled');
            o.classList.remove('selected', 'correct', 'wrong');
          });
        } else if (predictionType === 'free') {
          textarea.removeAttribute('disabled');
          textarea.value = '';
          if (hint) {
            hint.style.display = '';
            hint.textContent = '';
            hint.classList.remove('ready');
          }
        }

        const stepEl = el.querySelector('[data-motion="step"]');
        if (stepEl) {
          const firstDot = stepEl.querySelector('.step-dot[data-step-dot-idx="1"]');
          if (firstDot) firstDot.click();
        }
      }
    );

    checkBtn.setAttribute('disabled', 'true');

    if (StorageEngine.isCheckpointCompleted('predict-run', widgetIdx)) {
      state.committed = true;
      state.simCompleted = true;
      el.dataset.committed = 'true';
      checkBtn.style.display = 'none';
      resetBtn.style.display = '';

      if (predictionType === 'choice') {
        const correctIdx = config.options.findIndex(opt => opt.correct);
        state.selectedOptIdx = correctIdx >= 0 ? correctIdx : 0;
        const opts = $$('.w-opt', grid);
        opts.forEach(o => o.setAttribute('disabled', 'true'));
        if (correctIdx >= 0 && opts[correctIdx]) {
          opts[correctIdx].classList.add('correct');
        }
        feedback.innerHTML = config.options[state.selectedOptIdx].feedback || '';
      } else {
        if (textarea) textarea.setAttribute('disabled', 'true');
        if (hint) hint.style.display = 'none';
        feedback.textContent = 'Simulation complete. Review the explanation below.';
      }
      feedback.className = 'w-feedback correct';

      if (config.reveal) {
        revealArea.innerHTML = config.reveal;
        revealArea.style.display = 'block';
        revealArea.classList.add('show');
      }

      const stepEl = el.querySelector('[data-motion="step"]');
      if (stepEl) {
        const count = parseInt(stepEl.dataset.stepCount) || 1;
        const lastDot = stepEl.querySelector(`.step-dot[data-step-dot-idx="${count}"]`);
        if (lastDot) lastDot.click();
      }
    }
  }

  // --- 7. Diagnose the Error Widget ---
  function initDiagnoseError(el, config, widgetIdx) {
    const spots = el.querySelectorAll('.w-spot');
    
    const revealArea = document.createElement('div');
    revealArea.className = 'w-reveal-area';
    revealArea.style.display = 'none';
    el.appendChild(revealArea);

    let state = {
      selectedSpotId: null,
      committed: false
    };

    spots.forEach(spot => {
      spot.addEventListener('click', () => {
        if (state.committed) return;
        spots.forEach(s => s.classList.remove('selected'));
        spot.classList.add('selected');
        state.selectedSpotId = spot.dataset.spotId;
        checkBtn.removeAttribute('disabled');
      });
    });

    const { checkBtn, resetBtn, feedback } = createWidgetControls(el,
      (cBtn, rBtn, fb) => {
        if (!state.selectedSpotId) return;
        state.committed = true;
        el.dataset.committed = 'true';
        cBtn.style.display = 'none';
        rBtn.style.display = '';

        const chosenSpot = config.spots.find(s => s.id === state.selectedSpotId);
        const correctSpot = config.spots.find(s => s.correct);
        
        spots.forEach(s => {
          s.style.pointerEvents = 'none';
          if (s.dataset.spotId === correctSpot.id) {
            s.classList.add('correct');
          }
        });

        const isCorrect = chosenSpot && chosenSpot.correct;
        const chosenSpotEl = el.querySelector(`.w-spot[data-spot-id="${state.selectedSpotId}"]`);
        
        if (isCorrect) {
          fb.innerHTML = chosenSpot.feedback || 'That is the error.';
          fb.className = 'w-feedback correct';
        } else {
          if (chosenSpotEl) {
            chosenSpotEl.classList.add('wrong');
          }
          fb.innerHTML = (chosenSpot ? chosenSpot.feedback : '') || 'That part is correct. The error is in the highlighted part.';
          fb.className = 'w-feedback wrong';
        }

        if (config.reveal) {
          revealArea.innerHTML = config.reveal;
          revealArea.style.display = 'block';
          revealArea.classList.add('show');
          initWidgets();
          initMotionPrimitives();
        }
        commitDone(el, 'diagnose-error', widgetIdx);
      },
      (cBtn, rBtn, fb) => {
        el.removeAttribute('data-committed');
        state.committed = false;
        state.selectedSpotId = null;
        cBtn.setAttribute('disabled', 'true');
        revealArea.style.display = 'none';
        revealArea.classList.remove('show');
        revealArea.innerHTML = '';

        spots.forEach(s => {
          s.style.pointerEvents = '';
          s.classList.remove('selected', 'correct', 'wrong');
        });
      }
    );

    checkBtn.setAttribute('disabled', 'true');

    if (StorageEngine.isCheckpointCompleted('diagnose-error', widgetIdx)) {
      state.committed = true;
      el.dataset.committed = 'true';
      checkBtn.style.display = 'none';
      resetBtn.style.display = '';

      const correctSpot = config.spots.find(s => s.correct);
      spots.forEach(s => {
        s.style.pointerEvents = 'none';
        if (s.dataset.spotId === correctSpot.id) {
          s.classList.add('correct');
        }
      });

      feedback.innerHTML = correctSpot.feedback || 'The error is highlighted.';
      feedback.className = 'w-feedback correct';

      if (config.reveal) {
        revealArea.innerHTML = config.reveal;
        revealArea.style.display = 'block';
        revealArea.classList.add('show');
      }
    }
  }

  // --- 8. Construct with Live Validation Widget ---
  function initConstructValidate(el, config, widgetIdx) {
    if (!config.items || !config.items.length) return;

    const workspace = document.createElement('div');
    workspace.className = 'w-workspace';
    el.appendChild(workspace);

    const revealArea = document.createElement('div');
    revealArea.className = 'w-reveal-area';
    revealArea.style.display = 'none';
    el.appendChild(revealArea);

    let state = {
      counts: {},
      committed: false
    };

    config.items.forEach(item => {
      state.counts[item.id] = 0;
    });

    const constructContainer = document.createElement('div');
    constructContainer.className = 'w-construct-container';
    workspace.appendChild(constructContainer);

    const poolEl = document.createElement('div');
    poolEl.className = 'w-construct-pool';
    constructContainer.appendChild(poolEl);

    const workspaceEl = document.createElement('div');
    workspaceEl.className = 'w-construct-workspace';
    constructContainer.appendChild(workspaceEl);

    const formulaEl = document.createElement('div');
    formulaEl.className = 'w-construct-formula';
    workspaceEl.appendChild(formulaEl);

    const badgeEl = document.createElement('div');
    badgeEl.className = 'w-construct-badge';
    workspaceEl.appendChild(badgeEl);

    const updateValidation = () => {
      let netCharge = 0;
      let totalItems = 0;

      config.items.forEach(item => {
        const count = state.counts[item.id];
        totalItems += count;
        if (item.charge !== undefined) {
          netCharge += item.charge * count;
        }
      });

      let formulaHtml = '';
      config.items.forEach(item => {
        const count = state.counts[item.id];
        if (count > 0) {
          formulaHtml += `${item.id}${count > 1 ? `<sub>${count}</sub>` : ''}`;
        }
      });
      formulaEl.innerHTML = formulaHtml;

      if (totalItems === 0) {
        badgeEl.textContent = '';
        badgeEl.className = 'w-construct-badge';
        checkBtn.setAttribute('disabled', 'true');
      } else {
        if (netCharge === 0) {
          badgeEl.textContent = '0 (Neutral & Balanced)';
          badgeEl.className = 'w-construct-badge balanced';
          if (!state.committed) checkBtn.removeAttribute('disabled');
        } else {
          const sign = netCharge > 0 ? '+' : '';
          badgeEl.textContent = `${sign}${netCharge} (Unbalanced)`;
          badgeEl.className = 'w-construct-badge unbalanced';
          checkBtn.setAttribute('disabled', 'true');
        }
      }
    };

    const renderPool = () => {
      poolEl.innerHTML = '';
      config.items.forEach(item => {
        const poolItem = document.createElement('div');
        poolItem.className = 'w-construct-pool-item';

        const label = document.createElement('span');
        label.className = 'w-construct-label';
        label.innerHTML = item.label;
        poolItem.appendChild(label);

        const controls = document.createElement('div');
        controls.className = 'w-construct-controls';

        const minusBtn = document.createElement('button');
        minusBtn.className = 'w-construct-btn';
        minusBtn.type = 'button';
        minusBtn.textContent = '−';
        minusBtn.disabled = state.committed || state.counts[item.id] <= 0;
        minusBtn.addEventListener('click', () => {
          if (state.counts[item.id] > 0) {
            state.counts[item.id]--;
            renderPool();
            updateValidation();
          }
        });

        const val = document.createElement('span');
        val.className = 'w-construct-val';
        val.textContent = state.counts[item.id];

        const plusBtn = document.createElement('button');
        plusBtn.className = 'w-construct-btn';
        plusBtn.type = 'button';
        plusBtn.textContent = '+';
        plusBtn.disabled = state.committed || state.counts[item.id] >= 8;
        plusBtn.addEventListener('click', () => {
          state.counts[item.id]++;
          renderPool();
          updateValidation();
        });

        controls.appendChild(minusBtn);
        controls.appendChild(val);
        controls.appendChild(plusBtn);
        poolItem.appendChild(controls);
        poolEl.appendChild(poolItem);
      });
    };

    const { checkBtn, resetBtn, feedback } = createWidgetControls(el,
      (cBtn, rBtn, fb) => {
        state.committed = true;
        el.dataset.committed = 'true';
        cBtn.style.display = 'none';
        rBtn.style.display = '';

        $$('.w-construct-btn', poolEl).forEach(b => b.disabled = true);

        let isCorrect = true;
        let isMultiple = false;

        if (config.targetRatio) {
          const userRatio = {};
          config.items.forEach(item => {
            userRatio[item.id] = state.counts[item.id];
          });

          let targetMatch = true;
          config.items.forEach(item => {
            if (userRatio[item.id] !== config.targetRatio[item.id]) {
              targetMatch = false;
            }
          });

          if (targetMatch) {
            isCorrect = true;
          } else {
            let factor = null;
            let multipleMatch = true;
            config.items.forEach(item => {
              const userVal = userRatio[item.id];
              const targetVal = config.targetRatio[item.id];
              if (targetVal === 0 && userVal !== 0) multipleMatch = false;
              if (targetVal > 0) {
                if (userVal % targetVal !== 0) {
                  multipleMatch = false;
                } else {
                  const currentFactor = userVal / targetVal;
                  if (factor === null) factor = currentFactor;
                  else if (factor !== currentFactor) multipleMatch = false;
                }
              }
            });

            if (multipleMatch && factor > 1) {
              isMultiple = true;
              isCorrect = false;
            } else {
              isCorrect = false;
            }
          }
        }

        if (isCorrect) {
          fb.innerHTML = config.feedback_right || 'The charges cancel, and the ratio is the simplest whole-number ratio.';
          fb.className = 'w-feedback correct';
        } else if (isMultiple) {
          fb.innerHTML = 'The charges cancel, but this is not the simplest whole-number ratio. Reduce the counts.';
          fb.className = 'w-feedback wrong';
        } else {
          fb.innerHTML = config.feedback_wrong || 'The charges do not cancel yet. Check the charges and try again.';
          fb.className = 'w-feedback wrong';
        }

        if (config.reveal) {
          revealArea.innerHTML = config.reveal;
          revealArea.style.display = 'block';
          revealArea.classList.add('show');
          initWidgets();
          initMotionPrimitives();
        }
        commitDone(el, 'construct-validate', widgetIdx);
      },
      (cBtn, rBtn, fb) => {
        el.removeAttribute('data-committed');
        state.committed = false;
        config.items.forEach(item => {
          state.counts[item.id] = 0;
        });
        cBtn.setAttribute('disabled', 'true');
        revealArea.style.display = 'none';
        revealArea.classList.remove('show');
        revealArea.innerHTML = '';
        renderPool();
        updateValidation();
      }
    );

    renderPool();
    updateValidation();

    if (StorageEngine.isCheckpointCompleted('construct-validate', widgetIdx)) {
      state.committed = true;
      el.dataset.committed = 'true';
      checkBtn.style.display = 'none';
      resetBtn.style.display = '';

      if (config.targetRatio) {
        config.items.forEach(item => {
          state.counts[item.id] = config.targetRatio[item.id] || 0;
        });
      }

      renderPool();
      updateValidation();

      feedback.innerHTML = config.feedback_right || 'The charges cancel.';
      feedback.className = 'w-feedback correct';

      if (config.reveal) {
        revealArea.innerHTML = config.reveal;
        revealArea.style.display = 'block';
        revealArea.classList.add('show');
      }
    }
  }


  /* ============================================================
     MOTION PRIMITIVES - STEP, SCRUB, ZOOM CONTROLLERS
     ============================================================ */

  // Global registries for scrub redraw functions
  window.GC_SCRUB_FN = window.GC_SCRUB_FN || {};

  function initMotionPrimitives() {
    // 1. Step Controller (data-motion="step")
    $$('[data-motion="step"]').forEach((el, idx) => {
      if (el.dataset.motionInitialized) return;
      el.dataset.motionInitialized = 'true';
      initStepPrimitive(el, idx);
    });

    // 2. Scrub Controller (data-motion="scrub")
    $$('[data-motion="scrub"]').forEach((el, idx) => {
      if (el.dataset.motionInitialized) return;
      el.dataset.motionInitialized = 'true';
      initScrubPrimitive(el, idx);
    });

    // 3. Zoom Stage (data-motion="zoom")
    $$('[data-motion="zoom"]').forEach((el, idx) => {
      if (el.dataset.motionInitialized) return;
      el.dataset.motionInitialized = 'true';
      initZoomPrimitive(el, idx);
    });
  }

  // --- 1. Step controller implementation ---
  function initStepPrimitive(el, idx) {
    const stepCount = parseInt(el.dataset.stepCount) || 1;
    const stepStart = parseInt(el.dataset.stepStart) || 1;
    const labelsStr = el.dataset.stepLabels || '';
    const labels = labelsStr ? labelsStr.split('|') : [];

    el.classList.add('step-container');

    // Build a fixed-height stage so all frames crossfade in the same spot
    // instead of stacking in normal document flow. Measure each frame's
    // natural height BEFORE moving it (while still in flow, unstyled),
    // then move every frame into the stage and size the stage to the
    // tallest one so the frame never jumps or reserves extra dead space.
    const frames = Array.from(el.querySelectorAll('[data-step]'));
    const stage = document.createElement('div');
    stage.className = 'step-stage';
    el.insertBefore(stage, el.firstChild);

    let maxHeight = 0;
    const oldParents = new Set();
    frames.forEach(f => {
      maxHeight = Math.max(maxHeight, f.getBoundingClientRect().height);
      if (f.parentElement && f.parentElement !== el) oldParents.add(f.parentElement);
      stage.appendChild(f);
    });

    const recalibrateStageHeight = () => {
      let maxH = maxHeight;
      const stageW = stage.getBoundingClientRect().width || el.getBoundingClientRect().width;
      if (stageW > 0) {
        frames.forEach(f => {
          const svg = f.querySelector('svg');
          if (svg && svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width > 0) {
            const vb = svg.viewBox.baseVal;
            const computedSvgH = (stageW * vb.height) / vb.width;
            const cap = f.querySelector('.diagram-cap');
            const capH = cap ? (cap.offsetHeight || 36) : 0;
            maxH = Math.max(maxH, computedSvgH + capH);
          } else {
            maxH = Math.max(maxH, f.offsetHeight || 0, f.scrollHeight || 0);
          }
        });
      }
      if (maxH > 0) stage.style.height = `${Math.ceil(maxH)}px`;
    };

    recalibrateStageHeight();
    window.addEventListener('resize', recalibrateStageHeight);

    // Clean up now-empty wrapper elements the frames used to live in.
    oldParents.forEach(p => {
      if (p !== stage && !p.contains(stage) && p.children.length === 0 && !p.textContent.trim()) {
        p.remove();
      }
    });

    let currentStep = stepStart;

    // Render controls panel at the bottom
    const controls = document.createElement('div');
    controls.className = 'step-controls';
    controls.setAttribute('role', 'toolbar');
    
    let dotsHtml = '';
    for (let i = 1; i <= stepCount; i++) {
      dotsHtml += `<span class="step-dot" role="tab" aria-selected="${i === currentStep}" data-step-dot-idx="${i}" tabindex="0"></span>`;
    }

    controls.innerHTML = `
      <button class="step-btn step-prev" type="button" aria-label="Previous step">&larr;</button>
      <div class="step-dots" role="tablist">
        ${dotsHtml}
      </div>
      <button class="step-btn step-next" type="button" aria-label="Next step">&rarr;</button>
      <span class="step-label-text"></span>
    `;
    el.appendChild(controls);

    const prevBtn = $('.step-prev', controls);
    const nextBtn = $('.step-next', controls);
    const labelText = $('.step-label-text', controls);
    const dots = $$('.step-dot', controls);

    const updateStepState = (newStep) => {
      currentStep = Math.max(1, Math.min(stepCount, newStep));

      // Toggle active classes on children
      const layers = el.querySelectorAll('[data-step]');
      layers.forEach(l => {
        const stepNum = parseInt(l.dataset.step);
        if (stepNum === currentStep) {
          l.classList.add('active');
        } else {
          l.classList.remove('active');
        }
      });

      // Update dots
      dots.forEach((dot, dIdx) => {
        if (dIdx + 1 === currentStep) {
          dot.classList.add('active');
          dot.setAttribute('aria-selected', 'true');
        } else {
          dot.classList.remove('active');
          dot.setAttribute('aria-selected', 'false');
        }
      });

      // Update button disabled state
      prevBtn.disabled = (currentStep === 1);
      nextBtn.disabled = (currentStep === stepCount);

      // Update label
      if (labels[currentStep - 1]) {
        labelText.textContent = labels[currentStep - 1];
      } else {
        labelText.textContent = `Step ${currentStep} of ${stepCount}`;
      }

      markCheckpointCompleted('step-motion', idx);
    };

    // Click handlers
    prevBtn.addEventListener('click', () => updateStepState(currentStep - 1));
    nextBtn.addEventListener('click', () => updateStepState(currentStep + 1));
    
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const targetStep = parseInt(dot.dataset.stepDotIdx);
        updateStepState(targetStep);
      });
      dot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          updateStepState(parseInt(dot.dataset.stepDotIdx));
        }
      });
    });

    // Keyboard navigation on container
    el.setAttribute('tabindex', '0');
    el.addEventListener('keydown', (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        updateStepState(currentStep - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        updateStepState(currentStep + 1);
      }
    });

    // Initial state setup
    updateStepState(currentStep);
  }

  // --- 2. Scrub controller implementation ---
  function initScrubPrimitive(el, idx) {
    const fnName = el.dataset.scrubFn;
    const min = parseFloat(el.dataset.scrubMin) || 0;
    const max = parseFloat(el.dataset.scrubMax) || 100;
    const step = parseFloat(el.dataset.scrubStep) || 1;
    const valInitial = parseFloat(el.dataset.scrubValue) || min;
    const label = el.dataset.scrubLabel || '';
    const marksStr = el.dataset.scrubMarks || '';
    const targetVal = el.dataset.scrubTarget ? parseFloat(el.dataset.scrubTarget) : null;

    el.classList.add('scrub-container');

    // Label and Readout header
    const labelRow = document.createElement('div');
    labelRow.className = 'scrub-label-row';
    labelRow.innerHTML = `
      <span class="scrub-label">${label}</span>
      <span class="scrub-value-readout">${valInitial.toFixed(2)}</span>
    `;
    el.appendChild(labelRow);

    const valueReadout = $('.scrub-value-readout', labelRow);

    // Slider wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'scrub-slider-wrapper';
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'scrub-slider';
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = valInitial;
    wrapper.appendChild(slider);
    el.appendChild(wrapper);

    // Labeled tick marks
    if (marksStr) {
      const marksDiv = document.createElement('div');
      marksDiv.className = 'scrub-marks';
      const marks = marksStr.split('|');
      marks.forEach(m => {
        const parts = m.split(':');
        const mVal = parseFloat(parts[0]);
        const mLabel = parts[1] || '';
        const pct = ((mVal - min) / (max - min)) * 100;

        const markSpan = document.createElement('span');
        markSpan.className = 'scrub-mark';
        markSpan.textContent = mLabel;
        markSpan.style.left = `${pct}%`;
        if (pct <= 0) {
          markSpan.style.transform = 'translateX(0)';
        } else if (pct >= 100) {
          markSpan.style.transform = 'translateX(-100%)';
        }
        marksDiv.appendChild(markSpan);
      });
      el.appendChild(marksDiv);
    }

    // Target task prompt
    let targetMsg = null;
    if (targetVal !== null) {
      targetMsg = document.createElement('div');
      targetMsg.className = 'scrub-target-msg';
      targetMsg.innerHTML = `Target: Match the value <b>${targetVal.toFixed(2)}</b> by dragging the slider.`;
      el.appendChild(targetMsg);
    }

    const handleScrubUpdate = (val) => {
      valueReadout.textContent = val.toFixed(2);

      // Run registered draw function
      if (fnName && window.GC_SCRUB_FN[fnName]) {
        try {
          window.GC_SCRUB_FN[fnName](el, val);
        } catch (e) {
          console.error(`Error in scrub draw function '${fnName}':`, e);
        }
      }

      // Check target threshold (within 5% of range tolerance)
      if (targetVal !== null) {
        const tolerance = (max - min) * 0.05;
        const matched = Math.abs(val - targetVal) <= tolerance;

        if (matched) {
          slider.classList.add('at-target');
          if (targetMsg) {
            targetMsg.textContent = `Target matched. Value: ${val.toFixed(2)}`;
            targetMsg.classList.add('completed');
          }
          markCheckpointCompleted('scrub-motion', idx);
        } else {
          slider.classList.remove('at-target');
          if (targetMsg) {
            targetMsg.innerHTML = `Target: Match the value <b>${targetVal.toFixed(2)}</b> by dragging the slider.`;
            targetMsg.classList.remove('completed');
          }
        }
      }
    };

    slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      handleScrubUpdate(val);
    });

    slider.addEventListener('keydown', (e) => {
      if (e.key === 'Home') {
        slider.value = min;
        handleScrubUpdate(min);
      } else if (e.key === 'End') {
        slider.value = max;
        handleScrubUpdate(max);
      }
    });

    handleScrubUpdate(valInitial);
  }

  // --- 3. Zoom stage implementation ---
  function initZoomPrimitive(el, idx) {
    const levelsCount = parseInt(el.dataset.zoomLevels) || 2;
    const labelsStr = el.dataset.zoomLabels || '';
    const labels = labelsStr ? labelsStr.split('|') : [];
    const anchorStr = el.dataset.zoomAnchor || '50,50,15';
    const anchor = anchorStr.split(',').map(parseFloat);

    el.classList.add('zoom-stage');

    const layers = {
      macro: el.querySelector('[data-zoom-level="macro"]'),
      meso: el.querySelector('[data-zoom-level="meso"]'),
      particulate: el.querySelector('[data-zoom-level="particulate"]')
    };

    // Each level must carry this class so the CSS absolute-position +
    // opacity/visibility crossfade rules actually apply - without it every
    // level renders in normal flow at full opacity (they just stack).
    Object.values(layers).forEach(layer => {
      if (layer) layer.classList.add('zoom-level-layer');
    });

    if (layers.macro) {
      const svg = layers.macro.querySelector('svg');
      if (svg) {
        const zoomRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        zoomRing.setAttribute('cx', anchor[0]);
        zoomRing.setAttribute('cy', anchor[1]);
        zoomRing.setAttribute('r', anchor[2] || 15);
        zoomRing.setAttribute('class', 'zoom-ring');
        zoomRing.style.transformOrigin = `${anchor[0]}px ${anchor[1]}px`;
        svg.appendChild(zoomRing);
      }
    }

    const rail = document.createElement('div');
    rail.className = 'zoom-rail';
    rail.setAttribute('role', 'tablist');
    rail.setAttribute('aria-label', 'Scale levels');

    const levelKeys = levelsCount === 3 ? ['macro', 'meso', 'particulate'] : ['macro', 'particulate'];
    const defaultLabels = { macro: '🔍 Out', meso: '🔎 Mid', particulate: '🔬 In' };

    levelKeys.forEach((key, lIdx) => {
      const btn = document.createElement('button');
      btn.className = 'zoom-rail-btn';
      btn.type = 'button';
      btn.textContent = labels[lIdx] || defaultLabels[key];
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', lIdx === 0 ? 'true' : 'false');
      btn.dataset.zoomKey = key;

      btn.addEventListener('click', () => {
        updateZoomLevel(key);
      });
      rail.appendChild(btn);
    });
    el.appendChild(rail);

    const updateZoomLevel = (activeKey) => {
      levelKeys.forEach(key => {
        const layer = layers[key];
        if (!layer) return;

        const btn = rail.querySelector(`[data-zoom-key="${key}"]`);

        if (key === activeKey) {
          layer.classList.add('active');
          if (btn) {
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
          }
        } else {
          layer.classList.remove('active');
          if (btn) {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
          }
        }
      });

      if (activeKey === 'particulate' && layers.macro) {
        const svg = layers.macro.querySelector('svg');
        if (svg) {
          const factor = 4;
          svg.style.transformOrigin = `${anchor[0]}px ${anchor[1]}px`;
          svg.style.transform = `scale(${factor})`;
        }
      } else if (layers.macro) {
        const svg = layers.macro.querySelector('svg');
        if (svg) {
          svg.style.transform = 'none';
        }
      }

      markCheckpointCompleted('zoom-motion', idx);
    };

    updateZoomLevel('macro');
  }

  // Register dummy scrub drawing functions
  window.GC_SCRUB_FN['dummy-scale'] = function (container, value) {
    const svg = container.querySelector('svg');
    const shape = svg ? svg.querySelector('.scrub-shape') : null;
    if (shape) {
      shape.setAttribute('transform', `scale(${value})`);
      shape.style.transformOrigin = '50px 50px';
    }
  };

  window.GC_SCRUB_FN['den-cloud'] = function (container, value) {
    const svg = container.querySelector('svg');
    const atomL = svg ? svg.querySelector('.atom-l') : null;
    const atomR = svg ? svg.querySelector('.atom-r') : null;
    const cloud = svg ? svg.querySelector('.cloud-gradient') : null;

    let bondType = 'Nonpolar Covalent (Equal Sharing)';
    let bondColor = 'var(--good)';
    let chargeLText = '';
    let chargeRText = '';

    if (value < 0.5) {
      bondType = 'Nonpolar Covalent (Equal Sharing)';
      bondColor = 'var(--good)';
    } else if (value < 1.7) {
      bondType = 'Polar Covalent (Unequal Sharing)';
      bondColor = 'var(--accent)';
      chargeLText = 'δ+';
      chargeRText = 'δ−';
    } else {
      bondType = 'Ionic (Electron Transfer)';
      bondColor = 'var(--cool)';
      chargeLText = '+';
      chargeRText = '−';
    }

    if (cloud) {
      const shift = 50 + (value / 3.5) * 30;
      cloud.setAttribute('cx', `${shift}%`);
    }

    if (atomL && atomR) {
      const chargeL = svg.querySelector('.charge-l');
      const chargeR = svg.querySelector('.charge-r');
      if (chargeL && chargeR) {
        chargeL.textContent = chargeLText;
        chargeR.textContent = chargeRText;
      }
    }

    // Live Bond Type Readout inside SVG
    let svgStatus = svg ? svg.querySelector('.svg-bond-status') : null;
    if (svg && !svgStatus) {
      svgStatus = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      svgStatus.setAttribute('class', 'svg-bond-status');
      svgStatus.setAttribute('x', '100');
      svgStatus.setAttribute('y', '88');
      svgStatus.setAttribute('text-anchor', 'middle');
      svgStatus.setAttribute('font-family', 'var(--display)');
      svgStatus.setAttribute('font-weight', '700');
      svgStatus.style.fontSize = '9.5px';
      svg.appendChild(svgStatus);
    }
    if (svgStatus) {
      svgStatus.textContent = bondType;
      svgStatus.setAttribute('fill', bondColor);
    }

    // Live Bond Type badge in header row
    let htmlBadge = container.querySelector('.scrub-bond-badge');
    if (!htmlBadge) {
      const labelRow = container.querySelector('.scrub-label-row');
      if (labelRow) {
        htmlBadge = document.createElement('span');
        htmlBadge.className = 'scrub-bond-badge';
        htmlBadge.style.cssText = 'font-family:var(--mono);font-size:0.75rem;padding:0.2rem 0.6rem;border-radius:4px;font-weight:600;margin-left:auto;letter-spacing:0.02em;';
        labelRow.appendChild(htmlBadge);
      }
    }
    if (htmlBadge) {
      htmlBadge.textContent = bondType;
      htmlBadge.style.color = bondColor;
      htmlBadge.style.background = `color-mix(in srgb, ${bondColor} 12%, transparent)`;
      htmlBadge.style.border = `1px solid color-mix(in srgb, ${bondColor} 30%, transparent)`;
    }
  };

  window.GC_SCRUB_FN['imf-cooling-curve'] = function (container, value) {
    const svg = container.querySelector('svg');
    const curve = svg ? svg.querySelector('.imf-curve') : null;
    const label = svg ? svg.querySelector('.imf-curve-label') : null;
    if (!curve) return;

    const t = Math.max(0, Math.min(100, value)) / 100;
    // Interpolates between hexane's steep drop (t=0) and water's shallow drop (t=1)
    const endY = 172 - t * (172 - 95);
    const midY = 130 - t * (130 - 90);
    curve.setAttribute('d', `M50 80 Q 150 ${midY.toFixed(1)}, 350 ${endY.toFixed(1)}`);

    let regime, color;
    if (value < 33) {
      regime = 'London dispersion only: weak, fast evaporation';
      color = 'var(--accent)';
    } else if (value < 67) {
      regime = 'Dipole-dipole: moderate';
      color = 'var(--ink-soft)';
    } else {
      regime = 'Hydrogen bonding: strong, slow evaporation';
      color = 'var(--cool)';
    }
    curve.setAttribute('stroke', color);
    if (label) {
      label.setAttribute('y', (endY - 8).toFixed(1));
      label.setAttribute('fill', color);
      label.textContent = regime;
    }
  };


  /* ============================================================
     PRINT / PDF EXPORT - see INTERACTION_SPEC.md 3.6
     Every registered widget type brings a print function. It reads the
     widget's config and returns a detached .print-only block with the prompt
     and, after it, the answer. It never touches the live widget and never
     marks a checkpoint.
     ============================================================ */

  function firstAnswer(answer) {
    return Array.isArray(answer) ? answer[0] : answer;
  }

  function makePrintOnly(tag, className) {
    const node = document.createElement(tag);
    node.className = 'print-only' + (className ? ' ' + className : '');
    return node;
  }

  function printBlock() {
    return makePrintOnly('div', 'w-print-static');
  }

  function renderPrintOption(opt) {
    const item = document.createElement('div');
    item.className = 'w-print-item';
    const optEl = document.createElement('div');
    optEl.className = 'w-opt correct';
    optEl.innerHTML = '✓ ' + opt.label;
    item.appendChild(optEl);
    if (opt.feedback) {
      const fb = document.createElement('div');
      fb.className = 'w-print-feedback';
      fb.innerHTML = opt.feedback || '';
      item.appendChild(fb);
    }
    return item;
  }

  function printLabel(text) {
    const label = document.createElement('div');
    label.className = 'w-print-label';
    label.textContent = text;
    return label;
  }

  // Resolve any [data-widget] found inside HTML this print pass injects
  // (a widget's `reveal`/`finale` config can itself contain a nested widget).
  function resolveNestedWidgetsForPrint(container) {
    $$('[data-widget]', container).forEach(nested => {
      const printed = renderWidgetPrint(nested);
      if (printed) nested.replaceWith(printed);
    });
  }

  function appendRevealHtml(block, html) {
    if (!html) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    resolveNestedWidgetsForPrint(wrap);
    block.appendChild(wrap);
  }

  function printPrompt(block, html) {
    const prompt = document.createElement('div');
    prompt.className = 'w-prompt';
    prompt.innerHTML = html || '';
    block.appendChild(prompt);
  }

  // A prompt the lesson authored in the page (diagnose-error, construct-validate).
  function printAuthoredPrompt(block, el) {
    const prompt = $('.w-prompt', el);
    if (prompt) {
      const copy = prompt.cloneNode(true);
      block.appendChild(copy);
    }
  }

  function printCommitReveal(el, config) {
    const block = printBlock();
    const mode = config.mode || 'choice';
    printPrompt(block, config.prompt);

    if (mode === 'choice') {
      (config.options || []).filter(o => o.correct).forEach(opt => block.appendChild(renderPrintOption(opt)));
      appendRevealHtml(block, config.reveal);
    } else if (mode === 'free') {
      block.appendChild(printLabel('Model answer'));
      appendRevealHtml(block, config.reveal);
    } else if (mode === 'drill') {
      (config.items || []).forEach(item => {
        const q = document.createElement('div');
        q.className = 'w-print-item';
        q.innerHTML = '<p>' + item.prompt + '</p>';
        block.appendChild(q);
        const correctOpt = (item.options || []).find(o => o.correct);
        if (correctOpt) block.appendChild(renderPrintOption(correctOpt));
      });
      appendRevealHtml(block, config.reveal);
    }
    return block;
  }

  function printFadedExample(el, config) {
    const block = printBlock();
    block.appendChild(printLabel((config.yours && config.yours.title) || 'Your steps'));

    const ol = document.createElement('ol');
    ol.className = 'faded-steps';
    ((config.yours && config.yours.steps) || []).forEach(step => {
      const li = document.createElement('li');
      const labelHtml = '<span class="step-label">' + step.label + '</span>';
      if (step.given !== undefined) {
        li.innerHTML = labelHtml + '<div class="step-work">' + step.given + '</div>';
      } else if (step.blank) {
        const blank = step.blank;
        const answerText = blank.type === 'choice' ? blank.answer : firstAnswer(blank.answer);
        li.innerHTML = labelHtml;
        const work = document.createElement('div');
        work.className = 'step-work';
        const ansSpan = document.createElement('span');
        ansSpan.className = 'w-opt correct';
        ansSpan.textContent = answerText;
        work.appendChild(ansSpan);
        li.appendChild(work);
      }
      ol.appendChild(li);
    });
    block.appendChild(ol);
    return block;
  }

  function printScaffold(el, config) {
    const block = printBlock();
    const mode = config.mode || 'free';
    if (mode === 'bank') {
      (config.slots || []).forEach(slot => {
        const card = (config.bank || []).find(c => c.slot === slot.id);
        const item = document.createElement('div');
        item.className = 'w-print-item';
        const ansDiv = document.createElement('div');
        ansDiv.className = 'w-opt correct';
        ansDiv.textContent = card ? card.text : '';
        item.appendChild(printLabel(slot.label));
        item.appendChild(ansDiv);
        block.appendChild(item);
      });
    } else if (mode === 'table') {
      const wrapper = document.createElement('div');
      wrapper.className = 'w-table-wrapper';
      const tbl = document.createElement('table');
      tbl.className = 'w-table';
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      (config.table.headers || []).forEach(h => { headerRow.innerHTML += '<th>' + h + '</th>'; });
      thead.appendChild(headerRow);
      tbl.appendChild(thead);
      const tbody = document.createElement('tbody');
      (config.table.rows || []).forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
          const td = document.createElement('td');
          if (cell.given !== undefined) {
            td.innerHTML = cell.given;
          } else if (cell.blank) {
            const span = document.createElement('span');
            span.className = 'w-opt correct';
            span.textContent = firstAnswer(cell.blank.answer);
            td.appendChild(span);
          }
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      tbl.appendChild(tbody);
      wrapper.appendChild(tbl);
      block.appendChild(wrapper);
    } else {
      (config.slots || []).forEach(slot => {
        const item = document.createElement('div');
        item.className = 'w-print-item';
        const modelP = document.createElement('p');
        modelP.innerHTML = slot.model;
        item.appendChild(printLabel(slot.label));
        item.appendChild(modelP);
        block.appendChild(item);
      });
    }
    return block;
  }

  function printStepBuilder(el, config) {
    const block = printBlock();
    (config.steps || []).forEach(step => {
      const q = document.createElement('div');
      q.className = 'w-print-item';
      q.innerHTML = '<p>' + step.question + '</p>';
      block.appendChild(q);
      const correctOpt = (step.options || []).find(o => o.correct);
      if (correctOpt) block.appendChild(renderPrintOption(correctOpt));
    });
    appendRevealHtml(block, config.finale);
    return block;
  }

  function printSortClassify(el, config) {
    const block = printBlock();
    (config.items || []).forEach(item => {
      const q = document.createElement('div');
      q.className = 'w-print-item';
      q.innerHTML = '<p>' + item.text + '</p>';
      block.appendChild(q);
      const cat = (config.categories || []).find(c => c.id === item.category);
      if (cat) {
        const opt = document.createElement('div');
        opt.className = 'w-opt correct';
        opt.textContent = '✓ ' + cat.label;
        block.appendChild(opt);
      }
    });
    appendRevealHtml(block, config.reveal);
    return block;
  }

  // New in the shared runtime (chem printed no block for this type).
  function printPredictRun(el, config) {
    const block = printBlock();
    printPrompt(block, config.prompt);
    if ((config.predictionType || 'choice') === 'choice') {
      (config.options || []).filter(o => o.correct).forEach(opt => block.appendChild(renderPrintOption(opt)));
    } else {
      block.appendChild(printLabel('Your prediction'));
    }
    appendRevealHtml(block, config.reveal);
    return block;
  }

  // New in the shared runtime. The prompt and the equation are authored in the page.
  function printDiagnoseError(el, config) {
    const block = printBlock();
    printAuthoredPrompt(block, el);
    const work = $('.w-workspace', el);
    if (work) block.appendChild(work.cloneNode(true));
    const correct = (config.spots || []).find(s => s.correct);
    if (correct) {
      const item = document.createElement('div');
      item.className = 'w-print-item';
      item.appendChild(printLabel('The error'));
      const fb = document.createElement('div');
      fb.innerHTML = correct.feedback || '';
      item.appendChild(fb);
      block.appendChild(item);
    }
    appendRevealHtml(block, config.reveal);
    return block;
  }

  // New in the shared runtime. The prompt is authored in the page.
  function printConstructValidate(el, config) {
    const block = printBlock();
    printAuthoredPrompt(block, el);
    const target = config.targetRatio || {};
    const parts = (config.items || []).filter(i => target[i.id]).map(i => target[i.id] + ' &times; ' + i.label);
    if (parts.length) {
      const item = document.createElement('div');
      item.className = 'w-print-item';
      item.appendChild(printLabel('The answer'));
      const ans = document.createElement('div');
      ans.innerHTML = parts.join(', ');
      item.appendChild(ans);
      if (config.feedback_right) {
        const fb = document.createElement('div');
        fb.className = 'w-print-feedback';
        fb.innerHTML = config.feedback_right;
        item.appendChild(fb);
      }
      block.appendChild(item);
    }
    appendRevealHtml(block, config.reveal);
    return block;
  }

  // Pure renderer: reads a widget's .w-config JSON and returns a detached
  // .print-only block with its prompt, answer and model content unrolled.
  function renderWidgetPrint(el) {
    const configEl = $('.w-config', el);
    if (!configEl) return null;
    let config;
    try { config = JSON.parse(configEl.textContent); } catch (e) { return null; }
    const entry = registry[el.dataset.widget];
    if (!entry || typeof entry.print !== 'function') return null;
    return entry.print(el, config);
  }

  /* ---- register the eight types ---- */
  TB.widgets.register('commit-reveal', initCommitReveal, printCommitReveal);
  TB.widgets.register('faded-example', initFadedExample, printFadedExample);
  TB.widgets.register('scaffold', initScaffold, printScaffold);
  TB.widgets.register('step-builder', initStepBuilder, printStepBuilder);
  TB.widgets.register('sort-classify', initSortClassify, printSortClassify);
  TB.widgets.register('predict-run', initPredictRun, printPredictRun);
  TB.widgets.register('diagnose-error', initDiagnoseError, printDiagnoseError);
  TB.widgets.register('construct-validate', initConstructValidate, printConstructValidate);

  /* ---- print hook: core.js calls this when the page goes to print ---- */
  if (TB.print && TB.print.hook) {
    TB.print.hook(function (undo) {
      // open faded-example model panels (real <details>, CSS can't do this)
      $$('details.faded-model-collapsible').forEach(d => {
        if (d.open) return;
        d.open = true;
        undo(() => { d.open = false; });
      });

      // one static print block per widget
      $$('[data-widget]').forEach(el => {
        const printed = renderWidgetPrint(el);
        if (!printed) return;
        el.appendChild(printed);
        undo(() => printed.remove());
      });

      // caption step and zoom frames (after the widgets, so nested reveal content is covered)
      $$('[data-motion="step"]').forEach(container => {
        const labels = (container.dataset.stepLabels || '').split('|').filter(Boolean);
        $$('[data-step]', container).forEach(frame => {
          const stepNum = parseInt(frame.dataset.step, 10);
          const label = labels[stepNum - 1] || ('Step ' + stepNum);
          const cap = makePrintOnly('div', 'print-step-caption');
          cap.textContent = 'Step ' + stepNum + ': ' + label;
          frame.insertBefore(cap, frame.firstChild);
          undo(() => cap.remove());
        });
      });

      $$('[data-motion="zoom"]').forEach(container => {
        const labels = (container.dataset.zoomLabels || '').split('|').filter(Boolean);
        const defaultLabels = { macro: 'Out', meso: 'Mid', particulate: 'In' };
        ['macro', 'meso', 'particulate'].forEach((key, i) => {
          const layer = container.querySelector('[data-zoom-level="' + key + '"]');
          if (!layer) return;
          const cap = makePrintOnly('div', 'print-zoom-caption');
          cap.textContent = labels[i] || defaultLabels[key];
          layer.insertBefore(cap, layer.firstChild);
          undo(() => cap.remove());
        });
      });
    });
  }

  initWidgets();
  initMotionPrimitives();
})();
