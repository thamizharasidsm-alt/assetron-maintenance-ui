(function () {
  const roleOptions = [
    { value: "Admin", label: "Admin" },
    { value: "Technician", label: "Technician" },
    { value: "Approver", label: "Approver" },
  ];

  const fields = [
    { key: "empCode", label: "Employee Code", required: true },
    { key: "name", label: "Full Name", required: true },
    { key: "email", label: "Email", required: true },
    { key: "role", label: "Role", type: "select", options: roleOptions, required: true },
    { key: "claims", label: "Claims", type: "tags" },
  ];

  window.Pages["/masters/employees"] = function (container) {
    container.innerHTML = renderCrudPage({
      title: "Employee Master", icon: "users", collection: "employees", fields,
      subtitle: "Employees who create or approve maintenance transactions, with Role and Claims (permissions).",
    });
    wireCrudPage(container, { collection: "employees", fields, title: "Employee" });
  };
})();
