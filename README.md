# one-neuron

Interactive lessons on how a neural network learns, starting from a single neuron that plays the
responder in the Ultimatum Game. Each lesson has three columns: a reading, a lab you can drag and
step through, and the lesson's math (rendered with KaTeX, with a plain-text version of every formula).
Every term and symbol shows its definition when you hover it.

**Widescreen only:** laid out for a 1920x1080 screen at 100% zoom.

## Lessons

1. **One neuron, one forward pass:** input, weight, bias, weighted sum, sigmoid, the 50/50 point, other activation functions.
2. **Training, one step by hand:** the target, the error p − y, gradients, the learning rate η, the update rules, backpropagation vs gradient descent.
3. **The training loop, as code:** epochs, the loss curve, the learning rate, and a line-by-line stepper for the Python loop with a variables table.

More to come: why the error is exactly p − y (the loss), a hidden layer, softmax and sampling.

## Use

Open `index.html` in a browser (no server and no build step). The math needs an internet connection
to load KaTeX; without it the formulas show as TeX source.

## Checks

```bash
node tests/neuron.test.cjs                       # the math, against every number quoted in the lessons
brave-browser --headless=new --virtual-time-budget=5000 \
  --dump-dom "file://$PWD/index.html#/1/selftest" | grep -E 'PASS|FAIL'   # drives the real page
```

## Files

| Path | What |
| --- | --- |
| `js/neuron.js` | The math only (activations, forward pass, one training step, epoch, loss). Used by the page and the tests. |
| `js/lessons.js` | Lesson content as data: reading, math, new terms, starting state. |
| `js/glossary.js` | Every term and symbol, with the lesson that introduces it. |
| `js/lab.js`, `js/stepper.js` | The lab (diagram, sliders, curve, Table and Train tabs) and the Code tab stepper. |
| `js/render.js`, `js/app.js` | Markup and KaTeX helpers; lesson pages, hover definitions, glossary. |
| `js/selftest.js` | Runs only with `selftest` in the address; clicks through the page and reports PASS/FAIL. |
| `PLAN.md` | The design plan. |
