// The math of one neuron, and nothing else (no page code), so the tests can load the same file.
// Works as a browser global (window.Neuron) and as a Node module (require).
(function (root) {
  'use strict';

  const sigmoid = (z) => 1 / (1 + Math.exp(-z));

  // Activation functions. threshold: the output at or above which the neuron "accepts".
  const ACTIVATIONS = {
    linear:  { name: 'none (linear)', symbol: 'a', fn: (z) => z,              threshold: 0.5, range: null,     probability: false },
    sigmoid: { name: 'sigmoid',       symbol: 'σ', fn: sigmoid,               threshold: 0.5, range: [0, 1],   probability: true  },
    tanh:    { name: 'tanh',          symbol: 'tanh', fn: Math.tanh,          threshold: 0,   range: [-1, 1],  probability: false },
    relu:    { name: 'ReLU',          symbol: 'ReLU', fn: (z) => Math.max(0, z), threshold: 0.5, range: null,  probability: false },
  };

  const OFFERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Lesson 2's label rule: the fair split. Accept $5 or more out of $10.
  const label = (x) => (x >= 5 ? 1 : 0);

  function forward(w, b, x, act = 'sigmoid') {
    const z = w * x + b;
    return { z, a: ACTIVATIONS[act].fn(z) };
  }

  // One gradient-descent step on one example (sigmoid output, cross-entropy loss).
  function step(w, b, x, eta, y = label(x)) {
    const z = w * x + b;
    const p = sigmoid(z);
    const error = p - y;            // dL/dz
    const gradW = error * x;        // dL/dw = dL/dz * dz/dw, and dz/dw = x
    const gradB = error;            // dL/db = dL/dz * dz/db, and dz/db = 1
    const w2 = w - eta * gradW;
    const b2 = b - eta * gradB;
    return { x, y, w, b, z, p, error, gradW, gradB, eta, wNew: w2, bNew: b2, pNew: sigmoid(w2 * x + b2) };
  }

  // One epoch: one step per offer, $0 to $10 in order.
  function epoch(w, b, eta) {
    let last = null;
    for (const x of OFFERS) {
      last = step(w, b, x, eta);
      w = last.wNew;
      b = last.bNew;
    }
    return { w, b, last };
  }

  // Average cross-entropy over all offers: L = -[y ln p + (1 - y) ln(1 - p)].
  function loss(w, b) {
    const eps = 1e-12;
    let total = 0;
    for (const x of OFFERS) {
      const p = Math.min(Math.max(sigmoid(w * x + b), eps), 1 - eps);
      const y = label(x);
      total += -(y * Math.log(p) + (1 - y) * Math.log(1 - p));
    }
    return total / OFFERS.length;
  }

  // The offer at which the neuron is at its threshold (z = 0 for sigmoid): x = -b / w.
  const fiftyFifty = (w, b) => (w === 0 ? null : -b / w);

  const Neuron = { sigmoid, ACTIVATIONS, OFFERS, label, forward, step, epoch, loss, fiftyFifty };
  if (typeof module !== 'undefined' && module.exports) module.exports = Neuron;
  else root.Neuron = Neuron;
})(typeof window !== 'undefined' ? window : globalThis);
