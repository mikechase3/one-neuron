// Lesson content as data. Markup inside `reading`:
//   {{id}} or {{id|text}}      a term with a hover definition (ids in glossary.js)
//   \( ... \)  and  \[ ... \]  inline and display math (KaTeX). \T{id}{tex} makes math hoverable.
//   [[set:{json}|button text]]  a button that sets the lab (w, b, x, act, eta, tab)
// Dollar signs are plain text (no $...$ math), so offers like $8 are safe.
(function (root) {
  'use strict';

  const LESSONS = [
    {
      id: 1,
      title: 'One neuron, one forward pass',
      start: { w: 0.5, b: -2, x: 1, act: 'sigmoid', eta: 0.1, tab: 'table' },
      tabs: ['table'],
      newTerms: ['ultimatum', 'equilibrium', 'neuron', 'input', 'w', 'b', 'parameters', 'init', 'z', 'logit',
                 'activation', 'sigmoid', 'e', 'negexp', 'p', 'preject', 'forward', 'fifty', 'linear', 'tanh', 'relu', 'hidden'],
      math: [
        { tex: '\\T{z}{z} = \\T{w}{w}\\cdot \\T{x}{x} + \\T{b}{b}', text: 'z = w*x + b', note: 'weighted sum' },
        { tex: '\\T{sigmoid}{\\sigma}(z) = \\dfrac{1}{1 + \\T{e}{e}^{-z}}', text: 'sigma(z) = 1 / (1 + e^(-z))', note: 'sigmoid, the activation' },
        { tex: '\\T{p}{p} = \\sigma(z) = P(\\text{accept})', text: 'p = sigma(z) = P(accept)', note: 'the output' },
        { tex: '\\T{preject}{P(\\text{reject})} = 1 - p', text: 'P(reject) = 1 - p', note: '' },
        { tex: '\\T{fifty}{z = 0} \\iff x = -\\dfrac{b}{w}', text: '50/50 point: z = 0, so x = -b / w', note: 'b sets where, w how sharply' },
        { tex: '\\T{negexp}{a^{-n}} = \\dfrac{1}{a^{n}} \\qquad a^{1/n} = \\sqrt[n]{a}', text: 'a^(-n) = 1 / a^n;  a^(1/n) = nth root of a', note: 'flip vs root' },
      ],
      reading: `
<h2>The game</h2>
<p>The {{ultimatum}}: a proposer splits a $10 pot and offers you {{x|x}} dollars. <b>Accept</b> and you get x. <b>Reject</b> and you both get $0.</p>
<p>The game-theory answer is to accept any offer above $0, because something beats nothing (the {{equilibrium|subgame-perfect equilibrium}}). People don't play that way: they reject lowball offers.</p>

<h2>The smallest network: one neuron</h2>
<p>The lab (middle) shows it: one {{input}} node, one output node, and one arrow between them. Every arrow is a {{w|weight}}.</p>
<p>The neuron takes the {{z|weighted sum}} \\( \\T{z}{z} = \\T{w}{w}\\cdot \\T{x}{x} + \\T{b}{b} \\), then squashes it with the {{sigmoid}}, its {{activation}}. Out comes \\( \\T{p}{p} \\), the probability that it accepts.</p>
<p>Only \\(w\\) and \\(b\\) can change. They are the {{parameters}}; before training they start as small random numbers ({{init}}).</p>

<h2>A forward pass in your head</h2>
<p>A {{forward}} runs one offer through with the parameters held fixed. With \\( w = 0.5,\\ b = -2 \\):</p>
<table class="work">
<tr><th>offer</th><th class="n">z = 0.5·x − 2</th><th class="n">e<sup>−z</sup></th><th class="n">p = σ(z)</th><th>reads as</th></tr>
<tr><td>$1</td><td class="n">−1.5</td><td class="n">4.48</td><td class="n">0.18</td><td>18% chance of accepting: mostly <b>reject</b></td></tr>
<tr><td>$4</td><td class="n">0</td><td class="n">1</td><td class="n">0.50</td><td>coin flip</td></tr>
<tr><td>$10</td><td class="n">3</td><td class="n">0.05</td><td class="n">0.95</td><td>mostly <b>accept</b></td></tr>
</table>
<p>For $10, \\( e^{-3} = \\dfrac{1}{e^{3}} = \\dfrac{1}{20.1} \\approx 0.05 \\), using the {{negexp|negative-exponent rule}}, so \\( p = \\dfrac{1}{1.05} \\approx 0.95 \\).</p>
<p><b>The sign of z decides the lean:</b> z &gt; 0 exactly when p &gt; 0.5.</p>
<p>[[set:{"w":0.5,"b":-2,"x":1}|set w = 0.5, b = −2, offer $1]] [[set:{"x":4}|offer $4]] [[set:{"x":10}|offer $10]]</p>

<h2>What the bias is for</h2>
<p>The neuron is at 50/50 where z = 0, the {{fifty}}: \\( x = -b/w = 2/0.5 = 4 \\). <b>w sets how sharply</b> it switches; <b>b sets where</b>.</p>
<p>Try these and watch the curve:</p>
<p>[[set:{"w":0.5,"b":0}|no bias: b = 0]] stuck switching at $0. [[set:{"w":0,"b":-2}|no weight: w = 0]] a flat line; the offer has no effect.</p>

<h2>Many right answers</h2>
<p>To accept $5 or more, any \\( w &gt; 0 \\) with \\( -b/w \\) between 4 and 5 works. There are infinitely many correct pairs, and training finds one of them.</p>
<p>[[set:{"w":0.5,"b":-2.25}|w = 0.5, b = −2.25]] [[set:{"w":2,"b":-9}|w = 2, b = −9 (sharper)]] [[set:{"w":0.6,"b":-3}|w = 0.6, b = −3 ($5 is exactly 50/50)]]</p>

<h2>Other activation functions</h2>
<p>Click a tile in the lab: {{linear}}, sigmoid, {{tanh}}, {{relu}}. Only sigmoid's output is a probability.</p>
<p>With no activation, stacked layers collapse into one straight line. The squashing is what makes the curve "curvy", and what makes depth worth having.</p>

<h2>Going deep</h2>
<p>A {{hidden}} sits between input and output:</p>
<pre>INPUT     HIDDEN (3 nodes)      OUTPUT
          ┌─► (h1) ─┐
  (x) ────┼─► (h2) ─┼────────► (p)
          └─► (h3) ─┘
 3 w + 3 b            3 w + 1 b  = 10 parameters</pre>
<p>Every node does the same thing: a weighted sum, plus a bias, then an activation. Each node's output is an input to the next layer.</p>
`,
    },

    {
      id: 2,
      title: 'Training, one step by hand',
      start: { w: 0.1, b: 0, x: 8, act: 'sigmoid', eta: 0.1, tab: 'train' },
      tabs: ['table', 'train'],
      newTerms: ['y', 'label', 'error', 'loss', 'gradient', 'partial', 'eta', 'update', 'descent', 'backprop', 'chain', 'dzdw', 'dzdb', 'step'],
      math: [
        { tex: '\\T{y}{y} = \\begin{cases} 1 & x \\ge 5 \\\\ 0 & \\text{otherwise} \\end{cases}', text: 'y = 1 if x >= 5 else 0', note: 'the target (label rule)' },
        { tex: '\\T{error}{p - y}', text: 'error = p - y', note: 'error signal' },
        { tex: '\\T{chain}{\\dfrac{\\partial L}{\\partial w}} = \\dfrac{\\partial L}{\\partial z}\\cdot\\T{dzdw}{\\dfrac{\\partial z}{\\partial w}} = (p - y)\\cdot x', text: 'dL/dw = dL/dz * dz/dw = (p - y) * x', note: 'chain rule' },
        { tex: '\\dfrac{\\partial L}{\\partial b} = \\dfrac{\\partial L}{\\partial z}\\cdot\\T{dzdb}{\\dfrac{\\partial z}{\\partial b}} = (p - y)\\cdot 1', text: 'dL/db = dL/dz * dz/db = (p - y) * 1', note: '' },
        { tex: '\\T{update}{w \\leftarrow w - \\T{eta}{\\eta}\\,\\dfrac{\\partial L}{\\partial w}}', text: 'w <- w - eta * dL/dw', note: 'update rule' },
        { tex: 'b \\leftarrow b - \\eta\\,\\dfrac{\\partial L}{\\partial b}', text: 'b <- b - eta * dL/db', note: '' },
        { tex: '\\T{loss}{L} = -\\left[\\,y \\ln p + (1-y)\\ln(1-p)\\,\\right]', text: 'L = -[y ln p + (1 - y) ln(1 - p)]', note: 'cross-entropy loss (lesson 4 explains it)' },
      ],
      reading: `
<h2>From sliders to arithmetic</h2>
<p>In lesson 1 you trained the neuron yourself, dragging w and b until the curve looked right. Training does the same thing by arithmetic, one example at a time.</p>

<h2>Four new pieces</h2>
<table class="work">
<tr><td>{{y|target y}}</td><td>The answer we want. Not a layer of the network: it is what the output p gets compared to. Here \\( y = 1 \\) (accept) if the offer is $5 or more, else \\( y = 0 \\). It is 0 or 1 because p is a probability and we are sure of the answer.</td></tr>
<tr><td>{{error|error signal}}</td><td>\\( p - y \\). Negative: p should have been higher. Positive: lower.</td></tr>
<tr><td>{{gradient}}</td><td>How the error changes when a parameter is nudged. A direction and a size, <b>not the new value</b>.</td></tr>
<tr><td>{{eta|learning rate η}}</td><td>η is the Greek letter <b>eta</b> ("AY-tuh"). How big a step to take. We use 0.1.</td></tr>
</table>
<p>The {{update|update rules}}, the whole of training for one neuron:</p>
\\[ w \\leftarrow w - \\eta\\,(p - y)\\,x \\qquad\\qquad b \\leftarrow b - \\eta\\,(p - y) \\]

<h2>Step 1: offer $8, target y = 1</h2>
<p>[[set:{"w":0.1,"b":0,"x":8,"eta":0.1,"tab":"train"}|set w = 0.1, b = 0, offer $8]] then press <b>1 step on this x</b> in the Train tab to check each line.</p>
<ol class="steps">
<li><b>Forward:</b> \\( z = 0.1\\cdot 8 + 0 = 0.80 \\), so \\( p = \\sigma(0.80) = 0.690 \\). It leans the right way but isn't sure.</li>
<li><b>Error:</b> \\( p - y = 0.690 - 1 = -0.310 \\). Negative, so p should go up.</li>
<li><b>Gradients:</b> \\( \\dfrac{\\partial L}{\\partial w} = (p-y)\\,x = -0.310 \\times 8 = −2.48 \\) and \\( \\dfrac{\\partial L}{\\partial b} = p - y = -0.310 \\).</li>
<li><b>Update:</b> \\( w \\leftarrow 0.1 - 0.1 \\times (-2.48) = \\) <b>0.348</b> and \\( b \\leftarrow 0 - 0.1 \\times (-0.310) = \\) <b>0.031</b>.</li>
<li><b>Check:</b> \\( p(\\$8) \\) went from 0.69 to 0.94.</li>
</ol>
<p class="callout"><b>Watch out:</b> −2.48 is the gradient, not the new weight. The new weight is the old one minus η times the gradient: 0.348. The gradient only says which way to push and how hard; η scales the push.</p>

<h2>Step 2: offer $2, target y = 0</h2>
<p>[[set:{"x":2}|now offer $2]] (keep the new w and b) and press <b>1 step on this x</b> again.</p>
<ol class="steps">
<li>\\( z = 0.348\\cdot 2 + 0.031 = 0.727 \\), so \\( p = 0.674 \\): it wrongly leans accept.</li>
<li>Error: \\( p - y = +0.674 \\). Positive, so p should go down.</li>
<li>\\( w \\leftarrow 0.348 - 0.1\\times(0.674\\times 2) = \\) <b>0.213</b> and \\( b \\leftarrow 0.031 - 0.1\\times 0.674 = \\) <b>−0.036</b>. The bias went negative on its own.</li>
<li>\\( p(\\$2) \\) went from 0.674 to 0.60.</li>
</ol>

<h2>Why multiply by x?</h2>
<p>z changes by x when w changes by 1, so \\( \\T{dzdw}{\\partial z/\\partial w} = x \\). A weight is blamed in proportion to the input it multiplied; an offer of $0 means w had no effect, so it gets no blame. A bias always adds 1:1 to z (\\( \\T{dzdb}{\\partial z/\\partial b} = 1 \\)), so its gradient is just the error.</p>

<h2>Backpropagation vs gradient descent</h2>
<p>Every step does both:</p>
<ul>
<li>{{backprop|Backpropagation}} <b>computes</b> the gradients. The error is measured at the output and passed backwards with the {{chain}}.</li>
<li>{{descent|Gradient descent}} <b>uses</b> them: it steps each parameter against its gradient.</li>
</ul>
<p>In a deep network, backpropagation is what does the heavy lifting: the chain runs back through every layer.</p>
<p>Why the error comes out as exactly \\( p - y \\) needs one derivative of the {{loss}}. That's lesson 4.</p>

<h2>You wrote the labels</h2>
<p>The neuron learns whatever the labels say. Your fair-split labels teach fairness. Reward it with the dollars it keeps instead, and the same arithmetic pushes it toward accepting everything, the equilibrium.</p>
`,
    },

    {
      id: 3,
      title: 'The training loop, as code',
      start: { w: 0.1, b: 0, x: 0, act: 'sigmoid', eta: 0.1, tab: 'code' },
      tabs: ['table', 'train', 'code'],
      newTerms: ['epoch', 'convergence', 'overshoot', 'margin'],
      math: [
        { tex: '\\begin{aligned}&\\text{for each } \\T{epoch}{\\text{epoch}}:\\\\ &\\quad \\text{for } x = 0, 1, \\dots, 10:\\\\ &\\qquad w \\leftarrow w - \\eta\\,(p-y)\\,x\\\\ &\\qquad b \\leftarrow b - \\eta\\,(p-y)\\end{aligned}', text: 'for each epoch: for x in 0..10: w -= eta*(p-y)*x; b -= eta*(p-y)', note: 'the whole loop' },
        { tex: '\\bar L = \\dfrac{1}{11}\\sum_{x=0}^{10} L(x)', text: 'average loss over the 11 offers', note: 'one number per epoch' },
        { tex: '\\T{margin}{x^{*}} = \\dfrac{4 + 5}{2} = 4.5', text: 'widest-margin boundary: halfway between $4 and $5', note: 'where it heads' },
      ],
      reading: `
<h2>From one step to a loop</h2>
<p>Lesson 2 did one {{step}} at a time. One pass over all 11 offers, $0 to $10, is an {{epoch}}. Training is just epochs, over and over.</p>
<p>Open the <b>Code</b> tab. That is the whole program in Python. The stepper runs it one line at a time, shows every variable in a table, and moves the same w and b as the sliders, so the curve changes while it runs.</p>
<p>[[set:{"w":0.1,"b":0,"eta":0.1,"tab":"code"}|start over: w = 0.1, b = 0, η = 0.1]]</p>
<ul>
<li><b>Step line:</b> one line of code.</li>
<li><b>Finish example:</b> the rest of the current offer.</li>
<li><b>Finish epoch:</b> the rest of the 11 offers.</li>
<li><b>Run epochs:</b> as many as you type, at the speed you pick. "Instant" skips the animation.</li>
</ul>

<h2>Watch the loss fall</h2>
<p>From w = 0.1, b = 0 with η = 0.1:</p>
<table class="work">
<tr><th>epochs</th><th class="n">w</th><th class="n">b</th><th class="n">50/50 point</th><th class="n">loss</th></tr>
<tr><td>0</td><td class="n">0.10</td><td class="n">0.00</td><td class="n">$0.00</td><td class="n">0.577</td></tr>
<tr><td>100</td><td class="n">1.42</td><td class="n">−5.49</td><td class="n">$3.86</td><td class="n">0.126</td></tr>
<tr><td>147</td><td class="n"></td><td class="n"></td><td class="n">$4.00</td><td class="n"></td></tr>
<tr><td>10,000</td><td class="n">6.56</td><td class="n">−29.37</td><td class="n">$4.48</td><td class="n">0.007</td></tr>
</table>
<p>After 100 epochs, $4 is still accepted even though its label says reject. Epoch 147 is the first with all 11 decisions right.</p>

<h2>Where it ends up</h2>
<p>The 50/50 point creeps toward <b>$4.50</b>, halfway between the last reject ($4) and the first accept ($5). That's the boundary farthest from both, the widest {{margin}}.</p>
<p>The loss never reaches exactly 0, so w and b keep growing. The curve gets steeper and steeper, approaching a plain <code>if x &gt;= 4.5: accept</code>. The sigmoid is a soft if-statement that training sharpens.</p>
<p>The decisions settle long before the numbers stop moving. That's what {{convergence}} looks like here.</p>

<h2>The learning rate</h2>
<p>[[set:{"w":0.1,"b":0,"eta":0.01,"tab":"code"}|η = 0.01]] slow: after 100 epochs the 50/50 point is only at $2.95.</p>
<p>[[set:{"w":0.1,"b":0,"eta":1,"tab":"code"}|η = 1]] big steps: the loss jumps from 0.577 to 3.76 after the first epoch ({{overshoot|overshooting}}). By 1,000 epochs it's at $4.48 with a loss near 0.001.</p>
<p>For one neuron, a big η works out in the end. In big networks, too large an η can make training blow up, so picking η is a real decision.</p>
`,
    },
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = { LESSONS };
  else root.LESSONS = LESSONS;
})(typeof window !== 'undefined' ? window : globalThis);
