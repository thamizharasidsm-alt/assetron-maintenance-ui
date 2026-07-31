(function () {
  function employeeOptions() { return Store.all("employees").map((e) => ({ value: e.id, label: `${e.name} (${e.role})` })); }
  function groupOptions() { return Store.all("equipmentGroups").map((g) => ({ value: g.id, label: g.name })); }

  function fields() {
    return [
      { key: "forEmployeeId", label: "Employee (Creator)", type: "select", options: employeeOptions(), required: true },
      { key: "approverEmployeeId", label: "Default Approver", type: "select", options: employeeOptions(), required: true },
      { key: "groupId", label: "Restrict to Equipment Group (optional — blank applies to all)", type: "select", options: groupOptions() },
    ];
  }
  const columns = [
    { key: "forEmployeeId", label: "Employee (Creator)" }, { key: "approverEmployeeId", label: "Default Approver" }, { key: "groupId", label: "Equipment Group" },
  ];

  window.Pages["/masters/approvers"] = function (container) {
    render();
    function render() {
      const f = fields();
      container.innerHTML = renderCrudPage({
        title: "User Approver Master", icon: "usercheck", collection: "approverMatrix", fields: f, columns,
        subtitle: "Defines who approves whose Work Orders / Calibrations. Used to auto-route each transaction for approval and notify the right person.",
      });
      container.querySelectorAll("tbody tr[data-id]").forEach((tr) => {
        const m = Store.find("approverMatrix", tr.dataset.id);
        const cells = tr.querySelectorAll("td");
        cells[0].textContent = Store.find("employees", m.forEmployeeId)?.name || "—";
        cells[1].textContent = Store.find("employees", m.approverEmployeeId)?.name || "—";
        cells[2].textContent = m.groupId ? (Store.find("equipmentGroups", m.groupId)?.name || "—") : "All Groups";
      });
      wireCrudPage(container, { collection: "approverMatrix", fields: f, title: "Approver Mapping" });
    }
  };
})();
