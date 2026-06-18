const pageName = location.pathname.split("/").pop() || "index.html";

document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();
  initTheme();
  initLoader();
  initAOS();
  initRevealAnimations();
  initHeroSwiper();
  initCounters();
  initPortfolioFilters();
  setFooterYear();
  initFooterInteractions();
  normalizeSignupButtons();
});

function setActiveNav() {
  document.querySelectorAll("[data-page]").forEach((link) => {
    if (link.dataset.page === pageName && link.classList.contains("nav-link")) {
      link.classList.add("active");
    }
  });
}

function initTheme() {
  const storageKey = "dm_theme";
  const savedTheme = localStorage.getItem(storageKey);
  const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const initialTheme = savedTheme || preferredTheme;

  const renderTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.innerHTML = theme === "dark" ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon"></i>';
      button.setAttribute("aria-pressed", theme === "dark");
      button.setAttribute("title", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    });
  };

  renderTheme(initialTheme);

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      localStorage.setItem(storageKey, current);
      renderTheme(current);
    });
  });
}

function initLoader() {
  const loader = document.querySelector(".loader");
  if (!loader) return;
  window.addEventListener("load", () => {
    setTimeout(() => loader.classList.add("hidden"), 280);
  });
}

function initAOS() {
  const items = document.querySelectorAll(".reveal");
  items.forEach((item, index) => {
    if (!item.dataset.aos) {
      item.dataset.aos = index % 3 === 0 ? "fade-up" : index % 3 === 1 ? "fade-right" : "fade-left";
    }
  });

  if (window.AOS) {
    window.AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 72,
    });
    return;
  }

  const cssId = "aos-css";
  if (!document.getElementById(cssId)) {
    const link = document.createElement("link");
    link.id = cssId;
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/aos@2.3.4/dist/aos.css";
    document.head.appendChild(link);
  }

  if (!window.__aosLoading) {
    window.__aosLoading = true;
    const script = document.createElement("script");
    script.src = "https://unpkg.com/aos@2.3.4/dist/aos.js";
    script.onload = () => {
      window.AOS.init({
        duration: 800,
        easing: "ease-out-cubic",
        once: true,
        offset: 72,
      });
    };
    document.body.appendChild(script);
  }
}

function initRevealAnimations() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((item) => observer.observe(item));
}

function initHeroSwiper() {
  const root = document.querySelector("[data-hero-swiper]");
  if (!root) return;

  const slides = Array.from(root.querySelectorAll(".hero-slide"));
  const dots = Array.from(root.querySelectorAll("[data-hero-dot]"));
  const prevButton = root.querySelector("[data-hero-prev]");
  const nextButton = root.querySelector("[data-hero-next]");

  if (slides.length < 2) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  if (activeIndex < 0) activeIndex = 0;
  let timerId = null;

  function render(index) {
    activeIndex = (index + slides.length) % slides.length;
    const prevIndex = (activeIndex - 1 + slides.length) % slides.length;
    const nextIndex = (activeIndex + 1) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
      slide.classList.toggle("is-prev", slideIndex === prevIndex);
      slide.classList.toggle("is-next", slideIndex === nextIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  }

  function stopAutoplay() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function startAutoplay() {
    if (reduceMotion || timerId) return;
    timerId = window.setInterval(() => render(activeIndex + 1), 4400);
  }

  function go(delta) {
    render(activeIndex + delta);
  }

  render(activeIndex);
  startAutoplay();

  prevButton?.addEventListener("click", () => {
    stopAutoplay();
    go(-1);
    startAutoplay();
  });

  nextButton?.addEventListener("click", () => {
    stopAutoplay();
    go(1);
    startAutoplay();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const slideIndex = Number(dot.dataset.heroDot || 0);
      stopAutoplay();
      render(slideIndex);
      startAutoplay();
    });
  });

  root.addEventListener("mouseenter", stopAutoplay);
  root.addEventListener("mouseleave", startAutoplay);
  root.addEventListener("focusin", stopAutoplay);
  root.addEventListener("focusout", startAutoplay);
}

function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.45 }
  );
  counters.forEach((counter) => observer.observe(counter));
}

function animateCounter(el) {
  const target = Number(el.dataset.count);
  const duration = 1200;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = `${Math.floor(target * progress)}+`;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function initPortfolioFilters() {
  const buttons = document.querySelectorAll("[data-filter]");
  const projects = document.querySelectorAll("[data-category]");
  if (!buttons.length) return;
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      const filter = button.dataset.filter;
      projects.forEach((project) => {
        const show = filter === "all" || project.dataset.category === filter;
        project.classList.toggle("d-none", !show);
      });
    });
  });
}

function normalizeSignupButtons() {
  document.querySelectorAll('a[href="signup.html"], a[data-page="signup.html"]').forEach((button) => {
    button.classList.remove("btn-primary");
    button.classList.add("btn", "btn-outline-primary");
  });
}

function setFooterYear() {
  const year = new Date().getFullYear();
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = year;
  });
}

function initFooterInteractions() {
  document.querySelectorAll("footer .footer-brand").forEach((brand) => {
    brand.setAttribute("role", "link");
    brand.setAttribute("tabindex", "0");
    brand.setAttribute("aria-label", "Go to home page");
    brand.addEventListener("click", () => {
      location.href = "index.html";
    });
    brand.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        location.href = "index.html";
      }
    });
  });

  document.querySelectorAll("footer h3").forEach((heading) => {
    const title = heading.textContent.trim().toLowerCase();
    const list = heading.nextElementSibling;
    if (title === "quick links" && list && !list.querySelector('a[href="pricing.html"]')) {
      const item = document.createElement("li");
      item.innerHTML = '<a href="pricing.html">Pricing</a>';
      list.appendChild(item);
    }

    if (title === "services" && list) {
      // Removed problematic override that changed service links to 404.html
    }
  });

  document.querySelectorAll(".footer-newsletter").forEach((form) => {
    const input = form.querySelector('input[type="email"]');
    if (!input) return;

    const message = document.createElement("div");
    message.className = "footer-newsletter-message";
    message.setAttribute("aria-live", "polite");
    form.appendChild(message);

    const submitNewsletter = (event) => {
      event.preventDefault();
      const email = input.value.trim();
      if (!email || !input.checkValidity()) {
        input.classList.add("is-invalid");
        message.textContent = "Please enter a valid email address.";
        message.classList.remove("text-success");
        message.classList.add("text-warning");
        input.focus();
        input.reportValidity();
        return;
      }

      input.classList.remove("is-invalid");
      location.href = "404.html";
    };

    form.addEventListener("submit", submitNewsletter);
    input.addEventListener("input", () => {
      input.classList.remove("is-invalid");
      message.textContent = "";
    });
  });
}

function showToast(message, type = "success") {
  const container = document.querySelector(".toast-container") || createToastContainer();
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${type} border-0 show`;
  toast.setAttribute("role", "alert");
  toast.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function createToastContainer() {
  const container = document.createElement("div");
  container.className = "toast-container position-fixed top-0 end-0 p-3";
  container.style.zIndex = "4000";
  document.body.appendChild(container);
  return container;
}

function fieldValue(id) {
  return document.getElementById(id)?.value.trim() || "";
}

function setError(id, message) {
  const field = document.getElementById(id);
  const error = document.querySelector(`[data-error-for="${id}"]`);
  if (error) {
    error.innerHTML = message
      ? `<span class="error-message-icon" aria-hidden="true"><i class="bi bi-exclamation-circle-fill"></i></span><span>${message}</span>`
      : "";
  }
  if (field) field.classList.toggle("is-invalid", Boolean(message));
}

function clearErrors(form) {
  form.querySelectorAll("[data-error-for]").forEach((el) => (el.textContent = ""));
  form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPhone(value) {
  return /^\d{10,15}$/.test(value);
}

function isStrongPassword(value) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(value);
}
