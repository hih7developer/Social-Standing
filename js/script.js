/* ==========================================================================
   SOCIAL STANDING - MAIN SCRIPT
   ========================================================================== */

/* SIGN IN MODAL */
(() => {
  const modal = document.querySelector(".signin-modal");
  if (!modal) return;

  const dialog = modal.querySelector(".signin-dialog");
  const form = modal.querySelector("#signin-form");
  const feedback = modal.querySelector("#signin-feedback");
  let returnFocus = null;

  function openModal() {
    returnFocus = document.activeElement;
    modal.inert = false;
    modal.setAttribute("aria-hidden", "false");
    modal.classList.add("is-open");
    document.body.classList.add("signin-open");
    dialog.focus({ preventScroll: true });
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    modal.inert = true;
    document.body.classList.remove("signin-open");
    if (returnFocus && typeof returnFocus.focus === "function") {
      returnFocus.focus({ preventScroll: true });
    }
  }

  document.querySelectorAll("[data-open-signin]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openModal();
    });
  });
  modal.querySelectorAll("[data-close-signin]").forEach((trigger) => {
    trigger.addEventListener("click", closeModal);
  });
  document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("is-open")) return;
    if (event.key === "Escape") closeModal();
    if (event.key === "Tab") {
      const focusable = [...dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled])')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    feedback.textContent = "Sign in is not connected yet. Please contact your Social Standing representative for account access.";
  });

  if (window.location.hash === "#sign-in") openModal();
})();

/* ==========================================================================
   LOADER: START
   ========================================================================== */
(function () {
  /* Lock scroll immediately */
  document.body.classList.add("ss-loading");

  var loader = document.getElementById("ss-loader");
  var bar = loader && loader.querySelector(".loader-bar");
  var pctEl = loader && loader.querySelector(".loader-pct");
  var inner = loader && loader.querySelector(".loader-inner");

  if (!loader) return;

  /* Animate the inner content in after a tiny delay */
  setTimeout(function () {
    if (inner) inner.style.animation = "loader-inner-rise 0.6s cubic-bezier(0.2,0.9,0.2,1) forwards";
  }, 80);

  /* Fake progress bar that fills up to 90 % quickly, 100 % on window load */
  var pct = 0;
  function setProgress(val) {
    pct = Math.min(100, Math.round(val));
    if (bar) bar.style.width = pct + "%";
    if (pctEl) pctEl.textContent = pct + "%";
  }

  /* Quick ramp to 85 % over ~1.6 s */
  var ramp = setInterval(function () {
    if (pct < 85) {
      setProgress(pct + (85 - pct) * 0.07 + 0.8);
    } else {
      clearInterval(ramp);
    }
  }, 40);

  function dismissLoader() {
    clearInterval(ramp);
    setProgress(100);
    /* Small pause at 100 % before exit */
    setTimeout(function () {
      loader.classList.add("loader-done");
      loader.addEventListener("animationend", function () {
        loader.style.display = "none";
        document.body.classList.remove("ss-loading");
      }, { once: true });
    }, 380);
  }

  /* Dismiss on window load, or after 4 s max */
  if (document.readyState === "complete") {
    dismissLoader();
  } else {
    window.addEventListener("load", dismissLoader, { once: true });
    setTimeout(dismissLoader, 4000);
  }
})();
/* ==========================================================================
   LOADER: END
   ========================================================================== */

/* ==========================================================================
   HERO PREVIEW: START
   ========================================================================== */
(function () {
  var st = document.getElementById("st"),
    tgl = document.getElementById("tgl"),
    card = document.getElementById("card");
  if (!st || !tgl || !card) return;

  var sl = [].slice.call(card.querySelectorAll(".sl")),
    tabs = document.querySelectorAll("#tg span"),
    dots = document.querySelectorAll("#dots b"),
    hint = document.getElementById("hint"),
    i = 0,
    lock = false,
    acc = 0,
    ts = 0,
    open = false,
    autoplay = 0;
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  function go(n) {
    i = n;
    sl.forEach(function (s, k) {
      s.className = "sl" + (k == n ? " cur" : k < n ? " prev" : "");
    });
    tabs.forEach(function (t, k) {
      t.classList.toggle("on", k == n);
    });
    dots.forEach(function (d, k) {
      d.classList.toggle("on", k == n);
    });
    if (hint) {
      hint.classList.add("x");
    }
  }

  function step(d) {
    if (lock) return false;
    var n = i + d;
    if (n < 0 || n >= sl.length) return false;
    go(n);
    lock = true;
    setTimeout(function () {
      lock = false;
    }, 750);
    return true;
  }

  tgl.onclick = function () {
    open = !open;
    st.classList.toggle("open", open);
    tgl.setAttribute("aria-expanded", open);
    if (open) {
      go(0);
      if (hint) {
        hint.classList.remove("x");
      }
      card.focus({ preventScroll: true });
      if (!reduce) {
        autoplay = setInterval(function () {
          go((i + 1) % sl.length);
        }, 4500);
      }
    } else {
      clearInterval(autoplay);
    }
  };

  card.addEventListener(
    "wheel",
    function (e) {
      var d = e.deltaY > 0 ? 1 : -1,
        n = i + d;
      if (n < 0 || n >= sl.length) return;
      e.preventDefault();
      acc += e.deltaY;
      if (Math.abs(acc) > 30) {
        acc = 0;
        step(d);
      }
    },
    { passive: false },
  );

  card.addEventListener(
    "touchstart",
    function (e) {
      ts = e.touches[0].clientY;
    },
    { passive: true },
  );

  card.addEventListener(
    "touchmove",
    function (e) {
      var d = ts - e.touches[0].clientY;
      if (Math.abs(d) > 40) {
        var n = i + (d > 0 ? 1 : -1);
        if (n >= 0 && n < sl.length) {
          e.preventDefault();
          step(d > 0 ? 1 : -1);
          ts = e.touches[0].clientY;
        }
      }
    },
    { passive: false },
  );

  card.addEventListener("keydown", function (e) {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      step(1);
    }
    if (e.key == "ArrowUp") {
      e.preventDefault();
      step(-1);
    }
    if (e.key == "Escape") tgl.click();
  });

  // 3D tilt
  var h = document.getElementById("h1");
  if (!reduce && h) {
    document.addEventListener("mousemove", function (e) {
      var x = e.clientX / innerWidth - 0.5,
        y = e.clientY / innerHeight - 0.5;
      h.style.transform =
        "rotateY(" + x * 14 + "deg) rotateX(" + -y * 10 + "deg)";
      if (!open) {
        st.style.transform =
          "rotateY(" + x * -8 + "deg) rotateX(" + y * 6 + "deg)";
      } else {
        st.style.transform =
          "rotateY(" + x * -4 + "deg) rotateX(" + y * 3 + "deg)";
      }
    });
    st.style.transition = "transform .2s ease-out";
  }
})();
/* HERO PREVIEW: END */

/* ==========================================================================
   SERVICES CAROUSEL: START
   ========================================================================== */
(function () {
  var stage = document.getElementById("stg");
  if (!stage) return;

  var cards = [].slice.call(stage.querySelectorAll(".card")),
    count = cards.length,
    dots = document.getElementById("dt"),
    heading = document.getElementById("h2"),
    nextBtn = document.getElementById("nx"),
    prevBtn = document.getElementById("pv");

  if (!count) return;

  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches,
    pos = 0,
    target = 0,
    drag = null,
    cardWidth = 300,
    suppressClick = false,
    wheelDirection = 0,
    wheelAmount = 0,
    lastWheel = 0;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  if (dots) {
    for (var index = 0; index < count; index++) {
      var dot = document.createElement("b");
      dot.dataset.i = index;
      dots.appendChild(dot);
    }

    dots.onclick = function (event) {
      if (event.target.dataset.i != null) toIndex(+event.target.dataset.i);
    };
  }

  function toIndex(index) {
    target = clamp(Math.round(index), 0, count - 1);
  }

  if (nextBtn) {
    nextBtn.onclick = function () {
      toIndex(target + 1);
    };
  }
  if (prevBtn) {
    prevBtn.onclick = function () {
      toIndex(target - 1);
    };
  }

  stage.addEventListener("keydown", function (event) {
    if (event.key == "ArrowRight") {
      event.preventDefault();
      toIndex(target + 1);
    }
    if (event.key == "ArrowLeft") {
      event.preventDefault();
      toIndex(target - 1);
    }
  });

  cards.forEach(function (card, index) {
    card.addEventListener("click", function () {
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      toIndex(index);
    });
  });

  stage.addEventListener("pointerdown", function (event) {
    drag = { x: event.clientX, target: target, moved: false };
  });

  addEventListener(
    "pointermove",
    function (event) {
      if (!drag) return;
      var delta = event.clientX - drag.x;
      if (Math.abs(delta) > 6) drag.moved = true;
      if (drag.moved) {
        target = clamp(drag.target - delta / (cardWidth * 0.75), 0, count - 1);
      }
    },
    { passive: true },
  );

  function finishDrag() {
    if (!drag) return;
    var moved = drag.moved;
    drag = null;
    if (moved) {
      suppressClick = true;
      setTimeout(function () {
        suppressClick = false;
      }, 500);
      toIndex(target);
    }
  }

  addEventListener("pointerup", finishDrag);
  addEventListener("pointercancel", finishDrag);

  stage.addEventListener(
    "wheel",
    function (event) {
      var horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      var delta = horizontal ? event.deltaX : event.deltaY;
      if (!delta) return;

      var direction = delta > 0 ? 1 : -1;
      if (target + direction < 0 || target + direction >= count) {
        wheelAmount = 0;
        return;
      }

      event.preventDefault();
      if (direction != wheelDirection) {
        wheelDirection = direction;
        wheelAmount = 0;
      }
      wheelAmount += Math.abs(delta);
      if (wheelAmount < 50 || Date.now() - lastWheel < 450) return;

      lastWheel = Date.now();
      wheelAmount = 0;
      toIndex(target + direction);
    },
    { passive: false },
  );

  if (!reduce && heading) {
    document.addEventListener("mousemove", function (event) {
      var x = event.clientX / innerWidth - 0.5;
      var y = event.clientY / innerHeight - 0.5;
      heading.style.transform =
        "rotateY(" + x * 12 + "deg) rotateX(" + -y * 8 + "deg)";
      cards.forEach(function (card) {
        var active = +card.dataset.a || 0;
        if (card.firstElementChild) {
          card.firstElementChild.style.transform =
            active > 0.6
              ? "rotateY(" + x * 10 + "deg) rotateX(" + -y * 10 + "deg)"
              : "";
        }
      });
    });
  }

  function render() {
    cardWidth = cards[0].offsetWidth;
    pos += (target - pos) * (reduce ? 1 : 0.12);
    cards.forEach(function (card, index) {
      var distance = index - pos;
      var absoluteDistance = Math.abs(distance);
      var active = Math.max(0, 1 - absoluteDistance);
      var scale = 1 - Math.min(absoluteDistance, 2.2) * 0.16;
      var x = distance * cardWidth * 0.78;
      var rotation = -clamp(distance, -1.6, 1.6) * 40;
      var opacity = clamp(1.25 - absoluteDistance * 0.28, 0, 1);

      if (absoluteDistance > 0.5) {
        x += Math.sign(distance) * cardWidth * 0.12;
      }
      card.style.transform =
        "translate3d(" +
        x +
        "px,0," +
        -absoluteDistance * 130 +
        "px) rotateY(" +
        rotation +
        "deg) scale(" +
        (scale + active * 0.14) +
        ")";
      card.style.opacity = opacity;
      card.style.zIndex = 100 - Math.round(absoluteDistance * 10);
      card.style.setProperty("--a", active.toFixed(3));
      if (card.firstElementChild) {
        card.firstElementChild.style.setProperty("--a", active.toFixed(3));
      }
      card.dataset.a = active;
      card.style.pointerEvents = absoluteDistance > 2.5 ? "none" : "auto";
    });

    var activeIndex = clamp(Math.round(pos), 0, count - 1);
    if (dots) {
      [].forEach.call(dots.children, function (dot, index) {
        dot.classList.toggle("on", index == activeIndex);
      });
    }
    requestAnimationFrame(render);
  }
  render();
})();
/* SERVICES CAROUSEL: END */

/* ==========================================================================
   PRACTICE AREAS: START
   ========================================================================== */
(function () {
  const IMGS = [
    "./images/social_1.jpg",
    "./images/social_2.jpg",
    "./images/social_3.jpg",
    "./images/social_4.jpg",
    "./images/social_5.jpg",
    "./images/social_6.jpg",
    "./images/social_7.jpg",
    "./images/social_8.jpg",
  ];
  const DIRS = [
    ["Y", 1],
    ["X", -1],
    ["Y", -1],
    ["X", 1],
    ["X", 1],
    ["Y", 1],
    ["X", -1],
    ["Y", -1],
  ];

  const grid = document.querySelector(".practice-areas .practice-grid");
  if (!grid) return;

  const tiles = IMGS.map((src, i) => {
    const el = document.createElement("div");
    el.className = "practice-tile practice-t" + i;
    el.style.setProperty("--d", i * 0.5 + "s");
    el.innerHTML =
      '<div class="practice-cube"><div class="practice-face f"></div><div class="practice-face n"></div></div>';
    grid.appendChild(el);

    const t = {
      el,
      cube: el.firstChild,
      f: el.querySelector(".f"),
      n: el.querySelector(".n"),
      cur: i,
      dir: DIRS[i],
      busy: false,
    };
    t.f.style.backgroundImage = "url(" + src + ")";
    return t;
  });

  function flip(t) {
    if (t.busy) return;
    t.busy = true;

    const [a, s] = t.dir;
    const w = t.el.offsetWidth;
    const h = t.el.offsetHeight;
    const d = (a === "Y" ? w : h) / 2;
    const nxt =
      (t.cur + 1 + Math.floor(Math.random() * (IMGS.length - 1))) %
      IMGS.length;

    t.n.style.backgroundImage = "url(" + IMGS[nxt] + ")";
    t.f.style.transform = "translateZ(" + d + "px)";
    t.n.style.transform = "rotate" + a + "(" + 90 * s + "deg) translateZ(" + d + "px)";

    const base = "translateZ(" + -d + "px)";
    t.cube.style.transform = base;

    const an = t.cube.animate(
      [
        { transform: base + " rotate" + a + "(0deg)" },
        {
          transform:
            base +
            " translateZ(" +
            d * 0.5 +
            "px) rotate" +
            a +
            "(" +
            -45 * s +
            "deg)",
          offset: 0.5,
        },
        { transform: base + " rotate" + a + "(" + -90 * s + "deg)" },
      ],
      {
        duration: 1400,
        easing: "cubic-bezier(.65,0,.25,1)",
        fill: "forwards",
      },
    );

    an.onfinish = () => {
      t.f.style.backgroundImage = t.n.style.backgroundImage;
      t.cur = nxt;
      an.cancel();
      t.busy = false;
      t.dir = [Math.random() < 0.5 ? "X" : "Y", Math.random() < 0.5 ? 1 : -1];
    };
  }

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  tiles.forEach((t, i) => {
    if (!reduceMotion) {
      setTimeout(() => {
        flip(t);
        setInterval(() => flip(t), 3800 + i * 450);
      }, 900 + i * 500);
    }
  });

  const st = document.querySelector(".practice-areas .practice-stage");
  if (!reduceMotion && st) {
    st.addEventListener("mousemove", (e) => {
      const r = st.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      grid.style.transform =
        "rotateY(" + x * 10 + "deg) rotateX(" + -y * 8 + "deg)";
    });
    st.addEventListener("mouseleave", () => {
      grid.style.transform = "";
    });
  }
})();
/* PRACTICE AREAS: END */

/* ==========================================================================
   FOUNDERS: START
   ========================================================================== */
(function () {
  const section = document.getElementById("founder-scroll");
  const stage = section && section.querySelector(".founders-stage");
  const image = document.getElementById("founder-image");
  const copy = document.getElementById("founder-copy");
  if (!section || !stage || !image || !copy) return;

  const staggered = Array.from(copy.querySelectorAll(".founder-stagger"));
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const clamp = (value) => Math.min(1, Math.max(0, value));
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  /* ----------------------------------------------------------------------
     FOUNDERS ENTRANCE SCROLL ANIMATION
     - Phase 1 (progress 0.0 - 0.15): Book centered in middle position with 3D depth
     - Phase 2 (progress 0.15 - 0.60): 3D swipe to left & content reveals on right
     - Phase 3 (progress 0.60 - 1.00): All content fully showing & section stays pinned
     - After 1.00: Section scrolls away to next section
     ---------------------------------------------------------------------- */
  function render() {
    if (reducedMotion || window.innerWidth <= 800) {
      image.style.opacity = "1";
      image.style.transform = "none";
      copy.style.opacity = "1";
      copy.style.transform = "none";
      copy.style.pointerEvents = "auto";
      staggered.forEach((element) => {
        element.style.opacity = "1";
        element.style.transform = "none";
      });
      return;
    }

    const bounds = section.getBoundingClientRect();
    const scrollableHeight = section.offsetHeight - window.innerHeight;
    const progress = clamp(-bounds.top / Math.max(1, scrollableHeight));

    // Phase 1: 0.0 - 0.15 (Hold in middle)
    // Phase 2: 0.15 - 0.60 (Swipe to left with 3D animation)
    // Phase 3: 0.60 - 1.00 (All content fully showing while pinned)
    const rawSwipe = clamp((progress - 0.15) / 0.45);
    const swipeProgress = easeInOut(rawSwipe);

    // Calculate exact horizontal shift to center the book in the middle of the screen
    const horizontalShift =
      stage.clientWidth / 2 - (image.offsetLeft + image.offsetWidth / 2);

    // 3D perspective dynamics during swipe
    const currentShift = horizontalShift * (1 - swipeProgress);
    const rotY = -10 * (1 - swipeProgress);
    const rotX = 4 * (1 - swipeProgress);
    const zDepth = 35 * (1 - swipeProgress);
    const scale = 1 + 0.03 * (1 - swipeProgress);

    // Book image transforms: centered in 3D -> swipes smoothly to the left
    image.style.opacity = "1";
    image.style.transform =
      `translate3d(${currentShift}px, 0, ${zDepth}px) ` +
      `rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${scale})`;

    // Content reveals on the right side with 3D perspective
    copy.style.opacity = String(swipeProgress);
    copy.style.transform =
      `translate3d(${(1 - swipeProgress) * 75}px, 0, ${(1 - swipeProgress) * -35}px) ` +
      `rotateY(${(1 - swipeProgress) * 14}deg)`;
    copy.style.pointerEvents = swipeProgress > 0.5 ? "auto" : "none";

    // Staggered text items (Eyebrow, Heading, Paragraphs, Button) slide into view
    staggered.forEach((element, index) => {
      const itemProgress = easeOut(clamp(swipeProgress * 1.5 - index * 0.12));
      element.style.opacity = String(itemProgress);
      element.style.transform = `translate3d(0, ${(1 - itemProgress) * 24}px, 0)`;
    });
  }

  let frameRequested = false;
  function scheduleRender() {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(() => {
      frameRequested = false;
      render();
    });
  }

  window.addEventListener("scroll", scheduleRender, { passive: true });
  window.addEventListener("resize", scheduleRender);
  render();

  /* ----------------------------------------------------------------------
     FOUNDERS 3D BOOK & CONTINUOUS PAGE-TURNING ENGINE
     (Matches uploaded design: split panels, blue tint, center ring & captions)
     ---------------------------------------------------------------------- */
  const founderPages = [
    {
      photo: "./images/founder_1.jpg",
      name: "Stacey E. Burke",
      role: "Attorney · Majority Shareholder",
      isTinted: true
    },
    {
      photo: "./images/founder_2.jpg",
      name: "Lisa Hopkins",
      role: "Co-Founder · Partner",
      isTinted: false
    },
    {
      photo: "./images/fb_img.png",
      name: "Stacey & Lisa",
      role: "Founding Partners",
      isTinted: true
    },
    {
      photo: "./images/team.png",
      name: "Strategy Collective",
      role: "Marketing Specialists",
      isTinted: false
    }
  ];

  const book = document.getElementById("founders-book");
  if (!book) return;

  const flipper = document.getElementById("book-flipper");
  const shadowFront = book.querySelector(".page-shadow--front");
  const shadowBack = book.querySelector(".page-shadow--back");
  const leftPanel = document.getElementById("book-panel-left");
  const rightPanel = document.getElementById("book-panel-right");

  const leftEls = {
    photo: document.getElementById("left-photo"),
    name: document.getElementById("left-name"),
    role: document.getElementById("left-role"),
    tint: document.getElementById("left-tint")
  };

  const rightEls = {
    photo: document.getElementById("right-photo"),
    name: document.getElementById("right-name"),
    role: document.getElementById("right-role"),
    tint: document.getElementById("right-tint")
  };

  const flipperFrontEls = {
    photo: document.getElementById("flipper-front-photo"),
    name: document.getElementById("flipper-front-name"),
    role: document.getElementById("flipper-front-role"),
    tint: null
  };

  const flipperBackEls = {
    photo: document.getElementById("flipper-back-photo"),
    name: document.getElementById("flipper-back-name"),
    role: document.getElementById("flipper-back-role"),
    tint: flipper ? flipper.querySelector(".flipper-face--back .panel-tint") : null
  };

  let currentSpreadIndex = 0; // 0 = Spread 1 (pages 0 & 1), 1 = Spread 2 (pages 2 & 3)
  let isFlipping = false;
  let autoTimer = null;
  let isHovered = false;
  let isVisible = false;

  function populate(els, data) {
    if (!els || !data) return;
    if (els.photo) {
      els.photo.src = data.photo;
      els.photo.alt = data.name;
    }
    if (els.name) els.name.textContent = data.name;
    if (els.role) els.role.textContent = data.role;
    if (els.tint) {
      els.tint.style.display = data.isTinted ? "block" : "none";
    }
  }

  function turnNext() {
    if (isFlipping || !flipper) return;
    isFlipping = true;

    const currentLeftIdx = (currentSpreadIndex * 2) % founderPages.length;
    const currentRightIdx = (currentLeftIdx + 1) % founderPages.length;
    const nextLeftIdx = (currentLeftIdx + 2) % founderPages.length;
    const nextRightIdx = (currentLeftIdx + 3) % founderPages.length;

    // Front face shows current right page turning away
    populate(flipperFrontEls, founderPages[currentRightIdx]);
    // Back face shows incoming left page landing on left
    populate(flipperBackEls, founderPages[nextLeftIdx]);
    // Underneath on the right, prepare the next right page
    populate(rightEls, founderPages[nextRightIdx]);

    // Reset flipper instantly to 0deg before initiating turn
    flipper.style.transition = "none";
    flipper.style.transform = "rotateY(0deg)";
    if (shadowFront) shadowFront.style.opacity = "0";
    if (shadowBack) shadowBack.style.opacity = "0.45";
    flipper.offsetHeight; // force reflow

    // Animate to -180deg over spine hinge
    flipper.style.transition = "transform 1.35s cubic-bezier(0.45, 0.05, 0.25, 1)";
    flipper.style.transform = "rotateY(-180deg)";
    if (shadowFront) shadowFront.style.opacity = "0.45";
    if (shadowBack) shadowBack.style.opacity = "0";

    const nextSpread = (currentSpreadIndex + 1) % (founderPages.length / 2);

    setTimeout(() => {
      populate(leftEls, founderPages[nextLeftIdx]);
      flipper.style.transition = "none";
      flipper.style.transform = "rotateY(0deg)";
      if (shadowFront) shadowFront.style.opacity = "0";
      if (shadowBack) shadowBack.style.opacity = "0";

      currentSpreadIndex = nextSpread;
      isFlipping = false;
    }, 1400);
  }

  function turnPrev() {
    if (isFlipping || !flipper) return;
    isFlipping = true;

    const currentLeftIdx = (currentSpreadIndex * 2) % founderPages.length;
    const prevLeftIdx = (currentLeftIdx - 2 + founderPages.length) % founderPages.length;
    const prevRightIdx = (prevLeftIdx + 1) % founderPages.length;

    // Flipper starts at -180deg on the left for reverse turn
    populate(flipperBackEls, founderPages[currentLeftIdx]);
    populate(flipperFrontEls, founderPages[prevRightIdx]);
    populate(leftEls, founderPages[prevLeftIdx]);

    flipper.style.transition = "none";
    flipper.style.transform = "rotateY(-180deg)";
    if (shadowBack) shadowBack.style.opacity = "0.45";
    if (shadowFront) shadowFront.style.opacity = "0";
    flipper.offsetHeight; // trigger reflow

    // Animate back to 0deg
    flipper.style.transition = "transform 1.35s cubic-bezier(0.45, 0.05, 0.25, 1)";
    flipper.style.transform = "rotateY(0deg)";
    if (shadowBack) shadowBack.style.opacity = "0";
    if (shadowFront) shadowFront.style.opacity = "0.45";

    const prevSpread = (currentSpreadIndex - 1 + (founderPages.length / 2)) % (founderPages.length / 2);

    setTimeout(() => {
      populate(rightEls, founderPages[prevRightIdx]);
      flipper.style.transition = "none";
      if (shadowFront) shadowFront.style.opacity = "0";
      if (shadowBack) shadowBack.style.opacity = "0";

      currentSpreadIndex = prevSpread;
      isFlipping = false;
    }, 1400);
  }

  function startAuto() {
    stopAuto();
    if (reducedMotion) return;
    autoTimer = setInterval(() => {
      if (!isHovered && isVisible) {
        turnNext();
      }
    }, 4200);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  if (rightPanel) {
    rightPanel.addEventListener("click", () => {
      turnNext();
      startAuto();
    });
  }

  if (leftPanel) {
    leftPanel.addEventListener("click", () => {
      turnPrev();
      startAuto();
    });
  }

  book.addEventListener("mouseenter", () => {
    isHovered = true;
  });

  book.addEventListener("mouseleave", () => {
    isHovered = false;
  });

  // IntersectionObserver to only auto-turn when the section is in view
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(section);
  } else {
    isVisible = true;
  }

  // Initialize first spread (Spread 1: Stacey E. Burke & Lisa Hopkins)
  populate(leftEls, founderPages[0]);
  populate(rightEls, founderPages[1]);

  // Start continuous page-turning
  startAuto();
})();
/* FOUNDERS: END */

/* ==========================================================================
   INDUSTRY: START
   ========================================================================== */
(() => {
  const section = document.querySelector(".industry-wrap");
  if (!section) return;

  const experience = section.querySelector(".industry-experience");
  const items = [...section.querySelectorAll(".industry-item")];
  const cards = [...section.querySelectorAll(".industry-visual-card")];
  const progress = [...section.querySelectorAll(".industry-progress span")];
  const mobileQuery = window.matchMedia("(max-width: 760px)");

  if (
    !experience ||
    !items.length ||
    items.length !== cards.length ||
    items.length !== progress.length
  ) {
    console.error(
      "Industry section is missing matching items, cards, or progress indicators.",
    );
    return;
  }

  let activeIndex = 0;
  let wheelDirection = 0;
  let wheelAmount = 0;
  let lastWheel = 0;

  function setActive(index) {
    const nextIndex = Math.max(0, Math.min(items.length - 1, index));
    if (nextIndex === activeIndex) return;
    activeIndex = nextIndex;

    items.forEach((item, itemIndex) => {
      const active = itemIndex === activeIndex;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
      cards[itemIndex].classList.toggle("active", active);
      progress[itemIndex].classList.toggle("active", active);
    });
  }

  items.forEach((item, index) => {
    item.addEventListener("click", () => setActive(index));
  });

  experience.addEventListener(
    "wheel",
    (event) => {
      if (mobileQuery.matches) return;

      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      const delta = horizontal ? event.deltaX : event.deltaY;
      if (!delta) return;

      const direction = delta > 0 ? 1 : -1;
      const nextIndex = activeIndex + direction;
      if (nextIndex < 0 || nextIndex >= items.length) {
        wheelAmount = 0;
        return;
      }

      event.preventDefault();
      if (direction !== wheelDirection) {
        wheelDirection = direction;
        wheelAmount = 0;
      }
      wheelAmount += Math.abs(delta);
      if (wheelAmount < 50 || Date.now() - lastWheel < 450) return;

      lastWheel = Date.now();
      wheelAmount = 0;
      setActive(nextIndex);
    },
    { passive: false },
  );

  setActive(0);
})();
/* INDUSTRY: END */

/* ==========================================================================
   PROCESS: START
   ========================================================================== */
(function () {
  const section = document.getElementById("process");
  if (!section) return;

  const steps = Array.from(section.querySelectorAll(".process-step"));
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let activeStep = null;

  function clearActive() {
    if (!activeStep) return;
    activeStep.classList.remove("active");
    activeStep.setAttribute("aria-pressed", "false");
    activeStep = null;
  }

  function activate(step) {
    if (activeStep === step) return;
    clearActive();
    activeStep = step;
    step.classList.add("active");
    step.setAttribute("aria-pressed", "true");
  }

  steps.forEach((step) => {
    const tilt = step.querySelector(".process-tilt");

    step.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") activate(step);
    });
    step.addEventListener("pointerleave", (event) => {
      if (event.pointerType !== "mouse") return;
      if (document.activeElement !== step && activeStep === step) clearActive();
      if (tilt) {
        tilt.style.setProperty("--rx", "0deg");
        tilt.style.setProperty("--ry", "0deg");
      }
    });
    step.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse" || reducedMotion || !tilt) return;
      const bounds = step.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      tilt.style.setProperty("--ry", `${x * 18}deg`);
      tilt.style.setProperty("--rx", `${-y * 14}deg`);
    });
    step.addEventListener("click", () => activate(step));
    step.addEventListener("focus", () => activate(step));
    step.addEventListener("blur", (event) => {
      if (event.relatedTarget !== step && activeStep === step) clearActive();
    });
    step.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate(step);
      } else if (event.key === "Escape") {
        clearActive();
      }
    });
  });
})();
/* PROCESS: END */

/* ==========================================================================
   SOCIAL SHOWCASE: START
   ========================================================================== */
(function () {
  const section = document.getElementById("social-showcase");
  if (!section) return;

  const scene = section.querySelector("#showcase-scene");
  const stage = section.querySelector("#showcase-stage");
  const cards = Array.from(stage.querySelectorAll(".showcase-card"));
  const count = section.querySelector("#showcase-count");
  const previous = section.querySelector("#showcase-prev");
  const next = section.querySelector("#showcase-next");
  if (!scene || !stage || !cards.length || !count || !previous || !next) {
    console.error("Social showcase is missing required carousel elements.");
    return;
  }

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const cardCount = cards.length;
  let position = 1;
  let target = 1;
  let drag = null;
  let suppressClick = false;
  let frameRequested = false;
  let autoplayEnabled = !reducedMotion;
  let autoplayTimer = null;

  function wrap(index) {
    return ((index % cardCount) + cardCount) % cardCount;
  }

  function getSpacing() {
    return Math.min(280, scene.clientWidth * 0.34);
  }

  function updateSelection() {
    const current = wrap(Math.round(target));
    count.textContent =
      `${String(current + 1).padStart(2, "0")} / ` +
      `${String(cardCount).padStart(2, "0")}`;
    cards.forEach((card, index) => {
      const active = index === current;
      card.classList.toggle("is-active", active);
      card.setAttribute("aria-current", String(active));
    });
  }

  function render() {
    const spacing = getSpacing();
    cards.forEach((card, index) => {
      const difference = index - position;
      const offset =
        ((difference + cardCount / 2) % cardCount + cardCount) % cardCount -
        cardCount / 2;
      const distance = Math.abs(offset);
      card.style.transform =
        `translate3d(${offset * spacing}px, 0, ${-distance * 190}px) ` +
        `rotateY(${-offset * 34}deg) ` +
        `scale(${1 - Math.min(distance, 2) * 0.05})`;
      card.style.opacity = String(
        Math.max(0, 1 - Math.max(0, distance - 1.6) * 0.8),
      );
      card.style.zIndex = String(100 - Math.round(distance * 10));
    });
    updateSelection();
  }

  function animate() {
    if (reducedMotion) {
      position = target;
      render();
      return;
    }
    if (frameRequested) return;
    frameRequested = true;

    window.requestAnimationFrame(() => {
      frameRequested = false;
      position += (target - position) * 0.12;
      if (Math.abs(target - position) < 0.001) position = target;

      render();
      if (position !== target) animate();
    });
  }

  function stopAutoplay() {
    autoplayEnabled = false;
    if (autoplayTimer !== null) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay() {
    if (reducedMotion || !autoplayEnabled || autoplayTimer !== null) return;
    autoplayTimer = window.setInterval(() => {
      if (!drag) target = Math.round(target) + 1;
      updateSelection();
      animate();
    }, 4200);
  }

  function goBy(amount) {
    stopAutoplay();
    target = Math.round(target) + amount;
    updateSelection();
    animate();
  }

  function goTo(index) {
    stopAutoplay();
    const current = Math.round(target);
    const difference =
      ((index - current + cardCount / 2) % cardCount + cardCount) %
      cardCount -
      cardCount / 2;
    target = current + difference;
    updateSelection();
    animate();
  }

  previous.addEventListener("click", () => goBy(-1));
  next.addEventListener("click", () => goBy(1));

  scene.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goBy(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goBy(1);
    }
  });

  scene.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startTarget: target,
      moved: false,
    };
    stopAutoplay();
  });

  scene.addEventListener("pointermove", (event) => {
    if (!reducedMotion && event.pointerType === "mouse" && !drag) {
      const bounds = section.getBoundingClientRect();
      stage.style.setProperty(
        "--showcase-tilt-y",
        `${((event.clientX - bounds.left) / bounds.width - 0.5) * 8}deg`,
      );
      stage.style.setProperty(
        "--showcase-tilt-x",
        `${-((event.clientY - bounds.top) / bounds.height - 0.5) * 5}deg`,
      );
    }
  });

  window.addEventListener("pointermove", (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const difference = event.clientX - drag.startX;
    if (Math.abs(difference) > 8) drag.moved = true;
    if (drag.moved) {
      target = drag.startTarget - difference / getSpacing();
      updateSelection();
      animate();
    }
  });

  function finishDrag(event) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.moved) {
      suppressClick = true;
      window.setTimeout(() => {
        suppressClick = false;
      }, 0);
      target = Math.round(target);
    }
    drag = null;
    updateSelection();
    animate();
  }

  window.addEventListener("pointerup", finishDrag);
  window.addEventListener("pointercancel", finishDrag);

  scene.addEventListener("pointerleave", () => {
    stage.style.setProperty("--showcase-tilt-y", "0deg");
    stage.style.setProperty("--showcase-tilt-x", "0deg");
  });

  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      goTo(index);
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        goTo(index);
      }
    });
  });

  window.addEventListener("resize", render);
  render();

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) startAutoplay();
      else if (autoplayTimer !== null) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    });
    observer.observe(section);
  } else {
    startAutoplay();
  }
})();
/* SOCIAL SHOWCASE: END */

/* ==========================================================================
   CONTACT: START
   ========================================================================== */
(() => {
  const section = document.querySelector(".contact-section");
  if (!section) return;

  const start = section.querySelector("#contact-start");
  const openButton = section.querySelector("#contact-open");
  const closeButton = section.querySelector("#contact-close");
  const panel = section.querySelector("#contact-panel");
  const form = section.querySelector("#contact-form");
  const feedback = section.querySelector("#contact-feedback");
  const notice = section.querySelector("#contact-notice");
  const editButton = section.querySelector("#contact-edit");
  const tilt = section.querySelector("#contact-tilt");
  const orbs = [...section.querySelectorAll(".contact-orb")];

  function setOpen(isOpen) {
    section.classList.toggle("is-open", isOpen);
    openButton.setAttribute("aria-expanded", String(isOpen));
    start.inert = isOpen;
    panel.inert = !isOpen;

    if (isOpen) {
      form.querySelector("input").focus({ preventScroll: true });
    } else {
      openButton.focus({ preventScroll: true });
    }
  }

  openButton.addEventListener("click", () => setOpen(true));
  closeButton.addEventListener("click", () => setOpen(false));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && section.classList.contains("is-open")) {
      setOpen(false);
    }
  });

  form.addEventListener("input", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) {
      return;
    }

    const field = input.closest(".contact-field");
    if (field) {
      field.classList.remove("is-invalid");
    }
    input.removeAttribute("aria-invalid");
    feedback.textContent = "";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const requiredFields = [...form.querySelectorAll("[required]")];
    let firstInvalid = null;

    requiredFields.forEach((input) => {
      const field = input.closest(".contact-field");
      const isValid = input.checkValidity();
      if (field) {
        field.classList.toggle("is-invalid", !isValid);
      }

      if (isValid) {
        input.removeAttribute("aria-invalid");
      } else {
        input.setAttribute("aria-invalid", "true");
        if (!firstInvalid) firstInvalid = input;
      }
    });

    if (firstInvalid) {
      feedback.textContent = "Please check the highlighted fields.";
      firstInvalid.focus({ preventScroll: true });
      return;
    }

    feedback.textContent = "";
    form.hidden = true;
    form.inert = true;
    notice.hidden = false;
    editButton.focus({ preventScroll: true });
  });

  editButton.addEventListener("click", () => {
    notice.hidden = true;
    form.hidden = false;
    form.inert = false;
    form.querySelector("input").focus({ preventScroll: true });
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  if (!reducedMotion.matches && finePointer.matches && tilt) {
    section.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;

      const bounds = section.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      tilt.style.setProperty("--contact-ry", x * 16 + "deg");
      tilt.style.setProperty("--contact-rx", -y * 12 + "deg");

      orbs.forEach((orb) => {
        const depth = Number(orb.dataset.depth) || 0;
        orb.style.setProperty("--orb-x", x * depth + "px");
        orb.style.setProperty("--orb-y", y * depth + "px");
      });
    });

    section.addEventListener("pointerleave", () => {
      tilt.style.setProperty("--contact-ry", "0deg");
      tilt.style.setProperty("--contact-rx", "0deg");
      orbs.forEach((orb) => {
        orb.style.setProperty("--orb-x", "0px");
        orb.style.setProperty("--orb-y", "0px");
      });
    });
  }
})();
/* CONTACT: END */

/* ==========================================================================
   END OF SOCIAL STANDING SCRIPT
   ========================================================================== */
