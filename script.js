"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll(".nav__link");
  const sections = document.querySelectorAll("main section[id]");

  /* ---------- Mobile hamburger menu ---------- */
  const setMenu = (open) => {
    navMenu.classList.toggle("open", open);
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  };

  navToggle.addEventListener("click", () => {
    setMenu(!navMenu.classList.contains("open"));
  });

  // Close the menu after choosing a link, pressing Escape, or resizing to desktop
  navLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", () => { if (window.innerWidth >= 900) setMenu(false); });

  /* ---------- Header shadow + active nav link on scroll ---------- */
  const updateOnScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 20);

    const marker = window.scrollY + window.innerHeight * 0.35;
    let currentId = sections[0].id;

    sections.forEach((section) => {
      if (marker >= section.offsetTop) currentId = section.id;
    });

    // Highlight the last section when scrolled to the very bottom
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 2) {
      currentId = sections[sections.length - 1].id;
    }

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
    });
  };

  window.addEventListener("scroll", updateOnScroll, { passive: true });
  updateOnScroll();

  /* ---------- Fade-in on scroll (IntersectionObserver) ---------- */
  const fadeEls = document.querySelectorAll(".fade-in");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    // Small stagger for items inside grids
    fadeEls.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 90}ms`;
      observer.observe(el);
    });
  } else {
    fadeEls.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById("contactForm");
  const statusEl = document.getElementById("formStatus");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validators = {
    name: (v) => (v.trim().length >= 2 ? "" : "Please enter your name (min. 2 characters)."),
    email: (v) => (emailPattern.test(v.trim()) ? "" : "Please enter a valid email address."),
    message: (v) => (v.trim().length >= 10 ? "" : "Message should be at least 10 characters."),
  };

  const validateField = (field) => {
    const error = validators[field.name](field.value);
    field.classList.toggle("invalid", Boolean(error));
    field.setAttribute("aria-invalid", String(Boolean(error)));
    field.parentElement.querySelector(".form__error").textContent = error;
    return !error;
  };

  const fields = form.querySelectorAll("input, textarea");

  fields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.classList.contains("invalid")) validateField(field);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    statusEl.textContent = "";

    const allValid = [...fields].map(validateField).every(Boolean);
    if (!allValid) {
      statusEl.textContent = "Please fix the highlighted fields.";
      return;
    }

    // Demo only: connect to a backend or a service like Formspree / EmailJS here.
    statusEl.textContent = "Thanks! Your message has been sent. ✨";
    form.reset();
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
});

/* ===== Burgundy pixel lipstick cursor (slanted) ===== */
(() => {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const SCALE = 2;         // screen pixels per sprite cell
  const PAD = 1;           // cells of cream rim around the sprite
  const TIP_X = 3.5;       // hotspot: the tip of the lipstick bullet (in cells)
  const REST_TILT = -30;   // degrees at rest (more negative = leans further right)
  const HOVER_TILT = -42;  // degrees over links, buttons and inputs
  const CLICKABLE =
    'a[href], button:not(:disabled), [role="button"], summary, label, select, ' +
    'input:not([type="hidden"]), textarea, [tabindex]:not([tabindex="-1"])';

  // O outline, B bullet, b bullet shade, h bullet shine,
  // T tube, t tube shade, S tube shine, G gold band, . transparent
  const GRID = [
    "...OO...",
    "..OhhO..",
    ".OhhBbO.",
    ".OhBBbO.",
    ".OhBBbO.",
    ".OhBBbO.",
    ".OhBBbO.",
    ".ObbbbO.",
    "OOOOOOOO",
    "OGGGGGGO",
    "OOOOOOOO",
    "OTSTTtTO",
    "OTSTTtTO",
    "OTSTTtTO",
    "OTSTTtTO",
    "OTSTTtTO",
    "OTSTTtTO",
    "OOOOOOOO",
    "OGGGGGGO",
    "OOOOOOOO",
  ];

  const RIM = "#fbf3ef";
  const idle = {
    O: "#2a0c10", B: "#8a2a33", b: "#581820", h: "#c0525c",
    T: "#6f1d25", t: "#4a1219", S: "#a03a44", G: "#e8b4ae",
  };
  const hover = { ...idle, B: "#b8434f", b: "#8a2a33", h: "#e8b4ae" };

  const cols = GRID[0].length + PAD * 2;
  const rows = GRID.length + PAD * 2;

  const paint = (palette) => {
    const c = document.createElement("canvas");
    c.width = cols * SCALE;
    c.height = rows * SCALE;
    const g = c.getContext("2d");
    const at = (x, y) => {
      const ch = GRID[y - PAD]?.[x - PAD];
      return ch && ch !== "." ? ch : null;
    };
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const ch = at(x, y);
        let color = ch ? palette[ch] : null;
        if (!ch && (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1))) {
          color = RIM; // rim keeps it visible on burgundy backgrounds
        }
        if (color) {
          g.fillStyle = color;
          g.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
        }
      }
    }
    return `url(${c.toDataURL()})`;
  };

  const idleImg = paint(idle);
  const hoverImg = paint(hover);

  const hotX = (TIP_X + PAD) * SCALE;
  const hotY = PAD * SCALE;

  const el = document.createElement("div");
  el.className = "pixel-cursor";
  el.setAttribute("aria-hidden", "true");
  el.style.width = cols * SCALE + "px";
  el.style.height = rows * SCALE + "px";
  el.style.transformOrigin = `${hotX}px ${hotY}px`; // slant pivots on the tip
  el.style.backgroundImage = idleImg;
  document.body.appendChild(el);
  document.documentElement.classList.add("has-pixel-cursor");

  let x = 0, y = 0, tx = 0, ty = 0, raf = 0, placed = false, tilted = false;

  const render = () => {
    const px = Math.round(x - hotX);
    const py = Math.round(y - hotY);
    const angle = tilted ? HOVER_TILT : REST_TILT;
    el.style.transform = `translate3d(${px}px, ${py}px, 0) rotate(${angle}deg)`;
  };
  render();

  const tick = () => {
    const k = reduce.matches ? 1 : 0.45; // no easing with reduced motion
    x += (tx - x) * k;
    y += (ty - y) * k;
    render();
    const settled = Math.abs(tx - x) < 0.1 && Math.abs(ty - y) < 0.1;
    raf = settled ? 0 : requestAnimationFrame(tick);
  };

  document.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    tx = e.clientX;
    ty = e.clientY;
    if (!placed) { x = tx; y = ty; placed = true; render(); }
    el.classList.add("is-visible");
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });

  document.addEventListener("pointerover", (e) => {
    const t = e.target instanceof Element ? e.target : null;
    tilted = Boolean(t && t.closest(CLICKABLE));
    el.style.backgroundImage = tilted ? hoverImg : idleImg;
    render();
  }, { passive: true });

  document.documentElement.addEventListener("mouseleave", () =>
    el.classList.remove("is-visible")
  );
})();

/* ===== Burgundy pixel lipstick cursor (slanted) ===== */
(() => {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const SCALE = 2;         // screen pixels per sprite cell
  const PAD = 1;           // cells of cream rim around the sprite
  const TIP_X = 3.5;       // hotspot: the tip of the lipstick bullet (in cells)
  const REST_TILT = -30;   // degrees at rest (more negative = leans further right)
  const HOVER_TILT = -42;  // degrees over links, buttons and inputs
  const CLICKABLE =
    'a[href], button:not(:disabled), [role="button"], summary, label, select, ' +
    'input:not([type="hidden"]), textarea, [tabindex]:not([tabindex="-1"])';

  // O outline, B bullet, b bullet shade, h bullet shine,
  // T tube, t tube shade, S tube shine, G gold band, . transparent
  const GRID = [
    "...OO...",
    "..OhhO..",
    ".OhhBbO.",
    ".OhBBbO.",
    ".OhBBbO.",
    ".OhBBbO.",
    ".OhBBbO.",
    ".ObbbbO.",
    "OOOOOOOO",
    "OGGGGGGO",
    "OOOOOOOO",
    "OTSTTtTO",
    "OTSTTtTO",
    "OTSTTtTO",
    "OTSTTtTO",
    "OTSTTtTO",
    "OTSTTtTO",
    "OOOOOOOO",
    "OGGGGGGO",
    "OOOOOOOO",
  ];

  const RIM = "#fbf3ef";
  const idle = {
    O: "#2a0c10", B: "#8a2a33", b: "#581820", h: "#c0525c",
    T: "#6f1d25", t: "#4a1219", S: "#a03a44", G: "#e8b4ae",
  };
  const hover = { ...idle, B: "#b8434f", b: "#8a2a33", h: "#e8b4ae" };

  const cols = GRID[0].length + PAD * 2;
  const rows = GRID.length + PAD * 2;

  const paint = (palette) => {
    const c = document.createElement("canvas");
    c.width = cols * SCALE;
    c.height = rows * SCALE;
    const g = c.getContext("2d");
    const at = (x, y) => {
      const ch = GRID[y - PAD]?.[x - PAD];
      return ch && ch !== "." ? ch : null;
    };
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const ch = at(x, y);
        let color = ch ? palette[ch] : null;
        if (!ch && (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1))) {
          color = RIM; // rim keeps it visible on burgundy backgrounds
        }
        if (color) {
          g.fillStyle = color;
          g.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
        }
      }
    }
    return `url(${c.toDataURL()})`;
  };

  const idleImg = paint(idle);
  const hoverImg = paint(hover);

  const hotX = (TIP_X + PAD) * SCALE;
  const hotY = PAD * SCALE;

  const el = document.createElement("div");
  el.className = "pixel-cursor";
  el.setAttribute("aria-hidden", "true");
  el.style.width = cols * SCALE + "px";
  el.style.height = rows * SCALE + "px";
  el.style.transformOrigin = `${hotX}px ${hotY}px`; // slant pivots on the tip
  el.style.backgroundImage = idleImg;
  document.body.appendChild(el);
  document.documentElement.classList.add("has-pixel-cursor");

  let x = 0, y = 0, tx = 0, ty = 0, raf = 0, placed = false, tilted = false;

  const render = () => {
    const px = Math.round(x - hotX);
    const py = Math.round(y - hotY);
    const angle = tilted ? HOVER_TILT : REST_TILT;
    el.style.transform = `translate3d(${px}px, ${py}px, 0) rotate(${angle}deg)`;
  };
  render();

  const tick = () => {
    const k = reduce.matches ? 1 : 0.45; // no easing with reduced motion
    x += (tx - x) * k;
    y += (ty - y) * k;
    render();
    const settled = Math.abs(tx - x) < 0.1 && Math.abs(ty - y) < 0.1;
    raf = settled ? 0 : requestAnimationFrame(tick);
  };

  document.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    tx = e.clientX;
    ty = e.clientY;
    if (!placed) { x = tx; y = ty; placed = true; render(); }
    el.classList.add("is-visible");
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });

  document.addEventListener("pointerover", (e) => {
    const t = e.target instanceof Element ? e.target : null;
    tilted = Boolean(t && t.closest(CLICKABLE));
    el.style.backgroundImage = tilted ? hoverImg : idleImg;
    render();
  }, { passive: true });

  document.documentElement.addEventListener("mouseleave", () =>
    el.classList.remove("is-visible")
  );
})();