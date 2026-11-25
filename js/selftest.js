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
    for (let i = 0; i < 6; i++) click(q('[data-run="line"]'));
    const cur = q('#code-lines .ln.cur .no');
    check('six line steps land on line 7', cur && cur.textContent === '7', cur && cur.textContent);
    check('variables table shows error', /−0\.500|-0\.500/.test(q('#code-vars').textContent) || q('#code-vars').textContent.includes('0.500'), q('#code-vars').textContent.slice(0, 80));
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
