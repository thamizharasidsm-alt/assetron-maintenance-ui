(function () {
  function groupOptions() { return Store.all("equipmentGroups").map((g) => ({ value: g.id, label: g.name })); }
  function parentOptions(excludeId) {
    return Store.all("equipment").filter((e) => e.id !== excludeId).map((e) => ({ value: e.id, label: e.name }));
  }
  function freqOptions() { return FREQUENCY_OPTIONS.map((f) => ({ value: f.value, label: f.label })); }
  function companyCodeOptions() { return Store.all("companyCodes").map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` })); }
  function plantOptions() { return Store.all("plants").map((p) => ({ value: p.id, label: p.name })); }
  function locationOptions() { return Store.all("locations").filter((l) => l.level === "Room").map((l) => ({ value: l.id, label: Store.locationPath(l.id).join(" › ") })); }

  function fields(excludeId) {
    return [
      { key: "code", label: "Equipment Code", required: true },
      { key: "name", label: "Equipment Name", required: true },
      { key: "groupId", label: "Grouping Key", type: "select", options: groupOptions(), required: true },
      { key: "parentEquipmentId", label: "Parent Equipment (leave blank if top-level)", type: "select", options: parentOptions(excludeId) },
      { key: "assetRef", label: "Linked Asset Reference" },
      { key: "companyCodeId", label: "Company Code", type: "select", options: companyCodeOptions(), required: true },
      { key: "plantId", label: "Plant", type: "select", options: plantOptions() },
      { key: "locationId", label: "Location (Room/Cubicle)", type: "select", options: locationOptions() },
      { key: "frequencyDefault", label: "Default PM Frequency", type: "select", options: freqOptions(), required: true },
      { key: "customDaysDefault", label: "Custom Interval (days)", type: "number" },
      { key: "status", label: "Status", type: "select", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }] },
    ];
  }

  const columns = [
    { key: "code", label: "Code" }, { key: "name", label: "Name" }, { key: "groupId", label: "Group" },
    { key: "parentEquipmentId", label: "Parent" }, { key: "locationId", label: "Location" },
    { key: "frequencyDefault", label: "Default Frequency" }, { key: "status", label: "Status" },
  ];

  window.Pages["/masters/equipment"] = function (container) {
    render();
    function render() {
      const f = fields();
      container.innerHTML = renderCrudPage({
        title: "Equipment Master", icon: "grid", collection: "equipment", fields: f, columns,
        subtitle: "Physical equipment tracked for maintenance — grouped by Grouping Key, linked to a Company Code / Plant / Location, and can have Sub-Equipment (e.g. Compressor under an AC unit). Checklist items for preventive maintenance are managed directly here.",
      });
      // Replace raw ids with friendly labels in the rendered table.
      container.querySelectorAll("tbody tr[data-id]").forEach((tr) => {
        const eq = Store.find("equipment", tr.dataset.id);
        const cells = tr.querySelectorAll("td");
        cells[2].textContent = Store.find("equipmentGroups", eq.groupId)?.name || "—";
        cells[3].textContent = eq.parentEquipmentId ? (Store.find("equipment", eq.parentEquipmentId)?.name || "—") : "—";
        cells[4].textContent = eq.locationId ? Store.locationPath(eq.locationId).join(" › ") : "—";
        cells[5].textContent = FREQUENCY_OPTIONS.find((x) => x.value === eq.frequencyDefault)?.label || eq.frequencyDefault || "—";
      });
      wire();
    }

    function wire() {
      container.querySelector("#btn-add-row")?.addEventListener("click", () => showEquipmentForm());
      container.querySelectorAll("[data-edit]").forEach((btn) => {
        btn.addEventListener("click", () => showEquipmentForm(Store.find("equipment", btn.dataset.edit)));
      });
      container.querySelectorAll("[data-delete]").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (confirm("Delete this equipment? Its checklist items will also be removed. This cannot be undone.")) {
            Store.remove("equipment", btn.dataset.delete);
            const db = Store.load();
            db.checklistItems = db.checklistItems.filter((i) => i.equipmentId !== btn.dataset.delete);
            Store.save();
            toast("Record deleted", "success");
            renderRoute();
          }
        });
      });
      container.querySelector("#btn-dl-template")?.addEventListener("click", () => {
        downloadCsvTemplate(fields(), "equipment-template.csv");
      });
      container.querySelector("#btn-upload-csv")?.addEventListener("click", () => {
        container.querySelector("#csv-file-input").click();
      });
      container.querySelector("#csv-file-input")?.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        uploadCsvFile(file, fields(), "equipment", (added, skipped) => {
          toast(`Imported ${added} record(s)${skipped ? `, skipped ${skipped}` : ""}`, added ? "success" : "destructive");
          renderRoute();
        });
        e.target.value = "";
      });
    }

    function showEquipmentForm(record) {
      const isEdit = !!(record && record.id);
      let checklistRows = isEdit
        ? Store.all("checklistItems").filter((i) => i.equipmentId === record.id).map((i) => ({ ...i }))
        : [];

      const overlay = openModal(isEdit ? "Edit Equipment" : "New Equipment", `
        <form id="equipment-form">
          <div class="ac-form-grid">${fieldFormHtml(fields(record?.id), record || {})}</div>
          <h3 style="margin:var(--ac-space-4) 0 var(--ac-space-2);">Checklist Items</h3>
          <p class="ac-field__help" style="margin-bottom:8px;">Preventive-maintenance checklist for this equipment — loaded automatically on its Work Order / Calibration checklist tab.</p>
          <div id="checklist-rows"></div>
          <button type="button" class="ac-btn ac-btn--secondary ac-btn--sm" id="btn-add-checklist-row" style="margin-top:8px;">${icon("plus", 14)} Add Checklist Item</button>
          <div class="ac-modal__footer" style="margin-top:var(--ac-space-4);">
            <button type="button" class="ac-btn ac-btn--secondary" data-close-modal>Cancel</button>
            <button type="submit" class="ac-btn ac-btn--primary">${icon("save", 16)} ${isEdit ? "Update" : "Create"}</button>
          </div>
        </form>`, { size: "lg" });

      const rowsHost = overlay.querySelector("#checklist-rows");
      function drawChecklistRows() {
        rowsHost.innerHTML = checklistRows.length === 0 ? `<p class="ac-muted-text">No checklist items yet.</p>` : checklistRows.map((row, idx) => `
          <div class="ac-form-grid" style="grid-template-columns: 2fr 1fr auto; align-items:end; margin-bottom:8px;" data-cl-row="${idx}">
            <div class="ac-field"><label>Checklist Item</label><input class="ac-input" data-cl-text value="${(row.text || "").replace(/"/g, "&quot;")}" placeholder="e.g. Check refrigerant level"/></div>
            <div class="ac-field"><label>Category</label><input class="ac-input" data-cl-category value="${(row.category || "").replace(/"/g, "&quot;")}" placeholder="e.g. HVAC"/></div>
            <button type="button" class="ac-icon-btn ac-icon-btn--danger" data-remove-cl="${idx}">${icon("trash", 15)}</button>
          </div>`).join("");
        rowsHost.querySelectorAll("[data-remove-cl]").forEach((b) => b.addEventListener("click", () => { checklistRows.splice(Number(b.dataset.removeCl), 1); drawChecklistRows(); }));
        rowsHost.querySelectorAll("[data-cl-row]").forEach((rowEl) => {
          const idx = Number(rowEl.dataset.clRow);
          rowEl.querySelector("[data-cl-text]").addEventListener("input", (e) => { checklistRows[idx].text = e.target.value; });
          rowEl.querySelector("[data-cl-category]").addEventListener("input", (e) => { checklistRows[idx].category = e.target.value; });
        });
      }
      drawChecklistRows();
      overlay.querySelector("#btn-add-checklist-row").addEventListener("click", () => { checklistRows.push({ text: "", category: "" }); drawChecklistRows(); });

      const form = overlay.querySelector("#equipment-form");
      const freqSelect = form.elements["frequencyDefault"];
      const customDaysWrap = form.elements["customDaysDefault"].closest(".ac-field");
      function toggleCustomDays() { customDaysWrap.style.display = freqSelect.value === "Custom" ? "" : "none"; }
      freqSelect.addEventListener("change", toggleCustomDays);
      toggleCustomDays();

      overlay.querySelector("#equipment-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const data = readForm(e.target, fields(record?.id));
        const equipment = isEdit ? Store.update("equipment", record.id, data) : Store.insert("equipment", data);

        const db = Store.load();
        db.checklistItems = db.checklistItems.filter((i) => i.equipmentId !== equipment.id);
        checklistRows.filter((r) => (r.text || "").trim()).forEach((r) => {
          db.checklistItems.push({ id: r.id || uid("cl"), equipmentId: equipment.id, text: r.text.trim(), category: (r.category || "").trim() });
        });
        Store.save();

        closeModal();
        successAlert(isEdit ? "Updated successfully." : "Created successfully.");
        renderRoute();
      });
    }
  };
})();
