// ============================================================
// Shared UI helpers: formatting, toast, modal, generic CRUD table.
// ============================================================

function money(value) {
  const n = Number(value || 0);
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDateTime(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const BADGE_TONE = {
  Active: "success", Completed: "success", Matched: "success", Found: "success", Approved: "success",
  Confirmed: "success", Received: "success", Success: "success", Mapped: "success", Sent: "success",
  Pending: "warning", "In Review": "warning", "In Transit": "warning", Requested: "warning", Overdue: "warning",
  "Partially Mapped": "warning", "Not Connected": "warning",
  Missing: "destructive", Rejected: "destructive", Failed: "destructive", Retired: "destructive", "Not Mapped": "destructive",
  Draft: "neutral", Closed: "neutral", Inactive: "neutral", "Not Mapped2": "neutral",
};
function badge(text, toneOverride) {
  const tone = toneOverride || BADGE_TONE[text] || "info";
  return `<span class="ac-badge ac-badge--${tone}">${text}</span>`;
}

// ---- Toast ----
function toast(message, tone = "info") {
  let host = document.getElementById("ac-toast-host");
  if (!host) {
    host = document.createElement("div");
    host.id = "ac-toast-host";
    host.className = "ac-toast-host";
    document.body.appendChild(host);
  }
  const cssTone = tone === "destructive" ? "error" : tone;
  const el = document.createElement("div");
  el.className = `ac-toast ac-toast--${cssTone}`;
  el.innerHTML = `${icon(tone === "success" ? "checkcircle" : tone === "destructive" ? "alerttriangle" : "info", 16)}<span>${message}</span>`;
  host.appendChild(el);
  setTimeout(() => { el.classList.add("ac-toast--out"); setTimeout(() => el.remove(), 220); }, 2600);
}

// ---- Modal ----
function openModal(title, bodyHtml, { size = "" } = {}) {
  closeModal();
  const overlay = document.createElement("div");
  overlay.className = "ac-modal-backdrop";
  overlay.id = "ac-modal-overlay";
  overlay.innerHTML = `
    <div class="ac-modal ${size ? "ac-modal--" + size : ""}">
      <div class="ac-modal__header">
        <h3>${title}</h3>
        <button class="ac-icon-btn" data-close-modal>${icon("x", 18)}</button>
      </div>
      <div class="ac-modal__body">${bodyHtml}</div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
  overlay.querySelector("[data-close-modal]").addEventListener("click", closeModal);
  return overlay;
}
function closeModal() {
  const existing = document.getElementById("ac-modal-overlay");
  if (existing) existing.remove();
}

// ---- Generic field-config-driven CRUD page ----
// fields: [{ key, label, type: 'text'|'number'|'select'|'date'|'checkbox', options?: [{value,label}], required? }]
function renderCrudPage({ title, subtitle, collection, fields, columns, icon: pageIcon = "list", excel = true }) {
  const rows = Store.all(collection);
  const cols = columns || fields.map((f) => ({ key: f.key, label: f.label }));
  return `
    <div class="ac-page-header">
      <div>
        <h1>${icon(pageIcon, 22)} ${title}</h1>
        ${subtitle ? `<p class="ac-page-subtitle">${subtitle}</p>` : ""}
      </div>
      <div class="ac-page-header__actions">
        ${excel ? `
          <button class="ac-btn ac-btn--secondary" id="btn-dl-template">${icon("download", 16)} Download Template</button>
          <button class="ac-btn ac-btn--secondary" id="btn-upload-csv">${icon("upload", 16)} Upload Excel</button>
          <input type="file" id="csv-file-input" accept=".csv" style="display:none;"/>
        ` : ""}
        <button class="ac-btn ac-btn--primary" id="btn-add-row">${icon("plus", 16)} Add New</button>
      </div>
    </div>
    <div class="ac-card">
      <div class="ac-table-wrap">
        <table class="ac-table">
          <thead><tr>${cols.map((c) => `<th>${c.label}</th>`).join("")}<th class="ac-table__actions-col">Actions</th></tr></thead>
          <tbody>
            ${rows.length === 0 ? `<tr><td colspan="${cols.length + 1}"><div class="ac-empty-inline">No records yet — click Add New.</div></td></tr>` : ""}
            ${rows.map((r) => `<tr data-id="${r.id}">${cols.map((c) => `<td>${renderCellValue(r, c, fields)}</td>`).join("")}
              <td class="ac-table__actions">
                <button class="ac-icon-btn" data-edit="${r.id}" title="Edit">${icon("edit", 15)}</button>
                <button class="ac-icon-btn ac-icon-btn--danger" data-delete="${r.id}" title="Delete">${icon("trash", 15)}</button>
              </td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>`;
}

function renderCellValue(row, col, fields) {
  const f = fields.find((x) => x.key === col.key);
  let v = row[col.key];
  if (f && f.type === "select" && f.options) {
    const opt = f.options.find((o) => o.value === v);
    v = opt ? opt.label : v;
  }
  if (f && f.type === "checkbox") return v ? badge("Yes", "success") : badge("No", "neutral");
  if (f && f.type === "tags") return Array.isArray(v) && v.length ? v.join(", ") : "—";
  if (v === undefined || v === null || v === "") return "—";
  return v;
}

function fieldFormHtml(fields, record = {}) {
  return fields.map((f) => {
    const val = record[f.key] ?? "";
    if (f.type === "select") {
      return `<div class="ac-field"><label>${f.label}${f.required ? " *" : ""}</label>
        <select class="ac-select" name="${f.key}" ${f.required ? "required" : ""}>
          <option value="">Select…</option>
          ${f.options.map((o) => `<option value="${o.value}" ${o.value === val ? "selected" : ""}>${o.label}</option>`).join("")}
        </select></div>`;
    }
    if (f.type === "checkbox") {
      return `<div class="ac-field ac-field--checkbox"><label><input type="checkbox" name="${f.key}" ${val ? "checked" : ""}/> ${f.label}</label></div>`;
    }
    if (f.type === "textarea") {
      return `<div class="ac-field ac-field--full"><label>${f.label}${f.required ? " *" : ""}</label><textarea class="ac-textarea" name="${f.key}" ${f.required ? "required" : ""}>${val}</textarea></div>`;
    }
    if (f.type === "tags") {
      const joined = Array.isArray(val) ? val.join(", ") : val;
      return `<div class="ac-field ac-field--full"><label>${f.label}${f.required ? " *" : ""}</label>
        <input class="ac-input" name="${f.key}" value="${joined}" placeholder="Comma-separated" ${f.required ? "required" : ""}/>
        <span class="ac-field__help">Comma-separated values</span></div>`;
    }
    return `<div class="ac-field"><label>${f.label}${f.required ? " *" : ""}</label>
      <input class="ac-input" type="${f.type || "text"}" name="${f.key}" value="${val}" ${f.required ? "required" : ""}/></div>`;
  }).join("");
}

function readForm(form, fields) {
  const data = {};
  fields.forEach((f) => {
    const el = form.elements[f.key];
    if (!el) return;
    if (f.type === "checkbox") data[f.key] = el.checked;
    else if (f.type === "number") data[f.key] = el.value === "" ? null : Number(el.value);
    else if (f.type === "tags") data[f.key] = el.value.split(",").map((s) => s.trim()).filter(Boolean);
    else data[f.key] = el.value;
  });
  return data;
}

function wireCrudPage(container, { collection, fields, title }) {
  container.querySelector("#btn-add-row")?.addEventListener("click", () => {
    showCrudForm({ collection, fields, title: `New ${title}` });
  });
  container.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const rec = Store.find(collection, btn.dataset.edit);
      showCrudForm({ collection, fields, title: `Edit ${title}`, record: rec });
    });
  });
  container.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (confirm("Delete this record? This cannot be undone.")) {
        Store.remove(collection, btn.dataset.delete);
        toast("Record deleted", "success");
        renderRoute();
      }
    });
  });
  container.querySelector("#btn-dl-template")?.addEventListener("click", () => {
    downloadCsvTemplate(fields, `${collection}-template.csv`);
  });
  container.querySelector("#btn-upload-csv")?.addEventListener("click", () => {
    container.querySelector("#csv-file-input").click();
  });
  container.querySelector("#csv-file-input")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    uploadCsvFile(file, fields, collection, (added, skipped) => {
      toast(`Imported ${added} record(s)${skipped ? `, skipped ${skipped}` : ""}`, added ? "success" : "destructive");
      renderRoute();
    });
    e.target.value = "";
  });
}

// ---- CSV template download / upload (Excel-compatible, no external library) ----
function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsvTemplate(fields, filename) {
  const headers = fields.map((f) => f.label);
  const sample = fields.map((f) => {
    if (f.type === "select") return f.options?.[0]?.label || "";
    if (f.type === "number") return "0";
    if (f.type === "checkbox") return "No";
    if (f.type === "date") return todayStr();
    return "";
  });
  const csv = [headers.map(csvEscape).join(","), sample.map(csvEscape).join(",")].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ""; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field); field = "";
        if (row.some((x) => x !== "")) rows.push(row);
        row = [];
      } else field += c;
    }
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function uploadCsvFile(file, fields, collection, callback) {
  const reader = new FileReader();
  reader.onload = () => {
    const rows = parseCsv(String(reader.result));
    if (rows.length < 2) { callback(0, 0); return; }
    const headers = rows[0].map((h) => h.trim());
    let added = 0, skipped = 0;
    for (let r = 1; r < rows.length; r++) {
      const cells = rows[r];
      const record = {};
      fields.forEach((f) => {
        const idx = headers.findIndex((h) => h.toLowerCase() === f.label.toLowerCase());
        if (idx === -1) return;
        let val = (cells[idx] ?? "").trim();
        if (f.type === "select" && f.options) {
          const opt = f.options.find((o) => o.label.toLowerCase() === val.toLowerCase() || o.value.toLowerCase() === val.toLowerCase());
          val = opt ? opt.value : val;
        } else if (f.type === "number") {
          val = val === "" ? null : Number(val);
        } else if (f.type === "checkbox") {
          val = /^(yes|true|1)$/i.test(val);
        }
        record[f.key] = val;
      });
      const missingRequired = fields.some((f) => f.required && (record[f.key] === undefined || record[f.key] === "" || record[f.key] === null));
      if (missingRequired) { skipped++; continue; }
      Store.insert(collection, record);
      added++;
    }
    callback(added, skipped);
  };
  reader.readAsText(file);
}

// ---- Print / PDF preview (uses the browser's native print-to-PDF, no library) ----
function printDocument(title, bodyHtml) {
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) { toast("Pop-up blocked — allow pop-ups to preview as PDF.", "destructive"); return; }
  win.document.write(`<!doctype html><html><head><title>${title}</title>
    <meta charset="utf-8"/>
    <style>
      body { font-family: -apple-system, 'Segoe UI', Arial, sans-serif; color: #0F172A; padding: 32px; max-width: 860px; margin: 0 auto; }
      h1 { font-size: 20px; margin-bottom: 4px; }
      h2 { font-size: 15px; margin: 24px 0 8px; border-bottom: 2px solid #2563EB; padding-bottom: 4px; }
      .meta { color: #5B6B85; font-size: 13px; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 13px; }
      th, td { border: 1px solid #E4ECFC; padding: 6px 10px; text-align: left; }
      th { background: #F1F5FD; font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em; }
      .kv { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 24px; margin-bottom: 12px; font-size: 13px; }
      .kv div span.l { display:block; font-size: 10.5px; text-transform: uppercase; color: #5B6B85; font-weight:700; }
      .badge { display:inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; background:#EFF6FF; color:#2563EB; }
      .print-btn { position: fixed; top: 12px; right: 12px; }
      @media print { .print-btn { display: none; } }
    </style></head>
    <body>
      <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
      ${bodyHtml}
    </body></html>`);
  win.document.close();
  win.focus();
}

function showCrudForm({ collection, fields, title, record }) {
  const overlay = openModal(title, `
    <form id="crud-form">
      <div class="ac-form-grid">${fieldFormHtml(fields, record || {})}</div>
      <div class="ac-modal__footer">
        <button type="button" class="ac-btn ac-btn--secondary" data-close-modal>Cancel</button>
        <button type="submit" class="ac-btn ac-btn--primary">${icon("save", 16)} Save</button>
      </div>
    </form>`);
  overlay.querySelector("[data-close-modal]").addEventListener("click", closeModal);
  overlay.querySelector("#crud-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = readForm(e.target, fields);
    if (record && record.id) Store.update(collection, record.id, data);
    else Store.insert(collection, data);
    closeModal();
    toast("Saved successfully", "success");
    renderRoute();
  });
}

window.money = money;
window.fmtDate = fmtDate;
window.fmtDateTime = fmtDateTime;
window.badge = badge;
window.toast = toast;
window.openModal = openModal;
window.closeModal = closeModal;
window.renderCrudPage = renderCrudPage;
window.wireCrudPage = wireCrudPage;
window.showCrudForm = showCrudForm;
window.fieldFormHtml = fieldFormHtml;
window.readForm = readForm;
window.downloadCsvTemplate = downloadCsvTemplate;
window.uploadCsvFile = uploadCsvFile;
window.printDocument = printDocument;
