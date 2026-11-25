// Lesson pages (#/1, #/2 ...), the reading and math columns, hover definitions, the glossary drawer.
(function (root) {
  'use strict';
  const { LESSONS, GLOSSARY, Lab, R } = root;
  const $ = (id) => document.getElementById(id);
  let cur = LESSONS[0];

  function lessonFromHash() {
    const n = Number((location.hash.match(/^#\/(\d+)/) || [])[1]);
    return LESSONS.find((l) => l.id === n) || LESSONS[0];
  }

  function show(lesson, resetLab) {
    cur = lesson;
    const i = LESSONS.indexOf(lesson);
    $('lesson-title').textContent = `Lesson ${lesson.id} of ${LESSONS.length}: ${lesson.title}`;
    document.title = `Lesson ${lesson.id}: ${lesson.title}`;
    $('prev').disabled = i === 0;
    $('next').disabled = i === LESSONS.length - 1;
    $('reading').innerHTML = `<h2 style="color:var(--fg);font-size:19px">${R.esc(lesson.title)}</h2>` + R.markup(lesson.reading, GLOSSARY, lesson.newTerms);
    $('reading').scrollTop = 0;
    $('math').innerHTML = lesson.math.map((m) => `<div class="mathrow">${R.tex(m.tex, true)}` +
      (m.note ? `<div class="note">${R.esc(m.note)}</div>` : '') +
      `<details><summary>plain text</summary><pre>${R.esc(m.text)}</pre></details></div>`).join('');
    $('newterms').innerHTML = lesson.newTerms.map((id) => {
      const g = GLOSSARY[id]; if (!g) return '';
      return `<dt><span class="t new" data-term="${id}">${R.esc(g.label)}</span></dt><dd>${R.esc(g.def)}</dd>`;
    }).join('');
    if (resetLab) resetToStart();
  }

  function resetToStart() {
    const s = cur.start;
    Lab.state.tabs = cur.tabs.slice();
    Lab.set({ w: s.w, b: s.b, x: s.x, act: s.act, eta: s.eta, tab: s.tab }, false, true);
  }

  // ---------- hover callouts ----------
  function bindCallout() {
    const pop = $('callout');
    document.addEventListener('mouseover', (e) => {
      const el = e.target.closest && e.target.closest('[data-term]');
      if (!el) { pop.hidden = true; return; }
      const g = GLOSSARY[el.getAttribute('data-term')];
      if (!g) { pop.hidden = true; return; }
      const where = g.lesson === cur.id ? 'new in this lesson' : g.lesson > 8 ? 'parked for a later lesson' : `from lesson ${g.lesson}`;
      pop.innerHTML = `<b>${R.esc(g.label)}</b><div>${R.esc(g.def)}</div><div class="src">${where}</div>`;
      pop.hidden = false;
      const r = el.getBoundingClientRect();
      let left = Math.min(window.innerWidth - 380, Math.max(8, r.left));
      let top = r.bottom + 8;
      if (top + pop.offsetHeight > window.innerHeight - 8) top = r.top - pop.offsetHeight - 8;
      pop.style.left = left + 'px'; pop.style.top = top + 'px';
    });
  }

  // ---------- glossary drawer ----------
  function glossary() {
    const byLesson = {};
    for (const [id, g] of Object.entries(GLOSSARY)) (byLesson[g.lesson] = byLesson[g.lesson] || []).push([id, g]);
    $('glossary-body').innerHTML = Object.keys(byLesson).sort((a, b) => a - b).map((n) =>
      `<h3>${Number(n) > 8 ? 'Parked for later' : 'Lesson ' + n}</h3><dl class="terms">` +
      byLesson[n].map(([id, g]) => `<dt>${R.esc(g.label)}</dt><dd>${R.esc(g.def)}</dd>`).join('') + '</dl>').join('');
  }

  function init() {
    Lab.init();
    bindCallout();
    glossary();
    $('prev').addEventListener('click', () => { const i = LESSONS.indexOf(cur); if (i > 0) location.hash = '#/' + LESSONS[i - 1].id; });
    $('next').addEventListener('click', () => { const i = LESSONS.indexOf(cur); if (i < LESSONS.length - 1) location.hash = '#/' + LESSONS[i + 1].id; });
    $('reset-lesson').addEventListener('click', resetToStart);
    $('open-glossary').addEventListener('click', () => { $('glossary').hidden = !$('glossary').hidden; });
    $('close-glossary').addEventListener('click', () => { $('glossary').hidden = true; });
    $('reading').addEventListener('click', (e) => {
      const b = e.target.closest('button.try'); if (!b) return;
      const patch = JSON.parse(b.dataset.set);
      if ('tab' in patch && !Lab.state.tabs.includes(patch.tab)) delete patch.tab;
      Lab.set(patch);
    });
    window.addEventListener('hashchange', () => show(lessonFromHash(), true));
    show(lessonFromHash(), true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(window);
