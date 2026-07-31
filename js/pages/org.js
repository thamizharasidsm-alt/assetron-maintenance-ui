(function () {
  window.Pages["/org/company-codes"] = function (container) {
    const fields = [
      { key: "code", label: "Company Code", required: true },
      { key: "name", label: "Name", required: true },
      { key: "city", label: "City" },
      { key: "country", label: "Country" },
    ];
    container.innerHTML = renderCrudPage({ title: "Company Codes", subtitle: "Legal entities that own the equipment being maintained.", collection: "companyCodes", fields, icon: "briefcase" });
    wireCrudPage(container, { collection: "companyCodes", fields, title: "Company Code" });
  };

  window.Pages["/org/plants"] = function (container) {
    const ccOptions = Store.all("companyCodes").map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` }));
    const fields = [
      { key: "code", label: "Plant Code", required: true },
      { key: "name", label: "Plant Name", required: true },
      { key: "companyCodeId", label: "Company Code", type: "select", options: ccOptions, required: true },
    ];
    const columns = [{ key: "code", label: "Plant Code" }, { key: "name", label: "Name" }, { key: "companyCodeId", label: "Company Code" }];
    container.innerHTML = renderCrudPage({ title: "Plants", subtitle: "Physical operating sites within a company code.", collection: "plants", fields, columns, icon: "factory" });
    wireCrudPage(container, { collection: "plants", fields, title: "Plant" });
  };

  // ---- Locations: 4-level hierarchy (Site -> Building -> Floor -> Room/Cubicle) ----
  window.Pages["/org/locations"] = function (container) {
    render();
    function render() {
      const locations = Store.all("locations");
      const roots = locations.filter((l) => !l.parentId);
      container.innerHTML = `
        <div class="ac-page-header">
          <div>
            <h1>${icon("mappin", 22)} Locations <span class="ac-badge ac-badge--info" style="margin-left:8px;">4-Level Hierarchy</span></h1>
            <p class="ac-page-subtitle">Site → Building → Floor → Room/Cubicle. Equipment Master links to Room-level locations.</p>
          </div>
          <button class="ac-btn ac-btn--primary" id="btn-add-loc">${icon("plus", 16)} Add Location</button>
        </div>
        <div class="ac-card">
          <div id="loc-tree"></div>
        </div>`;
      const tree = container.querySelector("#loc-tree");
      tree.innerHTML = roots.map((r) => renderNode(r, 0)).join("");

      container.querySelector("#btn-add-loc").addEventListener("click", () => showLocForm());
      tree.querySelectorAll("[data-edit-loc]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); showLocForm(Store.find("locations", b.dataset.editLoc)); }));
      tree.querySelectorAll("[data-delete-loc]").forEach((b) => b.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm("Delete this location? Child locations will be orphaned.")) { Store.remove("locations", b.dataset.deleteLoc); toast("Location deleted", "success"); render(); }
      }));
    }

    function renderNode(node, depth) {
      const children = Store.all("locations").filter((l) => l.parentId === node.id);
      const levelIcon = { Site: "mappin", Building: "building", Floor: "layers", Room: "grid" }[node.level] || "mappin";
      return `
        <div style="margin-left:${depth * 26}px;padding:8px 10px;border-radius:8px;display:flex;align-items:center;gap:10px;" onmouseover="this.style.background='var(--ac-muted)'" onmouseout="this.style.background=''">
          ${icon(levelIcon, 16)}
          <span style="font-weight:600;">${node.name}</span>
          <span class="ac-muted-text">(${node.code})</span>
          ${badge(node.level, "neutral")}
          <span style="margin-left:auto;display:flex;gap:4px;">
            <button class="ac-icon-btn" data-edit-loc="${node.id}">${icon("edit", 14)}</button>
            <button class="ac-icon-btn ac-icon-btn--danger" data-delete-loc="${node.id}">${icon("trash", 14)}</button>
          </span>
        </div>
        ${children.map((c) => renderNode(c, depth + 1)).join("")}`;
    }

    function showLocForm(record) {
      const parentOptions = Store.all("locations").map((l) => ({ value: l.id, label: `${l.level}: ${l.name}` }));
      const fields = [
        { key: "code", label: "Code", required: true },
        { key: "name", label: "Name", required: true },
        { key: "level", label: "Level", type: "select", required: true, options: [
          { value: "Site", label: "Site" }, { value: "Building", label: "Building" }, { value: "Floor", label: "Floor" }, { value: "Room", label: "Room / Cubicle" },
        ] },
        { key: "parentId", label: "Parent Location", type: "select", options: parentOptions },
      ];
      const overlay = openModal(record ? "Edit Location" : "New Location", `
        <form id="loc-form"><div class="ac-form-grid">${fieldFormHtml(fields, record || {})}</div>
        <div class="ac-modal__footer"><button type="button" class="ac-btn ac-btn--secondary" data-close-modal>Cancel</button><button type="submit" class="ac-btn ac-btn--primary">${icon("save",16)} Save</button></div></form>`);
      overlay.querySelector("[data-close-modal]").addEventListener("click", closeModal);
      overlay.querySelector("#loc-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const data = readForm(e.target, fields);
        if (record) Store.update("locations", record.id, data); else Store.insert("locations", data);
        closeModal(); toast("Location saved", "success"); render();
      });
    }
  };
})();
