/* ============================================================
   CONFIG — edit these values to update site content
   ============================================================ */
const CONFIG = {
  siteName:     "Watchtower Records",
  tagline:      "Label  ·  Production  ·  Publishing",
  stats: {
    founded:  "2024",
    location: "Los Angeles",
  },
  instagramUrl: "https://www.instagram.com/watchtowerrec/",
  tiktokUrl:    "https://www.tiktok.com/@watchtowerrecords",
  formEndpoint: "https://formspree.io/f/mwvzjnaw",
  nav: [
    // { label: "Roster", href: "roster.html" },  // FUTURE
    // { label: "About",  href: "about.html"  },  // FUTURE
    { label: "Contact", href: "#contact" },
  ],
};

/* ============================================================
   NAV
   ============================================================ */
function buildNav() {
  const navLinks     = document.getElementById("nav-links");
  const overlayLinks = document.getElementById("nav-overlay-links");

  CONFIG.nav.forEach(item => {
    navLinks.appendChild(makeNavItem(item, false));
    overlayLinks.appendChild(makeNavItem(item, true));
  });
}

function makeNavItem(item, isOverlay) {
  const li = document.createElement("li");
  const a  = document.createElement("a");
  a.href        = item.href;
  a.textContent = item.label;
  if (isOverlay) a.addEventListener("click", closeMenu);
  li.appendChild(a);
  return li;
}

/* Nav scroll: transparent → frosted glass after 60px */
function initNavScroll() {
  const nav       = document.getElementById("nav");
  const threshold = 60;
  const tick = () => nav.classList.toggle("scrolled", window.scrollY > threshold);
  window.addEventListener("scroll", tick, { passive: true });
  tick();
}

/* Active nav link: highlights the link for the currently visible section */
function initActiveNav() {
  const sections = document.querySelectorAll("section[id]");
  const links    = document.querySelectorAll(".nav-links li a");

  if (!links.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(a => {
        a.classList.toggle(
          "active",
          a.getAttribute("href") === `#${entry.target.id}`
        );
      });
    });
  }, {
    rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-height")) || 72}px 0px -60% 0px`,
  });

  sections.forEach(s => observer.observe(s));
}

/* Mobile hamburger / overlay */
function initHamburger() {
  const btn     = document.getElementById("nav-hamburger");
  const overlay = document.getElementById("nav-overlay");

  btn.addEventListener("click", () => {
    btn.getAttribute("aria-expanded") === "true" ? closeMenu() : openMenu();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeMenu();
  });

  overlay.addEventListener("click", e => {
    if (e.target === overlay) closeMenu();
  });
}

function openMenu() {
  const btn     = document.getElementById("nav-hamburger");
  const overlay = document.getElementById("nav-overlay");
  btn.setAttribute("aria-expanded", "true");
  overlay.setAttribute("aria-hidden", "false");
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
  const firstLink = overlay.querySelector("a");
  if (firstLink) firstLink.focus();
}

function closeMenu() {
  const btn     = document.getElementById("nav-hamburger");
  const overlay = document.getElementById("nav-overlay");
  btn.setAttribute("aria-expanded", "false");
  overlay.setAttribute("aria-hidden", "true");
  overlay.classList.remove("open");
  document.body.style.overflow = "";
}

/* ============================================================
   HERO
   ============================================================ */
function buildHero() {
  const taglineEl = document.getElementById("hero-tagline");
  const cityEl    = document.getElementById("hero-city");
  const estEl     = document.getElementById("hero-est");
  if (taglineEl) taglineEl.textContent = CONFIG.tagline;
  if (cityEl)    cityEl.textContent    = `· ${CONFIG.stats.location} ·`;
  if (estEl)     estEl.textContent     = `Independent  ·  Est. ${CONFIG.stats.founded}`;
}

/* ============================================================
   ENTRANCE ANIMATIONS — IntersectionObserver fade-up
   ============================================================ */
function initEntranceAnimations() {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    document.querySelectorAll(".fade-up").forEach(el => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -48px 0px",
  });

  document.querySelectorAll(".fade-up").forEach(el => observer.observe(el));
}

/* ============================================================
   CONTACT FORM — validation, blur hints, loading state
   ============================================================ */
function initContactForm() {
  const form      = document.getElementById("contact-form");
  const submitBtn = document.getElementById("submit-btn");

  /* Social links — show TikTok only when URL is configured */
  const igLink = document.getElementById("instagram-link");
  const ttLink = document.getElementById("tiktok-link");
  if (igLink && CONFIG.instagramUrl) igLink.href = CONFIG.instagramUrl;
  if (ttLink) {
    if (CONFIG.tiktokUrl) {
      ttLink.href = CONFIG.tiktokUrl;
      ttLink.removeAttribute("hidden");
    }
    /* if tiktokUrl is empty, link stays hidden (set in HTML) */
  }

  if (!form) return;

  /* Wire form action to CONFIG endpoint */
  if (CONFIG.formEndpoint) form.action = CONFIG.formEndpoint;

  const email   = form.querySelector("#email");
  const message = form.querySelector("#message");

  /* Validate on blur, not on every keystroke */
  email.addEventListener("blur", () => {
    if (email.value.trim()) validateEmail(email);
  });

  message.addEventListener("blur", () => {
    if (!message.value.trim()) setFieldError(message, "Message is required.");
    else clearFieldError(message);
  });

  /* Clear error immediately on correction */
  form.querySelectorAll("input, textarea").forEach(field => {
    field.addEventListener("input", () => clearFieldError(field));
  });

  form.addEventListener("submit", e => {
    e.preventDefault();

    form.querySelectorAll("input, textarea").forEach(f => clearFieldError(f));

    let firstInvalid = null;

    if (!email.value.trim()) {
      setFieldError(email, "Email is required.");
      firstInvalid = email;
    } else if (!isValidEmail(email.value.trim())) {
      setFieldError(email, "Please enter a valid email address.");
      firstInvalid = email;
    }

    if (!message.value.trim()) {
      setFieldError(message, "Message is required.");
      if (!firstInvalid) firstInvalid = message;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    submitBtn.textContent = "Sending…";
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;

    if (CONFIG.formEndpoint) {
      fetch(CONFIG.formEndpoint, {
        method:  "POST",
        body:    new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then(res => { if (res.ok) showConfirmation(); else resetButton(); })
        .catch(() => resetButton());
    } else {
      setTimeout(showConfirmation, 600);
    }
  });
}

function validateEmail(field) {
  if (!field.value.trim()) {
    setFieldError(field, "Email is required.");
  } else if (!isValidEmail(field.value.trim())) {
    setFieldError(field, "Please enter a valid email address.");
  } else {
    clearFieldError(field);
  }
}

function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function setFieldError(field, msg) {
  field.classList.add("error");
  const el = document.getElementById(`${field.id}-error`);
  if (el) el.textContent = msg;
}

function clearFieldError(field) {
  field.classList.remove("error");
  const el = document.getElementById(`${field.id}-error`);
  if (el) el.textContent = "";
}

function resetButton() {
  const btn = document.getElementById("submit-btn");
  if (!btn) return;
  btn.textContent = "Send Message";
  btn.classList.remove("loading");
  btn.disabled = false;
}

function showConfirmation() {
  const wrap = document.getElementById("contact-form-wrap");
  if (wrap) wrap.innerHTML = '<p class="form-confirmation">Thanks — we\'ll be in touch.</p>';
}

/* ============================================================
   FOOTER
   ============================================================ */
function buildFooter() {
  const copyEl  = document.getElementById("footer-copy");
  const linksEl = document.getElementById("footer-links");

  if (copyEl) {
    copyEl.textContent = `© ${new Date().getFullYear()} ${CONFIG.siteName}. All rights reserved.`;
  }

  if (linksEl) {
    CONFIG.nav.forEach(item => {
      const li = document.createElement("li");
      const a  = document.createElement("a");
      a.href        = item.href;
      a.textContent = item.label;
      li.appendChild(a);
      linksEl.appendChild(li);
    });
  }
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  buildNav();
  buildHero();
  buildFooter();
  initNavScroll();
  initActiveNav();
  initHamburger();
  initContactForm();
  initEntranceAnimations();
});
