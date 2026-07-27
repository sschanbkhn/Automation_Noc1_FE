import React from "react";
import BadCellDashboard from "./SOC006CELL";

// Wrapper de R012Tabs import 1 ten ro rang "CellXau" thay vi ten cu "SOC006CELL"/"BadCellDashboard"
// tu module goc S006-CELL - giu nguyen SOC006CELL.tsx ben trong (khong doi ten) de de doi chieu voi
// module goc sau nay neu can
const CellXau: React.FC = () => <BadCellDashboard />;

export default CellXau;
