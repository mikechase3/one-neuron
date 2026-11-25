// The Code tab: the training loop as Python, run one line at a time like a debugger.
// It reads and writes the lab's w and b, so the sliders and the curve move while it runs.
(function (root) {
  'use strict';
  const N = root.Neuron, R = root.R, Lab = root.Lab;
  const $ = (id) => document.getElementById(id);

  const PRE = [
    'offers = range(0, 11)            # $0 .. $10',
    'w, b = <w>, <b>                  # current parameters',
    'eta = <eta>                      # learning rate',
    'def sigmoid(z): return 1 / (1 + exp(-z))',
  ];
  // Stepped lines, numbered 1..11.
  const LINES = [
    'for epoch in range(n_epochs):',
    '    for x in offers:',
    '        y = 1 if x >= 5 else 0     # target',
    '        z = w * x + b              # weighted sum',
    '        p = sigmoid(z)             # forward pass',
    '        error = p - y              # error signal',
    '        grad_w = error * x         # backprop: dL/dw',
    '        grad_b = error             # backprop: dL/db',
    '        w = w - eta * grad_w       # gradient descent',
    '        b = b - eta * grad_b',
    '    loss = mean_loss(w, b)         # after each epoch',
  ];
  const VARS = [
    ['epoch', 'epoch'], ['x', 'x'], ['y', 'y'], ['z', 'z'], ['p', 'p'], ['error', 'error'],
    ['grad_w', 'gradient'], ['grad_b', 'gradient'], ['w', 'w'], ['b', 'b'], ['loss', 'loss'],
  ];
  const SPEEDS = [1, 2, 5, 10, 30, 100, 400, Infinity];  // lines per second; last = instant

  const S = {
    next: 1, xi: 0, epochInRun: 0, vars: {}, changed: [],
    running: false, target: null, timer: null, speedIdx: 3, nEpochs: 100,
  };

  function resetProgram() { stop(); S.next = 1; S.xi = 0; S.epochInRun = 0; S.vars = {}; S.changed = []; }

  // Execute the line S.next. Returns the event: 'line', 'example' (finished an offer), 'epoch'.
  function exec(silent) {
    const st = Lab.state, v = S.vars;
    let ev = 'line';
    switch (S.next) {
      case 1: v.epoch = st.epochs; S.xi = 0; S.changed = ['epoch']; S.next = 2; break;
      case 2: v.x = N.OFFERS[S.xi]; S.changed = ['x']; S.next = 3; break;
      case 3: v.y = N.label(v.x); S.changed = ['y']; S.next = 4; break;
      case 4: v.z = st.w * v.x + st.b; v.w = st.w; v.b = st.b; S.changed = ['z']; S.next = 5; break;
      case 5: v.p = N.sigmoid(v.z); S.changed = ['p']; S.next = 6; break;
      case 6: v.error = v.p - v.y; S.changed = ['error']; S.next = 7; break;
      case 7: v.grad_w = v.error * v.x; S.changed = ['grad_w']; S.next = 8; break;
      case 8: v.grad_b = v.error; S.changed = ['grad_b']; S.next = 9; break;
      case 9: v.w = st.w - st.eta * v.grad_w; st.w = v.w; S.changed = ['w']; S.next = 10; break;
      case 10:
        v.b = st.b - st.eta * v.grad_b; st.b = v.b; st.steps++; S.changed = ['b'];
        S.xi++; S.next = S.xi < N.OFFERS.length ? 2 : 11; ev = 'example'; break;
      case 11:
        v.loss = N.loss(st.w, st.b); st.epochs++; st.losses.push(v.loss); S.changed = ['loss'];
        S.epochInRun++; S.next = 1; ev = 'epoch'; break;
    }
    if (!silent) Lab.set({}, true);
    return ev;
  }

  // Run whole epochs fast, when sitting at the top of the loop (instant mode).
  function fastEpochs(n) {
    const st = Lab.state;
    for (let i = 0; i < n; i++) {
      const r = N.epoch(st.w, st.b, st.eta); st.w = r.w; st.b = r.b;
      st.epochs++; st.steps += N.OFFERS.length; S.epochInRun++;
      st.losses.push(N.loss(st.w, st.b));
      const l = r.last; Object.assign(S.vars, { epoch: st.epochs - 1, x: l.x, y: l.y, z: l.z, p: l.p, error: l.error, grad_w: l.gradW, grad_b: l.gradB, w: st.w, b: st.b, loss: st.losses[st.losses.length - 1] });
    }
    S.changed = ['loss']; S.next = 1;
  }

  // Run until `until` says stop: 'example', 'epoch', or a number of epochs.
  function run(until) {
    stop();
    if (Lab.state.act !== 'sigmoid') return;
    S.running = true; S.target = until; S.epochInRun = 0;
    const sp = SPEEDS[S.speedIdx];
    if (sp === Infinity) { finishInstant(); return; }
    let acc = 0, lastT = performance.now();
    const tick = (t) => {
      if (!S.running) return;
      acc += (t - lastT) / 1000 * sp; lastT = t;
      let n = Math.floor(acc); acc -= n;
      while (n-- > 0 && S.running) { const ev = exec(true); if (done(ev)) { S.running = false; } }
      Lab.set({}, true);
      if (S.running) S.timer = requestAnimationFrame(tick);
    };
    S.timer = requestAnimationFrame(tick);
    draw();
  }
  function done(ev) {
    if (S.target === 'example') return ev === 'example';
    if (S.target === 'epoch') return ev === 'epoch';
    if (typeof S.target === 'number') return ev === 'epoch' && S.epochInRun >= S.target;
    return true;
  }
  function finishInstant() {
    // finish the current example/epoch line by line, then whole epochs at full speed
    let guard = 0;
    if (S.target === 'example') { while (exec(true) !== 'example' && guard++ < 20); }
    else {
      if (S.next !== 1) { let ev; do { ev = exec(true); } while (ev !== 'epoch' && guard++ < 200); }
      const want = S.target === 'epoch' ? 1 : S.target;
      const left = want - S.epochInRun;
      if (left > 0) fastEpochs(left);
    }
    S.running = false; Lab.set({}, true);
  }
  function stop() { S.running = false; if (S.timer) cancelAnimationFrame(S.timer); S.timer = null; }

  // ---------- drawing ----------
  function codeHtml() {
    const st = Lab.state;
    const pre = PRE.map((l) => l.replace('<w>', R.fmt(st.w, 3).replace('−', '-')).replace('<b>', R.fmt(st.b, 3).replace('−', '-')).replace('<eta>', st.eta));
    const line = (no, raw, cls) => {
      const j = raw.indexOf('#');  // pad the code so every comment starts in the same column
      const text = j >= 0 ? raw.slice(0, j).trimEnd().padEnd(34) + raw.slice(j) : raw;
      const i = text.indexOf('#');
      const body = i >= 0 ? R.esc(text.slice(0, i)) + '<span class="cm">' + R.esc(text.slice(i)) + '</span>' : R.esc(text);
      return `<div class="ln ${cls}"><span class="no">${no}</span><span>${body}</span></div>`;
    };
    return pre.map((t) => line('', t, 'pre')).join('') +
      LINES.map((t, i) => line(i + 1, t, i + 1 === S.next ? 'cur' : '')).join('');
  }
  function varsHtml() {
    const v = S.vars;
    const show = (k) => (v[k] === undefined ? '' : k === 'epoch' || k === 'y' ? v[k] : k === 'x' ? '$' + v[k] : R.fmt(v[k], 3));
    return `<table class="grid vars"><thead><tr><th>variable</th><th class="n">value</th></tr></thead><tbody>` +
      VARS.map(([k, term]) => `<tr><td><span class="t" data-term="${term}">${k}</span></td><td class="n${S.changed.includes(k) ? ' changed' : ''}">${show(k)}</td></tr>`).join('') +
      `</tbody></table>`;
  }
  function lossChart() {
    const L = Lab.state.losses;
    if (L.length < 2) return '<p class="small">Loss per epoch appears here once two epochs have run.</p>';
    const W = 300, H = 90, step = Math.max(1, Math.floor(L.length / 300));
    const pts = []; for (let i = 0; i < L.length; i += step) pts.push([i, L[i]]);
    pts.push([L.length - 1, L[L.length - 1]]);
    const hi = Math.max(...L), X = (i) => 30 + i / (L.length - 1) * (W - 36), Y = (v) => 8 + (1 - v / hi) * (H - 24);
    return `<svg viewBox="0 0 ${W} ${H}" width="100%"><line x1="30" y1="${H - 16}" x2="${W - 6}" y2="${H - 16}" stroke="var(--line)"/>
      <path d="${pts.map(([i, v], k) => (k ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(v).toFixed(1)).join('')}" fill="none" stroke="var(--acc2)" stroke-width="2"/>
      <text x="26" y="12" font-size="10" text-anchor="end">${R.fmt(hi, 2)}</text><text x="26" y="${H - 14}" font-size="10" text-anchor="end">0</text>
      <text x="${(W + 30) / 2}" y="${H - 2}" font-size="10" text-anchor="middle">epoch (${L.length} so far) · loss now ${R.fmt(L[L.length - 1], 3)}</text></svg>`;
  }

  function draw() {
    const el = $('tab-code');
    if (!Lab.state.tabs.includes('code')) { el.innerHTML = ''; delete el.dataset.built; return; }
    if (!el.dataset.built) build();
    const ok = Lab.state.act === 'sigmoid';
    $('code-lines').innerHTML = codeHtml();
    $('code-vars').innerHTML = varsHtml();
    $('code-loss').innerHTML = lossChart();
    const v = S.vars;
    $('code-where').innerHTML = ok
      ? `next: line ${S.next}` + (v.x !== undefined && S.next >= 3 && S.next <= 10 ? ` · offer $${v.x}` : '') + ` · epochs done: ${Lab.state.epochs}` + (S.running ? ' · <b>running</b>' : '')
      : '<span class="disabled-note">The code trains a sigmoid neuron. Pick sigmoid to run it.</span>';
    el.querySelectorAll('[data-run]').forEach((b) => { b.disabled = !ok || (S.running && b.dataset.run !== 'pause'); });
    el.querySelector('[data-run="pause"]').disabled = !S.running;
    $('code-speed-label').textContent = SPEEDS[S.speedIdx] === Infinity ? 'instant' : SPEEDS[S.speedIdx] + ' lines/s';
  }

  function build() {
    const el = $('tab-code');
    el.dataset.built = '1';
    el.innerHTML = `
      <div class="ctl">
        <button type="button" data-run="line">Step line</button>
        <button type="button" data-run="example">Finish example</button>
        <button type="button" data-run="epoch">Finish epoch</button>
        <button type="button" data-run="n">Run</button><input type="number" id="code-n" min="1" value="${S.nEpochs}" aria-label="epochs to run"> epochs
        <button type="button" data-run="pause">Pause</button>
        <button type="button" data-run="restart" title="Back to line 1; keeps w and b">Back to line 1</button>
      </div>
      <div class="ctl"><span class="small">speed</span><input type="range" id="code-speed" min="0" max="${SPEEDS.length - 1}" step="1" value="${S.speedIdx}" aria-label="speed"><span id="code-speed-label" class="small"></span></div>
      <div class="where" id="code-where"></div>
      <div class="code-wrap"><div class="code mono" id="code-lines"></div><div><div id="code-vars"></div><div id="code-loss"></div></div></div>`;
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-run]'); if (!b || b.disabled) return;
      const k = b.dataset.run;
      if (k === 'line') { stop(); exec(false); }
      else if (k === 'example') run('example');
      else if (k === 'epoch') run('epoch');
      else if (k === 'n') { S.nEpochs = Math.max(1, Number($('code-n').value) || 1); run(S.nEpochs); }
      else if (k === 'pause') { stop(); draw(); }
      else if (k === 'restart') { resetProgram(); draw(); }
    });
    $('code-speed').addEventListener('input', (e) => { S.speedIdx = Number(e.target.value); draw(); });
  }

  Lab.onRender(draw);
  Lab.onExternalChange(() => resetProgram());
  root.Stepper = { reset: resetProgram, draw };
})(window);
