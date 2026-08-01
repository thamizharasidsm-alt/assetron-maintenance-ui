(function () {
  function eqName(id) { return Store.find("equipment", id)?.name || "—"; }
  function empName(id) { return Store.find("employees", id)?.name || "—"; }
  function deptName(performedById) { return Store.find("departments", Store.find("employees", performedById)?.departmentId)?.name || "—"; }
  function freqLabel(v) { return FREQUENCY_OPTIONS.find((f) => f.value === v)?.label || v || "—"; }

  function exportCsv(filename, rows, headers) {
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  // ---- Equipment History ----
  window.Pages["/reports/equipment-history"] = function (container) {
    let selectedEquipmentId = Store.all("equipment")[0]?.id || "";
    render();
    function render() {
      const equipmentOptions = Store.all("equipment").map((e) => `<option value="${e.id}" ${e.id === selectedEquipmentId ? "selected" : ""}>${e.name} (${e.code})</option>`).join("");
      const wo = Store.all("workOrders").filter((r) => r.equipmentId === selectedEquipmentId).map((r) => ({ ...r, module: "Work Order" }));
      const cal = Store.all("calibrations").filter((r) => r.equipmentId === selectedEquipmentId).map((r) => ({ ...r, module: "Calibration" }));
      const rows = [...wo, ...cal].sort((a, b) => (b.performedDate || "").localeCompare(a.performedDate || ""));

      container.innerHTML = `
        <div class="ac-page-header"><div><h1>${iconChip("clock", 20, 34)} Equipment History</h1><p class="ac-page-subtitle">All Work Order and Calibration transactions recorded against a selected equipment.</p></div></div>
        <div class="ac-card" style="max-width:520px;margin-bottom:var(--ac-space-4);">
          <div class="ac-field"><label>Equipment</label><select class="ac-select" id="eq-select">${equipmentOptions}</select></div>
        </div>
        <div class="ac-table-wrap"><table class="ac-table">
          <thead><tr><th>Doc No.</th><th>Module</th><th>Performed Date</th><th>Performed By</th><th>Frequency</th><th>Next Scheduled</th><th>Status</th></tr></thead>
          <tbody>${rows.length === 0 ? `<tr><td colspan="7"><div class="ac-empty-inline">No history for this equipment yet.</div></td></tr>` : rows.map((r) => `
            <tr><td><strong>${r.docNumber}</strong></td><td>${badge(r.module, "info")}</td><td>${fmtDate(r.performedDate)}</td><td>${empName(r.performedById)}</td><td>${freqLabel(r.frequency)}</td><td>${fmtDate(r.nextScheduledDate)}</td><td>${badge(r.status === "PendingApproval" ? "Pending" : r.status)}</td></tr>`).join("")}</tbody>
        </table></div>`;
      container.querySelector("#eq-select").addEventListener("change", (e) => { selectedEquipmentId = e.target.value; render(); });
    }
  };

  // ---- Range Report ----
  window.Pages["/reports/range"] = function (container) {
    let from = todayStr(-90), to = todayStr(), modules = { workOrders: true, calibrations: true }, categoryId = "", departmentId = "";
    render();
    function render() {
      const rows = buildRows();
      const categoryOptions = Store.all("spareCategories").map((c) => `<option value="${c.id}" ${c.id === categoryId ? "selected" : ""}>${c.name}</option>`).join("");
      const departmentOptions = Store.all("departments").map((d) => `<option value="${d.id}" ${d.id === departmentId ? "selected" : ""}>${d.name}</option>`).join("");
      container.innerHTML = `
        <div class="ac-page-header"><div><h1>${iconChip("barchart", 20, 34)} Range Report</h1><p class="ac-page-subtitle">Transactions performed within a date range, across Work Order and/or Calibration. Optionally filter to transactions that used a spare from a given category or belong to a department.</p></div>
          <button class="ac-btn ac-btn--secondary" id="btn-export">${icon("download", 16)} Export CSV</button></div>
        <div class="ac-filterbar">
          <div class="ac-filterbar__field"><label>From</label><input class="ac-input" type="date" id="f-from" value="${from}"/></div>
          <div class="ac-filterbar__field"><label>To</label><input class="ac-input" type="date" id="f-to" value="${to}"/></div>
          <div class="ac-filterbar__field"><label>Modules</label>
            <div style="display:flex;gap:14px;align-items:center;height:40px;">
              <label style="display:flex;align-items:center;gap:6px;font-weight:500;font-size:13.5px;"><input type="checkbox" id="f-mod-wo" ${modules.workOrders ? "checked" : ""}/> Work Order</label>
              <label style="display:flex;align-items:center;gap:6px;font-weight:500;font-size:13.5px;"><input type="checkbox" id="f-mod-cal" ${modules.calibrations ? "checked" : ""}/> Calibration</label>
            </div>
          </div>
          <div class="ac-filterbar__field"><label>Spare Category</label><select class="ac-select" id="f-category"><option value="">All categories</option>${categoryOptions}</select></div>
          <div class="ac-filterbar__field"><label>Department</label><select class="ac-select" id="f-department"><option value="">All departments</option>${departmentOptions}</select></div>
          <button class="ac-btn ac-btn--primary" id="btn-apply">${icon("search", 16)} Apply</button>
        </div>
        <div class="ac-table-wrap"><table class="ac-table">
          <thead><tr><th>Doc No.</th><th>Module</th><th>Equipment</th><th>Performed Date</th><th>Performed By</th><th>Department</th><th>Status</th></tr></thead>
          <tbody>${rows.length === 0 ? `<tr><td colspan="7"><div class="ac-empty-inline">No transactions in this range.</div></td></tr>` : rows.map((r) => `
            <tr><td><strong>${r.docNumber}</strong></td><td>${badge(r.module, "info")}</td><td>${eqName(r.equipmentId)}</td><td>${fmtDate(r.performedDate)}</td><td>${empName(r.performedById)}</td><td>${deptName(r.performedById)}</td><td>${badge(r.status === "PendingApproval" ? "Pending" : r.status)}</td></tr>`).join("")}</tbody>
        </table></div>`;

      container.querySelector("#btn-apply").addEventListener("click", () => {
        from = container.querySelector("#f-from").value;
        to = container.querySelector("#f-to").value;
        modules = { workOrders: container.querySelector("#f-mod-wo").checked, calibrations: container.querySelector("#f-mod-cal").checked };
        categoryId = container.querySelector("#f-category").value;
        departmentId = container.querySelector("#f-department").value;
        render();
      });
      container.querySelector("#btn-export").addEventListener("click", () => {
        exportCsv("range-report.csv", rows.map((r) => [r.docNumber, r.module, eqName(r.equipmentId), r.performedDate, empName(r.performedById), deptName(r.performedById), r.status]), ["Doc No", "Module", "Equipment", "Performed Date", "Performed By", "Department", "Status"]);
      });
    }

    function buildRows() {
      const rows = [];
      if (modules.workOrders) Store.all("workOrders").forEach((r) => rows.push({ ...r, module: "Work Order" }));
      if (modules.calibrations) Store.all("calibrations").forEach((r) => rows.push({ ...r, module: "Calibration" }));
      return rows.filter((r) => (!from || r.performedDate >= from) && (!to || r.performedDate <= to))
        .filter((r) => !categoryId || r.spares.some((s) => Store.find("spares", s.spareId)?.categoryId === categoryId))
        .filter((r) => !departmentId || Store.find("employees", r.performedById)?.departmentId === departmentId)
        .sort((a, b) => (b.performedDate || "").localeCompare(a.performedDate || ""));
    }
  };
})();
