// ============================================================
// Shared builder for Work Order + Calibration — identical workflow,
// different backing collection/table per the spec ("same
// functionality replicated with separate tables").
// ============================================================
function buildTransactionModule({ collection, docPrefix, moduleLabel, basePath, moduleIcon }) {
  function eqName(id) { return Store.find("equipment", id)?.name || "—"; }
  function empName(id) { return Store.find("employees", id)?.name || "—"; }
  function freqLabel(v) { return FREQUENCY_OPTIONS.find((f) => f.value === v)?.label || v || "—"; }

  // ---- List ----
  window.Pages[basePath] = function (container) {
    const rows = [...Store.all(collection)].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    container.innerHTML = `
      <div class="ac-page-header">
        <div><h1>${icon(moduleIcon, 22)} ${moduleLabel}</h1><p class="ac-page-subtitle">${rows.length} transaction(s) recorded.</p></div>
        <a class="ac-btn ac-btn--primary" href="#${basePath}/new">${icon("plus", 16)} New ${moduleLabel}</a>
      </div>
      <div class="ac-table-wrap"><table class="ac-table">
        <thead><tr><th>Doc No.</th><th>Equipment</th><th>Performed Date</th><th>Performed By</th><th>Frequency</th><th>Next Scheduled</th><th>Status</th><th></th></tr></thead>
        <tbody>${rows.length === 0 ? `<tr><td colspan="8"><div class="ac-empty-inline">No records yet.</div></td></tr>` : rows.map((r) => `
          <tr data-open="${r.id}">
            <td><strong>${r.docNumber}</strong></td>
            <td>${eqName(r.equipmentId)}</td>
            <td>${fmtDate(r.performedDate)}</td>
            <td>${empName(r.performedById)}</td>
            <td>${freqLabel(r.frequency)}</td>
            <td>${fmtDate(r.nextScheduledDate)}</td>
            <td>${badge(r.status === "PendingApproval" ? "Pending" : r.status)}</td>
            <td><button class="ac-btn ac-btn--sm ac-btn--ghost" data-view="${r.id}">${icon("eye", 14)} Open</button></td>
          </tr>`).join("")}</tbody>
      </table></div>`;
    container.querySelectorAll("[data-open], [data-view]").forEach((el) => {
      el.addEventListener("click", (e) => { e.stopPropagation(); location.hash = `#${basePath}/${el.dataset.open || el.dataset.view}`; });
    });
  };

  // ---- Create / View / Edit ----
  window.Pages[`${basePath}/new`] = function (container) { renderForm(container, null); };
  window.Pages[`${basePath}/:id`] = function (container, params) { renderForm(container, params.id); };

  function renderForm(container, id) {
    const record = id ? Store.find(collection, id) : null;
    const currentUser = Store.currentUser();
    const isNew = !record;
    const isOwner = record ? record.performedById === currentUser.id : true;
    const editable = isNew || (isOwner && (record.status === "Draft" || record.status === "Rejected"));

    let sparesRows = record ? record.spares.map((s) => ({ ...s })) : [];
    let qnaRows = record ? record.qna.map((q) => ({ ...q })) : [
      { question: "Why 1 —", answer: "" }, { question: "Why 2 —", answer: "" }, { question: "Why 3 —", answer: "" },
      { question: "Why 4 —", answer: "" }, { question: "Why 5 —", answer: "" }, { question: "How (corrective action) —", answer: "" },
    ];
    let selectedEquipmentId = record ? record.equipmentId : "";
    let activeTab = "checklist";

    draw();

    function draw() {
      const equipmentOptions = Store.all("equipment").map((e) => `<option value="${e.id}" ${e.id === selectedEquipmentId ? "selected" : ""}>${e.name} (${e.code})</option>`).join("");
      const readonlyAttr = editable ? "" : "disabled";

      container.innerHTML = `
        <div class="ac-breadcrumb"><a href="#${basePath}">${moduleLabel}</a> ${icon("chevronright", 12)} <span>${isNew ? "New" : record.docNumber}</span></div>
        <div class="ac-page-header">
          <div><h1>${icon(moduleIcon, 22)} ${isNew ? `New ${moduleLabel}` : record.docNumber}</h1>
          ${record ? `<p class="ac-page-subtitle">${badge(record.status === "PendingApproval" ? "Pending" : record.status)} ${!editable ? "· read-only" : ""}</p>` : ""}</div>
        </div>
        ${record && record.status === "Rejected" ? `<div class="ac-card" style="border-color:var(--ac-destructive);margin-bottom:var(--ac-space-4);"><strong>${icon("alerttriangle", 15)} Rejected by ${empName(record.approverId)}:</strong> ${record.approvalRemarks || "No reason given."}${isOwner ? " — edit and resubmit below." : ""}</div>` : ""}

        <div class="ac-card" style="margin-bottom:var(--ac-space-4);">
          <div class="ac-form-grid">
            <div class="ac-field"><label>Equipment *</label><select class="ac-select" id="f-equipment" ${readonlyAttr} required><option value="">Select…</option>${equipmentOptions}</select></div>
            <div class="ac-field"><label>Performed Date *</label><input class="ac-input" type="date" id="f-date" value="${record?.performedDate || todayStr()}" ${readonlyAttr} required/></div>
            <div class="ac-field"><label>Frequency (for next PM) *</label><select class="ac-select" id="f-freq" ${readonlyAttr} required>
              ${FREQUENCY_OPTIONS.map((f) => `<option value="${f.value}" ${record?.frequency === f.value ? "selected" : ""}>${f.label}</option>`).join("")}
            </select></div>
            <div class="ac-field" id="f-customdays-wrap" style="display:${record?.frequency === "Custom" ? "flex" : "none"};">
              <label>Custom Interval (days)</label><input class="ac-input" type="number" id="f-customdays" min="1" value="${record?.customDays || ""}" ${readonlyAttr}/>
            </div>
          </div>
          <div class="ac-info-box" style="margin-top:var(--ac-space-2);" id="last-performed-box"></div>
          <div class="ac-muted-text" style="margin-top:10px;">Next Scheduled Date: <strong id="next-sched-display">—</strong></div>
        </div>

        <div class="ac-card" style="margin-bottom:var(--ac-space-4);">
          <h3>Spares Used</h3>
          <div id="spares-rows"></div>
          ${editable ? `<button type="button" class="ac-btn ac-btn--secondary ac-btn--sm" id="btn-add-spare" style="margin-top:8px;">${icon("plus", 14)} Add Spare</button>` : ""}
        </div>

        <div class="ac-tabstrip">
          <div class="ac-tab ${activeTab === "checklist" ? "active" : ""}" data-tab="checklist">Checklist</div>
          <div class="ac-tab ${activeTab === "qna" ? "active" : ""}" data-tab="qna">Q&amp;A (5Why1How)</div>
        </div>
        <div class="ac-card" id="checklist-panel" style="display:${activeTab === "checklist" ? "block" : "none"};"></div>
        <div class="ac-card" id="qna-panel" style="display:${activeTab === "qna" ? "block" : "none"};">
          <div id="qna-rows"></div>
          ${editable ? `<button type="button" class="ac-btn ac-btn--secondary ac-btn--sm" id="btn-add-qna" style="margin-top:8px;">${icon("plus", 14)} Add Row</button>` : ""}
        </div>

        ${editable ? `
          <div class="ac-modal__footer" style="border-top:1px solid var(--ac-border);margin-top:var(--ac-space-4);padding-top:var(--ac-space-4);">
            <a class="ac-btn ac-btn--secondary" href="#${basePath}">Cancel</a>
            <button type="button" class="ac-btn ac-btn--secondary" id="btn-save-draft">${icon("save", 16)} Save as Draft</button>
            <button type="button" class="ac-btn ac-btn--primary" id="btn-save-submit">${icon("checkcircle", 16)} Save &amp; Send for Approval</button>
          </div>` : ""}
      `;

      // spares rows
      const sparesHost = container.querySelector("#spares-rows");
      function drawSpares() {
        sparesHost.innerHTML = sparesRows.length === 0 ? `<p class="ac-muted-text">No spares added.</p>` : sparesRows.map((row, idx) => `
          <div class="ac-form-grid" style="grid-template-columns: 2fr 1fr 2fr auto; align-items:end; margin-bottom:8px;" data-spare-row="${idx}">
            <div class="ac-field"><label>Spare</label><select class="ac-select" data-spare-select ${readonlyAttr}><option value="">Select…</option>${Store.all("spares").map((s) => `<option value="${s.id}" ${s.id === row.spareId ? "selected" : ""}>${s.name}</option>`).join("")}</select></div>
            <div class="ac-field"><label>Qty</label><input class="ac-input" type="number" min="1" data-spare-qty value="${row.qty || 1}" ${readonlyAttr}/></div>
            <div class="ac-field"><label>Remarks</label><input class="ac-input" data-spare-remarks value="${row.remarks || ""}" ${readonlyAttr}/></div>
            ${editable ? `<button type="button" class="ac-icon-btn ac-icon-btn--danger" data-remove-spare="${idx}">${icon("trash", 15)}</button>` : `<span></span>`}
          </div>`).join("");
        sparesHost.querySelectorAll("[data-remove-spare]").forEach((b) => b.addEventListener("click", () => { sparesRows.splice(Number(b.dataset.removeSpare), 1); drawSpares(); }));
        // Keep sparesRows in sync with the DOM so a later Add/Remove re-render doesn't drop existing entries.
        sparesHost.querySelectorAll("[data-spare-row]").forEach((rowEl) => {
          const idx = Number(rowEl.dataset.spareRow);
          rowEl.querySelector("[data-spare-select]").addEventListener("change", (e) => { sparesRows[idx].spareId = e.target.value; });
          rowEl.querySelector("[data-spare-qty]").addEventListener("input", (e) => { sparesRows[idx].qty = Number(e.target.value) || 1; });
          rowEl.querySelector("[data-spare-remarks]").addEventListener("input", (e) => { sparesRows[idx].remarks = e.target.value; });
        });
      }
      drawSpares();
      container.querySelector("#btn-add-spare")?.addEventListener("click", () => { sparesRows.push({ spareId: "", qty: 1, remarks: "" }); drawSpares(); });

      // qna rows
      const qnaHost = container.querySelector("#qna-rows");
      function drawQna() {
        qnaHost.innerHTML = qnaRows.map((row, idx) => `
          <div class="ac-qna-row" data-qna-row="${idx}">
            <div class="ac-field"><input class="ac-input" data-qna-q value="${row.question.replace(/"/g, "&quot;")}" placeholder="Question" ${readonlyAttr}/></div>
            <div class="ac-field"><input class="ac-input" data-qna-a value="${row.answer.replace(/"/g, "&quot;")}" placeholder="Answer (free text)" ${readonlyAttr}/></div>
            ${editable ? `<button type="button" class="ac-icon-btn ac-icon-btn--danger" data-remove-qna="${idx}">${icon("trash", 15)}</button>` : `<span></span>`}
          </div>`).join("");
        qnaHost.querySelectorAll("[data-remove-qna]").forEach((b) => b.addEventListener("click", () => { qnaRows.splice(Number(b.dataset.removeQna), 1); drawQna(); }));
        qnaHost.querySelectorAll("[data-qna-row]").forEach((rowEl) => {
          const idx = Number(rowEl.dataset.qnaRow);
          rowEl.querySelector("[data-qna-q]").addEventListener("input", (e) => { qnaRows[idx].question = e.target.value; });
          rowEl.querySelector("[data-qna-a]").addEventListener("input", (e) => { qnaRows[idx].answer = e.target.value; });
        });
      }
      drawQna();
      container.querySelector("#btn-add-qna")?.addEventListener("click", () => { qnaRows.push({ question: "", answer: "" }); drawQna(); });

      // tabs
      container.querySelectorAll("[data-tab]").forEach((t) => t.addEventListener("click", () => {
        activeTab = t.dataset.tab;
        container.querySelectorAll("[data-tab]").forEach((x) => x.classList.toggle("active", x.dataset.tab === activeTab));
        container.querySelector("#checklist-panel").style.display = activeTab === "checklist" ? "block" : "none";
        container.querySelector("#qna-panel").style.display = activeTab === "qna" ? "block" : "none";
      }));

      // equipment change -> last performed + checklist + next-scheduled recompute
      const eqSelect = container.querySelector("#f-equipment");
      eqSelect.addEventListener("change", () => { selectedEquipmentId = eqSelect.value; refreshEquipmentDependent(); });
      refreshEquipmentDependent();

      function refreshEquipmentDependent() {
        const lastBox = container.querySelector("#last-performed-box");
        const last = selectedEquipmentId ? Store.lastPerformed(collection, selectedEquipmentId, record?.id) : null;
        if (selectedEquipmentId) {
          lastBox.style.display = "flex";
          lastBox.innerHTML = last
            ? `<div class="ac-info-box__icon">${icon("clock", 18)}</div><div><div class="ac-info-box__title">Last performed ${fmtDate(last.performedDate)} by ${empName(last.performedById)}</div><div class="ac-info-box__meta">${last.docNumber} · ${last.spares.map((s) => Store.find("spares", s.spareId)?.name).filter(Boolean).join(", ") || "No spares recorded"}</div></div>`
            : `<div class="ac-info-box__icon">${icon("info", 18)}</div><div><div class="ac-info-box__title">No prior history</div><div class="ac-info-box__meta">This will be the first recorded ${moduleLabel.toLowerCase()} for this equipment.</div></div>`;
        } else {
          lastBox.style.display = "none";
        }

        const clPanel = container.querySelector("#checklist-panel");
        const items = selectedEquipmentId ? Store.checklistFor(selectedEquipmentId) : [];
        const existingChecklist = record?.checklist || [];
        clPanel.innerHTML = items.length === 0
          ? `<p class="ac-muted-text">${selectedEquipmentId ? "No checklist items mapped to this equipment — set them up in Checklist Mapping." : "Select an equipment to load its checklist."}</p>`
          : items.map((i) => {
            const existing = existingChecklist.find((c) => c.checklistItemId === i.id);
            return `<div class="ac-checklist-row" data-checklist-item="${i.id}">
              <div class="ac-checklist-row__text">${i.text}</div>
              <div class="ac-radio-group">
                <label><input type="radio" name="cl-${i.id}" value="Yes" ${existing?.performed === "Yes" ? "checked" : ""} ${readonlyAttr}/> Yes</label>
                <label><input type="radio" name="cl-${i.id}" value="No" ${existing?.performed === "No" ? "checked" : ""} ${readonlyAttr}/> No</label>
              </div>
              <input class="ac-input" data-checklist-remarks placeholder="Remarks" value="${(existing?.remarks || "").replace(/"/g, "&quot;")}" ${readonlyAttr}/>
            </div>`;
          }).join("");

        updateNextScheduled();
      }

      function updateNextScheduled() {
        const dateEl = container.querySelector("#f-date");
        const freqEl = container.querySelector("#f-freq");
        const customEl = container.querySelector("#f-customdays");
        container.querySelector("#f-customdays-wrap").style.display = freqEl.value === "Custom" ? "flex" : "none";
        const display = container.querySelector("#next-sched-display");
        if (dateEl.value && freqEl.value) {
          display.textContent = fmtDate(computeNextDate(dateEl.value, freqEl.value, customEl.value));
        } else {
          display.textContent = "—";
        }
      }
      container.querySelector("#f-date").addEventListener("change", updateNextScheduled);
      container.querySelector("#f-freq").addEventListener("change", updateNextScheduled);
      container.querySelector("#f-customdays")?.addEventListener("input", updateNextScheduled);

      // save handlers
      container.querySelector("#btn-save-draft")?.addEventListener("click", () => save("Draft"));
      container.querySelector("#btn-save-submit")?.addEventListener("click", () => save("PendingApproval"));

      function save(targetStatus) {
        const eqId = container.querySelector("#f-equipment").value;
        const performedDate = container.querySelector("#f-date").value;
        const frequency = container.querySelector("#f-freq").value;
        const customDays = container.querySelector("#f-customdays")?.value || null;
        if (!eqId || !performedDate || !frequency) { toast("Equipment, Performed Date and Frequency are required", "destructive"); return; }

        const spares = [...sparesHost.querySelectorAll("[data-spare-row]")].map((row) => ({
          spareId: row.querySelector("[data-spare-select]").value,
          qty: Number(row.querySelector("[data-spare-qty]").value) || 1,
          remarks: row.querySelector("[data-spare-remarks]").value,
        })).filter((r) => r.spareId);

        const checklist = [...clPanelItems()].map((i) => {
          const row = container.querySelector(`[data-checklist-item="${i.id}"]`);
          const checked = row.querySelector(`input[name="cl-${i.id}"]:checked`);
          return { checklistItemId: i.id, performed: checked ? checked.value : "", remarks: row.querySelector("[data-checklist-remarks]").value };
        });

        const qna = [...qnaHost.querySelectorAll("[data-qna-row]")].map((row) => ({
          question: row.querySelector("[data-qna-q]").value,
          answer: row.querySelector("[data-qna-a]").value,
        }));

        const equipment = Store.find("equipment", eqId);
        const approverMap = Store.approverFor(currentUser.id, equipment?.groupId);
        const nextScheduledDate = computeNextDate(performedDate, frequency, customDays);
        const nowIso = new Date().toISOString();

        const payload = {
          equipmentId: eqId, performedDate, performedById: record?.performedById || currentUser.id,
          spares, frequency, customDays: frequency === "Custom" ? Number(customDays) : null, nextScheduledDate,
          checklist, qna, status: targetStatus,
          approverId: approverMap ? approverMap.approverEmployeeId : (record?.approverId || null),
          approvalRemarks: targetStatus === "PendingApproval" ? "" : (record?.approvalRemarks || ""),
          approvedDate: targetStatus === "PendingApproval" ? null : (record?.approvedDate || null),
          updatedAt: nowIso,
        };

        if (record) {
          Store.update(collection, record.id, payload);
          toast(targetStatus === "PendingApproval" ? "Resubmitted for approval" : "Saved as draft", "success");
          location.hash = `${basePath}/${record.id}`;
        } else {
          payload.docNumber = Store.nextDocNumber(docPrefix);
          payload.createdAt = nowIso;
          const created = Store.insert(collection, payload);
          toast(targetStatus === "PendingApproval" ? "Sent for approval" : "Saved as draft", "success");
          location.hash = `${basePath}/${created.id}`;
        }
      }

      function clPanelItems() { return selectedEquipmentId ? Store.checklistFor(selectedEquipmentId) : []; }
    }
  }
}

window.buildTransactionModule = buildTransactionModule;
