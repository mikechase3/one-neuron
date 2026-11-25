// Checks the math in js/neuron.js against the worked numbers printed in the lessons.
// Run: node tests/neuron.test.cjs   (exit 1 on any failure)
'use strict';
const N = require('../js/neuron.js');
const L = require('../js/lessons.js');

let failures = 0;
function near(name, got, want, tol = 0.0015) {
  const ok = Math.abs(got - want) <= tol;
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}: got ${got.toFixed(4)}, want ${want}`);
}
function has(name, text, needle) {
  const ok = text.includes(needle);
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}: lesson text contains "${needle}"`);
}

// Lesson 1: forward pass at w = 0.5, b = -2.
near('sigma(0)', N.sigmoid(0), 0.5);
near('L1 $1: z', N.forward(0.5, -2, 1).z, -1.5);
near('L1 $1: p', N.forward(0.5, -2, 1).a, 0.18, 0.003);
near('L1 $4: p', N.forward(0.5, -2, 4).a, 0.5);
near('L1 $10: p', N.forward(0.5, -2, 10).a, 0.95, 0.003);
near('L1 50/50 point', N.fiftyFifty(0.5, -2), 4);

// Lesson 2: from w = 0.1, b = 0, eta = 0.1: one step on $8, then one on $2.
const s1 = N.step(0.1, 0, 8, 0.1);
near('L2 step 1 z', s1.z, 0.80);
near('L2 step 1 p', s1.p, 0.690);
near('L2 step 1 error', s1.error, -0.310);
near('L2 step 1 gradW', s1.gradW, -2.480, 0.003);
near('L2 step 1 new w', s1.wNew, 0.348);
near('L2 step 1 new b', s1.bNew, 0.031);
near('L2 step 1 new p', s1.pNew, 0.94, 0.005);
const s2 = N.step(s1.wNew, s1.bNew, 2, 0.1);
near('L2 step 2 z', s2.z, 0.727);
near('L2 step 2 p', s2.p, 0.674);
near('L2 step 2 new w', s2.wNew, 0.213);
near('L2 step 2 new b', s2.bNew, -0.036);
near('L2 step 2 new p', s2.pNew, 0.596, 0.005);

// The lesson text quotes those same numbers.
const l2 = L.LESSONS.find((l) => l.id === 2).reading;
for (const n of ['0.348', '0.031', '0.213', '−0.036', '−2.48', '0.674']) has('L2 reading', l2, n);

// Lesson 3: long runs (numbers quoted in its reading).
function train(eta, epochs) { let w = 0.1, b = 0; for (let e = 0; e < epochs; e++) ({ w, b } = N.epoch(w, b, eta)); return { w, b }; }
const r100 = train(0.1, 100);
near('L3 100 epochs w', r100.w, 1.423);
near('L3 100 epochs b', r100.b, -5.493);
near('L3 100 epochs 50/50', N.fiftyFifty(r100.w, r100.b), 3.86, 0.005);
const r10k = train(0.1, 10000);
near('L3 10k epochs 50/50', N.fiftyFifty(r10k.w, r10k.b), 4.48, 0.005);
function firstAllCorrect(eta){ let w=0.1,b=0; for(let e=1;e<=5000;e++){ ({w,b}=N.epoch(w,b,eta)); if(N.OFFERS.every(x=>(N.forward(w,b,x).a>=0.5)===(x>=5))) return e; } return -1; }
const fc = firstAllCorrect(0.1); const fcOk = fc === 147; if(!fcOk) failures++; console.log(`${fcOk?'ok  ':'FAIL'} L3 first all-correct epoch: got ${fc}, want 147`);
near('L3 start loss', N.loss(0.1, 0), 0.577);
near('L3 100 epochs loss', N.loss(r100.w, r100.b), 0.126);
const e01 = train(0.01, 100); near('L3 eta 0.01, 100 epochs 50/50', N.fiftyFifty(e01.w, e01.b), 2.95, 0.005);
const e1a = train(1, 1); near('L3 eta 1, 1 epoch loss', N.loss(e1a.w, e1a.b), 3.76, 0.005);
const e1k = train(1, 1000); near('L3 eta 1, 1000 epochs 50/50', N.fiftyFifty(e1k.w, e1k.b), 4.48, 0.005);
const l3 = L.LESSONS.find((l) => l.id === 3).reading;
for (const n of ['3.86', '4.48', '1.42', '−5.49', '0.577', '0.126', '147', '2.95', '3.76', '6.56', '−29.37']) has('L3 reading', l3, n);

console.log(failures ? `\n${failures} FAILED` : '\nall passed');
process.exit(failures ? 1 : 0);
