/* ==========================================================================
   SCROLL EFFECTS (GSAP + ScrollTrigger)
   - Each section "opens" in 3D as it scrolls in after the previous one
   - Floating 3D shapes (cube, gyroscope rings, prism) drift + rotate on scroll
   - Section headings flip in
   - Scroll progress bar
   Loaded AFTER script.js. If GSAP fails to load, the page works as before.
   ========================================================================== */
(function () {
  "use strict";

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  /* Sections that get the "open" effect (hero is excluded: it has its own intro) */
  var SECTION_SELECTORS = [
    "#services",
    "#practice-areas",
    "#founders",
    "#all-industries",
    "#process",
    "#social-showcase",
    "#contact"
  ];

  /* Section heading blocks that flip in (services + founders already have their own motion) */
  var HEADING_SELECTORS = [
    ".practice-head",
    ".industry-heading",
    ".process-head",
    ".showcase-head",
    ".contact-heading"
  ];

  /* Shape layout per section: [type, size px, left %, top %, depth]  */
  var SHAPES = {
    "#services": [["cube", 90, 4, 12, 1], ["rings", 120, 90, 62, 0.6]],
    "#practice-areas": [["prism", 100, 92, 10, 0.8], ["cube", 70, 3, 70, 1.2]],
    "#founders": [["rings", 110, 92, 8, 0.7]],
    "#all-industries": [["cube", 80, 92, 16, 1], ["prism", 90, 2, 64, 0.7]],
    "#process": [["rings", 130, 3, 14, 0.8], ["cube", 70, 92, 70, 1.3]],
    "#social-showcase": [["prism", 110, 91, 12, 0.9], ["cube", 80, 4, 66, 1.1]],
    "#contact": [["rings", 150, 90, 10, 0.8], ["cube", 90, 3, 72, 1.2]]
  };

  /* ---------- helpers: build 3D shapes as plain DOM ---------- */
  function el(cls, parent) {
    var d = document.createElement("div");
    d.className = cls;
    if (parent) parent.appendChild(d);
    return d;
  }

  function buildShape(type, size) {
    var wrap = el("fx-shape fx-" + type);
    wrap.style.setProperty("--s", size + "px");
    var inner = el("fx-inner", wrap);
    var i;
    if (type === "cube") {
      ["front", "back", "right", "left", "top", "bottom"].forEach(function (f) {
        el("fx-face fx-face--" + f, inner);
      });
    } else if (type === "rings") {
      for (i = 0; i < 3; i++) el("fx-ring fx-ring--" + i, inner);
      el("fx-core", inner);
    } else if (type === "prism") {
      ["front", "back", "left", "right"].forEach(function (f) {
        el("fx-tri fx-tri--" + f, inner);
      });
    }
    return wrap;
  }

  function addShapes(section, key, isDark) {
    var list = SHAPES[key];
    if (!list) return [];
    var layer = el("fx3d" + (isDark ? " fx3d--dark" : ""));
    layer.setAttribute("aria-hidden", "true");
    section.insertBefore(layer, section.firstChild);

    return list.map(function (cfg) {
      var s = buildShape(cfg[0], cfg[1]);
      s.style.left = cfg[2] + "%";
      s.style.top = cfg[3] + "%";
      s.dataset.depth = cfg[4];
      layer.appendChild(s);
      return s;
    });
  }

  /* ---------- everything below respects reduced-motion ---------- */
  var mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", function () {
    /* 1) Scroll progress bar */
    var bar = el("ss-progress");
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    gsap.fromTo(
      bar,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3
        }
      }
    );

    /* 2) Section "open" effect + 3D shapes */
    SECTION_SELECTORS.forEach(function (sel, i) {
      var section = document.querySelector(sel);
      if (!section) return;

      var side = i % 2 === 0 ? -1 : 1; /* alternate the tilt direction */

      /* The section opens like a lid: starts as a smaller, tilted, rounded card
         and widens to full size as it scrolls into view. */
      gsap.fromTo(
        section,
        {
          transformPerspective: 1600,
          transformOrigin: "50% 100%",
          rotationX: -9,
          rotationY: side * 2.5,
          scale: 0.9,
          y: 70,
          clipPath: "inset(7% 6% 0% 6% round 64px 64px 0px 0px)"
        },
        {
          rotationX: 0,
          rotationY: 0,
          scale: 1,
          y: 0,
          clipPath: "inset(0% 0% 0% 0% round 0px 0px 0px 0px)",
          ease: "power2.out",
          immediateRender: true,
          scrollTrigger: {
            trigger: section,
            start: "top 100%",
            end: "top 30%",
            scrub: 0.6
          },
          /* Leave no transform behind once open, so existing sticky/scroll
             code in script.js behaves exactly as before. */
          onComplete: function () {
            gsap.set(section, { clearProps: "transform,clipPath" });
          }
        }
      );

      /* Floating 3D shapes: rotate + parallax while the section is on screen */
      var isDark = sel === "#contact";
      var shapes = addShapes(section, sel, isDark);

      shapes.forEach(function (shape, n) {
        var depth = parseFloat(shape.dataset.depth) || 1;
        var inner = shape.firstChild;

        /* scroll-linked spin and drift */
        gsap.fromTo(
          inner,
          { rotationX: 20 * (n + 1), rotationY: -30 },
          {
            rotationX: 20 * (n + 1) + 220 * depth,
            rotationY: 210 * depth * (n % 2 ? -1 : 1),
            rotationZ: 40 * depth,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1
            }
          }
        );
        gsap.fromTo(
          shape,
          { y: 60 * depth },
          {
            y: -140 * depth,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2
            }
          }
        );

        /* gentle idle bobbing so it never looks frozen */
        gsap.to(shape, {
          x: (n % 2 ? -1 : 1) * 14,
          duration: 3 + n,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1
        });

        /* fade in when the section becomes active */
        gsap.fromTo(
          shape,
          { autoAlpha: 0, scale: 0.4 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 1.1,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });
    });

    /* 3) Heading flip-in */
    HEADING_SELECTORS.forEach(function (sel) {
      var head = document.querySelector(sel);
      if (!head) return;
      gsap.fromTo(
        head,
        {
          autoAlpha: 0,
          y: 60,
          rotationX: -28,
          transformPerspective: 900,
          transformOrigin: "50% 100%"
        },
        {
          autoAlpha: 1,
          y: 0,
          rotationX: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: head,
            start: "top 88%",
            toggleActions: "play none none reverse"
          },
          onComplete: function () {
            gsap.set(head, { clearProps: "transform" });
          }
        }
      );
    });
  });

  /* ---------- keep trigger positions correct ---------- */
  var refresh = function () {
    ScrollTrigger.refresh();
  };

  /* images / fonts change page height */
  window.addEventListener("load", function () {
    setTimeout(refresh, 300);
  });

  /* the loader locks scrolling; recalculate once it releases */
  if (document.body.classList.contains("ss-loading")) {
    var mo = new MutationObserver(function () {
      if (!document.body.classList.contains("ss-loading")) {
        mo.disconnect();
        setTimeout(refresh, 100);
      }
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }
})();
