(function () {
  function groupOptions() { return Store.all("equipmentGroups").map((g) => ({ value: g.id, label: g.name })); }
  function parentOptions(excludeId) {
    return Store.all("equipment").filter((e) => e.id !== excludeId).map((e) => ({ value: e.id, label: e.name }));
  }
  function freqOptions() { return FREQUENCY_OPTIONS.map((f) => ({ value: f.value, label: f.label })); }
  function companyCodeOptions() { return Store.all("companyCodes").map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` })); }
  function plantOptions() { return Store.all("plants").map((p) => ({ value: p.id, label: p.name })); }
  function locationOptions() { return Store.all("locations").filter((l) => l.level === "Room").map((l) => ({ value: l.id, label: Store.locationPath(l.id).join(" › ") })); }

  function fields() {
    return [
      { key: "code", label: "Equipment Code", required: true },
      { key: "name", label: "Equipment Name", required: true },
      { key: "groupId", label: "Grouping Key", type: "select", options: groupOptions(), required: true },
      { key: "parentEquipmentId", label: "Parent Equipment (leave blank if top-level)", type: "select", options: parentOptions() },
      { key: "assetRef", label: "Linked Asset Reference" },
      { key: "companyCodeId", label: "Company Code", type: "select", options: companyCodeOptions(), required: true },
      { key: "plantId", label: "Plant", type: "select", options: plantOptions() },
      { key: "locationId", label: "Location (Room/Cubicle)", type: "select", options: locationOptions() },
      { key: "frequencyDefault", label: "Default PM Frequency", type: "select", options: freqOptions(), required: true },
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
        subtitle: "Physical equipment tracked for maintenance — grouped by Grouping Key, linked to a Company Code / Plant / Location, and can have Sub-Equipment (e.g. Compressor under an AC unit).",
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
      wireCrudPage(container, { collection: "equipment", fields: f, title: "Equipment" });
    }
  };
})();
