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
<meta content="text/html;charset=utf-8" http-equiv="Content-Type"/>
<style>
canvas {
    padding-left: 0;
    padding-right: 0;
    margin-left: auto;
    margin-right: auto;
    display: block;
    width: 600px;
}
</style>
</head>
<body>
<canvas id="game-canvas"></canvas>
<script type="module">
    import init, { Universe, Cell } from '/game/game.js';
    const wasm = await init();
    const CELL_SIZE = 5;
    const GRID_COLOR = "#CCCCCC";
    const DEAD_COLOR = "#FFFFFF";
    const ALIVE_COLOR = "#000000";
    const universe = Universe.new(64, 64);
    const width = universe.width();
    const height = universe.height();
    const canvas = document.getElementById("game-canvas");
    canvas.height = (CELL_SIZE + 1) * height + 1;
    canvas.width = (CELL_SIZE + 1) * width + 1;
    const ctx = canvas.getContext('2d');
    const renderLoop = () => {
        universe.tick();
        drawGrid();
        drawCells();
        requestAnimationFrame(renderLoop);
    };
    requestAnimationFrame(renderLoop);
    const getIndex = (row, column) => {
        return row * width + column;
    };
    const drawCells = () => {
        const cellsPtr = universe.cells();
        const cells = new Uint8Array(wasm.memory.buffer, cellsPtr, width * height);
        ctx.beginPath();
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const idx = getIndex(row, col);
                ctx.fillStyle = cells[idx] === Cell.Dead
                    ? DEAD_COLOR
                    : ALIVE_COLOR;
                ctx.fillRect(
                    col * (CELL_SIZE + 1) + 1,
                    row * (CELL_SIZE + 1) + 1,
                    CELL_SIZE,
                    CELL_SIZE
                );
            }
        }
        ctx.stroke();
    };
    const drawGrid = () => {
        ctx.beginPath();
        ctx.strokeStyle = GRID_COLOR;
        for (let i = 0; i <= width; i++) {
            ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
            ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
        }
        for (let j = 0; j <= height; j++) {
            ctx.moveTo(0,                           j * (CELL_SIZE + 1) + 1);
            ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
        }
        ctx.stroke();
    };
</script>
</body>
{{< /rawhtml >}}
