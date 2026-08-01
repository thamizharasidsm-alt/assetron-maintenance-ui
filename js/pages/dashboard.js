(function () {
  const TILES = [
    { route: "#/org/company-codes", label: "Company Codes", icon: "briefcase", collection: "companyCodes" },
    { route: "#/org/departments", label: "Department Master", icon: "shield", collection: "departments" },
    { route: "#/org/plants", label: "Plants", icon: "factory", collection: "plants" },
    { route: "#/org/locations", label: "Locations", icon: "mappin", collection: "locations" },
    { route: "#/masters/equipment", label: "Equipment Master", icon: "grid", collection: "equipment" },
    { route: "#/masters/spares", label: "Spare Master", icon: "package", collection: "spares" },
    { route: "#/masters/spare-categories", label: "Spare Category Master", icon: "layers", collection: "spareCategories" },
    { route: "#/masters/employees", label: "Employee Master", icon: "users", collection: "employees" },
    { route: "#/masters/approvers", label: "User Approver Master", icon: "usercheck", collection: "approverMatrix" },
    { route: "#/workorder", label: "Work Order", icon: "settings", collection: "workOrders" },
    { route: "#/calibration", label: "Calibration", icon: "scan", collection: "calibrations" },
    { route: "#/reports/equipment-history", label: "Equipment History", icon: "clock" },
    { route: "#/reports/range", label: "Range Report", icon: "barchart" },
  ];

  window.Pages["/"] = function (container) {
    const user = Store.currentUser();
    const woOpen = Store.all("workOrders").filter((w) => w.status !== "Approved").length;
    const calOpen = Store.all("calibrations").filter((w) => w.status !== "Approved").length;
    const dueSoon = [...Store.all("equipment")].map((e) => {
      const wo = Store.all("workOrders").filter((w) => w.equipmentId === e.id && w.status === "Approved");
      const cal = Store.all("calibrations").filter((w) => w.equipmentId === e.id && w.status === "Approved");
      const latest = [...wo, ...cal].sort((a, b) => (b.performedDate || "").localeCompare(a.performedDate || ""))[0];
      return latest ? { equipment: e, nextScheduledDate: latest.nextScheduledDate } : null;
    }).filter(Boolean).filter((x) => x.nextScheduledDate <= todayStr(14)).sort((a, b) => a.nextScheduledDate.localeCompare(b.nextScheduledDate));
    const pendingForMe = Store.pendingApprovalsFor(user.id).length;

    container.innerHTML = `
      <div class="ac-page-header">
        <div><h1>${iconChip("home", 20, 34)} Dashboard</h1><p class="ac-page-subtitle">Signed in as <strong>${user.name}</strong> (${user.role}). This is a self-contained demo — all data lives in your browser (localStorage).</p></div>
      </div>
      <div class="ac-kpi-grid">
        <div class="ac-kpi-tile" data-route="#/workorder"><div class="ac-kpi-tile__label">Open Work Orders</div><div class="ac-kpi-tile__value">${woOpen}</div></div>
        <div class="ac-kpi-tile" data-route="#/calibration"><div class="ac-kpi-tile__label">Open Calibrations</div><div class="ac-kpi-tile__value">${calOpen}</div></div>
        <div class="ac-kpi-tile" data-route="#/approvals"><div class="ac-kpi-tile__label">Pending My Approval</div><div class="ac-kpi-tile__value">${pendingForMe}</div>${pendingForMe ? `<div class="ac-kpi-tile__delta ac-kpi-tile__delta--down">${icon("alerttriangle",13)} Needs review</div>` : ""}</div>
        <div class="ac-kpi-tile" data-route="#/reports/equipment-history"><div class="ac-kpi-tile__label">Due Within 14 Days</div><div class="ac-kpi-tile__value">${dueSoon.length}</div></div>
      </div>

      ${dueSoon.length ? `
        <div class="ac-card" style="margin-bottom:var(--ac-space-5);">
          <h3 style="margin-bottom:10px;">Upcoming Preventive Maintenance</h3>
          ${dueSoon.map((d) => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--ac-border);font-size:13.5px;"><span>${d.equipment.name}</span><span class="ac-muted-text">Due ${fmtDate(d.nextScheduledDate)}</span></div>`).join("")}
        </div>` : ""}

      <div class="ac-launchpad-section">
        <div class="ac-launchpad-section__title">Quick Links</div>
        <div class="ac-tile-grid">
          ${TILES.map((t) => `
            <a class="ac-tile" href="${t.route}">
              <div class="ac-tile__icon" style="background:${iconColor(t.icon)}22;color:${iconColor(t.icon)};">${icon(t.icon, 19)}</div>
              <div><div class="ac-tile__title">${t.label}</div>${t.collection ? `<div class="ac-tile__count">${Store.all(t.collection).length}</div>` : ""}</div>
            </a>`).join("")}
        </div>
      </div>
    `;
    container.querySelectorAll(".ac-kpi-tile[data-route]").forEach((el) => el.addEventListener("click", () => { location.hash = el.dataset.route; }));
  };
})();
