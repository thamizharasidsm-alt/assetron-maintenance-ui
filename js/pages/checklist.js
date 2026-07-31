(function () {
  const fields = [
    { key: "text", label: "Checklist Item", required: true },
    { key: "category", label: "Category" },
  ];

  window.Pages["/masters/checklist"] = function (container) {
    container.innerHTML = renderCrudPage({
      title: "Checklist Master", icon: "clipboardcheck", collection: "checklistItems", fields,
      subtitle: "Reusable checklist items. Shared by both Work Order and Calibration — link them to specific equipment on the Checklist Mapping screen.",
    });
    wireCrudPage(container, { collection: "checklistItems", fields, title: "Checklist Item" });
  };

  // ---- Checklist <-> Equipment mapping (many-to-many) ----
  window.Pages["/masters/checklist-mapping"] = function (container) {
    let selectedEquipmentId = Store.all("equipment")[0]?.id || "";
    render();

    function render() {
      const equipmentOptions = Store.all("equipment").map((e) => `<option value="${e.id}" ${e.id === selectedEquipmentId ? "selected" : ""}>${e.name}</option>`).join("");
      const allItems = Store.all("checklistItems");
      const mappedIds = new Set(Store.all("checklistMapping").filter((m) => m.equipmentId === selectedEquipmentId).map((m) => m.checklistItemId));

      container.innerHTML = `
        <div class="ac-page-header">
          <div><h1>${icon("gitcompare", 22)} Checklist Mapping</h1><p class="ac-page-subtitle">Link Checklist Master items to specific equipment. These are what load automatically on the Work Order / Calibration checklist tab.</p></div>
        </div>
        <div class="ac-card" style="max-width:640px;margin-bottom:var(--ac-space-4);">
          <div class="ac-field"><label>Equipment</label><select class="ac-select" id="eq-select">${equipmentOptions}</select></div>
        </div>
        <div class="ac-card">
          <h3 style="margin-bottom:var(--ac-space-3);">Checklist Items</h3>
          ${allItems.length === 0 ? `<div class="ac-empty-inline">No checklist items yet — add some in Checklist Master first.</div>` : `
            <div id="item-list">
              ${allItems.map((i) => `
                <label class="ac-field--checkbox" style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--ac-border);">
                  <input type="checkbox" data-item="${i.id}" ${mappedIds.has(i.id) ? "checked" : ""}/>
                  <span>${i.text}</span>
                  ${i.category ? badge(i.category, "neutral") : ""}
                </label>`).join("")}
            </div>
            <div class="ac-modal__footer" style="border-top:1px solid var(--ac-border);margin-top:var(--ac-space-4);padding-top:var(--ac-space-4);">
              <button class="ac-btn ac-btn--primary" id="btn-save-mapping">${icon("save", 16)} Save Mapping</button>
            </div>`}
        </div>`;

      container.querySelector("#eq-select").addEventListener("change", (e) => { selectedEquipmentId = e.target.value; render(); });
      container.querySelector("#btn-save-mapping")?.addEventListener("click", () => {
        const db = Store.load();
        db.checklistMapping = db.checklistMapping.filter((m) => m.equipmentId !== selectedEquipmentId);
        container.querySelectorAll("[data-item]:checked").forEach((el) => {
          db.checklistMapping.push({ id: uid("cm"), equipmentId: selectedEquipmentId, checklistItemId: el.dataset.item });
        });
        Store.save();
        toast("Checklist mapping saved", "success");
        render();
      });
    }
  };
})();
