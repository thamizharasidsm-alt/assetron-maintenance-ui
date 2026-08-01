(function () {
  const roleOptions = [
    { value: "Admin", label: "Admin" },
    { value: "Technician", label: "Technician" },
    { value: "Approver", label: "Approver" },
  ];

  function departmentOptions() { return Store.all("departments").map((d) => ({ value: d.id, label: d.name })); }
  function plantOptions() { return Store.all("plants").map((p) => ({ value: p.id, label: p.name })); }
  function locationOptions() { return Store.all("locations").filter((l) => l.level === "Room").map((l) => ({ value: l.id, label: Store.locationPath(l.id).join(" › ") })); }

  function fields() {
    return [
      { key: "empCode", label: "Employee Code", required: true },
      { key: "name", label: "Full Name", required: true },
      { key: "email", label: "Email", required: true },
      { key: "role", label: "Role", type: "select", options: roleOptions, required: true },
      { key: "departmentId", label: "Department", type: "select", options: departmentOptions() },
      { key: "plantId", label: "Plant", type: "select", options: plantOptions() },
      { key: "locationId", label: "Location (Room/Cubicle)", type: "select", options: locationOptions() },
      { key: "claims", label: "Claims", type: "tags" },
    ];
  }

  const columns = [
    { key: "empCode", label: "Employee Code" }, { key: "name", label: "Full Name" }, { key: "email", label: "Email" },
    { key: "role", label: "Role" }, { key: "departmentId", label: "Department" }, { key: "plantId", label: "Plant" },
    { key: "locationId", label: "Location" }, { key: "claims", label: "Claims" },
  ];

  window.Pages["/masters/employees"] = function (container) {
    const f = fields();
    container.innerHTML = renderCrudPage({
      title: "Employee Master", icon: "users", collection: "employees", fields: f, columns,
      subtitle: "Employees who create or approve maintenance transactions, with Role, Department, Plant/Location, and Claims (permissions).",
    });
    container.querySelectorAll("tbody tr[data-id]").forEach((tr) => {
      const emp = Store.find("employees", tr.dataset.id);
      const cells = tr.querySelectorAll("td");
      cells[4].textContent = Store.find("departments", emp.departmentId)?.name || "—";
      cells[5].textContent = Store.find("plants", emp.plantId)?.name || "—";
      cells[6].textContent = emp.locationId ? Store.locationPath(emp.locationId).join(" › ") : "—";
    });
    wireCrudPage(container, { collection: "employees", fields: f, title: "Employee" });
  };
})();
