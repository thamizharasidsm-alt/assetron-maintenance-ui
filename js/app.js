// ============================================================
// Hash router + app shell, with a current-user/role switcher and
// a notification bell for pending approvals (single-browser demo
// simulation — there is no backend to push real notifications).
// ============================================================
window.Pages = window.Pages || {};

function applyStoredTheme() {
  const saved = localStorage.getItem("assetron_maint_theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("assetron_maint_theme", next);
  const btn = document.getElementById("theme-toggle-btn");
  if (btn) btn.innerHTML = icon(next === "dark" ? "sun" : "moon", 18);
}

function isNavCollapsed() {
  return localStorage.getItem("assetron_maint_nav_collapsed") === "1";
}

function initials(name) {
  return String(name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function renderShell() {
  const root = document.getElementById("app-root");
  const isDark = (document.documentElement.getAttribute("data-theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "dark";
  const user = Store.currentUser();
  const pendingCount = Store.pendingApprovalsFor(user.id).length;

  root.innerHTML = `
    <div class="ac-shell ${isNavCollapsed() ? "nav-collapsed" : ""}" id="app-shell">
      <header class="ac-topbar">
        <button class="ac-icon-btn" id="mobile-nav-toggle">${icon("menu", 20)}</button>
        <a href="#/" class="ac-topbar__brand">
          <span class="ac-topbar__brand-mark">AR</span>
          <span>ASSETRON <span style="font-weight:500;color:var(--ac-foreground-muted);">Maintenance</span></span>
        </a>
        <div class="ac-topbar__search">
          ${icon("search", 16)}
          <input type="text" placeholder="Search equipment, work orders…" id="global-search" />
        </div>
        <div class="ac-topbar__actions">
          <button class="ac-icon-btn" id="theme-toggle-btn" title="Toggle theme">${icon(isDark ? "sun" : "moon", 18)}</button>
          <div style="position:relative;">
            <button class="ac-icon-btn" id="bell-btn" title="Notifications">${icon("bell", 18)}${pendingCount ? `<span class="ac-icon-btn__badge"></span>` : ""}</button>
            <div class="ac-notif-panel" id="bell-panel" style="display:none;"></div>
          </div>
          <button class="ac-icon-btn" title="Reset demo data" id="reset-demo-btn">${icon("refreshcw", 18)}</button>
          <div style="position:relative;">
            <div class="ac-avatar" id="user-avatar" title="${user.name} — ${user.role} (click to switch user)">${initials(user.name)}</div>
            <div class="ac-notif-panel" id="user-panel" style="display:none;"></div>
          </div>
        </div>
      </header>
      <div class="ac-body">
        <nav class="ac-sidenav" id="sidenav"></nav>
        <main class="ac-main" id="page-container"></main>
      </div>
    </div>`;

  document.getElementById("theme-toggle-btn").addEventListener("click", toggleTheme);
  document.getElementById("mobile-nav-toggle").addEventListener("click", () => {
    if (window.innerWidth <= 1024) {
      document.getElementById("sidenav").classList.toggle("mobile-open");
    } else {
      const collapsed = document.getElementById("app-shell").classList.toggle("nav-collapsed");
      localStorage.setItem("assetron_maint_nav_collapsed", collapsed ? "1" : "0");
    }
  });
  document.getElementById("reset-demo-btn").addEventListener("click", () => {
    if (confirm("Reset all demo data back to the original seed? Any changes you made will be lost.")) {
      Store.reset();
      toast("Demo data reset", "success");
      renderShell();
      renderRoute();
    }
  });

  wireBell(user, pendingCount);
  wireUserSwitcher(user);
  renderSidenav();
}

function wireBell(user, pendingCount) {
  const bellBtn = document.getElementById("bell-btn");
  const panel = document.getElementById("bell-panel");
  const items = Store.pendingApprovalsFor(user.id);
  panel.innerHTML = `
    <div class="ac-notif-panel__header">Pending Approvals ${pendingCount ? `(${pendingCount})` : ""}</div>
    ${items.length === 0 ? `<div class="ac-notif-panel__empty">Nothing waiting on you right now.</div>` : items.map((i) => `
      <a class="ac-notif-panel__item" href="#/approvals">
        <strong>${i.docNumber}</strong>
        <span>${i.module} — ${Store.find("equipment", i.equipmentId)?.name || ""}</span>
      </a>`).join("")}`;
  bellBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("user-panel").style.display = "none";
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  });
  document.addEventListener("click", () => { panel.style.display = "none"; }, { once: true });
}

function wireUserSwitcher(user) {
  const avatar = document.getElementById("user-avatar");
  const panel = document.getElementById("user-panel");
  const employees = Store.all("employees");
  panel.innerHTML = `
    <div class="ac-notif-panel__header">Switch User (demo role simulation)</div>
    ${employees.map((e) => `
      <button class="ac-notif-panel__item ac-notif-panel__item--btn" data-switch-user="${e.id}">
        <strong>${e.name}</strong>
        <span>${e.role}${e.id === user.id ? " · current" : ""}</span>
      </button>`).join("")}`;
  avatar.addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("bell-panel").style.display = "none";
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  });
  panel.querySelectorAll("[data-switch-user]").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      Store.setCurrentUser(b.dataset.switchUser);
      toast(`Switched to ${Store.find("employees", b.dataset.switchUser).name}`, "success");
      renderShell();
      renderRoute();
    });
  });
  document.addEventListener("click", () => { panel.style.display = "none"; }, { once: true });
}

function renderSidenav() {
  const nav = document.getElementById("sidenav");
  const currentHash = location.hash || "#/";
  nav.innerHTML = NAV_GROUPS.map((g) => `
    <div class="ac-navgroup">
      <div class="ac-navgroup__label">${g.label}</div>
      ${g.items.map((item) => `
        <a href="${item.route}" class="ac-navitem ${item.route === currentHash ? "active" : ""}">
          ${iconChip(item.icon, 15, 26)}<span>${item.label}</span>
        </a>`).join("")}
    </div>`).join("");
}

// ---- Router ----
function matchRoute(hash) {
  const raw = hash.replace(/^#/, "") || "/";
  const [path, queryStr] = raw.split("?");
  const query = {};
  if (queryStr) new URLSearchParams(queryStr).forEach((v, k) => { query[k] = v; });
  if (window.Pages[path]) return { handler: window.Pages[path], params: query };
  for (const route in window.Pages) {
    if (route.includes(":")) {
      const routeParts = route.split("/");
      const pathParts = path.split("/");
      if (routeParts.length !== pathParts.length) continue;
      const params = { ...query };
      let ok = true;
      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(":")) params[routeParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
        else if (routeParts[i] !== pathParts[i]) { ok = false; break; }
      }
      if (ok) return { handler: window.Pages[route], params };
    }
  }
  return null;
}

function renderRoute() {
  const hash = location.hash || "#/";
  const container = document.getElementById("page-container");
  const match = matchRoute(hash);
  renderSidenav();
  if (!match) {
    container.innerHTML = `<div class="ac-empty-state">${icon("alerttriangle", 40)}<h3>Page not found</h3><p>The screen "${hash}" doesn't exist in this demo.</p><a class="ac-btn ac-btn--primary" href="#/">Back to Dashboard</a></div>`;
    return;
  }
  container.scrollTop = 0;
  window.scrollTo(0, 0);
  match.handler(container, match.params);
  document.getElementById("sidenav").classList.remove("mobile-open");
}
window.renderRoute = renderRoute;
window.renderShellTopbar = renderShell;

window.addEventListener("hashchange", renderRoute);

document.addEventListener("DOMContentLoaded", () => {
  applyStoredTheme();
  Store.load();
  renderShell();
  renderRoute();
});
