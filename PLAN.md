# Plan

A small, self-contained web app of lessons on how a neural network learns, built one lesson at a time while
the author works through them. One neuron plays the responder in the Ultimatum Game; later lessons add
training, the loop as code, the loss, and a hidden layer.

**Widescreen only.** Laid out for a 1920x1080 display at 100% zoom. No phone or e-reader layout.

## Layout (one screen, no page scroll; each column scrolls on its own)

```
+-------------------------------------------------------------------------------------------+
| one-neuron   < Back   Lesson 2 of 3: Training, one step by hand   Next >      [glossary]   |
+----------------------+------------------------------------------+-------------------------+
| READING              | LAB (interactive)                        | MATH                    |
| lesson text,         | network diagram (live numbers)           | this lesson's formulas, |
| worked example,      | parameters: w, b, x sliders, zero in the | KaTeX (real fractions), |
| "try this" prompts   |   middle, + number boxes to type values  | each with a collapsible |
| that set the lab     | activation picker (4 small tiles; click  | plain-text version      |
| ("set w = 0.1, b = 0"| = select)                                | NEW TERMS in this lesson|
|  buttons)            | curve a(z) vs offer, axis titles + units | (earlier terms: hover)  |
|                      | tabs: [Table] [Train] [Code]             |                         |
+----------------------+------------------------------------------+-------------------------+
```

- **Reset** returns the lab to the current lesson's starting state (lesson 1: w = 0.5, b = -2, x = $1;
  lesson 2: w = 0.1, b = 0, x = $8).
- **Hover definitions:** every term and symbol (w, b, x, z, p, y, η, σ, P(reject), L, ∂L/∂w ...) is
  marked; hovering shows a callout with its definition and the lesson it was introduced in. One glossary
  file is the single source; a glossary drawer lists everything.
- **Math:** KaTeX from a CDN (pinned version), so ∂L/∂w renders as a fraction. Every formula keeps a
  plain-text twin in a collapsible.
- **Train tab:** label rule y = 1 if x ≥ 5, learning rate η, buttons for 1 step on this x, 1 epoch,
  100 epochs, and "start from w = 0.1, b = 0". The last step's arithmetic is shown in KaTeX, text
  version collapsible. Loss and epoch counters.
- **Code tab (lesson 3):** the training loop as about 12 lines of Python. A stepper highlights the
  current line and shows a variables table (epoch, x, y, z, p, error, grad_w, grad_b, w, b), with
  controls: step one line, finish this example, finish this epoch, run 100 epochs, pause, and a speed
  slider. It drives the same w and b as the sliders, so the curve moves while it runs.

## Lessons

1. **One neuron, forward pass.** Inputs, weight, bias, weighted sum z, sigmoid, P(accept), 50/50 point.
2. **Training, one step by hand.** Target y, error p − y, gradient, learning rate η, the update rules,
   the chain rule; backpropagation versus gradient descent.
3. **The training loop as code.** Epochs, the loss curve, learning rate too small or too large,
   the code stepper.
4. Later: the loss and why the error is exactly p − y; a hidden layer; softmax and sampling.

## Files

```
index.html          shell: header, three columns, lesson nav
css/style.css       light and dark, widescreen grid
js/neuron.js        the math only (activation functions, forward, gradient step, loss); no DOM
js/glossary.js      every term: id, label, definition, lesson introduced
js/lessons.js       lesson content as data: title, reading HTML, math list, new terms, start state
js/lab.js           diagram, sliders, curve, table, train tab
js/stepper.js       the Python stepper (lesson 3)
js/render.js        number formatting, KaTeX, lesson markup
js/app.js           routing (#/1, #/2 ...), hover callouts, glossary drawer
js/selftest.js      page self-test (only with "selftest" in the address)
tests/neuron.test.cjs   node test of the math against the worked numbers in the lessons
```

No build step, no framework, and no ES modules (they do not load from file://). `node tests/neuron.test.mjs` checks that the worked examples in the
lesson text match what the code computes (for example, from w = 0.1, b = 0, η = 0.1, one step on
x = $8 gives w = 0.348, b = 0.031).
