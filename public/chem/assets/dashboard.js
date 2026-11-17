/* ============================================================
   GEN CHEM: DASHBOARD SCRIPT
   Moved verbatim out of index.html (lesson list from lessons.json, progress rings,
   spaced-repetition due list, search, tabs, concept map, glossary, resources).
   The theme toggle now lives in the shared top bar. Zero em-dashes.
   ============================================================ */
(function () {
'use strict';
// Dynamic Runtime Manifest Data
let MANIFEST_DATA = { lessons: [], resources: {}, glossary: [] };

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// A term's glossary key. The search (below) used this without defining it, so a search that
// reached the glossary threw; defining it here fixes that (found by lint in 4c stage 1).
const termSlug = t => t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

// DOM Utilities
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

// Storage Engine (sandboxed-safe virtualization)
const StorageEngine = (function () {
  let storageType = null;
  let fallbackDict = {};

  function checkStorage(type) {
    try {
      const storage = window[type];
      const x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return false;
    }
  }

  if (checkStorage('localStorage')) {
    storageType = 'localStorage';
  } else if (checkStorage('sessionStorage')) {
    storageType = 'sessionStorage';
  } else {
    storageType = 'memory';
  }

  const getItem = (key) => {
    if (storageType === 'localStorage') {
      try { return localStorage.getItem(key); } catch (e) { return null; }
    } else if (storageType === 'sessionStorage') {
      try { return sessionStorage.getItem(key); } catch (e) { return null; }
    } else {
      return fallbackDict[key] || null;
    }
  };

  const setItem = (key, value) => {
    if (storageType === 'localStorage') {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        try {
          sessionStorage.setItem(key, value);
        } catch (err) {
          fallbackDict[key] = String(value);
        }
      }
    } else if (storageType === 'sessionStorage') {
      try {
        sessionStorage.setItem(key, value);
      } catch (e) {
        fallbackDict[key] = String(value);
      }
    } else {
      fallbackDict[key] = String(value);
    }
  };

  const removeItem = (key) => {
    if (storageType === 'localStorage') {
      try { localStorage.removeItem(key); } catch (e) {}
    } else if (storageType === 'sessionStorage') {
      try { sessionStorage.removeItem(key); } catch (e) {}
    }
    delete fallbackDict[key];
  };

  const clear = () => {
    if (storageType === 'localStorage') {
      try { localStorage.clear(); } catch (e) {}
    } else if (storageType === 'sessionStorage') {
      try { sessionStorage.clear(); } catch (e) {}
    }
    fallbackDict = {};
  };

  const getProgress = () => {
    try {
      return JSON.parse(getItem('gc-textbook-progress')) || {};
    } catch (e) {
      return {};
    }
  };

  const saveProgress = (progress) => {
    setItem('gc-textbook-progress', JSON.stringify(progress));
  };

  // Clears chemistry progress ONLY. Never call clear() for this: the textbook
  // is served from the same origin as the main app, so wiping localStorage
  // would also take out the sign-in session, badges, and the theme setting.
  const clearProgress = () => {
    removeItem('gc-textbook-progress');
  };

  // A checkpoint is stored either as legacy `true` or as the spaced-repetition
  // metadata object written by core.js's markCheckpointCompleted(). Anything
  // that counts completions MUST go through this, comparing against `true`
  // silently misses every modern entry. `_`-prefixed keys (_total, _resume)
  // are bookkeeping, not checkpoints.
  const isComplete = (val) => val === true || (!!val && typeof val === 'object' && val.completed === true);

  const countCompleted = (lessonProgress) =>
    Object.keys(lessonProgress || {}).filter(k => k[0] !== '_' && isComplete(lessonProgress[k])).length;

  return {
    getItem,
    setItem,
    removeItem,
    clear,
    clearProgress,
    getProgress,
    saveProgress,
    isComplete,
    countCompleted
  };
})();

// Tab Switching Logic
$$('.dashboard-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    $$('.dashboard-tab').forEach(t => t.classList.remove('active'));
    $$('.dashboard-panel').forEach(p => p.classList.remove('active'));
    
    tab.classList.add('active');
    $(`#panel-${tab.dataset.panel}`).classList.add('active');
    
    // Reset search filter when switching tabs
    $('#searchInput').value = '';
    filterItems('');

    if (tab.dataset.panel === 'cram-mode') {
      loadCramModeData();
    } else if (tab.dataset.panel === 'practice-review') {
      initPracticeReview();
    }
  });
});
// Dynamic Lesson Cards Renderer
function renderLessonCards(lessons) {
  const byUnit = {};
  (lessons || []).forEach(l => {
    const u = String(l.unit || '1');
    if (!byUnit[u]) byUnit[u] = [];
    byUnit[u].push(l);
  });

  document.querySelectorAll('[data-unit-grid]').forEach(container => {
    const unitId = container.getAttribute('data-unit-grid');
    const unitLessons = byUnit[unitId] || [];
    container.innerHTML = unitLessons.map(lesson => {
      const pes = (lesson.pes || []).join(', ');
      const firstPe = (lesson.pes && lesson.pes[0]) || '';
      const searchAttr = `${lesson.id} ${lesson.title.toLowerCase()} ${(lesson.pes || []).join(' ').toLowerCase()} unit ${lesson.unit} ${lesson.description.toLowerCase()}`;
      return `
      <a href="lessons/${lesson.slug}.html" class="lesson-card" data-lesson-id="${lesson.id}" data-pe="${firstPe}" data-unit="${lesson.unit}" data-search="${escapeHtml(searchAttr)}">
        <div class="lesson-card-top">
          <div class="lesson-card-header">
            <span class="lesson-badge">${lesson.id}</span>
            <span class="lesson-status-badge not-started" id="status-${lesson.id}">Not Started</span>
          </div>
          <h3>${escapeHtml(lesson.title)}</h3>
          <span class="lesson-pes">${pes ? escapeHtml(pes) + ' &middot; ' : ''}Unit ${lesson.unit}</span>
          <p class="lesson-desc">${escapeHtml(lesson.description)}</p>
        </div>
        <div class="lesson-card-bottom">
          <div class="lesson-progress-container">
            <div class="lesson-progress-meta">
              <span>Progress</span>
              <span id="text-${lesson.id}">Not started</span>
            </div>
            <div class="lesson-progress-bar-bg">
              <div class="lesson-progress-bar" id="bar-${lesson.id}"></div>
            </div>
          </div>
        </div>
      </a>
      `;
    }).join('');
  });
}

// Generate Glossary Cards alphabetically with dynamic section anchoring.
// Display text comes from GC_GLOSSARY (assets/glossary.js), the same
// definitions students see in lesson tooltips, while MANIFEST_DATA.glossary
// supplies where each term lives. Variant forms that resolve to the same
// canonical entry (e.g. singular + plural) merge into one card. The
// embedded term/definition text is only a fallback for unresolved slugs.
function renderGlossaryCards(glossaryList) {
  const glossaryGrid = $('#glossaryGrid');
  if (!glossaryGrid) return;
  glossaryGrid.innerHTML = '';
  const termSlug = t => t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  const glossaryGroups = new Map();
  (glossaryList || []).forEach(g => {
    const entry = (typeof GC_GLOSSARY !== 'undefined' && GC_GLOSSARY[termSlug(g.term)]) || null;
    const key = entry ? entry.term : g.term;
    if (!glossaryGroups.has(key)) {
      glossaryGroups.set(key, { term: key, definition: entry ? entry.definition : g.definition, locations: [] });
    }
    glossaryGroups.get(key).locations.push(g);
  });

  [...glossaryGroups.values()].sort((a, b) => a.term.localeCompare(b.term)).forEach(group => {
    const links = group.locations.map(g => {
      const lesson = (MANIFEST_DATA.lessons || []).find(l => l.id === g.lessonId);
      const url = lesson ? `lessons/${lesson.slug}.html#${g.sectionId}` : '#';
      const lessonName = lesson ? lesson.id : g.lessonId;
      return `<a href="${url}" class="glossary-link">Found in Lesson ${lessonName} &rarr;</a>`;
    }).join('');
    const lessonNames = group.locations.map(g => g.lessonId).join(' ');

    const card = document.createElement('div');
    card.className = 'glossary-card';
    card.setAttribute('data-search', `${group.term} ${group.definition} ${lessonNames}`);
    card.innerHTML = `
      <div class="glossary-card-top">
        <div class="glossary-term">${group.term}</div>
        <div class="glossary-definition">${group.definition}</div>
      </div>
      ${links}
    `;
    glossaryGrid.appendChild(card);
  });
}

// Generate Resources dynamically (excluding Gizmos & practice worksheets)
function renderResources(unit, containerPrefix) {
  const videosList = $(`#${containerPrefix}-videos-list`);
  const textsList = $(`#${containerPrefix}-texts-list`);
  if (!videosList || !textsList) return;
  
  const resources = MANIFEST_DATA.resources[unit] || [];
  
  // Group by category under type groups
  const groupedVideos = {};
  const groupedTextsSims = {};
  
  resources.forEach(r => {
    const catName = r.category;
    if (r.type === 'video') {
      if (!groupedVideos[catName]) groupedVideos[catName] = [];
      groupedVideos[catName].push(r);
    } else {
      // both text (Readings) and simulation (PhET) go to column 2
      if (!groupedTextsSims[catName]) groupedTextsSims[catName] = [];
      groupedTextsSims[catName].push(r);
    }
  });
  
  // Render Videos (Column 1)
  for (const [catName, items] of Object.entries(groupedVideos)) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'resource-category-group';
    
    const catTitle = document.createElement('div');
    catTitle.className = 'resource-category-title';
    if (catName === 'SciencePractice.app') {
      catTitle.innerHTML = 'SciencePractice.app<a href="https://www.sciencepractice.app" target="_blank" class="resource-category-link" style="display: block; font-size: var(--text-xs); font-weight: 500; color: var(--accent); text-decoration: underline; margin-top: 2px;">https://www.sciencepractice.app</a>';
    } else {
      catTitle.textContent = catName;
    }
    groupDiv.appendChild(catTitle);
    
    items.forEach(r => {
      const item = document.createElement('a');
      item.href = r.url;
      item.target = '_blank';
      item.className = 'resource-item';
      const peList = (r.pes || []).join(' ');
      item.setAttribute('data-search', `${r.title} ${catName} video ${peList}`);
      item.innerHTML = `
        <svg class="resource-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <div class="resource-title">${r.title}</div>
      `;
      groupDiv.appendChild(item);
    });
    videosList.appendChild(groupDiv);
  }
  
  // Render Readings & Simulations (Column 2)
  for (const [catName, items] of Object.entries(groupedTextsSims)) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'resource-category-group';
    
    const catTitle = document.createElement('div');
    catTitle.className = 'resource-category-title';
    if (catName === 'SciencePractice.app') {
      catTitle.innerHTML = 'SciencePractice.app<a href="https://www.sciencepractice.app" target="_blank" class="resource-category-link" style="display: block; font-size: var(--text-xs); font-weight: 500; color: var(--accent); text-decoration: underline; margin-top: 2px;">https://www.sciencepractice.app</a>';
    } else {
      catTitle.textContent = catName;
    }
    groupDiv.appendChild(catTitle);
    
    items.forEach(r => {
      const item = document.createElement('a');
      item.href = r.url;
      item.target = '_blank';
      item.className = 'resource-item';
      const peList = (r.pes || []).join(' ');
      item.setAttribute('data-search', `${r.title} ${catName} ${r.type} ${peList}`);
      
      let iconHtml = '';
      if (r.type === 'text') {
        iconHtml = `<svg class="resource-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`;
      } else if (r.type === 'simulation') {
        iconHtml = `<svg class="resource-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`;
      }
      
      item.innerHTML = `
        ${iconHtml}
        <div class="resource-title">${r.title}</div>
      `;
      groupDiv.appendChild(item);
    });
    textsList.appendChild(groupDiv);
  }
}

// NGSS Performance Expectations Metadata
const PE_METADATA = [
  {
    id: 'HS-PS1-1',
    title: 'HS-PS1-1: Valence Electrons & Periodic Trends',
    standard: 'Use the periodic table as a model to predict the relative properties of elements based on the patterns of electrons in the outermost energy level of atoms.'
  },
  {
    id: 'HS-PS1-2',
    title: 'HS-PS1-2: Simple Chemical Reactions & Bonding',
    standard: 'Construct and revise an explanation for the outcome of a simple chemical reaction based on the outermost electron states of atoms, trends in the periodic table, and knowledge of the patterns of chemical properties.'
  },
  {
    id: 'HS-PS1-3',
    title: 'HS-PS1-3: Electrical Forces & Intermolecular Forces',
    standard: 'Plan and conduct an investigation to gather evidence to compare the structure of substances at the bulk scale to infer the strength of electrical forces between particles.'
  },
  {
    id: 'HS-PS1-4',
    title: 'HS-PS1-4: Bond Energy & Reaction Energetics',
    standard: 'Develop a model to illustrate that the release or absorption of energy from a chemical reaction system depends upon the changes in total bond energy.'
  },
  {
    id: 'HS-PS1-5',
    title: 'HS-PS1-5: Collision Theory, Rates & Catalysis',
    standard: 'Apply scientific principles and evidence to provide an explanation about the effects of changing the temperature or concentration of the reacting particles on the rate at which a reaction occurs.'
  },
  {
    id: 'HS-PS1-6',
    title: 'HS-PS1-6: Dynamic Equilibrium & Le Chatelier',
    standard: 'Refine the design of a chemical system by specifying a change in conditions that would produce increased amounts of products at equilibrium.'
  },
  {
    id: 'HS-PS1-7',
    title: 'HS-PS1-7: Conservation of Atoms & The Mole',
    standard: 'Use mathematical representations to support the claim that atoms, and therefore mass, are conserved during a chemical reaction.'
  },
  {
    id: 'HS-PS1-8',
    title: 'HS-PS1-8: Nuclear Processes, Decay & Energy',
    standard: 'Develop models to illustrate the changes in the composition of the nucleus of the atom and the energy released during the processes of fission, fusion, and radioactive decay.'
  },
  {
    id: 'HS-PS2-6',
    title: 'HS-PS2-6: Molecular Structure & Bulk Properties',
    standard: 'Communicate scientific and technical information about why the molecular-level structure is important in the functioning of designed materials.'
  },
  {
    id: 'HS-PS3-1',
    title: 'HS-PS3-1: Computational Thermal Energy & Calorimetry',
    standard: 'Create a computational model to calculate the change in the energy of one component in a system when the change in energy of the other component(s) and energy flows in and out of the system are known.'
  },
  {
    id: 'HS-PS3-4',
    title: 'HS-PS3-4: Thermal Equilibrium in Closed Systems',
    standard: 'Plan and conduct an investigation to provide evidence that the transfer of thermal energy when two components of different temperature are combined within a closed system results in a more uniform energy distribution among the components in the system.'
  },
  {
    id: 'HS-PS4-4',
    title: 'HS-PS4-4: Electromagnetic Radiation & Matter',
    standard: 'Evaluate the validity and reliability of claims in published materials of the effects that different frequencies of electromagnetic radiation have when absorbed by matter.'
  },
  {
    id: 'HS-ESS1-1',
    title: 'HS-ESS1-1: Solar Fusion & Lifespan of the Sun',
    standard: 'Develop a model based on evidence to illustrate the life span of the sun and the role of nuclear fusion in the sun’s core to release energy that eventually reaches Earth in the form of radiation.'
  },
  {
    id: 'HS-ESS1-2',
    title: 'HS-ESS1-2: The Big Bang & Astronomical Evidence',
    standard: 'Construct an explanation of the Big Bang theory based on astronomical evidence of light spectra, motion of distant galaxies, and composition of matter in the universe.'
  },
  {
    id: 'HS-ESS1-3',
    title: 'HS-ESS1-3: Stellar Nucleosynthesis of Elements',
    standard: 'Communicate scientific ideas about the way stars, over their life cycle, produce elements.'
  }
];

function createResourceLinkHtml(r, peId, peTitle) {
  let iconHtml = '';
  if (r.type === 'video') {
    iconHtml = '<svg class="resource-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
  } else if (r.type === 'simulation') {
    iconHtml = '<svg class="resource-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>';
  } else {
    iconHtml = '<svg class="resource-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>';
  }
  const searchAttr = `${r.title} ${r.category} ${r.type} ${peId} ${peTitle}`.toLowerCase();
  return `
    <a href="${r.url}" target="_blank" class="resource-item" data-search="${searchAttr}">
      ${iconHtml}
      <div class="resource-title">${r.title}</div>
    </a>
  `;
}

function renderPEResources() {
  const container = $('#peResourcesList');
  if (!container) return;
  container.innerHTML = '';

  // Collect all unique resources across all units
  const allResources = [];
  const seenUrls = new Set();
  Object.values(MANIFEST_DATA.resources || {}).forEach(unitList => {
    (unitList || []).forEach(r => {
      if (!seenUrls.has(r.url)) {
        seenUrls.add(r.url);
        allResources.push(r);
      }
    });
  });

  PE_METADATA.forEach(peMeta => {
    const peItems = allResources.filter(r => Array.isArray(r.pes) && r.pes.includes(peMeta.id));
    if (peItems.length === 0) return;

    const sims = peItems.filter(r => r.type === 'simulation');
    const vids = peItems.filter(r => r.type === 'video');
    const texts = peItems.filter(r => r.type === 'text');

    const section = document.createElement('section');
    section.className = 'pe-resource-section';
    section.setAttribute('data-pe', peMeta.id);

    const countText = `${peItems.length} Resource${peItems.length === 1 ? '' : 's'}`;
    section.innerHTML = `
      <div class="pe-resource-header">
        <div class="pe-resource-title">
          <span>${peMeta.title}</span>
          <span class="pe-resource-count">${countText}</span>
        </div>
        <p class="pe-resource-standard">&ldquo;${peMeta.standard}&rdquo;</p>
      </div>
      <div class="pe-resource-subgrid">
        ${sims.length > 0 ? `
          <div class="pe-resource-column pe-sims-col">
            <div class="pe-column-title">🧪 Interactive Simulations (${sims.length})</div>
            ${sims.map(r => createResourceLinkHtml(r, peMeta.id, peMeta.title)).join('')}
          </div>
        ` : ''}
        ${vids.length > 0 ? `
          <div class="pe-resource-column pe-vids-col">
            <div class="pe-column-title">🎥 Video Tutorials (${vids.length})</div>
            ${vids.map(r => createResourceLinkHtml(r, peMeta.id, peMeta.title)).join('')}
          </div>
        ` : ''}
        ${texts.length > 0 ? `
          <div class="pe-resource-column pe-texts-col">
            <div class="pe-column-title">📖 Textbook Readings (${texts.length})</div>
            ${texts.map(r => createResourceLinkHtml(r, peMeta.id, peMeta.title)).join('')}
          </div>
        ` : ''}
      </div>
    `;
    container.appendChild(section);
  });
}

// Progress Rendering Engine
function renderProgress() {
  const progress = StorageEngine.getProgress();

  (MANIFEST_DATA.lessons || []).forEach(l => {
    const lessonProgress = progress[l.id] || {};
    // A lesson's real checkpoint count is only known once its page has been
    // opened (core.js writes _total from the live DOM). Until then, say so
    // rather than inventing a denominator.
    const counted = typeof lessonProgress._total === 'number';
    const total = counted ? lessonProgress._total : 4;
    
    const completed = StorageEngine.countCompleted(lessonProgress);

    const ratio = total > 0 ? (completed / total) : 0;
    const pct = Math.min(Math.round(ratio * 100), 100);

    // Update elements
    const bar = $(`#bar-${l.id}`);
    const text = $(`#text-${l.id}`);
    const status = $(`#status-${l.id}`);

    if (bar) {
      bar.style.width = `${pct}%`;
      if (pct === 100) bar.classList.add('completed');
      else bar.classList.remove('completed');
    }

    if (text) {
      text.textContent = counted ? `${completed}/${total} checkpoints` : 'Not started';
    }

    if (status) {
      status.className = 'lesson-status-badge';
      if (completed === 0) {
        status.textContent = 'Not Started';
        status.classList.add('not-started');
      } else if (completed >= total) {
        status.textContent = 'Completed';
        status.classList.add('completed');
      } else {
        status.textContent = 'In Progress';
        status.classList.add('in-progress');
      }
    }
  });

  // Color-code Concept Map Nodes & Connections
  (MANIFEST_DATA.lessons || []).forEach(l => {
    const lessonProgress = progress[l.id] || {};
    const total = lessonProgress._total || 4;
    const completed = StorageEngine.countCompleted(lessonProgress);

    const node = $(`#panel-concept-map .concept-node[data-lesson="${l.id}"]`);
    if (node) {
      node.classList.remove('state-not-started', 'state-in-progress', 'state-completed');
      if (completed === 0) {
        node.classList.add('state-not-started');
      } else if (completed >= total) {
        node.classList.add('state-completed');
      } else {
        node.classList.add('state-in-progress');
      }
    }
  });

  const lines = $$('#panel-concept-map .d-arrow');
  lines.forEach(line => {
    const fromId = line.getAttribute('data-from');
    const lessonProgress = progress[fromId] || {};
    const total = lessonProgress._total || 4;
    const completed = StorageEngine.countCompleted(lessonProgress);

    line.classList.remove('state-not-started', 'state-in-progress', 'state-completed');
    if (completed >= total && total > 0) {
      line.setAttribute('marker-end', 'url(#arrow-completed)');
      line.classList.add('state-completed');
    } else if (completed > 0) {
      line.setAttribute('marker-end', 'url(#arrow-in-progress)');
      line.classList.add('state-in-progress');
    } else {
      line.setAttribute('marker-end', 'url(#arrow-mute)');
      line.classList.add('state-not-started');
    }
  });
}


// Deep Search Index state
let fullTextIndexed = false;
const lessonTextIndex = {};

async function buildDeepSearchIndex() {
  try {
    const promises = MANIFEST_DATA.lessons.map(async (lesson) => {
      const url = `lessons/${lesson.slug}.html`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("CORS or not found");
      const htmlText = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      
      let textContent = '';
      const sections = doc.querySelectorAll('section');
      sections.forEach(sec => {
        if (sec.classList.contains('hero')) return;
        const prose = sec.querySelectorAll('p, h2, h3, h4, li, .callout, .w-prompt, td, th');
        prose.forEach(p => {
          textContent += ' ' + p.textContent;
        });
      });
      
      lessonTextIndex[lesson.id] = textContent.toLowerCase();
    });
    
    await Promise.all(promises);
    fullTextIndexed = true;
    console.log("Deep search index built successfully!");
  } catch (e) {
    console.warn("Could not build deep search index (likely CORS or network limit). Falling back to static data-search.", e);
  }
}

// --- Practice & Review SRS Memory Engine (Leitner Box System) ---
const domCache = {};
async function fetchLessonDOM(slug) {
  if (domCache[slug]) return domCache[slug];
  const res = await fetch(`lessons/${slug}.html`);
  if (!res.ok) throw new Error("Fetch failed");
  const html = await res.text();
  const parser = new DOMParser();
  domCache[slug] = parser.parseFromString(html, 'text/html');
  return domCache[slug];
}

function checkAndMigrateSRS() {
  const progress = StorageEngine.getProgress();
  let migrated = false;
  
  MANIFEST_DATA.lessons.forEach(lesson => {
    const lessonProgress = progress[lesson.id];
    if (!lessonProgress) return;
    
    Object.keys(lessonProgress).forEach(key => {
      if (key === '_total') return;
      if (key.startsWith('recall-') || key.startsWith('scheme-')) {
        const val = lessonProgress[key];
        if (val === true || (val && typeof val === 'object' && val.completed === true && !val.nextDue)) {
          lessonProgress[key] = {
            completed: true,
            box: 1,
            interval: 1,
            nextDue: Date.now(), // due immediately for review
            lastAttempt: Date.now(),
            attempts: 1
          };
          migrated = true;
        }
      }
    });
  });
  
  if (migrated) {
    StorageEngine.saveProgress(progress);
  }
}

function updateItemRepetition(lessonId, type, index, grade) {
  const progress = StorageEngine.getProgress();
  if (!progress[lessonId]) progress[lessonId] = {};
  
  const key = `${type}-${index}`;
  const existing = progress[lessonId][key] || { completed: true };
  
  let box = existing.box || 1;
  let attempts = (existing.attempts || 0) + 1;
  
  if (grade === 'forgot') {
    box = 1;
  } else if (grade === 'easy') {
    box = Math.min(5, box + 1);
  }
  
  const intervals = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
  const interval = intervals[box];
  const nextDue = Date.now() + interval * 24 * 60 * 60 * 1000;
  
  progress[lessonId][key] = {
    completed: true,
    box: box,
    interval: interval,
    nextDue: nextDue,
    lastAttempt: Date.now(),
    attempts: attempts
  };
  
  StorageEngine.saveProgress(progress);
  renderProgress();
}

let currentDueItems = [];
let currentDueIdx = 0;

function initPracticeReview() {
  checkAndMigrateSRS();
  
  const progress = StorageEngine.getProgress();
  currentDueItems = [];
  
  MANIFEST_DATA.lessons.forEach(lesson => {
    const lessonProgress = progress[lesson.id];
    if (!lessonProgress) return;
    
    Object.keys(lessonProgress).forEach(key => {
      if (key.startsWith('recall-') || key.startsWith('scheme-')) {
        const val = lessonProgress[key];
        if (val && typeof val === 'object' && val.completed === true) {
          if (val.nextDue <= Date.now()) {
            const parts = key.split('-');
            const type = parts[0];
            const index = parseInt(parts[1], 10);
            currentDueItems.push({ lessonId: lesson.id, type, index });
          }
        }
      }
    });
  });
  
  const badge = $('#dueCountBadge');
  if (badge) {
    badge.textContent = `${currentDueItems.length} Due`;
    if (currentDueItems.length === 0) {
      badge.classList.add('zero');
    } else {
      badge.classList.remove('zero');
    }
  }
  
  currentDueIdx = 0;
  showNextSpacedReview();
}

function showNextSpacedReview() {
  const area = $('#spacedReviewArea');
  if (!area) return;
  
  if (currentDueItems.length === 0) {
    area.innerHTML = `
      <div class="practice-placeholder-text">
        <span style="font-size: var(--text-xl); display:block; margin-bottom: 0.5rem;">🎉</span>
        <strong>All caught up!</strong><br>
        You have 0 reviews due today. Complete checkpoints inside lessons to schedule reviews, or run a Mixed Review drill.
      </div>
    `;
    return;
  }
  
  if (currentDueIdx >= currentDueItems.length) {
    area.innerHTML = `
      <div class="practice-placeholder-text" style="color: var(--good);">
        <span style="font-size: var(--text-xl); display:block; margin-bottom: 0.5rem;">✅</span>
        <strong>Reviews completed!</strong><br>
        You have finished all spacing reviews scheduled for today. Check back tomorrow!
      </div>
    `;
    initPracticeReview();
    return;
  }
  
  const item = currentDueItems[currentDueIdx];
  renderReviewCard(item, area, (grade) => {
    updateItemRepetition(item.lessonId, item.type, item.index, grade);
    currentDueIdx++;
    showNextSpacedReview();
  });
}

function extractExamQuestionData(doc, lesson) {
  // an Enrichment written response is never the practice question (1-2c has one before its core response)
  const coreFrames = Array.from(doc.querySelectorAll('.exam-frame')).filter((f) => !f.closest('details.enrichment'));
  const examContainer = coreFrames[0] || doc.querySelector('.exam-card, #s-exam');
  if (!examContainer) return null;

  let promptHtml = '';
  let schemeHtml = '';

  // Check if commit-reveal widget is embedded inside
  // only a widget inside the exam itself: a doc-wide fallback picked the lesson's first checkpoint as the "exam"
  const widgetEl = examContainer.querySelector('[data-widget="commit-reveal"]');
  if (widgetEl) {
    const configEl = widgetEl.querySelector('.w-config');
    if (configEl) {
      try {
        const config = JSON.parse(configEl.textContent);
        if (config.prompt) promptHtml = config.prompt;
        if (config.reveal) schemeHtml = config.reveal;
      } catch (e) {}
    }
  }

  // If promptHtml still not found, search DOM elements
  if (!promptHtml) {
    const qEl = examContainer.querySelector('.exam-q, .stem, .exam-prompt');
    if (qEl) {
      promptHtml = qEl.innerHTML;
    } else {
      const pEls = examContainer.querySelectorAll('p:not(.exam-meta):not(.label)');
      if (pEls.length > 0) {
        promptHtml = Array.from(pEls).map(p => p.outerHTML).join('');
      }
    }
  }

  // Append any sub-questions or tasks
  const subQs = examContainer.querySelectorAll('.sub-q, .task');
  if (subQs.length > 0 && !promptHtml.includes('sub-q') && !promptHtml.includes('task')) {
    promptHtml += '<div style="margin-top:0.75rem;">' + Array.from(subQs).map(sq => sq.outerHTML).join('') + '</div>';
  }

  // If diagram exists in examContainer or preceding section, preserve it
  const diagramEl = examContainer.querySelector('.diagram') || doc.querySelector('#s-exam .diagram');
  if (diagramEl && !promptHtml.includes('<svg') && !promptHtml.includes('figure')) {
    const diagClone = diagramEl.cloneNode(true);
    diagClone.classList.remove('reveal');
    diagClone.classList.add('in');
    promptHtml = diagClone.outerHTML + '<br>' + promptHtml;
  }

  // If schemeHtml still not found, search DOM elements
  if (!schemeHtml) {
    const schemeEl = examContainer.querySelector('.scheme, .mark-scheme, details.scheme, .scheme-card');
    if (schemeEl) {
      schemeHtml = schemeEl.innerHTML;
    }
  }

  if (!promptHtml) {
    promptHtml = `<p>Review and explain the core chemical mechanisms and phenomena from Lesson ${lesson.id}: <em>${lesson.title}</em>.</p>`;
  }
  if (!schemeHtml) {
    schemeHtml = `<p>Review Lesson ${lesson.id} and your consensus notes for detailed scoring criteria and explanation frames.</p>`;
  }

  return { promptHtml, schemeHtml };
}

function extractRecallQuestionData(doc, lesson) {
  const recallEl = doc.querySelector('.recall');
  if (recallEl) {
    const sentence = recallEl.querySelector('.recall-sentence');
    const fields = recallEl.querySelector('.st-fields');
    const blanks = recallEl.querySelectorAll('input.blank');
    if ((sentence || fields) && blanks.length > 0) {
      const target = sentence ? sentence.cloneNode(true) : fields.cloneNode(true);
      target.querySelectorAll('input').forEach(inp => {
        inp.value = '';
        inp.disabled = false;
      });
      const answers = [];
      blanks.forEach((b, idx) => {
        const a = (b.getAttribute('data-answer') || '').split('|')[0];
        answers.push(`${idx + 1}. <strong class="term">${a}</strong>`);
      });
      return {
        element: target,
        answersHtml: '<h4 style="margin: 0 0 0.5rem 0; font-family: var(--display); font-size: var(--text-base);">Answer Key:</h4>' + answers.join('<br>')
      };
    }
  }

  // Fallback 1: check for any interactive widget config (e.g. commit-reveal)
  const widgets = doc.querySelectorAll('.w-config');
  for (const w of widgets) {
    try {
      const conf = JSON.parse(w.textContent);
      if (conf.prompt && conf.reveal) {
        const container = document.createElement('div');
        container.innerHTML = `<div style="margin-bottom:0.75rem; font-size: var(--text-base); line-height:1.5;">${conf.prompt}</div><input type="text" class="blank" style="width:100%; max-width:380px; padding:0.45rem 0.65rem; font-family:var(--display); border:1px solid var(--hair); border-radius:4px;" placeholder="Type your answer here...">`;
        return {
          element: container,
          answersHtml: `<h4 style="margin: 0 0 0.5rem 0; font-family: var(--display); font-size: var(--text-base);">Answer Key:</h4>${conf.reveal}`
        };
      }
    } catch (e) {}
  }

  // Fallback 2: Check for key terms from lesson
  const keyTerms = Array.from(doc.querySelectorAll('.term')).slice(0, 4).map(t => t.textContent.trim()).filter(Boolean);
  const container = document.createElement('div');
  container.innerHTML = `<p style="margin-bottom:0.6rem; font-size: var(--text-base);">Recall and state the core definitions or relationships for <strong>Lesson ${lesson.id}: ${lesson.title}</strong>:</p><input type="text" class="blank" style="width:100%; max-width:380px; padding:0.45rem 0.65rem; font-family:var(--display); border:1px solid var(--hair); border-radius:4px;" placeholder="Key vocabulary or core concept...">`;
  return {
    element: container,
    answersHtml: `<h4 style="margin: 0 0 0.5rem 0; font-family: var(--display); font-size: var(--text-base);">Key Terms & Concepts:</h4>${keyTerms.length ? keyTerms.map((t, i) => `${i + 1}. <strong class="term">${t}</strong>`).join('<br>') : 'Refer to the lesson notes for vocabulary definitions.'}`
  };
}

async function renderReviewCard(item, container, onCompleteCallback) {
  container.innerHTML = '<div style="text-align:center; padding: 2.5rem 1rem; font-family: var(--mono); font-size: var(--text-sm); color: var(--ink-soft);">Loading review question...</div>';
  
  const lesson = MANIFEST_DATA.lessons.find(l => l.id === item.lessonId);
  if (!lesson) {
    container.innerHTML = '<div class="no-results">Error finding lesson data.</div>';
    return;
  }
  
  try {
    const doc = await fetchLessonDOM(lesson.slug);
    
    const card = document.createElement('div');
    card.className = 'review-session-card';
    
    const meta = document.createElement('div');
    meta.className = 'review-meta';
    meta.innerHTML = `
      <span>Lesson ${lesson.id} · ${lesson.title}</span>
      <span>${item.type === 'recall' ? 'Vocabulary Recall' : 'Constructed Response'}</span>
    `;
    card.appendChild(meta);
    
    const promptContainer = document.createElement('div');
    promptContainer.className = 'review-prompt-container';
    
    let answersHtml = '';
    
    if (item.type === 'recall') {
      const recallData = extractRecallQuestionData(doc, lesson);
      promptContainer.appendChild(recallData.element);
      answersHtml = recallData.answersHtml;
    } else {
      const examData = extractExamQuestionData(doc, lesson);
      const qWrapper = document.createElement('div');
      qWrapper.innerHTML = examData.promptHtml;
      promptContainer.appendChild(qWrapper);
      
      const textarea = document.createElement('textarea');
      textarea.placeholder = 'Type your draft answer here before opening the scoring guide...';
      promptContainer.appendChild(textarea);
      
      answersHtml = examData.schemeHtml;
    }
    card.appendChild(promptContainer);
    
    const actionArea = document.createElement('div');
    actionArea.className = 'review-action-area';
    
    const revealBtn = document.createElement('button');
    revealBtn.className = 'btn';
    revealBtn.textContent = 'Reveal Answer';
    actionArea.appendChild(revealBtn);
    card.appendChild(actionArea);
    
    container.innerHTML = '';
    container.appendChild(card);
    
    revealBtn.addEventListener('click', () => {
      revealBtn.style.display = 'none';
      promptContainer.querySelectorAll('input, textarea').forEach(el => el.disabled = true);
      
      const answerDisplay = document.createElement('div');
      answerDisplay.className = 'review-answer-display';
      answerDisplay.innerHTML = answersHtml;
      
      actionArea.appendChild(answerDisplay);
      
      const ratingContainer = document.createElement('div');
      ratingContainer.className = 'review-action-area';
      ratingContainer.innerHTML = `
        <div style="font-family: var(--mono); font-size: var(--text-xs); text-align: center; color: var(--ink-soft); margin-top: 0.5rem;">How well did you recall this?</div>
        <div class="review-grading-buttons" style="margin-top:0.25rem;">
          <button class="btn btn-forgot" data-grade="forgot">Forgot</button>
          <button class="btn btn-hard" data-grade="hard">Hard</button>
          <button class="btn btn-easy" data-grade="easy">Easy</button>
        </div>
      `;
      actionArea.appendChild(ratingContainer);
      
      ratingContainer.addEventListener('click', e => {
        const gradeBtn = e.target.closest('[data-grade]');
        if (!gradeBtn) return;
        onCompleteCallback(gradeBtn.dataset.grade);
      });
    });
    
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="no-results">Error loading question content. Make sure your local server is running.</div>';
  }
}

let currentMixedItems = [];
let currentMixedIdx = 0;

function startMixedReview() {
  const pool = [];
  MANIFEST_DATA.lessons.forEach(lesson => {
    pool.push({ lessonId: lesson.id, type: 'recall', index: 0 });
    pool.push({ lessonId: lesson.id, type: 'scheme', index: 0 });
  });
  
  const shuffled = pool.sort(() => 0.5 - Math.random());
  currentMixedItems = shuffled.slice(0, 5);
  currentMixedIdx = 0;
  
  showNextMixedReview();
}

function showNextMixedReview() {
  const area = $('#mixedReviewArea');
  if (!area) return;
  
  if (currentMixedItems.length === 0) {
    area.innerHTML = `
      <div class="practice-placeholder-text">
        Click "Start Drill" to load a random sample of 5 recall and exam questions across all units.
      </div>
    `;
    return;
  }
  
  if (currentMixedIdx >= currentMixedItems.length) {
    area.innerHTML = `
      <div class="practice-placeholder-text" style="color: var(--good);">
        <span style="font-size: var(--text-xl); display:block; margin-bottom: 0.5rem;">💪</span>
        <strong>Mixed Review Complete!</strong><br>
        Excellent job! You've completed your interleaving study drill of 5 questions.
      </div>
    `;
    initPracticeReview();
    return;
  }
  
  const item = currentMixedItems[currentMixedIdx];
  
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.gap = '1rem';
  
  const progressLabel = document.createElement('div');
  progressLabel.style.fontFamily = 'var(--mono)';
  progressLabel.style.fontSize = '0.74rem';
  progressLabel.style.color = 'var(--ink-mute)';
  progressLabel.textContent = `Card ${currentMixedIdx + 1} of 5`;
  wrapper.appendChild(progressLabel);
  
  const contentCard = document.createElement('div');
  wrapper.appendChild(contentCard);
  area.innerHTML = '';
  area.appendChild(wrapper);
  
  renderReviewCard(item, contentCard, (grade) => {
    updateItemRepetition(item.lessonId, item.type, item.index, grade);
    currentMixedIdx++;
    showNextMixedReview();
  });
}

// Cram Mode Loading & Binding
let cramModeLoaded = false;

async function loadCramModeData() {
  if (cramModeLoaded) return;
  const cramSpinner = $('#cramSpinner');
  const cramList = $('#cramList');
  
  cramSpinner.style.display = 'flex';
  cramList.style.display = 'none';
  cramList.innerHTML = '';
  
  try {
    const promises = MANIFEST_DATA.lessons.map(async (lesson) => {
      const url = `lessons/${lesson.slug}.html`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Could not fetch " + lesson.title);
      const htmlText = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      
      const examData = extractExamQuestionData(doc, lesson);
      if (!examData) return null;

      const examFrame = document.createElement('div');
      examFrame.className = 'exam-frame in';
      
      const metaDiv = document.createElement('div');
      metaDiv.className = 'exam-meta';
      metaDiv.innerHTML = `<span class="exam-src">Gen Chem · Lesson ${lesson.id}</span><span class="exam-marks">[Constructed Response]</span>`;
      examFrame.appendChild(metaDiv);

      const qDiv = document.createElement('div');
      qDiv.className = 'exam-q';
      qDiv.innerHTML = examData.promptHtml;
      examFrame.appendChild(qDiv);

      const taKey = `cramAns-${lesson.id}`;
      const textarea = document.createElement('textarea');
      textarea.className = 'textbox';
      textarea.id = taKey;
      textarea.placeholder = 'Write your draft response here…';
      const savedAns = StorageEngine.getItem(taKey);
      if (savedAns) textarea.value = savedAns;
      textarea.addEventListener('input', (evt) => {
        StorageEngine.setItem(taKey, evt.target.value);
      });
      examFrame.appendChild(textarea);

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'actions';
      const revealBtn = document.createElement('button');
      revealBtn.className = 'btn';
      revealBtn.setAttribute('data-scheme', '');
      revealBtn.textContent = 'Show scoring guide';
      actionsDiv.appendChild(revealBtn);
      examFrame.appendChild(actionsDiv);

      const schemeDiv = document.createElement('div');
      schemeDiv.className = 'scheme';
      schemeDiv.style.display = 'none';
      const schemeCard = document.createElement('div');
      schemeCard.className = 'scheme-card';
      schemeCard.innerHTML = examData.schemeHtml;
      schemeDiv.appendChild(schemeCard);
      examFrame.appendChild(schemeDiv);

      revealBtn.addEventListener('click', () => {
        schemeDiv.style.display = schemeDiv.style.display === 'none' ? 'block' : 'none';
        revealBtn.textContent = schemeDiv.style.display === 'none' ? 'Show scoring guide' : 'Hide scoring guide';
      });
      
      const card = document.createElement('div');
      card.className = 'cram-lesson-group';
      card.innerHTML = `
        <div class="cram-lesson-header">
          <span class="cram-lesson-title">${lesson.title}</span>
          <span class="cram-lesson-badge">${lesson.id}</span>
        </div>
      `;
      card.appendChild(examFrame);
      return { lesson, card };
    });
    
    const results = await Promise.all(promises);
    results.forEach(res => {
      if (res) cramList.appendChild(res.card);
    });
    
    cramSpinner.style.display = 'none';
    cramList.style.display = 'flex';
    cramModeLoaded = true;
  } catch (err) {
    console.error(err);
    cramSpinner.style.display = 'none';
    cramList.innerHTML = '<div class="no-results">Error loading exam questions. Please ensure you are serving this folder via a local server (e.g. VS Code Live Server or Python HTTP server) rather than opening the HTML file directly.</div>';
  }
}

// Search Filtering Engine
function filterItems(query) {
  const q = query.trim().toLowerCase();
  
  // Filter Lessons using static tags + deep text index + glossary matching
  const matchingGlossaryLessons = new Set();
  MANIFEST_DATA.glossary.forEach(g => {
    const entry = (typeof GC_GLOSSARY !== 'undefined' && GC_GLOSSARY[termSlug(g.term)]) || null;
    const term = entry ? entry.term : g.term;
    const definition = entry ? entry.definition : g.definition;
    if (term.toLowerCase().includes(q) || definition.toLowerCase().includes(q)) {
      matchingGlossaryLessons.add(g.lessonId);
    }
  });

  const lessonCards = $$('#panel-lessons .lesson-card');
  let visibleLessons = 0;
  lessonCards.forEach(card => {
    const lessonId = card.querySelector('.lesson-badge').textContent.trim();
    const staticSearchText = card.getAttribute('data-search').toLowerCase() + ' ' + card.querySelector('h3').textContent.toLowerCase();
    
    let match = staticSearchText.includes(q);
    
    if (!match && fullTextIndexed && lessonTextIndex[lessonId]) {
      match = lessonTextIndex[lessonId].includes(q);
    }
    
    if (!match && matchingGlossaryLessons.has(lessonId)) {
      match = true;
    }

    if (match) {
      card.style.display = 'flex';
      visibleLessons++;
    } else {
      card.style.display = 'none';
    }
  });

  // Filter Unit & PE sections (hide headings if all nested lessons are hidden)
  $$('#panel-lessons .unit-section').forEach(sec => {
    const visibleInSec = [...sec.querySelectorAll('.lesson-card')].filter(c => c.style.display !== 'none').length;
    sec.style.display = visibleInSec > 0 ? 'block' : 'none';
  });

  // Filter Concept Map
  const conceptNodes = $$('#panel-concept-map .concept-node');
  let visibleNodes = 0;
  conceptNodes.forEach(node => {
    const lessonId = node.getAttribute('data-lesson');
    const lesson = MANIFEST_DATA.lessons.find(l => l.id === lessonId);
    const searchText = (lessonId + ' ' + (lesson ? lesson.title + ' ' + lesson.description : '')).toLowerCase();
    if (searchText.includes(q)) {
      node.style.opacity = '1';
      visibleNodes++;
    } else {
      node.style.opacity = '0.15';
    }
  });

  const conceptLines = $$('#panel-concept-map .d-arrow');
  conceptLines.forEach(line => {
    const fromId = line.getAttribute('data-from');
    const toId = line.getAttribute('data-to');
    const fromNode = $(`#panel-concept-map .concept-node[data-lesson="${fromId}"]`);
    const toNode = $(`#panel-concept-map .concept-node[data-lesson="${toId}"]`);
    if (fromNode && toNode && fromNode.style.opacity === '1' && toNode.style.opacity === '1') {
      line.style.opacity = '1';
    } else {
      line.style.opacity = '0.15';
    }
  });

  // Filter Glossary
  const glossaryCards = $$('#panel-glossary .glossary-card');
  let visibleGlossary = 0;
  glossaryCards.forEach(card => {
    const searchText = card.getAttribute('data-search').toLowerCase();
    if (searchText.includes(q)) {
      card.style.display = 'flex';
      visibleGlossary++;
    } else {
      card.style.display = 'none';
    }
  });

  // Filter Unit Resources (Units 1-5)
  const visibleUnitRes = { unit1: 0, unit2: 0, unit3: 0, unit4: 0, unit5: 0 };
  ['unit1', 'unit2', 'unit3', 'unit4', 'unit5'].forEach(u => {
    const items = $$(`#panel-${u}-res .resource-item`);
    items.forEach(item => {
      const searchText = item.getAttribute('data-search').toLowerCase();
      const match = searchText.includes(q);
      item.style.display = match ? 'flex' : 'none';
      if (match) visibleUnitRes[u]++;
    });
    $$(`#panel-${u}-res .resource-category-group`).forEach(group => {
      const visible = [...group.querySelectorAll('.resource-item')].filter(i => i.style.display !== 'none').length;
      group.style.display = visible > 0 ? 'block' : 'none';
    });
    $$(`#panel-${u}-res .resource-group`).forEach(group => {
      const visible = [...group.querySelectorAll('.resource-item')].filter(i => i.style.display !== 'none').length;
      group.style.display = visible > 0 ? 'block' : 'none';
    });
  });

  // Filter PE Resources
  const peItems = $$('#panel-pe-res .resource-item');
  let visiblePE = 0;
  peItems.forEach(item => {
    const searchText = item.getAttribute('data-search').toLowerCase();
    const match = searchText.includes(q);
    item.style.display = match ? 'flex' : 'none';
    if (match) visiblePE++;
  });
  $$('#panel-pe-res .pe-resource-column').forEach(col => {
    const visible = [...col.querySelectorAll('.resource-item')].filter(i => i.style.display !== 'none').length;
    col.style.display = visible > 0 ? 'flex' : 'none';
  });
  $$('#panel-pe-res .pe-resource-section').forEach(sec => {
    const visible = [...sec.querySelectorAll('.resource-item')].filter(i => i.style.display !== 'none').length;
    sec.style.display = visible > 0 ? 'block' : 'none';
  });

  // Filter Cram Mode
  const cramGroups = $$('#panel-cram-mode .cram-lesson-group');
  let visibleCram = 0;
  cramGroups.forEach(group => {
    const searchText = group.textContent.toLowerCase();
    if (searchText.includes(q)) {
      group.style.display = 'block';
      visibleCram++;
    } else {
      group.style.display = 'none';
    }
  });

  // Handle "No Results" placeholders
  const activePanelEl = $('.dashboard-panel.active');
  const activePanelId = activePanelEl ? activePanelEl.id : '';
  removeNoResults();

  if (activePanelId === 'panel-lessons' && visibleLessons === 0) {
    showNoResults('#panel-lessons');
  } else if (activePanelId === 'panel-concept-map' && visibleNodes === 0) {
    showNoResults('#panel-concept-map');
  } else if (activePanelId === 'panel-glossary' && visibleGlossary === 0) {
    showNoResults('#panel-glossary');
  } else if (activePanelId === 'panel-unit1-res' && visibleUnitRes.unit1 === 0) {
    showNoResults('#panel-unit1-res');
  } else if (activePanelId === 'panel-unit2-res' && visibleUnitRes.unit2 === 0) {
    showNoResults('#panel-unit2-res');
  } else if (activePanelId === 'panel-unit3-res' && visibleUnitRes.unit3 === 0) {
    showNoResults('#panel-unit3-res');
  } else if (activePanelId === 'panel-unit4-res' && visibleUnitRes.unit4 === 0) {
    showNoResults('#panel-unit4-res');
  } else if (activePanelId === 'panel-unit5-res' && visibleUnitRes.unit5 === 0) {
    showNoResults('#panel-unit5-res');
  } else if (activePanelId === 'panel-pe-res' && visiblePE === 0) {
    showNoResults('#panel-pe-res');
  } else if (activePanelId === 'panel-cram-mode' && visibleCram === 0) {
    showNoResults('#panel-cram-mode');
  }
}

function showNoResults(parentSelector) {
  const parent = $(parentSelector);
  const div = document.createElement('div');
  div.className = 'no-results';
  div.innerHTML = 'No matching items found. Try another search term!';
  parent.appendChild(div);
}

function removeNoResults() {
  $$('.no-results').forEach(el => el.remove());
}

// Bind click delegation for Cram Mode scheme reveals
const cramList = $('#cramList');
if (cramList) {
  cramList.addEventListener('click', e => {
    const btn = e.target.closest('[data-scheme], .actions .btn');
    if (!btn) return;
    
    const frame = btn.closest('.exam-frame') || btn.closest('.cram-lesson-group');
    if (!frame) return;
    
    const scheme = frame.querySelector('.scheme');
    if (!scheme) return;
    
    scheme.classList.toggle('show');
    btn.textContent = scheme.classList.contains('show') ? 'Hide scoring guide' : 'Show scoring guide';
  });
}

// Search Input Event
$('#searchInput').addEventListener('input', e => {
  filterItems(e.target.value);
});

// Practice mixed review start button
const startMixedBtn = $('#startMixedReviewBtn');
if (startMixedBtn) {
  startMixedBtn.addEventListener('click', () => {
    startMixedReview();
  });
}

// Run on Load
renderProgress();

// Resources Dropdown Handler
const resWrap = $('#resourcesDropdownWrap');
const resBtn = $('#resourcesDropdownBtn');
if (resBtn && resWrap) {
  resBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    resWrap.classList.toggle('open');
    const isOpen = resWrap.classList.contains('open');
    resBtn.setAttribute('aria-expanded', String(isOpen));
  });
  document.addEventListener('click', () => {
    resWrap.classList.remove('open');
    resBtn.setAttribute('aria-expanded', 'false');
  });

  let lastViewedUnitResPanel = 'unit1-res';

  $$('#resourcesDropdownMenu .dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      resWrap.classList.remove('open');
      resBtn.setAttribute('aria-expanded', 'false');
      
      $$('.dashboard-tab').forEach(t => t.classList.remove('active'));
      $$('.dashboard-panel').forEach(p => p.classList.remove('active'));
      $$('#resourcesDropdownMenu .dropdown-item').forEach(i => i.classList.remove('active'));
      
      resBtn.classList.add('active');
      item.classList.add('active');
      $(`#panel-${item.dataset.panel}`).classList.add('active');

      if (item.dataset.panel === 'pe-res') {
        $$('.btn-res-group-unit').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
        $$('.btn-res-group-pe').forEach(b => { b.classList.add('active'); b.setAttribute('aria-pressed', 'true'); });
        $$('.res-view-mode-meta').forEach(m => { m.textContent = 'Showing: Performance Expectations (NGSS)'; });
      } else {
        lastViewedUnitResPanel = item.dataset.panel;
        $$('.btn-res-group-unit').forEach(b => { b.classList.add('active'); b.setAttribute('aria-pressed', 'true'); });
        $$('.btn-res-group-pe').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
        $$('.res-view-mode-meta').forEach(m => { m.textContent = 'Showing: Unit Storylines'; });
      }
      
      $('#searchInput').value = '';
      filterItems('');
    });
  });

  // Resource View Switcher (By Unit vs By PE)
  function switchResView(mode) {
    const isPE = mode === 'pe';
    $$('.btn-res-group-unit').forEach(b => {
      b.classList.toggle('active', !isPE);
      b.setAttribute('aria-pressed', String(!isPE));
    });
    $$('.btn-res-group-pe').forEach(b => {
      b.classList.toggle('active', isPE);
      b.setAttribute('aria-pressed', String(isPE));
    });
    $$('.res-view-mode-meta').forEach(m => {
      m.textContent = isPE ? 'Showing: Performance Expectations (NGSS)' : 'Showing: Unit Storylines';
    });

    $$('.dashboard-tab').forEach(t => t.classList.remove('active'));
    $$('.dashboard-panel').forEach(p => p.classList.remove('active'));
    $$('#resourcesDropdownMenu .dropdown-item').forEach(i => i.classList.remove('active'));
    
    const resDropdownBtn = $('#resourcesDropdownBtn');
    if (resDropdownBtn) resDropdownBtn.classList.add('active');

    if (isPE) {
      const pePanel = $('#panel-pe-res');
      if (pePanel) pePanel.classList.add('active');
      const peDropdownItem = $(`#resourcesDropdownMenu .dropdown-item[data-panel="pe-res"]`);
      if (peDropdownItem) peDropdownItem.classList.add('active');
    } else {
      const targetPanel = $(`#panel-${lastViewedUnitResPanel}`) || $('#panel-unit1-res');
      if (targetPanel) targetPanel.classList.add('active');
      const unitDropdownItem = $(`#resourcesDropdownMenu .dropdown-item[data-panel="${lastViewedUnitResPanel}"]`);
      if (unitDropdownItem) unitDropdownItem.classList.add('active');
    }

    const q = $('#searchInput').value.trim().toLowerCase();
    if (q) filterItems(q);
  }

  $$('.btn-res-group-unit').forEach(btn => btn.addEventListener('click', () => switchResView('unit')));
  $$('.btn-res-group-pe').forEach(btn => btn.addEventListener('click', () => switchResView('pe')));
}

// View Switcher (By Unit vs By PE)
function switchView(mode) {
  const isPE = mode === 'pe';
  StorageEngine.setItem('sp_chem_grouping', mode);
  
  const btnUnit = $('#btnGroupUnit');
  const btnPE = $('#btnGroupPE');
  const meta = $('#viewModeMeta');
  if (btnUnit && btnPE && meta) {
    btnUnit.classList.toggle('active', !isPE);
    btnUnit.setAttribute('aria-pressed', String(!isPE));
    btnPE.classList.toggle('active', isPE);
    btnPE.setAttribute('aria-pressed', String(isPE));
    meta.textContent = isPE ? 'Showing: Performance Expectations (NGSS)' : 'Showing: Unit Storylines';
  }

  const viewUnit = $('#viewContainerUnit');
  const viewPE = $('#viewContainerPE');
  
  if (isPE) {
    $$('.lesson-card').forEach(card => {
      const pe = card.getAttribute('data-pe');
      const grid = $(`#viewContainerPE .lessons-grid[data-pe-grid="${pe}"]`);
      if (grid) grid.appendChild(card);
    });
    if (viewUnit) viewUnit.style.display = 'none';
    if (viewPE) viewPE.style.display = 'block';
  } else {
    $$('.lesson-card').forEach(card => {
      const unit = card.getAttribute('data-unit');
      const grid = $(`#viewContainerUnit .lessons-grid[data-unit-grid="${unit}"]`);
      if (grid) grid.appendChild(card);
    });
    if (viewPE) viewPE.style.display = 'none';
    if (viewUnit) viewUnit.style.display = 'block';
  }
  // Re-run search filter on cards if search query exists
  const q = $('#searchInput').value.trim().toLowerCase();
  if (q) filterItems(q);
}

const btnUnit = $('#btnGroupUnit');
const btnPE = $('#btnGroupPE');
if (btnUnit && btnPE) {
  btnUnit.addEventListener('click', () => switchView('unit'));
  btnPE.addEventListener('click', () => switchView('pe'));
}

const initialGrouping = StorageEngine.getItem('sp_chem_grouping') || 'unit';

// Fetch lessons.json and boot dashboard
fetch('lessons.json')
  .then(res => {
    if (!res.ok) throw new Error('Failed to load lessons.json: HTTP ' + res.status);
    return res.json();
  })
  .then(manifest => {
    MANIFEST_DATA = manifest;
    renderLessonCards(manifest.lessons);
    renderGlossaryCards(manifest.glossary);
    renderResources('unit1', 'unit1');
    renderResources('unit2', 'unit2');
    renderResources('unit3', 'unit3');
    renderResources('unit4', 'unit4');
    renderResources('unit5', 'unit5');
    renderPEResources();
    renderProgress();
    switchView(initialGrouping);
    buildDeepSearchIndex();
    checkAndMigrateSRS();

    const q = $('#searchInput').value.trim().toLowerCase();
    if (q) filterItems(q);
  })
  .catch(err => {
    console.error('Error loading chemistry lessons manifest:', err);
    const viewUnit = $('#viewContainerUnit');
    if (viewUnit && !$$('.lesson-card').length) {
      const errDiv = document.createElement('div');
      errDiv.className = 'error-notice';
      errDiv.style.padding = '2rem';
      errDiv.style.textAlign = 'center';
      errDiv.style.color = 'var(--ink-soft)';
      errDiv.style.fontFamily = 'var(--display)';
      errDiv.innerHTML = '<p><strong>Unable to load lesson manifest.</strong></p><p>Please ensure you are serving this textbook via a local web server (e.g. <code>npm run dev</code>) rather than opening the HTML file directly via <code>file://</code>.</p>';
      viewUnit.prepend(errDiv);
    }
  });

// Clear Progress Button Event
// book.js lists "Clear Progress" as a top-bar tool and announces it with this event
document.addEventListener('gc:clear-progress', () => {
  if (confirm('Are you sure you want to clear all your chemistry progress? This cannot be undone.')) {
    StorageEngine.clearProgress();
    renderProgress();
  }
});

// Storage Event Listener for real-time progress syncing
window.addEventListener('storage', (e) => {
  if (e.key === 'gc-textbook-progress') {
    renderProgress();
  }
});
})();
