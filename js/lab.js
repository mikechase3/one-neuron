// The lab: diagram, activation tiles, sliders, curve, and the Table and Train tabs.
// One state object; every control writes to it through Lab.set(), and render() redraws everything.
(function (root) {
  'use strict';
  const N = root.Neuron, R = root.R;
  const $ = (id) => document.getElementById(id);

  const SLIDERS = [
    { key: 'w', term: 'w', min: -3, max: 3, step: 0.01, d: 2 },
    { key: 'b', term: 'b', min: -10, max: 10, step: 0.01, d: 2 },
    { key: 'x', term: 'x', min: 0, max: 10, step: 1, d: 0, money: true },
    { key: 'eta', term: 'eta', label: 'η', min: 0.01, max: 1, step: 0.01, d: 2 },
  ];

  const state = {
    w: 0.5, b: -2, x: 1, act: 'sigmoid', eta: 0.1, tab: 'table', tabs: ['table'],
    epochs: 0, steps: 0, losses: [], last: null,
  };
  const listeners = [];

  const actOf = () => N.ACTIVATIONS[state.act];
  const out = (x) => N.forward(state.w, state.b, x, state.act);
  const accepts = (a) => a >= actOf().threshold;

  // ---------- public API ----------
  // set(): change state. fromTraining: true when the change is a training update (keeps history).
  function set(patch, fromTraining = false, forceReset = false) {
    const wbChanged = ('w' in patch && patch.w !== state.w) || ('b' in patch && patch.b !== state.b);
    Object.assign(state, patch);
    if ((wbChanged && !fromTraining) || forceReset) { state.epochs = 0; state.steps = 0; state.losses = []; state.last = null; listeners.forEach((f) => f('reset')); }
    if (!state.tabs.includes(state.tab)) state.tab = state.tabs[0];
    render();
  }
  const onExternalChange = (f) => listeners.push(f);

  // ---------- diagram ----------
  function diagram() {
    const A = actOf(), { z, a } = out(state.x);
    const sym = state.act === 'sigmoid' ? 'σ' : state.act === 'linear' ? 'none' : A.symbol;
    const outLabel = state.act === 'sigmoid' ? 'p = σ(z)' : state.act === 'linear' ? 'a = z' : `a = ${A.symbol}(z)`;
    const outWhat = A.probability ? 'OUTPUT: P(accept)' : 'OUTPUT: a(z), not a probability';
    $('diagram').innerHTML = `
      <defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
      <g style="color:var(--mut)" stroke="currentColor" fill="none" stroke-width="1.5">
        <circle cx="60" cy="62" r="34"/><rect x="230" y="30" width="190" height="64" rx="8"/><rect x="545" y="30" width="200" height="64" rx="8"/>
        <line x1="94" y1="62" x2="228" y2="62" marker-end="url(#ar)"/><line x1="420" y1="62" x2="543" y2="62" marker-end="url(#ar)"/>
        <line x1="325" y1="135" x2="325" y2="96" marker-end="url(#ar)"/></g>
      <text x="60" y="58" text-anchor="middle" font-size="16" data-term="x">x</text>
      <text x="60" y="78" text-anchor="middle" font-size="13">$${state.x}</text>
      <text x="60" y="112" text-anchor="middle" font-size="11" data-term="input">INPUT (offer)</text>
      <text x="160" y="54" text-anchor="middle" font-size="13" style="fill:var(--acc)" data-term="w">w = ${R.fmt(state.w)}</text>
      <text x="325" y="56" text-anchor="middle" font-size="14" data-term="z">z = w·x + b</text>
      <text x="325" y="78" text-anchor="middle" font-size="13">= ${R.fmt(z)}</text>
      <text x="325" y="148" text-anchor="middle" font-size="13" style="fill:var(--acc2)" data-term="b">b = ${R.fmt(state.b)}</text>
      <text x="482" y="54" text-anchor="middle" font-size="13" data-term="${state.act === 'sigmoid' ? 'sigmoid' : state.act}">${sym}</text>
      <text x="645" y="56" text-anchor="middle" font-size="14" data-term="${A.probability ? 'p' : 'activation'}">${outLabel}</text>
      <text x="645" y="78" text-anchor="middle" font-size="13">= ${R.fmt(a)} ${accepts(a) ? 'accept' : 'reject'}</text>
      <text x="645" y="112" text-anchor="middle" font-size="11">${outWhat}</text>`;
  }

  // ---------- activation tiles ----------
  function tiles() {
    const fx = { linear: 'a(z) = z', sigmoid: 'σ(z) = 1/(1+e^−z)', tanh: 'tanh(z), −1 to 1', relu: 'ReLU(z) = max(0, z)' };
    $('tiles').innerHTML = Object.entries(N.ACTIVATIONS).map(([k, A]) => {
      const pts = []; let lo = Infinity, hi = -Infinity;
      for (let i = 0; i <= 40; i++) { const zz = -4 + i * 0.2, v = A.fn(zz); pts.push([zz, v]); lo = Math.min(lo, v); hi = Math.max(hi, v); }
      const X = (zz) => 4 + (zz + 4) / 8 * 142, Y = (v) => 36 - (v - lo) / ((hi - lo) || 1) * 32;
      const d = pts.map(([zz, v], i) => (i ? 'L' : 'M') + X(zz).toFixed(1) + ',' + Y(v).toFixed(1)).join('');
      const th = Y(A.threshold);
      return `<button type="button" class="tile${k === state.act ? ' on' : ''}" data-act="${k}" role="radio" aria-checked="${k === state.act}">
        <span class="tn" data-term="${k === 'sigmoid' ? 'sigmoid' : k}">${A.name}</span>
        <svg viewBox="0 0 150 40" preserveAspectRatio="none"><line x1="75" y1="2" x2="75" y2="38" stroke="var(--line)"/>
          <line x1="4" y1="${th}" x2="146" y2="${th}" stroke="var(--line)" stroke-dasharray="3 3"/>
          <path d="${d}" fill="none" stroke="var(--acc)" stroke-width="2"/></svg>
        <span class="tf">${fx[k]} · accept if ≥ ${A.threshold}</span></button>`;
    }).join('');
    $('act').innerHTML = Object.entries(N.ACTIVATIONS).map(([k, A]) => `<option value="${k}"${k === state.act ? ' selected' : ''}>${A.name}</option>`).join('');
  }

  // ---------- sliders + typed values ----------
  function buildSliders() {
    $('sliders').innerHTML = SLIDERS.map((s) => `
      <div class="srow"><span class="sl t" data-term="${s.term}">${s.label || s.key}</span>
        <input type="range" id="r-${s.key}" min="${s.min}" max="${s.max}" step="${s.step}" aria-label="${s.key}">
        <input type="number" id="n-${s.key}" step="${s.step}" aria-label="${s.key} value"></div>
      ${s.key === 'w' || s.key === 'b' ? `<div class="ticks"><span>${s.min}</span><span>0</span><span>${s.max}</span></div>` : ''}`).join('');
    for (const s of SLIDERS) {
      $('r-' + s.key).addEventListener('input', (e) => set({ [s.key]: Number(e.target.value) }));
      $('n-' + s.key).addEventListener('change', (e) => {
        let v = Number(e.target.value);
        if (!Number.isFinite(v)) return;
        if (s.key === 'x') v = Math.min(10, Math.max(0, Math.round(v)));
        if (s.key === 'eta') v = Math.max(0.0001, v);
        set({ [s.key]: v });
      });
    }
  }
  function syncSliders() {
    for (const s of SLIDERS) {
      const v = state[s.key], r = $('r-' + s.key), n = $('n-' + s.key);
      r.value = Math.min(s.max, Math.max(s.min, v));
      if (document.activeElement !== n) n.value = s.d ? Number(v.toFixed(s.d === 2 ? 3 : s.d)) : v;
      const outside = v < s.min || v > s.max;
      n.classList.toggle('out', outside);
      n.title = outside ? 'beyond the slider range; the slider is pinned at its end' : '';
    }
  }

  function arith() {
    const { z, a } = out(state.x), A = actOf();
    const zl = `z = ${R.tn(state.w)}\\cdot ${state.x} + ${R.tn(state.b, 2, true)} = ${R.tn(z)}`;
    let al;
    if (state.act === 'sigmoid') al = `p = \\sigma(${R.tn(z)}) = \\dfrac{1}{1 + ${Math.exp(-z) > 9999 ? '\\text{huge}' : R.tn(Math.exp(-z))}} = ${R.tn(a)}`;
    else if (state.act === 'linear') al = `a = z = ${R.tn(a)}`;
    else if (state.act === 'relu') al = `a = \\max(0, ${R.tn(z)}) = ${R.tn(a)}`;
    else al = `a = \\tanh(${R.tn(z)}) = ${R.tn(a)}`;
    const verdict = accepts(a) ? `<b class="ok">accept</b>` : `<b class="bad">reject</b>`;
    const ff = state.act === 'sigmoid' || state.act === 'tanh' ? N.fiftyFifty(state.w, state.b) : null;
    $('arith').innerHTML = R.tex(zl, true) + R.tex(al, true) +
      `<div>${verdict} <span class="small">(accept if ${A.probability ? 'p' : 'a'} ≥ ${A.threshold})</span>` +
      (ff !== null ? ` <span class="small"> · <span class="t" data-term="fifty">50/50 point</span>: x = −b/w = $${R.fmt(ff)}</span>` : state.w === 0 ? ' <span class="small">· w = 0: the offer has no effect</span>' : '') + '</div>';
  }

  // ---------- curve ----------
  function curve() {
    const A = actOf(); let lo, hi;
    if (A.range) [lo, hi] = A.range;
    else {
      const vals = N.OFFERS.map((o) => out(o).a).concat([A.threshold]);
      lo = Math.min(...vals); hi = Math.max(...vals);
      const pad = (hi - lo) * 0.08 || 1; lo -= pad; hi += pad;
    }
    const L = 58, Rr = 410, T = 14, B = 222;
    const X = (o) => L + o / 10 * (Rr - L), Y = (v) => B - (v - lo) / (hi - lo) * (B - T);
    let d = ''; for (let i = 0; i <= 200; i++) { const o = i / 20; d += (i ? 'L' : 'M') + X(o).toFixed(1) + ',' + Y(out(o).a).toFixed(1); }
    let ticks = ''; for (let o = 0; o <= 10; o += 1) ticks += `<line x1="${X(o)}" y1="${B}" x2="${X(o)}" y2="${B + 4}" stroke="var(--mut)"/>` + (o % 2 === 0 ? `<text x="${X(o)}" y="${B + 16}" font-size="11" text-anchor="middle">$${o}</text>` : '');
    const yt = [lo, A.threshold, hi].map((v) => `<text x="${L - 6}" y="${Y(v) + 4}" font-size="11" text-anchor="end">${R.fmt(v, Math.abs(v) < 10 ? 2 : 0)}</text>`).join('');
    const ff = N.fiftyFifty(state.w, state.b);
    const ffLine = state.act === 'sigmoid' && ff !== null && ff >= 0 && ff <= 10 ? `<line x1="${X(ff)}" y1="${T}" x2="${X(ff)}" y2="${B}" stroke="var(--acc2)" stroke-dasharray="2 4"/>` : '';
    const ylab = A.probability ? 'P(accept) = σ(z)' : `a(z) = ${A.name}, not a probability`;
    const cur = out(state.x).a;
    $('curve').innerHTML = `
      <line x1="${L}" y1="${B}" x2="${Rr}" y2="${B}" stroke="var(--line)"/><line x1="${L}" y1="${T}" x2="${L}" y2="${B}" stroke="var(--line)"/>
      <line x1="${L}" y1="${Y(A.threshold)}" x2="${Rr}" y2="${Y(A.threshold)}" stroke="var(--mut)" stroke-dasharray="4 4"/>
      ${ffLine}${ticks}${yt}
      <path d="${d}" fill="none" stroke="var(--acc)" stroke-width="2.5"/>
      <circle cx="${X(state.x)}" cy="${Math.max(T, Math.min(B, Y(cur)))}" r="5.5" fill="var(--acc2)"/>
      <text x="${(L + Rr) / 2}" y="${B + 36}" font-size="11.5" text-anchor="middle" data-term="x">Offer to the responder ($, out of a $10 pot)</text>
      <text x="14" y="${(T + B) / 2}" font-size="11.5" text-anchor="middle" transform="rotate(-90 14 ${(T + B) / 2})" data-term="${A.probability ? 'p' : 'activation'}">${ylab}</text>
      <text x="${Rr}" y="${Y(A.threshold) - 4}" font-size="10" text-anchor="end" style="fill:var(--mut)">accept above this line</text>`;
  }

  // ---------- tabs ----------
  const TAB_NAMES = { table: 'Table', train: 'Train', code: 'Code' };
  function tabbar() {
    $('tiles').hidden = state.tab === 'code';  // the code trains a sigmoid; give the code room
    $('tabbar').innerHTML = state.tabs.map((t) => `<button type="button" role="tab" data-tab="${t}" class="${t === state.tab ? 'on' : ''}" aria-selected="${t === state.tab}">${TAB_NAMES[t]}</button>`).join('');
    for (const t of ['table', 'train', 'code']) $('tab-' + t).hidden = t !== state.tab;
  }

  function table() {
    const A = actOf(), lab = state.tabs.includes('train');
    let rows = '';
    for (const o of N.OFFERS) {
      const { z, a } = out(o), acc = accepts(a), y = N.label(o);
      rows += `<tr class="${o === state.x ? 'cur' : ''}"><td>$${o}</td><td class="n">${R.fmt(z)}</td>` +
        (state.act === 'sigmoid' ? `<td class="n">${Math.exp(-z) > 999 ? '&gt;999' : R.fmt(Math.exp(-z))}</td>` : '') +
        `<td class="n">${R.fmt(a)}</td><td class="${acc ? 'ok' : 'bad'}">${acc ? 'accept' : 'reject'}</td>` +
        (lab ? `<td class="n">${y}</td><td>${(acc ? 1 : 0) === y ? '<span class="ok">✓</span>' : '<span class="bad">✗</span>'}</td>` : '') + '</tr>';
    }
    $('tab-table').innerHTML = `<table class="grid"><thead><tr><th>offer x</th><th class="n">z</th>` +
      (state.act === 'sigmoid' ? `<th class="n">e<sup>−z</sup></th>` : '') +
      `<th class="n">${A.probability ? 'p = σ(z)' : 'a(z)'}</th><th>leans</th>` +
      (lab ? `<th class="n"><span class="t" data-term="y">target y</span></th><th>right?</th>` : '') + `</tr></thead><tbody>${rows}</tbody></table>`;
  }

  function train() {
    const el = $('tab-train');
    if (!state.tabs.includes('train')) { el.innerHTML = ''; return; }
    const ok = state.act === 'sigmoid';
    const s = state.last;
    let last = '<p class="small">Press "1 step on this x" to see the arithmetic of one step.</p>';
    if (s) {
      const lines = [
        `z &= w\\cdot x + b = ${R.tn(s.w, 3)}\\cdot ${s.x} + ${R.tn(s.b, 3, true)} = ${R.tn(s.z, 3)}`,
        `p &= \\sigma(z) = \\sigma(${R.tn(s.z, 3)}) = ${R.tn(s.p, 3)}`,
        `\\T{error}{p - y} &= ${R.tn(s.p, 3)} - ${s.y} = ${R.tn(s.error, 3)}`,
        `\\dfrac{\\partial L}{\\partial w} &= (p - y)\\,x = ${R.tn(s.error, 3)} \\times ${s.x} = ${R.tn(s.gradW, 3)}`,
        `\\dfrac{\\partial L}{\\partial b} &= p - y = ${R.tn(s.error, 3)}`,
        `w &\\leftarrow w - \\eta\\,\\dfrac{\\partial L}{\\partial w} = ${R.tn(s.w, 3)} - ${R.tn(s.eta, 2)} \\times ${R.tn(s.gradW, 3, true)} = \\mathbf{${R.tn(s.wNew, 3)}}`,
        `b &\\leftarrow b - \\eta\\,\\dfrac{\\partial L}{\\partial b} = ${R.tn(s.b, 3)} - ${R.tn(s.eta, 2)} \\times ${R.tn(s.error, 3, true)} = \\mathbf{${R.tn(s.bNew, 3)}}`,
        `p(\\$${s.x}) &: ${R.tn(s.p, 3)} \\to ${R.tn(s.pNew, 3)}`,
      ];
      const plain = [
        `z      = w*x + b = ${R.fmt(s.w, 3)}*${s.x} + ${R.fmt(s.b, 3)} = ${R.fmt(s.z, 3)}`,
        `p      = sigma(z) = ${R.fmt(s.p, 3)}`,
        `error  = p - y = ${R.fmt(s.p, 3)} - ${s.y} = ${R.fmt(s.error, 3)}`,
        `dL/dw  = error * x = ${R.fmt(s.error, 3)} * ${s.x} = ${R.fmt(s.gradW, 3)}`,
        `dL/db  = error = ${R.fmt(s.error, 3)}`,
        `w new  = ${R.fmt(s.w, 3)} - ${s.eta} * ${R.fmt(s.gradW, 3)} = ${R.fmt(s.wNew, 3)}`,
        `b new  = ${R.fmt(s.b, 3)} - ${s.eta} * ${R.fmt(s.error, 3)} = ${R.fmt(s.bNew, 3)}`,
        `p($${s.x}): ${R.fmt(s.p, 3)} -> ${R.fmt(s.pNew, 3)}`,
      ];
      last = `<div class="lastmath">${R.tex('\\begin{aligned}' + lines.join('\\\\') + '\\end{aligned}', true)}</div>
        <details><summary>plain-text version</summary><pre>${plain.join('\n')}</pre></details>`;
    }
    el.innerHTML = `
      <div class="trainbar"><span><span class="t" data-term="label">label rule</span>: ${R.tex('y = 1 \\text{ if } x \\ge 5 \\text{ else } 0')}</span>
        <span class="small">example: offer $${state.x}, target y = ${N.label(state.x)} (change x with its slider)</span></div>
      ${ok ? '' : '<p class="disabled-note">Training here uses the sigmoid (the error p − y only holds for sigmoid with cross-entropy). Pick sigmoid to train.</p>'}
      <div class="trainbar">
        <button type="button" data-train="step" ${ok ? '' : 'disabled'}>1 step on this x</button>
        <button type="button" data-train="epoch" ${ok ? '' : 'disabled'}>1 epoch (all offers $0 to $10)</button>
        <button type="button" data-train="100" ${ok ? '' : 'disabled'}>100 epochs</button>
        <button type="button" data-train="start" ${ok ? '' : 'disabled'}>start from w = 0.1, b = 0</button></div>
      <div class="stats"><span><span class="t" data-term="loss">loss</span> <b>${R.fmt(N.loss(state.w, state.b), 3)}</b></span>
        <span><span class="t" data-term="epoch">epochs</span> <b>${state.epochs}</b></span><span><span class="t" data-term="step">steps</span> <b>${state.steps}</b></span>
        <span>η <b>${state.eta}</b></span></div>
      ${last}`;
  }

  function doTrain(kind) {
    if (kind === 'start') { set({ w: 0.1, b: 0 }); return; }
    if (kind === 'step') {
      const s = N.step(state.w, state.b, state.x, state.eta);
      state.steps++; state.last = s; set({ w: s.wNew, b: s.bNew }, true); return;
    }
    const n = kind === 'epoch' ? 1 : 100;
    let { w, b } = state, last = null;
    for (let i = 0; i < n; i++) { const r = N.epoch(w, b, state.eta); w = r.w; b = r.b; last = r.last; state.losses.push(N.loss(w, b)); }
    state.epochs += n; state.steps += n * N.OFFERS.length; state.last = null;
    set({ w, b }, true);
    listeners.forEach((f) => f('trained'));
  }

  // ---------- render all ----------
  const renderHooks = [];
  function render() {
    diagram(); tiles(); syncSliders(); arith(); curve(); tabbar(); table(); train();
    renderHooks.forEach((f) => f());
  }

  function init() {
    buildSliders();
    $('act').addEventListener('change', (e) => set({ act: e.target.value }));
    $('tiles').addEventListener('click', (e) => { const t = e.target.closest('[data-act]'); if (t) set({ act: t.dataset.act }); });
    $('tabbar').addEventListener('click', (e) => { const t = e.target.closest('[data-tab]'); if (t) set({ tab: t.dataset.tab }); });
    $('tab-train').addEventListener('click', (e) => { const t = e.target.closest('[data-train]'); if (t && !t.disabled) doTrain(t.dataset.train); });
    render();
  }

  root.Lab = { state, set, init, render, onExternalChange, onRender: (f) => renderHooks.push(f) };
})(window);
