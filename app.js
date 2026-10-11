"use strict";
const $ = (id) => document.getElementById(id);
const PASSWORD = "PROGRAM";

// Each puzzle: render(stage, solved, say) builds UI; call solved() when correct.
const puzzles = [
  {
    concept: "Patterns", title: "Room 1: The Number Door",
    story: "A keypad glows with a sequence. Find the rule, then type the next number.",
    hints: ["Look at how each number relates to the one before it.", "Each number is double the previous one... or is it?"],
    render(stage, solved, say) {
      stage.append(code("3, 6, 12, 24, ?"));
      textAnswer(stage, "48", solved, say);
    },
  },
  {
    concept: "Variables", title: "Room 2: The Memory Vault",
    story: "Variables are labeled boxes that hold values. Trace the code like a computer, line by line. What does it print?",
    hints: ["Write x and y on paper and update them after every line.", "After line 3, x is 14 and y is 7."],
    render(stage, solved, say) {
      stage.append(code("x = 4\ny = x + 3\nx = y * 2\ny = x - y\nprint(x + y)"));
      textAnswer(stage, "21", solved, say);
    },
  },
  {
    concept: "Loops", title: "Room 3: The Looping Hallway",
    story: "A loop repeats code. Here, a loop lives inside another loop! How many stars get printed in total?",
    hints: ["Row 0 prints 1 star, row 1 prints 2 stars...", "range(4) means i = 0, 1, 2, 3. Add 1+2+3+4."],
    render(stage, solved, say) {
      stage.append(code('for i in range(4):\n    for j in range(i + 1):\n        print("*")'));
      textAnswer(stage, "10", solved, say);
    },
  },
  {
    concept: "Binary", title: "Room 4: The Binary Lights",
    story: "Computers count with on/off switches. Each bulb is worth a number; add the lit ones. Make the lights show the number 13.",
    hints: ["Bulb values: 8, 4, 2, 1.", "13 = 8 + 4 + 1."],
    render(stage, solved, say) {
      const vals = [8, 4, 2, 1], on = [false, false, false, false];
      const wrap = el("div", "bulbs"), total = el("div"); total.style.textAlign = "center";
      const upd = () => { total.textContent = "Total: " + vals.reduce((s, v, i) => s + (on[i] ? v : 0), 0); };
      vals.forEach((v, i) => {
        const d = el("div", "bulb"), b = el("button"); b.textContent = v; b.setAttribute("aria-label", "bulb " + v);
        b.onclick = () => { on[i] = !on[i]; b.classList.toggle("on", on[i]); upd(); };
        d.append(b); wrap.append(d);
      });
      const go = el("button", "big"); go.textContent = "Check Lights";
      go.onclick = () => {
        const sum = vals.reduce((s, v, i) => s + (on[i] ? v : 0), 0);
        sum === 13 ? solved() : say("That shows " + sum + ". Try again!", "bad");
      };
      upd(); stage.append(wrap, total, go);
    },
  },
  {
    concept: "Sequencing & Loops", title: "Room 5: The Robot Courier",
    story: "Program the robot 🤖 to reach the exit 🚪. Walls 🧱 block the way. You may use only 4 blocks, so use the repeat count!",
    hints: ["Column 3 is a wall from top to row 4. Go around the bottom.", "Down ×4, Right ×4, Up ×4."],
    render(stage, solved, say) {
      const W = ["0,2", "1,2", "2,2", "3,2"], goal = [0, 4], dirs = { "⬇": [1, 0], "➡": [0, 1], "⬆": [-1, 0], "⬅": [0, -1] };
      const grid = el("div", "grid"), prog = el("div", "row prog"), pick = el("div", "row");
      let list = [], busy = false, dir = "⬇", n = 1;
      const draw = (r = 0, c = 0) => {
        grid.innerHTML = "";
        for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
          const d = el("div", "cell");
          if (W.includes(i + "," + j)) { d.classList.add("wall"); d.textContent = "🧱"; }
          if (i === goal[0] && j === goal[1]) { d.classList.add("goal"); d.textContent = "🚪"; }
          if (i === r && j === c) d.textContent = "🤖";
          grid.append(d);
        }
      };
      const showProg = () => {
        prog.innerHTML = "";
        list.forEach(([d, k], i) => {
          const b = el("button", "block"); b.textContent = d + " ×" + k; b.title = "Remove";
          b.onclick = () => { if (!busy) { list.splice(i, 1); showProg(); } };
          prog.append(b);
        });
        if (!list.length) prog.textContent = "(click blocks to add; click a block to remove it)";
      };
      const sel = el("select"); [1, 2, 3, 4].forEach((k) => sel.append(new Option("×" + k, k)));
      sel.onchange = () => (n = +sel.value);
      Object.keys(dirs).forEach((d) => {
        const b = el("button"); b.textContent = d;
        b.onclick = () => { if (!busy && list.length < 4) { list.push([d, n]); showProg(); } else if (list.length >= 4) say("Max 4 blocks!", "bad"); };
        pick.append(b);
      });
      pick.append(sel);
      const run = el("button", "big"); run.textContent = "▶ Run Program";
      run.onclick = async () => {
        if (busy || !list.length) return; busy = true;
        let r = 0, c = 0, crashed = false; draw();
        for (const [d, k] of list) {
          for (let s = 0; s < k; s++) {
            const nr = r + dirs[d][0], nc = c + dirs[d][1];
            if (nr < 0 || nr > 4 || nc < 0 || nc > 4 || W.includes(nr + "," + nc)) { crashed = true; break; }
            r = nr; c = nc; draw(r, c); await sleep(250);
          }
          if (crashed) break;
        }
        busy = false;
        if (crashed) say("💥 Bonk! The robot hit a wall or the edge.", "bad");
        else if (r === goal[0] && c === goal[1]) solved();
        else say("The robot stopped at the wrong spot. Adjust and retry!", "bad");
      };
      draw(); showProg(); stage.append(grid, pick, prog, run);
    },
  },
  {
    concept: "Sorting Algorithms", title: "Room 6: The Sorting Conveyor",
    story: "The crates are out of order! Click one crate, then an <b>adjacent</b> one to swap them. Sort smallest → largest (like Bubble Sort!).",
    hints: ["Compare neighbors. If the left one is bigger, swap them.", "Repeat passes from left to right until nothing needs swapping."],
    render(stage, solved, say) {
      const a = [5, 2, 9, 1, 7, 3]; let sel = -1, swaps = 0;
      const bars = el("div", "bars"), info = el("div");
      const draw = () => {
        bars.innerHTML = "";
        a.forEach((v, i) => {
          const b = el("div", "bar" + (i === sel ? " sel" : "")); b.style.height = v * 22 + "px"; b.textContent = v;
          b.onclick = () => {
            if (sel < 0) sel = i;
            else if (Math.abs(sel - i) === 1) {
              [a[sel], a[i]] = [a[i], a[sel]]; swaps++; sel = -1;
            } else sel = i === sel ? -1 : i;
            info.textContent = "Swaps: " + swaps; draw();
            if (a.every((x, k) => !k || a[k - 1] <= x)) solved("Sorted in " + swaps + " swaps!");
          };
          bars.append(b);
        });
      };
      info.textContent = "Swaps: 0"; draw(); stage.append(bars, info);
    },
  },
  {
    concept: "Debugging", title: "Room 7: The Bug Nest",
    story: "This program should print the sum of 1 + 2 + 3 + 4 + 5 = 15, but it prints 10. Click the line with the bug 🐛.",
    hints: ["Does range(1, 5) include 5?", "range stops BEFORE the end number."],
    render(stage, solved, say) {
      const lines = ["total = 0", "for i in range(1, 5):", "    total = total + i", "print(total)"];
      const pre = el("pre");
      lines.forEach((t, i) => {
        const s = el("span", "line click"); s.textContent = (i + 1) + "  " + t;
        s.onclick = () => {
          if (i === 1) { s.classList.add("right"); solved("Bug squashed: it should be range(1, 6)."); }
          else { s.classList.add("wrong"); say("That line is fine. Look again!", "bad"); }
        };
        pre.append(s);
      });
      stage.append(pre);
    },
  },
];

function el(tag, cls) { const e = document.createElement(tag); if (cls) e.className = cls; return e; }
function code(t) { const p = el("pre"); p.textContent = t; return p; }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function textAnswer(stage, answer, solved, say) {
  const row = el("div", "row"), inp = el("input"), b = el("button", "big");
  inp.placeholder = "Your answer"; inp.autocomplete = "off"; b.textContent = "Submit";
  const check = () => (inp.value.trim() === answer ? solved() : (say("Not quite. Trace it again!", "bad"), stage.classList.add("shake"), setTimeout(() => stage.classList.remove("shake"), 300)));
  b.onclick = check; inp.onkeydown = (e) => e.key === "Enter" && check();
  row.append(inp, b); stage.append(row); inp.focus();
}

let idx = 0, got = [], hintN = 0, seconds = 0, tick = null, solvedNow = false;

function say(t, cls = "") { const m = $("msg"); m.textContent = t; m.className = cls; }

function load() {
  const p = puzzles[idx]; solvedNow = false; hintN = 0;
  $("concept").textContent = "Concept: " + p.concept;
  $("title").textContent = p.title; $("story").innerHTML = p.story;
  $("stage").innerHTML = ""; say(""); $("next").classList.add("hidden"); $("hint").disabled = false;
  $("progress").innerHTML = `<div style="width:${(idx / puzzles.length) * 100}%"></div>`;
  p.render($("stage"), (extra) => {
    if (solvedNow) return; solvedNow = true;
    got[idx] = PASSWORD[idx];
    say("✅ Unlocked! " + (extra || "") + " You got the letter '" + PASSWORD[idx] + "'!", "ok");
    drawLetters(); $("next").classList.remove("hidden"); $("hint").disabled = true;
    $("next").textContent = idx === puzzles.length - 1 ? "To the Final Door ➜" : "Next Room ➜";
    $("progress").innerHTML = `<div style="width:${((idx + 1) / puzzles.length) * 100}%"></div>`;
  }, say);
}

function drawLetters() {
  $("letters").innerHTML = "";
  puzzles.forEach((_, i) => { const s = el("div", "slot" + (got[i] ? " got" : "")); s.textContent = got[i] || "?"; $("letters").append(s); });
}

function show(id) { document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("hidden", s.id !== id)); }

$("start").onclick = () => {
  $("team-label").textContent = "Team: " + ($("team").value.trim() || "Mystery Coders");
  idx = 0; got = []; seconds = 0; clearInterval(tick);
  tick = setInterval(() => { seconds++; $("timer").textContent = "⏱ " + Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0"); }, 1000);
  drawLetters(); show("game"); load();
};
$("hint").onclick = () => {
  const h = puzzles[idx].hints; say("💡 " + h[Math.min(hintN, h.length - 1)], "hint"); hintN++;
};
$("next").onclick = () => {
  if (++idx < puzzles.length) return load();
  $("final-letters").textContent = got.join(" "); show("final"); $("final-input").focus();
};
function tryFinal() {
  if ($("final-input").value.trim().toUpperCase() === PASSWORD) {
    clearInterval(tick);
    $("win-text").textContent = `${$("team-label").textContent.replace("Team: ", "")} escaped in ${Math.floor(seconds / 60)}m ${seconds % 60}s! You used patterns, variables, loops, binary, sequencing, sorting, and debugging. You're real programmers!`;
    show("win"); confetti();
  } else $("final-msg").textContent = "GLITCH laughs: wrong password! Check the letters in order.";
}
$("final-go").onclick = tryFinal;
$("final-input").onkeydown = (e) => e.key === "Enter" && tryFinal();
$("again").onclick = () => show("intro");

function confetti() {
  const cv = $("confetti"), ctx = cv.getContext("2d");
  cv.width = innerWidth; cv.height = innerHeight;
  const ps = Array.from({ length: 160 }, () => ({ x: Math.random() * cv.width, y: -Math.random() * cv.height, v: 2 + Math.random() * 4, c: `hsl(${Math.random() * 360},90%,60%)`, s: 6 + Math.random() * 6 }));
  let f = 0;
  (function loop() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    ps.forEach((p) => { p.y += p.v; ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.s, p.s); });
    if (++f < 400) requestAnimationFrame(loop); else ctx.clearRect(0, 0, cv.width, cv.height);
  })();
}
