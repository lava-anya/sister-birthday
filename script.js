/* =========================================================
   Birthday site — behaviour
   - switches between screens
   - typewriter text
   - gift progress, candles, memories lightbox, confetti
   ========================================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- STICKERS: change the picture on each screen here ----------
     Put your sticker files (PNG with transparent background works best)
     inside the assets/ folder and write the file names below. */
  const STICKERS = {
    intro: "assets/creation.gif", // "I have made something for you"
    nope: "assets/trymore.gif", // "HOW DARE YOU!?" (shown upside down)
    excited: "assets/exciting.gif", // "Are you really excited?"
    gift1: "assets/guitarshinchan.gif", // birthday card corner
    wish: "assets/wishCorner.png", // make a wish corner
    gift3: "assets/letter.gif", // letter corner
    final: "assets/ending.gif", // closing message corner
  };
  Object.entries(STICKERS).forEach(([id, src]) => {
    const img = document.querySelector("#" + id + " .mascot");
    if (img) img.src = src;
  });

  const screens = $$(".screen");
  const opened = new Set(); // which gifts have been opened
  const TOTAL_GIFTS = 3;
  let typeTimer = null;

  /* ---------- screen switching ---------- */
  function show(id) {
    screens.forEach((s) => s.classList.toggle("active", s.id === id));
    // run typewriter for anything on the new screen that wants it
    const scr = document.getElementById(id);
    clearInterval(typeTimer);
    $$("[data-type]", scr).forEach((el) => {
      el.textContent = "";
    });
    $$("[data-type]", scr).forEach((el) => typeWriter(el, el.dataset.type, 70));

    if (id === "gifts") refreshGifts();
    if (id === "wish") resetCandles();
    if (id === "gift3") $(".letter-scroll").scrollTop = 0;
  }

  /* ---------- typewriter ---------- */
  function typeWriter(el, text, speed = 70) {
    let i = 0;
    const chars = [...text]; // keeps emoji intact
    clearInterval(el._t);
    el._t = setInterval(() => {
      el.textContent = chars.slice(0, ++i).join("");
      if (i >= chars.length) clearInterval(el._t);
    }, speed);
  }

  /* ---------- generic buttons ---------- */
  document.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]");
    if (go) return show(go.dataset.go);

    const done = e.target.closest("[data-done]"); // finish a gift -> back to gift page
    if (done) {
      opened.add(done.dataset.done);
      return show("gifts");
    }
  });

  /* ---------- gifts page ---------- */
  $$(".gift").forEach((btn) =>
    btn.addEventListener("click", () => show(btn.dataset.gift)),
  );

  function refreshGifts() {
    $$(".gift").forEach((g) =>
      g.classList.toggle("opened", opened.has(g.dataset.gift)),
    );
  }

  $("#giftsNext").addEventListener("click", () => {
    if (opened.size >= TOTAL_GIFTS) return show("final");
    const t = $("#toast");
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 1800);
  });

  /* ---------- the NO button gets a bit dramatic ---------- */
  // (handled by data-go="nope" -> screen #nope with typed "HOW DARE YOU!?")

  /* ---------- cake candles ---------- */
  const NUM_CANDLES = 7; // change to match her age!
  function resetCandles() {
    const wrap = $("#candles");
    wrap.innerHTML = "";
    for (let i = 0; i < NUM_CANDLES; i++) {
      const c = document.createElement("button");
      c.className = "candle";
      c.setAttribute("aria-label", "candle " + (i + 1));
      c.addEventListener("click", blowAll); // tapping ANY candle blows them all out
      wrap.appendChild(c);
    }
    $("#wishHint").textContent = "tap the candles to blow them out 💨";
  }
  function blowAll() {
    const lit = $$(".candle:not(.out)");
    if (!lit.length) return;
    lit.forEach((c, i) => setTimeout(() => c.classList.add("out"), i * 60)); // quick ripple
    setTimeout(wishDone, lit.length * 60 + 150);
  }
  function wishDone() {
    $("#wishHint").textContent = "your wish is on its way ✨ happy birthday!";
    confetti();
  }

  /* ---------- memories: ransom-note title + lightbox ---------- */
  (function ransom() {
    const el = $("#ransom");
    const fonts = [
      '"Rye"',
      '"Special Elite"',
      '"Abril Fatface"',
      '"Bungee"',
      '"Playfair Display"',
      '"Fredoka"',
    ];
    const bgs = ["#fff", "#f6d6d6", "#c0272d", "#fbe9c8", "#e8481c", "#fff"];
    const fgs = ["#c0272d", "#9c1d22", "#fff", "#c0272d", "#fff", "#e8481c"];
    [...el.dataset.word.toUpperCase()].forEach((ch, i) => {
      const s = document.createElement("span");
      s.textContent = i % 2 ? ch.toLowerCase() : ch;
      const k = (i * 5 + 2) % fonts.length;
      s.style.fontFamily = fonts[k] + ", serif";
      s.style.background = bgs[(k + i) % bgs.length];
      s.style.color = fgs[(k + i) % fgs.length];
      s.style.transform = `rotate(${[-4, 3, -2, 5, -5, 2, -3, 4][i % 8]}deg)`;
      el.appendChild(s);
    });
  })();

  const lb = $("#lightbox"),
    lbImg = $("img", lb);
  $$(".hang").forEach((h) =>
    h.addEventListener("click", () => {
      lbImg.src = $("img", h).src;
      lb.classList.add("show");
    }),
  );
  lb.addEventListener("click", () => lb.classList.remove("show"));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") lb.classList.remove("show");
  });

  /* ---------- confetti (tiny, no library) ---------- */
  function confetti() {
    const c = $("#confetti"),
      ctx = c.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    c.width = innerWidth * dpr;
    c.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);
    const colors = [
      "#c0272d",
      "#e8481c",
      "#f4c542",
      "#f08aa6",
      "#7fb5e6",
      "#fff",
    ];
    const bits = Array.from({ length: 140 }, () => ({
      x: innerWidth / 2,
      y: innerHeight * 0.55,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 16 - 4,
      s: 6 + Math.random() * 8,
      r: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.4,
      col: colors[(Math.random() * colors.length) | 0],
    }));
    let frames = 0;
    (function tick() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      bits.forEach((b) => {
        b.vy += 0.35;
        b.x += b.vx;
        b.y += b.vy;
        b.r += b.vr;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.r);
        ctx.fillStyle = b.col;
        ctx.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2);
        ctx.restore();
      });
      if (++frames < 170) requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })();
  }

  /* ---------- background song ---------- */
  /* ---------- background song ---------- */
  const bgm = document.getElementById("bgm");
  const musicBtn = document.getElementById("musicBtn");
  const START = 10; // song starts from this second
  bgm.volume = 0.6; // 0 to 1

  function playFromStart() {
    const go = () => {
      bgm.currentTime = START;
      bgm.play().catch(() => {});
    };
    if (bgm.readyState >= 1)
      go(); // file info already loaded
    else bgm.addEventListener("loadedmetadata", go, { once: true });
  }

  // when the song ends, restart from START instead of 0:00
  bgm.loop = false;
  bgm.addEventListener("ended", () => {
    bgm.currentTime = START;
    bgm.play();
  });

  // start on the very first tap anywhere (browsers block autoplay before that)
  document.addEventListener("click", function startOnce() {
    playFromStart();
    document.removeEventListener("click", startOnce);
  });

  // 🎵 button: pause / play
  musicBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (bgm.paused) {
      bgm.play();
      musicBtn.classList.remove("off");
    } else {
      bgm.pause();
      musicBtn.classList.add("off");
    }
  });
  /* ---------- go ---------- */
  show("intro");
})();
