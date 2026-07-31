(function () {
  const categoryFields = [
    { key: "code", label: "Category Code", required: true },
    { key: "name", label: "Category Name", required: true },
  ];

  window.Pages["/masters/spare-categories"] = function (container) {
    container.innerHTML = renderCrudPage({
      title: "Spare Category Master", icon: "layers", collection: "spareCategories", fields: categoryFields,
      subtitle: "Categories linked to Spare Master — used to filter usage on the Range Report.",
    });
    wireCrudPage(container, { collection: "spareCategories", fields: categoryFields, title: "Spare Category" });
  };

  function fields() {
    return [
      { key: "code", label: "Spare Code", required: true },
      { key: "name", label: "Spare Name", required: true },
      { key: "uom", label: "Unit of Measure", required: true },
      { key: "categoryId", label: "Category", type: "select", options: Store.all("spareCategories").map((c) => ({ value: c.id, label: c.name })), required: true },
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
        subtitle: "Generic spare parts — not tied to a single equipment, can be consumed against any Work Order or Calibration. Category comes from the Spare Category Master.",
      });
      container.querySelectorAll("tbody tr[data-id]").forEach((tr) => {
        const sp = Store.find("spares", tr.dataset.id);
        const cells = tr.querySelectorAll("td");
        cells[3].textContent = Store.find("spareCategories", sp.categoryId)?.name || "—";
      });
      wireCrudPage(container, { collection: "spares", fields: f, title: "Spare" });
    }
  };
})();
