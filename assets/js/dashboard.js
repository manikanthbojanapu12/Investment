document.addEventListener("DOMContentLoaded", () => {
  const user = requireSession();
  if (!user) return;

  populateProfile(user);
  initLogout();
  initDashboardNavigation();
  initSettingsPanel();
  window.addEventListener("resize", debounce(() => {
    if (getActivePanelName() === "dashboard") {
      drawCharts();
    }
  }, 150));
});

function requireSession() {
  const session = JSON.parse(localStorage.getItem("dm_session") || "null");
  const users = JSON.parse(localStorage.getItem("dm_users") || "[]");
  const storedUser = session
    ? users.find((item) => item.email.toLowerCase() === session.email.toLowerCase())
    : null;
  const user = storedUser || (session ? { ...session } : null);

  if (!user) {
    location.href = "login.html";
    return null;
  }

  return user;
}

function populateProfile(user) {
  const displayName = user.name || user.username || user.email.split("@")[0];
  const joinedAt = user.createdAt || user.loggedInAt;
  const joinedLabel = joinedAt
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(joinedAt))
    : "Recently";

  document.querySelectorAll("[data-user-name]").forEach((el) => (el.textContent = displayName));
  document.querySelectorAll("[data-user-email]").forEach((el) => (el.textContent = user.email));
  document.querySelectorAll("[data-user-role]").forEach((el) => (el.textContent = user.role || "Client"));
  document.querySelectorAll("[data-user-joined]").forEach((el) => (el.textContent = joinedLabel));
}

function initLogout() {
  document.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.removeItem("dm_session");
      location.href = "login.html";
    });
  });
}

function initDashboardNavigation() {
  const links = Array.from(document.querySelectorAll("[data-dashboard-link]"));
  const panels = Array.from(document.querySelectorAll("[data-dashboard-panel]"));

  const showPanel = (panelName) => {
    panels.forEach((panel) => {
      const isActive = panel.dataset.dashboardPanel === panelName;
      panel.hidden = !isActive;
      panel.classList.toggle("is-active", isActive);
    });

    links.forEach((link) => {
      const isActive = link.dataset.dashboardLink === panelName;
      link.classList.toggle("active", isActive);
    });

    if (panelName === "dashboard") {
      drawCharts();
    }
  };

  links.forEach((link) => {
    const target = link.dataset.dashboardLink;
    if (!target || target === "logout") return;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showPanel(target);
    });
  });

  const initialPanel = getRequestedPanel(links) || "dashboard";
  showPanel(initialPanel);
}

function initSettingsPanel() {
  const settingsPanel = document.querySelector('[data-dashboard-panel="settings"]');
  if (!settingsPanel) return;

  settingsPanel.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      location.href = "404.html";
    });
  });
}

function getRequestedPanel(links) {
  const hash = location.hash.replace("#", "");
  if (!hash) return null;
  return links.some((link) => link.dataset.dashboardLink === hash) ? hash : null;
}

function getActivePanelName() {
  const activePanel = document.querySelector("[data-dashboard-panel]:not([hidden])");
  return activePanel ? activePanel.dataset.dashboardPanel : "dashboard";
}

function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

function drawCharts() {
  drawBarChart("revenueChart", [32, 45, 55, 48, 72, 84], "#0f6bff");
  drawLineChart("trafficChart", [22, 35, 30, 52, 61, 78], "#14b8a6");
  drawBarChart("performanceChart", [68, 82, 74, 91, 64, 88], "#ffb703");
}

function setupCanvas(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return null;
  const parent = canvas.parentElement;
  const rect = parent.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height || 280;
  return { canvas, ctx: canvas.getContext("2d"), width: canvas.width, height: canvas.height };
}

function drawBarChart(id, values, color) {
  const chart = setupCanvas(id);
  if (!chart) return;
  const { ctx, width, height } = chart;
  const gap = 18;
  const pad = 34;
  const max = Math.max(...values);
  const barWidth = (width - pad * 2 - gap * (values.length - 1)) / values.length;
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(100,116,139,.25)";
  ctx.beginPath();
  ctx.moveTo(pad, height - pad);
  ctx.lineTo(width - pad, height - pad);
  ctx.stroke();
  values.forEach((value, index) => {
    const barHeight = ((height - pad * 2) * value) / max;
    const x = pad + index * (barWidth + gap);
    const y = height - pad - barHeight;
    ctx.fillStyle = color;
    roundedRect(ctx, x, y, barWidth, barHeight, 8);
  });
}

function drawLineChart(id, values, color) {
  const chart = setupCanvas(id);
  if (!chart) return;
  const { ctx, width, height } = chart;
  const pad = 34;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values.map((value, index) => {
    const x = pad + (index * (width - pad * 2)) / (values.length - 1);
    const y = height - pad - ((value - min) / (max - min)) * (height - pad * 2);
    return { x, y };
  });
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(100,116,139,.25)";
  ctx.beginPath();
  ctx.moveTo(pad, height - pad);
  ctx.lineTo(width - pad, height - pad);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();
  points.forEach((point) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
    ctx.fill();
  });
}

function roundedRect(ctx, x, y, width, height, radius) {
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();
    return;
  }
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}
/* ======================
   MOBILE SIDEBAR
====================== */

document.addEventListener("DOMContentLoaded", () => {

    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if(menuToggle){

        menuToggle.addEventListener("click", () => {

            sidebar.classList.toggle("active");
            overlay.classList.toggle("active");

        });

        overlay.addEventListener("click", () => {

            sidebar.classList.remove("active");
            overlay.classList.remove("active");

        });

        document.querySelectorAll("[data-dashboard-link]").forEach(link => {

            link.addEventListener("click", () => {

                if(window.innerWidth < 992){

                    sidebar.classList.remove("active");
                    overlay.classList.remove("active");

                }

            });

        });
    }

});
