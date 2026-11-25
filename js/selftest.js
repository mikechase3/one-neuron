// Self-test of the page, run only when the address ends in "selftest" (e.g. index.html#/1/selftest).
// It drives the real buttons and writes PASS/FAIL lines into <pre id="selftest">, so a headless
// browser can check the page:  brave-browser --headless=new --dump-dom "file://.../index.html#/1/selftest"
(function (root) {
  'use strict';
  if (!/selftest/.test(location.hash)) return;
  const out = [], near = (a, b, t = 0.0015) => Math.abs(a - b) <= t;
  const check = (name, ok, got) => out.push(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ' (got ' + got + ')'}`);
  const q = (sel) => document.querySelector(sel);
  const click = (el) => el && el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  const S = root.Lab.state;
  try {
    check('lesson 1 math has a hoverable P(reject)', !!q('#math [data-term="preject"]'), 'missing');
    check('lab arithmetic has hoverable z', !!q('#arith [data-term="z"]'), 'missing');
    location.hash = '#/2'; root.dispatchEvent(new HashChangeEvent('hashchange'));
    check('lesson 2 starts at w = 0.1, b = 0, x = 8', S.w === 0.1 && S.b === 0 && S.x === 8, [S.w, S.b, S.x]);
    click(q('[data-train="step"]'));
    check('one step on $8 gives w = 0.348', near(S.w, 0.348), S.w);
    check('one step on $8 gives b = 0.031', near(S.b, 0.031), S.b);
    check('step math is rendered', !!q('#tab-train .lastmath .katex'), 'no katex');
    click([...document.querySelectorAll('button.try')].find((b) => b.textContent.includes('$2')));
    click(q('[data-train="step"]'));
    check('then a step on $2 gives w = 0.213', near(S.w, 0.213), S.w);
    check('and b = -0.036', near(S.b, -0.036), S.b);
    click(q('[data-act="relu"]'));
    check('clicking the ReLU tile sets the dropdown', q('#act').value === 'relu', q('#act').value);
    check('training is disabled for ReLU', q('[data-train="step"]').disabled === true, 'enabled');
    click(q('[data-act="sigmoid"]'));

    location.hash = '#/3'; root.dispatchEvent(new HashChangeEvent('hashchange'));
    check('lesson 3 opens on the Code tab', S.tab === 'code' && !!q('#code-lines'), S.tab);
    for (let i = 0; i < 10; i++) click(q('[data-run="line"]'));  // line 1, then lines 2..10 for offer $0
    for (let i = 0; i < 4; i++) click(q('[data-run="line"]'));   // lines 2..5 for offer $1, next line 6
    const cur = q('#code-lines .ln.cur .no');
    check('14 line steps land on line 6, offer $1', cur && cur.textContent === '6' && q('#code-vars').textContent.includes('$1'), cur && cur.textContent);
    const st1 = Neuron.step(Neuron.step(0.1, 0, 0, 0.1).wNew, Neuron.step(0.1, 0, 0, 0.1).bNew, 1, 0.1);
    check('variables table shows p for offer $1', q('#code-vars').textContent.includes(st1.p.toFixed(3)), q('#code-vars').textContent.replace(/\s+/g, ' ').slice(0, 120));
    click(q('[data-run="line"]'));
    check('one more line computes the error', q('#code-vars').textContent.includes(R.fmt(st1.error, 3)), R.fmt(st1.error, 3));
    click(q('[data-run="restart"]'));
    click(q('[data-tab="code"]'));
    const sp = q('#code-speed'); sp.value = sp.max; sp.dispatchEvent(new Event('input', { bubbles: true }));
    q('#code-n').value = 100;
    // start the 100 epochs from lesson start
    click(q('#reset-lesson'));
    q('#code-n').value = 100;
    const sp2 = q('#code-speed'); sp2.value = sp2.max; sp2.dispatchEvent(new Event('input', { bubbles: true }));
    click(q('[data-run="n"]'));
    check('instant run of 100 epochs: epochs = 100', S.epochs === 100, S.epochs);
    check('instant run of 100 epochs: w = 1.423', near(S.w, 1.423), S.w);
    check('instant run of 100 epochs: b = -5.493', near(S.b, -5.493), S.b);
    check('loss chart drawn', !!q('#code-loss svg'), 'none');
  } catch (e) { out.push('FAIL exception: ' + e.message); }
  const pre = document.createElement('pre'); pre.id = 'selftest';
  pre.textContent = out.join('\n') + '\n' + (out.some((l) => l.startsWith('FAIL')) ? 'SELFTEST FAILED' : 'SELFTEST PASSED');
  document.body.appendChild(pre);
})(window);
