// Shared helpers: number formatting, KaTeX, and the lesson markup ({{term}}, \( \), [[set:...]]).
(function (root) {
  'use strict';

  const KATEX_OPTS = {
    throwOnError: false,
    strict: 'ignore',
    trust: (ctx) => ctx.command === '\\htmlData',
    macros: { '\\T': '\\htmlData{term=#1}{#2}' },
  };

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Display number with a real minus sign (U+2212).
  function fmt(v, d = 2) {
    if (v === null || v === undefined || Number.isNaN(v)) return '–';
    if (!Number.isFinite(v)) return v > 0 ? '∞' : '−∞';
    const s = Math.abs(v).toFixed(d);
    return (v < 0 && Number(s) !== 0 ? '−' : '') + s;
  }
  // Number for inside TeX (KaTeX draws "-" as a minus). Wrap negatives in parentheses when asked.
  function tn(v, d = 2, paren = false) {
    const s = (v < 0 ? '-' : '') + Math.abs(v).toFixed(d);
    return paren && v < 0 ? '(' + s + ')' : s;
  }

  function tex(src, display = false) {
    if (root.katex) {
      try { return root.katex.renderToString(src, Object.assign({ displayMode: display }, KATEX_OPTS)); }
      catch (e) { return '<code title="' + esc(e.message) + '">' + esc(src) + '</code>'; }
    }
    return '<code>' + esc(src) + '</code>';  // KaTeX not loaded (offline): show the source
  }

  // Lesson markup to HTML. newIds: terms introduced in this lesson get a heavier style.
  function markup(src, glossary, newIds = []) {
    let html = src.replace(/\[\[set:(\{[^\]]*?\})\|([^\]]+)\]\]/g, (_, json, text) =>
      `<button type="button" class="try" data-set='${json.replace(/'/g, '&#39;')}'>${text}</button>`);
    html = html.replace(/\{\{(\w+)(?:\|([^}]+))?\}\}/g, (_, id, text) => {
      const g = glossary[id];
      const label = text || (g ? g.label : id);
      return `<span class="t${newIds.includes(id) ? ' new' : ''}" data-term="${id}">${label}</span>`;
    });
    html = html.replace(/\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)/g, (_, disp, inl) =>
      disp !== undefined ? tex(disp, true) : tex(inl, false));
    return html;
  }

  root.R = { esc, fmt, tn, tex, markup };
})(window);
