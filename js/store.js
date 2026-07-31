// ============================================================
// Client-only data layer for the Maintenance System. Everything
// lives in localStorage — no server, no database. Fully
// independent of the AMS Asset Management demo (own seed data).
// ============================================================
const DB_KEY = "assetron_maint_db_v3";

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

function today(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const FREQUENCY_OPTIONS = [
  { value: "Monthly", label: "Monthly", days: 30 },
  { value: "BiMonthly", label: "Bi-Monthly", days: 60 },
  { value: "Quarterly", label: "Quarterly", days: 91 },
  { value: "HalfYearly", label: "Half-Yearly", days: 182 },
  { value: "Yearly", label: "Yearly", days: 365 },
  { value: "Custom", label: "Custom (days)", days: null },
];

function computeNextDate(performedDate, frequency, customDays) {
  const base = new Date(performedDate);
  const freq = FREQUENCY_OPTIONS.find((f) => f.value === frequency);
  const days = frequency === "Custom" ? Number(customDays || 0) : (freq ? freq.days : 0);
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

function seedData() {
  const companyCodes = [
    { id: "cc1", code: "1000", name: "Nexora Technologies Pvt Ltd", city: "Bengaluru", country: "IN" },
  ];

  const plants = [
    { id: "pl1", code: "1100", name: "Head Office Plant", companyCodeId: "cc1" },
  ];

  // 4-level location hierarchy: Site -> Building -> Floor -> Room/Cubicle (same structure as AMS).
  const locations = [
    { id: "loc-site-ho", code: "SITE-HO", name: "Head Office (Bengaluru)", level: "Site", parentId: null, plantId: "pl1" },
    { id: "loc-bldg-a", code: "BLDG-A", name: "Tower A", level: "Building", parentId: "loc-site-ho" },
    { id: "loc-floor-a3", code: "A-F3", name: "3rd Floor", level: "Floor", parentId: "loc-bldg-a" },
    { id: "loc-room-a302", code: "A302", name: "Room 302 - Server Room", level: "Room", parentId: "loc-floor-a3" },
    { id: "loc-site-terrace", code: "SITE-TR", name: "Terrace & Utility Yard", level: "Site", parentId: null, plantId: "pl1" },
    { id: "loc-terrace-dg", code: "TR-DG", name: "DG Yard", level: "Building", parentId: "loc-site-terrace" },
    { id: "loc-terrace-dg-room", code: "TR-DG-01", name: "DG Enclosure", level: "Room", parentId: "loc-terrace-dg" },
    { id: "loc-terrace-cool", code: "TR-CT", name: "Cooling Tower Deck", level: "Building", parentId: "loc-site-terrace" },
    { id: "loc-terrace-cool-room", code: "TR-CT-01", name: "Pump Room", level: "Room", parentId: "loc-terrace-cool" },
    { id: "loc-site-store", code: "SITE-ST", name: "Instrumentation Store", level: "Site", parentId: null, plantId: "pl1" },
    { id: "loc-store-room", code: "ST-01", name: "Calibration Store Room", level: "Room", parentId: "loc-site-store" },
  ];

  const equipmentGroups = [
    { id: "grp-hvac", code: "HVAC", name: "HVAC" },
    { id: "grp-elec", code: "ELEC", name: "Electrical" },
    { id: "grp-mech", code: "MECH", name: "Mechanical" },
    { id: "grp-plumb", code: "PLUMB", name: "Plumbing" },
    { id: "grp-instr", code: "INSTR", name: "Instrumentation" },
  ];

  const equipment = [
    { id: "eq-ac1", code: "EQ-AC-001", name: "Split AC Unit - 1.5 Ton", groupId: "grp-hvac", parentEquipmentId: null, assetRef: "AST-300010", companyCodeId: "cc1", plantId: "pl1", locationId: "loc-room-a302", frequencyDefault: "Quarterly", status: "Active" },
    { id: "eq-ac1-comp", code: "EQ-AC-001-C", name: "AC Compressor", groupId: "grp-hvac", parentEquipmentId: "eq-ac1", assetRef: "-", companyCodeId: "cc1", plantId: "pl1", locationId: "loc-room-a302", frequencyDefault: "Yearly", status: "Active" },
    { id: "eq-ac1-cond", code: "EQ-AC-001-CC", name: "AC Condenser Coil", groupId: "grp-hvac", parentEquipmentId: "eq-ac1", assetRef: "-", companyCodeId: "cc1", plantId: "pl1", locationId: "loc-room-a302", frequencyDefault: "HalfYearly", status: "Active" },
    { id: "eq-dg1", code: "EQ-DG-001", name: "Diesel Generator 125 KVA", groupId: "grp-elec", parentEquipmentId: null, assetRef: "AST-400010", companyCodeId: "cc1", plantId: "pl1", locationId: "loc-terrace-dg-room", frequencyDefault: "Monthly", status: "Active" },
    { id: "eq-pump1", code: "EQ-PUMP-001", name: "Centrifugal Pump - Cooling Tower", groupId: "grp-mech", parentEquipmentId: null, assetRef: "AST-500001", companyCodeId: "cc1", plantId: "pl1", locationId: "loc-terrace-cool-room", frequencyDefault: "Quarterly", status: "Active" },
    { id: "eq-gauge1", code: "EQ-INST-001", name: "Digital Pressure Gauge", groupId: "grp-instr", parentEquipmentId: null, assetRef: "AST-600002", companyCodeId: "cc1", plantId: "pl1", locationId: "loc-store-room", frequencyDefault: "Yearly", status: "Active" },
  ];

  const spareCategories = [
    { id: "spc-hvac", code: "HVAC", name: "HVAC" },
    { id: "spc-elec", code: "ELEC", name: "Electrical" },
    { id: "spc-mech", code: "MECH", name: "Mechanical" },
    { id: "spc-gen", code: "GEN", name: "General" },
  ];

  const spares = [
    { id: "sp1", code: "SP-0001", name: "Refrigerant Gas R32 (1kg)", uom: "CYL", categoryId: "spc-hvac" },
    { id: "sp2", code: "SP-0002", name: "Air Filter - Standard", uom: "EA", categoryId: "spc-hvac" },
    { id: "sp3", code: "SP-0003", name: "Capacitor 35uF", uom: "EA", categoryId: "spc-elec" },
    { id: "sp4", code: "SP-0004", name: "Fan Belt", uom: "EA", categoryId: "spc-gen" },
    { id: "sp5", code: "SP-0005", name: "Engine Oil 15W40 (5L)", uom: "CAN", categoryId: "spc-elec" },
    { id: "sp6", code: "SP-0006", name: "Diesel Filter", uom: "EA", categoryId: "spc-elec" },
    { id: "sp7", code: "SP-0007", name: "Pump Seal Kit", uom: "SET", categoryId: "spc-mech" },
    { id: "sp8", code: "SP-0008", name: "Grease Cartridge", uom: "EA", categoryId: "spc-gen" },
  ];

  const checklistItems = [
    { id: "cl1", text: "Check refrigerant level", category: "HVAC" },
    { id: "cl2", text: "Clean / replace air filter", category: "HVAC" },
    { id: "cl3", text: "Inspect condenser coil for dust", category: "HVAC" },
    { id: "cl4", text: "Check thermostat accuracy", category: "HVAC" },
    { id: "cl5", text: "Inspect electrical connections", category: "General" },
    { id: "cl6", text: "Check engine oil level", category: "Electrical" },
    { id: "cl7", text: "Inspect battery terminals", category: "Electrical" },
    { id: "cl8", text: "Test auto-start function", category: "Electrical" },
    { id: "cl9", text: "Check pump seal for leakage", category: "Mechanical" },
    { id: "cl10", text: "Verify vibration levels", category: "Mechanical" },
    { id: "cl11", text: "Verify reading against reference standard", category: "Instrumentation" },
    { id: "cl12", text: "Check calibration certificate validity", category: "Instrumentation" },
  ];

  const checklistMapping = [
    { id: "cm1", equipmentId: "eq-ac1", checklistItemId: "cl1" },
    { id: "cm2", equipmentId: "eq-ac1", checklistItemId: "cl2" },
    { id: "cm3", equipmentId: "eq-ac1", checklistItemId: "cl3" },
    { id: "cm4", equipmentId: "eq-ac1", checklistItemId: "cl4" },
    { id: "cm5", equipmentId: "eq-ac1", checklistItemId: "cl5" },
    { id: "cm6", equipmentId: "eq-dg1", checklistItemId: "cl6" },
    { id: "cm7", equipmentId: "eq-dg1", checklistItemId: "cl7" },
    { id: "cm8", equipmentId: "eq-dg1", checklistItemId: "cl8" },
    { id: "cm9", equipmentId: "eq-dg1", checklistItemId: "cl5" },
    { id: "cm10", equipmentId: "eq-pump1", checklistItemId: "cl9" },
    { id: "cm11", equipmentId: "eq-pump1", checklistItemId: "cl10" },
    { id: "cm12", equipmentId: "eq-gauge1", checklistItemId: "cl11" },
    { id: "cm13", equipmentId: "eq-gauge1", checklistItemId: "cl12" },
  ];

  const employees = [
    { id: "emp-admin", empCode: "EMP-0001", name: "System Administrator", email: "admin@assetron.demo", role: "Admin", claims: ["ManageMasters", "ApproveAll"] },
    { id: "emp-arjun", empCode: "EMP-0002", name: "Arjun Mehta", email: "arjun.mehta@assetron.demo", role: "Technician", claims: ["CreateWorkOrder", "CreateCalibration"] },
    { id: "emp-priya", empCode: "EMP-0003", name: "Priya Sharma", email: "priya.sharma@assetron.demo", role: "Technician", claims: ["CreateWorkOrder", "CreateCalibration"] },
    { id: "emp-kavita", empCode: "EMP-0004", name: "Kavita Rao", email: "kavita.rao@assetron.demo", role: "Approver", claims: ["Approve"] },
  ];

  const approverMatrix = [
    { id: "am1", forEmployeeId: "emp-arjun", approverEmployeeId: "emp-kavita", groupId: null },
    { id: "am2", forEmployeeId: "emp-priya", approverEmployeeId: "emp-kavita", groupId: null },
  ];

  const qnaTemplate = () => ([
    { question: "Why 1 —", answer: "" },
    { question: "Why 2 —", answer: "" },
    { question: "Why 3 —", answer: "" },
    { question: "Why 4 —", answer: "" },
    { question: "Why 5 —", answer: "" },
    { question: "How (corrective action) —", answer: "" },
  ]);

  const workOrders = [
    {
      id: "wo1", docNumber: "WO-2026-000001", equipmentId: "eq-ac1", performedDate: "2026-04-15", performedById: "emp-arjun",
      spares: [{ spareId: "sp2", qty: 1, remarks: "Filter was clogged with dust" }],
      frequency: "Quarterly", customDays: null, nextScheduledDate: "2026-07-15",
      checklist: [
        { checklistItemId: "cl1", performed: "Yes", remarks: "Within range" },
        { checklistItemId: "cl2", performed: "Yes", remarks: "Replaced" },
        { checklistItemId: "cl3", performed: "Yes", remarks: "Cleaned" },
        { checklistItemId: "cl4", performed: "Yes", remarks: "±0.5°C accurate" },
        { checklistItemId: "cl5", performed: "Yes", remarks: "Tight, no corrosion" },
      ],
      qna: [
        { question: "Why 1 — Was cooling insufficient before this visit?", answer: "Yes, mild reduction in cooling reported by occupants." },
        { question: "Why 2 — Was the filter dirty?", answer: "Yes, heavily clogged with dust." },
        { question: "Why 3 — Was airflow restricted?", answer: "Yes, restricted airflow due to filter." },
        { question: "Why 4 — Root cause?", answer: "Filter cleaning interval too long for dusty server room environment." },
        { question: "Why 5 — Any secondary cause?", answer: "None found." },
        { question: "How (corrective action) —", answer: "Reduce filter cleaning interval to monthly visual check; formal PM remains quarterly." },
      ],
      status: "Approved", approverId: "emp-kavita", approvalRemarks: "Looks good, approved.", approvedDate: "2026-04-16",
      createdAt: "2026-04-15T11:00:00", updatedAt: "2026-04-16T09:00:00",
    },
    {
      id: "wo2", docNumber: "WO-2026-000002", equipmentId: "eq-dg1", performedDate: "2026-07-20", performedById: "emp-priya",
      spares: [{ spareId: "sp5", qty: 1, remarks: "Topped up engine oil" }, { spareId: "sp6", qty: 1, remarks: "Replaced diesel filter" }],
      frequency: "Monthly", customDays: null, nextScheduledDate: "2026-08-19",
      checklist: [
        { checklistItemId: "cl6", performed: "Yes", remarks: "Topped up to full mark" },
        { checklistItemId: "cl7", performed: "Yes", remarks: "Clean, tightened" },
        { checklistItemId: "cl8", performed: "No", remarks: "Auto-start relay delayed by 3s — flagged for repair" },
        { checklistItemId: "cl5", performed: "Yes", remarks: "OK" },
      ],
      qna: qnaTemplate(),
      status: "PendingApproval", approverId: "emp-kavita", approvalRemarks: "", approvedDate: null,
      createdAt: "2026-07-20T14:30:00", updatedAt: "2026-07-20T14:30:00",
    },
  ];

  const calibrations = [
    {
      id: "cal1", docNumber: "CAL-2026-000001", equipmentId: "eq-gauge1", performedDate: "2026-03-01", performedById: "emp-arjun",
      spares: [],
      frequency: "Yearly", customDays: null, nextScheduledDate: "2027-03-01",
      checklist: [
        { checklistItemId: "cl11", performed: "Yes", remarks: "Within ±1% tolerance" },
        { checklistItemId: "cl12", performed: "Yes", remarks: "Certificate valid till 2027-03-01" },
      ],
      qna: qnaTemplate(),
      status: "Approved", approverId: "emp-kavita", approvalRemarks: "Certificate verified, approved.", approvedDate: "2026-03-02",
      createdAt: "2026-03-01T10:00:00", updatedAt: "2026-03-02T09:00:00",
    },
  ];

  return {
    companyCodes, plants, locations,
    equipmentGroups, equipment, spareCategories, spares, checklistItems, checklistMapping,
    employees, approverMatrix, workOrders, calibrations,
    meta: { seededAt: new Date().toISOString(), currentUserId: "emp-arjun" },
  };
}

const Store = {
  _db: null,

  load() {
    if (this._db) return this._db;
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      try { this._db = JSON.parse(raw); return this._db; } catch { /* fall through to reseed */ }
    }
    this._db = seedData();
    this.save();
    return this._db;
  },

  save() {
    localStorage.setItem(DB_KEY, JSON.stringify(this._db));
  },

  reset() {
    this._db = seedData();
    this.save();
    return this._db;
  },

  all(collection) {
    return this.load()[collection] || [];
  },

  find(collection, id) {
    return this.all(collection).find((x) => x.id === id) || null;
  },

  insert(collection, record) {
    const db = this.load();
    if (!db[collection]) db[collection] = [];
    if (!record.id) record.id = uid(collection);
    db[collection].push(record);
    this.save();
    return record;
  },

  update(collection, id, patch) {
    const db = this.load();
    const idx = (db[collection] || []).findIndex((x) => x.id === id);
    if (idx === -1) return null;
    db[collection][idx] = { ...db[collection][idx], ...patch };
    this.save();
    return db[collection][idx];
  },

  remove(collection, id) {
    const db = this.load();
    db[collection] = (db[collection] || []).filter((x) => x.id !== id);
    this.save();
  },

  nextDocNumber(prefix) {
    // Derived from existing records (not a standalone counter) so seeded
    // demo documents and freshly-created ones never collide on number.
    const collectionMap = { WO: "workOrders", CAL: "calibrations" };
    const collection = collectionMap[prefix];
    const year = new Date().getFullYear();
    const existing = collection ? this.all(collection) : [];
    const prefixStr = `${prefix}-${year}-`;
    const nums = existing.map((r) => r.docNumber).filter((d) => d && d.startsWith(prefixStr)).map((d) => Number(d.slice(prefixStr.length)) || 0);
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    return `${prefixStr}${String(next).padStart(6, "0")}`;
  },

  currentUser() {
    return this.find("employees", this.load().meta.currentUserId) || this.all("employees")[0];
  },

  setCurrentUser(employeeId) {
    const db = this.load();
    db.meta.currentUserId = employeeId;
    this.save();
  },

  // ---- lookups ----
  locationPath(locationId) {
    const parts = [];
    let cur = this.find("locations", locationId);
    while (cur) {
      parts.unshift(cur.name);
      cur = cur.parentId ? this.find("locations", cur.parentId) : null;
    }
    return parts;
  },

  lastPerformed(collection, equipmentId, excludeId) {
    const rows = this.all(collection).filter((r) => r.equipmentId === equipmentId && r.id !== excludeId && r.status !== "Rejected");
    if (rows.length === 0) return null;
    return [...rows].sort((a, b) => (b.performedDate || "").localeCompare(a.performedDate || ""))[0];
  },

  approverFor(employeeId, groupId) {
    const rows = this.all("approverMatrix").filter((m) => m.forEmployeeId === employeeId);
    const specific = rows.find((m) => m.groupId === groupId);
    return specific || rows.find((m) => !m.groupId) || null;
  },

  pendingApprovalsFor(employeeId) {
    const wo = this.all("workOrders").filter((w) => w.status === "PendingApproval" && w.approverId === employeeId).map((w) => ({ ...w, module: "Work Order", moduleKey: "workOrders" }));
    const cal = this.all("calibrations").filter((w) => w.status === "PendingApproval" && w.approverId === employeeId).map((w) => ({ ...w, module: "Calibration", moduleKey: "calibrations" }));
    return [...wo, ...cal];
  },

  checklistFor(equipmentId) {
    return this.all("checklistMapping").filter((m) => m.equipmentId === equipmentId).map((m) => this.find("checklistItems", m.checklistItemId)).filter(Boolean);
  },

  equipmentPath(equipmentId) {
    const parts = [];
    let cur = this.find("equipment", equipmentId);
    while (cur) {
      parts.unshift(cur.name);
      cur = cur.parentEquipmentId ? this.find("equipment", cur.parentEquipmentId) : null;
    }
    return parts;
  },
};

window.Store = Store;
window.uid = uid;
window.todayStr = today;
window.FREQUENCY_OPTIONS = FREQUENCY_OPTIONS;
window.computeNextDate = computeNextDate;
