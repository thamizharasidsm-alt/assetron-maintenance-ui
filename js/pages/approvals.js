(function () {
  function eqName(id) { return Store.find("equipment", id)?.name || "—"; }
  function empName(id) { return Store.find("employees", id)?.name || "—"; }
  function freqLabel(v) { return FREQUENCY_OPTIONS.find((f) => f.value === v)?.label || v || "—"; }

  window.Pages["/approvals"] = function (container) {
    render();
    function render() {
      const user = Store.currentUser();
      const items = Store.pendingApprovalsFor(user.id);
      container.innerHTML = `
        <div class="ac-page-header">
          <div><h1>${icon("checkcircle", 22)} Pending Approvals</h1><p class="ac-page-subtitle">Work Orders and Calibrations routed to ${user.name} for approval. Switch user (top-right avatar) to preview as a different approver.</p></div>
        </div>
        <div class="ac-table-wrap"><table class="ac-table">
          <thead><tr><th>Doc No.</th><th>Module</th><th>Equipment</th><th>Performed By</th><th>Performed Date</th><th>Frequency</th><th>Submitted</th><th></th></tr></thead>
          <tbody>${items.length === 0 ? `<tr><td colspan="8"><div class="ac-empty-inline">Nothing waiting on you right now.</div></td></tr>` : items.map((i) => `
            <tr>
              <td><strong>${i.docNumber}</strong></td>
              <td>${badge(i.module, "info")}</td>
              <td>${eqName(i.equipmentId)}</td>
              <td>${empName(i.performedById)}</td>
              <td>${fmtDate(i.performedDate)}</td>
              <td>${freqLabel(i.frequency)}</td>
              <td>${fmtDateTime(i.updatedAt)}</td>
              <td style="white-space:nowrap;">
                <button class="ac-btn ac-btn--sm ac-btn--ghost" data-pdf="${i.moduleKey}:${i.id}">${icon("filetext", 14)} Preview PDF</button>
                <button class="ac-btn ac-btn--sm ac-btn--primary" data-approve="${i.moduleKey}:${i.id}">${icon("checkcircle", 14)} Approve</button>
                <button class="ac-btn ac-btn--sm ac-btn--destructive" data-reject="${i.moduleKey}:${i.id}">${icon("x", 14)} Reject</button>
              </td>
            </tr>`).join("")}</tbody>
        </table></div>`;

      container.querySelectorAll("[data-pdf]").forEach((b) => b.addEventListener("click", () => {
        const [moduleKey, id] = b.dataset.pdf.split(":");
        previewPdf(moduleKey, id);
      }));
      container.querySelectorAll("[data-approve]").forEach((b) => b.addEventListener("click", () => {
        const [moduleKey, id] = b.dataset.approve.split(":");
        if (!confirm("Approve this record?")) return;
        Store.update(moduleKey, id, { status: "Approved", approvalRemarks: "Approved.", approvedDate: todayStr(), updatedAt: new Date().toISOString() });
        toast("Approved — the creator will see the updated status on their record.", "success");
        render();
        window.renderShellTopbar?.();
      }));
      container.querySelectorAll("[data-reject]").forEach((b) => b.addEventListener("click", () => {
        const [moduleKey, id] = b.dataset.reject.split(":");
        showRejectForm(moduleKey, id);
      }));
    }

    function showRejectForm(moduleKey, id) {
      const overlay = openModal("Reject with Reason", `
        <form id="reject-form">
          <div class="ac-field ac-field--full"><label>Reason for Rejection *</label><textarea class="ac-textarea" name="reason" required placeholder="Explain what needs to be corrected…"></textarea></div>
          <div class="ac-modal__footer"><button type="button" class="ac-btn ac-btn--secondary" data-close-modal>Cancel</button><button type="submit" class="ac-btn ac-btn--destructive">${icon("x", 16)} Reject</button></div>
        </form>`);
      overlay.querySelector("[data-close-modal]").addEventListener("click", closeModal);
      overlay.querySelector("#reject-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const reason = new FormData(e.target).get("reason");
        Store.update(moduleKey, id, { status: "Rejected", approvalRemarks: reason, approvedDate: null, updatedAt: new Date().toISOString() });
        closeModal();
        toast("Rejected — the creator can edit and resubmit.", "info");
        render();
        window.renderShellTopbar?.();
      });
    }

    function previewPdf(moduleKey, id) {
      const r = Store.find(moduleKey, id);
      const equipment = Store.find("equipment", r.equipmentId);
      const moduleLabel = moduleKey === "workOrders" ? "Work Order" : "Calibration";
      const html = `
        <h1>${moduleLabel} — ${r.docNumber}</h1>
        <div class="meta">Generated ${fmtDateTime(new Date().toISOString())}</div>
        <div class="kv">
          <div><span class="l">Equipment</span>${equipment?.name || "—"} (${equipment?.code || "—"})</div>
          <div><span class="l">Linked Asset</span>${equipment?.assetRef || "—"}</div>
          <div><span class="l">Performed By</span>${empName(r.performedById)}</div>
          <div><span class="l">Performed Date</span>${fmtDate(r.performedDate)}</div>
          <div><span class="l">Submitted</span>${fmtDateTime(r.updatedAt)}</div>
          <div><span class="l">Frequency</span>${freqLabel(r.frequency)}</div>
          <div><span class="l">Next Scheduled</span>${fmtDate(r.nextScheduledDate)}</div>
          <div><span class="l">Status</span><span class="badge">${r.status === "PendingApproval" ? "Pending" : r.status}</span></div>
          <div><span class="l">Approver</span>${empName(r.approverId)}</div>
        </div>
        <h2>Spares Used</h2>
        <table><thead><tr><th>Spare</th><th>Qty</th><th>Remarks</th></tr></thead><tbody>
          ${r.spares.length === 0 ? `<tr><td colspan="3">No spares used</td></tr>` : r.spares.map((s) => `<tr><td>${Store.find("spares", s.spareId)?.name || "—"}</td><td>${s.qty}</td><td>${s.remarks || "—"}</td></tr>`).join("")}
        </tbody></table>
        <h2>Checklist</h2>
        <table><thead><tr><th>Item</th><th>Performed</th><th>Remarks</th></tr></thead><tbody>
          ${r.checklist.length === 0 ? `<tr><td colspan="3">No checklist recorded</td></tr>` : r.checklist.map((c) => `<tr><td>${Store.find("checklistItems", c.checklistItemId)?.text || "—"}</td><td>${c.performed || "—"}</td><td>${c.remarks || "—"}</td></tr>`).join("")}
        </tbody></table>
        <h2>Q&amp;A (5Why1How)</h2>
        <table><thead><tr><th>Question</th><th>Answer</th></tr></thead><tbody>
          ${r.qna.filter((q) => q.question || q.answer).map((q) => `<tr><td>${q.question}</td><td>${q.answer || "—"}</td></tr>`).join("") || `<tr><td colspan="2">No entries</td></tr>`}
        </tbody></table>
        ${r.status !== "PendingApproval" ? `<h2>Approval</h2><div class="kv"><div><span class="l">Decision</span>${r.status}</div><div><span class="l">Date</span>${fmtDate(r.approvedDate)}</div></div><p>${r.approvalRemarks || ""}</p>` : ""}
      `;
      printDocument(`${r.docNumber} — ${moduleLabel}`, html);
    }
  };
})();
