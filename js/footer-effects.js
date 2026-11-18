/* ==========================================================================
   FOOTER EFFECTS
   - Pointer wave: ripples + glow follow the mouse inside the footer
   - Columns tilt in 3D with a moving glare
   - Logo and social icons are magnetic
   - Floating 3D shapes
   - Footer "opens" and its content staggers in on scroll (needs GSAP)
   Load AFTER script.js (and after GSAP + scroll-effects.js).
   ========================================================================== */
(function () {
  "use strict";

  var footer = document.querySelector(".site-footer");
  if (!footer) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function div(cls, parent) {
    var d = document.createElement("div");
    d.className = cls;
    if (parent) parent.appendChild(d);
    return d;
  }

  /* ------------------------------------------------------------------
     1) Floating 3D shapes (cube, gyroscope rings, pyramid)
     ------------------------------------------------------------------ */
  function initShapes() {
    var layer = div("fx3d fx3d--dark fx3d--footer");
    layer.setAttribute("aria-hidden", "true");
    footer.insertBefore(layer, footer.firstChild);

    function shape(type, size, left, top) {
      var s = div("fx-shape fx-" + type, layer);
      s.style.setProperty("--s", size + "px");
      s.style.left = left + "%";
      s.style.top = top + "%";
      var inner = div("fx-inner", s);
      var i;
      if (type === "cube") {
        ["front", "back", "right", "left", "top", "bottom"].forEach(function (f) {
          div("fx-face fx-face--" + f, inner);
        });
      } else if (type === "rings") {
        for (i = 0; i < 3; i++) div("fx-ring fx-ring--" + i, inner);
        div("fx-core", inner);
      } else {
        ["front", "back", "left", "right"].forEach(function (f) {
          div("fx-tri fx-tri--" + f, inner);
        });
      }
      return s;
    }

    return [
      shape("rings", 120, 44, 6),
      shape("cube", 70, 91, 56),
      shape("prism", 80, 3, 62)
    ];
  }

  /* ------------------------------------------------------------------
     2) Pointer wave (canvas ripples + soft glow)
     ------------------------------------------------------------------ */
  function initWave() {
    var cv = document.createElement("canvas");
    cv.className = "ft-wave";
    cv.setAttribute("aria-hidden", "true");
    footer.insertBefore(cv, footer.firstChild);

    var ctx = cv.getContext("2d");
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0;
    var h = 0;

    function resize() {
      var r = footer.getBoundingClientRect();
      w = r.width;
      h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(footer);
    else window.addEventListener("resize", resize);

    var COLORS = ["36,84,255", "139,61,255", "0,180,255", "25,228,223"];
    var colorIdx = 0;
    var ripples = [];
    var mouse = { x: 0, y: 0, tx: 0, ty: 0, inside: false, glow: 0 };
    var last = { x: -999, y: -999, t: 0 };
    var raf = 0;

    function spawn(x, y, big) {
      ripples.push({
        x: x,
        y: y,
        r: 4,
        max: big ? 280 : 140 + Math.random() * 60,
        speed: big ? 3.4 : 2.3,
        rgb: COLORS[colorIdx++ % COLORS.length],
        a: big ? 0.75 : 0.5
      });
      if (ripples.length > 45) ripples.shift();
    }

    function local(e) {
      var r = footer.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    footer.addEventListener(
      "pointermove",
      function (e) {
        var p = local(e);
        mouse.tx = p.x;
        mouse.ty = p.y;
        if (!mouse.inside) {
          mouse.x = p.x;
          mouse.y = p.y;
          mouse.inside = true;
        }
        var dx = p.x - last.x;
        var dy = p.y - last.y;
        var now = performance.now();
        if (dx * dx + dy * dy > 900 && now - last.t > 70) {
          spawn(p.x, p.y, false);
          last.x = p.x;
          last.y = p.y;
          last.t = now;
        }
        start();
      },
      { passive: true }
    );

    footer.addEventListener("pointerleave", function () {
      mouse.inside = false;
    });

    /* click / tap = big shockwave (three rings) */
    footer.addEventListener(
      "pointerdown",
      function (e) {
        var p = local(e);
        spawn(p.x, p.y, true);
        setTimeout(function () { spawn(p.x, p.y, true); }, 120);
        setTimeout(function () { spawn(p.x, p.y, false); }, 240);
        start();
      },
      { passive: true }
    );

    function frame() {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      /* eased glow that follows the pointer and fades in/out */
      mouse.x += (mouse.tx - mouse.x) * 0.15;
      mouse.y += (mouse.ty - mouse.y) * 0.15;
      mouse.glow += ((mouse.inside ? 1 : 0) - mouse.glow) * 0.08;

      if (mouse.glow > 0.01) {
        var g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 190);
        g.addColorStop(0, "rgba(36,84,255," + 0.3 * mouse.glow + ")");
        g.addColorStop(0.5, "rgba(139,61,255," + 0.1 * mouse.glow + ")");
        g.addColorStop(1, "rgba(36,84,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      for (var i = ripples.length - 1; i >= 0; i--) {
        var p = ripples[i];
        p.r += p.speed;
        var t = p.r / p.max;
        if (t >= 1) {
          ripples.splice(i, 1);
          continue;
        }
        var a = p.a * (1 - t) * (1 - t);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(" + p.rgb + "," + a + ")";
        ctx.lineWidth = 2.4 * (1 - t) + 0.6;
        ctx.stroke();

        if (p.r > 14) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 0.62, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(" + p.rgb + "," + a * 0.5 + ")";
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }

      ctx.globalCompositeOperation = "source-over";

      if (ripples.length || mouse.inside || mouse.glow > 0.01) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = 0;
        ctx.clearRect(0, 0, w, h);
      }
    }

    function start() {
      if (!raf) raf = requestAnimationFrame(frame);
    }
  }

  /* ------------------------------------------------------------------
     3) Column tilt + glare, magnetic logo / social icons (mouse only)
     ------------------------------------------------------------------ */
  function initTilt() {
    var cols = footer.querySelectorAll(".site-footer-column");
    cols.forEach(function (col) {
      col.addEventListener(
        "pointermove",
        function (e) {
          var r = col.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width;
          var py = (e.clientY - r.top) / r.height;
          col.style.setProperty("--ry", ((px - 0.5) * 8).toFixed(2) + "deg");
          col.style.setProperty("--rx", ((0.5 - py) * 6).toFixed(2) + "deg");
          col.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
          col.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
        },
        { passive: true }
      );
      col.addEventListener("pointerleave", function () {
        col.style.setProperty("--rx", "0deg");
        col.style.setProperty("--ry", "0deg");
      });
    });
  }

  function initMagnet() {
    var items = footer.querySelectorAll(".site-footer-social a, .site-footer-logo");
    items.forEach(function (item) {
      item.addEventListener(
        "pointermove",
        function (e) {
          var r = item.getBoundingClientRect();
          var dx = e.clientX - (r.left + r.width / 2);
          var dy = e.clientY - (r.top + r.height / 2);
          item.style.setProperty("--mx", (dx * 0.35).toFixed(1) + "px");
          item.style.setProperty("--my", (dy * 0.35).toFixed(1) + "px");
        },
        { passive: true }
      );
      item.addEventListener("pointerleave", function () {
        item.style.setProperty("--mx", "0px");
        item.style.setProperty("--my", "0px");
      });
    });
  }

  /* ------------------------------------------------------------------
     4) GSAP: footer opens like a lid, content staggers in, shapes drift
     ------------------------------------------------------------------ */
  function initEntrance(shapes) {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    /* footer lid: ends exactly when the page reaches the bottom */
    gsap.fromTo(
      footer,
      { transformPerspective: 1400, transformOrigin: "50% 100%", rotationX: -7, scale: 0.94, y: 50 },
      {
        rotationX: 0,
        scale: 1,
        y: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: footer,
          start: "top 100%",
          end: "bottom bottom",
          scrub: 0.6
        },
        onComplete: function () {
          gsap.set(footer, { clearProps: "transform" });
        }
      }
    );

    /* staggered content */
    var q = function (s) {
      return gsap.utils.toArray(footer.querySelectorAll(s));
    };
    var targets = []
      .concat(q(".site-footer-logo"))
      .concat(q(".site-footer-description"))
      .concat(q(".site-footer-social a"))
      .concat(q("hr"))
      .concat(q(".site-footer-column h3"))
      .concat(q(".site-footer-col-grid li"))
      .concat(q(".site-footer-copyright"));

    var tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      scrollTrigger: {
        trigger: footer,
        start: "top 92%",
        toggleActions: "play none none reverse"
      },
      /* hand control back to CSS so hover / magnet transforms work */
      onComplete: function () {
        gsap.set(targets, { clearProps: "transform,opacity,visibility" });
      }
    });

    tl.from(".site-footer-logo", { autoAlpha: 0, y: 30, rotationY: -80, transformPerspective: 600, duration: 0.9 }, 0)
      .from(".site-footer-description", { autoAlpha: 0, y: 24, duration: 0.8 }, 0.1)
      .from(".site-footer-social a", { autoAlpha: 0, scale: 0, rotation: -120, duration: 0.7, stagger: 0.08, ease: "back.out(2)" }, 0.2)
      .from(".site-footer hr", { scaleX: 0, transformOrigin: "0 50%", duration: 1, stagger: 0.3 }, 0.3)
      .from(".site-footer-column h3", { autoAlpha: 0, y: 24, rotationX: -60, transformPerspective: 600, duration: 0.8, stagger: 0.12 }, 0.4)
      .from(".site-footer-col-grid li", { autoAlpha: 0, x: -26, rotationY: -35, transformPerspective: 600, duration: 0.7, stagger: 0.035 }, 0.5)
      .from(".site-footer-copyright", { autoAlpha: 0, y: 16, duration: 0.6 }, 1.1);

    /* shape parallax while the footer scrolls into view */
    shapes.forEach(function (s, i) {
      gsap.fromTo(
        s,
        { y: 50 + i * 20 },
        {
          y: -40 - i * 20,
          ease: "none",
          scrollTrigger: {
            trigger: footer,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 1
          }
        }
      );
    });
  }

  /* ---------- start ---------- */
  var shapes = initShapes();
  initWave();
  if (finePointer) {
    initTilt();
    initMagnet();
  }
  initEntrance(shapes);

  /* footer height changes once fonts/images settle */
  window.addEventListener("load", function () {
    if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 350);
  });
})();
