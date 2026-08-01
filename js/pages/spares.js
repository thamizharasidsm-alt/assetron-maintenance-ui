(function () {
  function fields() {
    return [
      { key: "code", label: "Spare Code", required: true },
      { key: "name", label: "Spare Name", required: true },
      { key: "uom", label: "Unit of Measure", required: true },
      { key: "categoryId", label: "Category", type: "select", options: Store.all("departments").map((d) => ({ value: d.id, label: d.name })), required: true },
    ];
  }
  const columns = [
    { key: "code", label: "Code" }, { key: "name", label: "Name" }, { key: "uom", label: "UOM" }, { key: "categoryId", label: "Category" },
  ];

  window.Pages["/masters/spares"] = function (container) {
    render();
    function render() {
      const f = fields();
      container.innerHTML = renderCrudPage({
        title: "Spare Master", icon: "package", collection: "spares", fields: f, columns,
        subtitle: "Generic spare parts — not tied to a single equipment, can be consumed against any Work Order or Calibration. Category is sourced from the Department Master.",
      });
      container.querySelectorAll("tbody tr[data-id]").forEach((tr) => {
        const sp = Store.find("spares", tr.dataset.id);
        const cells = tr.querySelectorAll("td");
        cells[3].textContent = Store.find("departments", sp.categoryId)?.name || "—";
      });
      wireCrudPage(container, { collection: "spares", fields: f, title: "Spare" });
    }
  };
})();
