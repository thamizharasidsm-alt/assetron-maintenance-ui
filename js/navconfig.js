const NAV_GROUPS = [
  {
    label: "Home",
    items: [
      { route: "#/", label: "Dashboard", icon: "home" },
      { route: "#/approvals", label: "Pending Approvals", icon: "checkcircle" },
    ],
  },
  {
    label: "Organization",
    items: [
      { route: "#/org/company-codes", label: "Company Codes", icon: "briefcase" },
      { route: "#/org/plants", label: "Plants", icon: "factory" },
      { route: "#/org/locations", label: "Locations", icon: "mappin" },
    ],
  },
  {
    label: "Masters",
    items: [
      { route: "#/masters/equipment", label: "Equipment Master", icon: "grid" },
      { route: "#/masters/spares", label: "Spare Master", icon: "package" },
      { route: "#/masters/spare-categories", label: "Spare Category Master", icon: "layers" },
      { route: "#/masters/checklist", label: "Checklist Master", icon: "clipboardcheck" },
      { route: "#/masters/checklist-mapping", label: "Checklist Mapping", icon: "gitcompare" },
      { route: "#/masters/employees", label: "Employee Master", icon: "users" },
      { route: "#/masters/approvers", label: "User Approver Master", icon: "usercheck" },
    ],
  },
  {
    label: "Transactions",
    items: [
      { route: "#/workorder", label: "Work Order", icon: "settings" },
      { route: "#/calibration", label: "Calibration", icon: "scan" },
    ],
  },
  {
    label: "Reports",
    items: [
      { route: "#/reports/equipment-history", label: "Equipment History", icon: "clock" },
      { route: "#/reports/range", label: "Range Report", icon: "barchart" },
    ],
  },
];

window.NAV_GROUPS = NAV_GROUPS;
