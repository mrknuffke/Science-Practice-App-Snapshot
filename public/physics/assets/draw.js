/* ============================================================
   MISSION: PHYSICA: DRAWING HELPERS FOR THE SIMS
   A physics-only book tool (RUNTIME_SPEC 2.2): arrows, boxed labels sized with
   measureText, and graph axes with numbered ticks. A sim's own script owns its
   model and its drawing; these are the small pieces every one of them reuses.
   Loaded after assets/glossary.js and before the lesson's script.
   Colours and fonts always come from the sim helper's env (tokens), never from here.
   Zero em-dashes.
   ============================================================ */
(function () {
  'use strict';

  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

  function roundRect(ctx, x, y, w, h, r) {
    const k = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + k, y);
    ctx.arcTo(x + w, y, x + w, y + h, k);
    ctx.arcTo(x + w, y + h, x, y + h, k);
    ctx.arcTo(x, y + h, x, y, k);
    ctx.arcTo(x, y, x + w, y, k);
    ctx.closePath();
  }

  // A straight arrow with a filled head. Very short arrows draw as a short line with a small head.
  function arrow(ctx, x1, y1, x2, y2, color, width) {
    const len = Math.hypot(x2 - x1, y2 - y1);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width || 2.5;
    if (len < 1) return;
    const head = clamp(len * 0.4, 5, 11);
    const a = Math.atan2(y2 - y1, x2 - x1);
    const bx = x2 - head * 0.8 * Math.cos(a);
    const by = y2 - head * 0.8 * Math.sin(a);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - head * Math.cos(a - 0.45), y2 - head * Math.sin(a - 0.45));
    ctx.lineTo(x2 - head * Math.cos(a + 0.45), y2 - head * Math.sin(a + 0.45));
    ctx.closePath();
    ctx.fill();
  }

  // Text in a box sized with measureText, kept inside the canvas. opt: align, color, bg, size, face, weight, pad.
  // Returns the box so a caller can keep two labels apart.
  function label(ctx, env, text, x, y, opt) {
    const o = opt || {};
    ctx.font = env.font(o.size || 12, o.face || 'mono', o.weight || 600);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    const pad = o.pad === undefined ? 4 : o.pad;
    const w = ctx.measureText(text).width + 2 * pad;
    const h = (o.size || 12) + 2 * pad - 2;
    let left = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    left = clamp(left, 2, Math.max(2, env.w - w - 2));
    const top = clamp(y - h / 2, 2, Math.max(2, env.h - h - 2));
    if (o.bg) {
      ctx.fillStyle = o.bg;
      roundRect(ctx, left, top, w, h, 4);
      ctx.fill();
    }
    ctx.fillStyle = o.color || env.colors.ink;
    ctx.fillText(text, left + pad, top + h / 2 + 0.5);
    return { x: left, y: top, w: w, h: h };
  }

  // A tick step (1, 2, 5, 10, ...) that gives about `count` ticks across [lo, hi].
  function tickStep(lo, hi, count) {
    const raw = (hi - lo) / Math.max(1, count);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const f = raw / mag;
    return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * mag;
  }

  function fmt(v, step) {
    const digits = step >= 1 ? 0 : step >= 0.1 ? 1 : 2;
    const s = Number(v).toFixed(digits);
    return s === '-0' || s === '-0.0' || s === '-0.00' ? s.slice(1) : s;
  }

  // Graph axes inside rect {x, y, w, h}. Returns { px(xValue), py(yValue), rect }.
  // o: xmin, xmax, ymin, ymax, xlabel, ylabel (short, with unit), xticks, yticks (approximate counts).
  function graph(ctx, env, rect, o) {
    const c = env.colors;
    const left = rect.x + 44;
    const right = rect.x + rect.w - 10;
    const top = rect.y + 8;
    const bottom = rect.y + rect.h - 34;
    const px = (v) => left + ((v - o.xmin) / (o.xmax - o.xmin)) * (right - left);
    const py = (v) => bottom - ((v - o.ymin) / (o.ymax - o.ymin)) * (bottom - top);
    ctx.save();
    ctx.lineWidth = 1;
    ctx.font = env.font(11, 'mono', 500);
    ctx.fillStyle = c.inkSoft;
    const xs = tickStep(o.xmin, o.xmax, o.xticks || Math.max(2, Math.floor((right - left) / 60)));
    const ys = tickStep(o.ymin, o.ymax, o.yticks || Math.max(2, Math.floor((bottom - top) / 40)));
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    for (let v = Math.ceil(o.xmin / xs) * xs; v <= o.xmax + 1e-9; v += xs) {
      ctx.strokeStyle = c.hairSoft;
      ctx.beginPath(); ctx.moveTo(px(v), top); ctx.lineTo(px(v), bottom); ctx.stroke();
      ctx.fillText(fmt(v, xs), px(v), bottom + 4);
    }
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    for (let v = Math.ceil(o.ymin / ys) * ys; v <= o.ymax + 1e-9; v += ys) {
      ctx.strokeStyle = c.hairSoft;
      ctx.beginPath(); ctx.moveTo(left, py(v)); ctx.lineTo(right, py(v)); ctx.stroke();
      ctx.fillText(fmt(v, ys), left - 5, py(v));
    }
    // zero lines and frame
    ctx.strokeStyle = c.inkMute;
    ctx.lineWidth = 1.5;
    if (o.ymin < 0 && o.ymax > 0) { ctx.beginPath(); ctx.moveTo(left, py(0)); ctx.lineTo(right, py(0)); ctx.stroke(); }
    if (o.xmin < 0 && o.xmax > 0) { ctx.beginPath(); ctx.moveTo(px(0), top); ctx.lineTo(px(0), bottom); ctx.stroke(); }
    ctx.strokeStyle = c.hair;
    ctx.strokeRect(left, top, right - left, bottom - top);
    // axis names
    ctx.fillStyle = c.inkSoft;
    ctx.font = env.font(11, 'display', 600);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    if (o.xlabel) ctx.fillText(o.xlabel, (left + right) / 2, rect.y + rect.h - 1);
    if (o.ylabel) {
      ctx.save();
      ctx.translate(rect.x + 11, (top + bottom) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textBaseline = 'middle';
      ctx.fillText(o.ylabel, 0, 0);
      ctx.restore();
    }
    ctx.restore();
    return { px: px, py: py, left: left, right: right, top: top, bottom: bottom };
  }

  // A polyline through [[x, y], ...] in pixels.
  function line(ctx, pts, color, width, dash) {
    if (pts.length < 2) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 2.5;
    ctx.lineJoin = 'round';
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
    ctx.restore();
  }

  function sign(v, digits) {
    const s = Number(v).toFixed(digits === undefined ? 1 : digits);
    return (v > 0 && Number(s) !== 0 ? '+' : '') + (Number(s) === 0 ? Number(0).toFixed(digits === undefined ? 1 : digits) : s);
  }

  // A group of chips where one is pressed at a time. onPick gets the chip's data-<attr> value.
  function chipGroup(chips, attr, onPick) {
    chips.forEach((chip) => chip.addEventListener('click', () => {
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      onPick(chip.dataset[attr]);
    }));
  }

  // Set the <output> of a slider's label after the script (not the student) moves the slider.
  function setOutput(input, text) {
    const label = input.closest('label');
    const out = label && label.querySelector('output');
    if (out) out.textContent = text;
  }

  window.PD = { chipGroup: chipGroup, setOutput: setOutput, clamp: clamp, roundRect: roundRect, arrow: arrow, label: label, graph: graph, line: line, tickStep: tickStep, sign: sign };
})();
