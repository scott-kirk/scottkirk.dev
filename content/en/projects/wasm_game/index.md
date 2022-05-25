---
title: 'WebAssembly Experiment'
weight: 2
resources:
    - src: wasm.png
      params:
          weight: -100
---
A simple [WebAssembly](https://webassembly.org/) proof of concept written in Rust. Based off of the RustWASM docs found [here](https://rustwasm.github.io/book/game-of-life/introduction.html) and [here](https://rustwasm.github.io/docs/wasm-bindgen/examples/without-a-bundler.html).
<br><br>
{{< rawhtml >}}
<head>
<meta content="text/html;charset=utf-8" http-equiv="Content-Type"/></head>
<body>
<div class="canvas-container">
    <canvas id="game-canvas"></canvas>
</div>
<script type="module" src="/scripts/game_layout.js"></script>
</body>
{{< /rawhtml >}}
