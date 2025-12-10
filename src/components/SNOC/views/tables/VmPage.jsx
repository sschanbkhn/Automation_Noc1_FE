// =============================
// File: VmPage.jsx
// =============================
import React from "react";
import VmSitesReport from "./VmSitesReport"; // cùng thư mục

export function VmPage() {
  // Vì VmPage.jsx và vm_sites_report.html cùng thư mục → dùng './'
  const reportUrl = new URL(
    "./vm_sites_report.html",
    import.meta.url
  ).toString();
  return <VmSitesReport src={reportUrl} />;
}

export default VmPage;
