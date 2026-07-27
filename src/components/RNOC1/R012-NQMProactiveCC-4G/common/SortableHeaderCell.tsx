import React from "react";
import { Header, flexRender } from "@tanstack/react-table";

// component <th> dung CHUNG cho TAT CA bang co sort trong module R012 (SessionHistoryList, StationSearchGrid,
// AffectedStationsTable, AffectedCellsTable, CrCellsTable, EvaluationDetail, CrResultsByDirection...) - tach
// rieng vi day la CUNG 1 doan JSX/logic (click header de sort + hien mui ten huong sort) lap lai HET SUC
// GIONG NHAU o 7 bang khac nhau, khong phai truong hop nen tu viet lai tung noi. Generic theo <TData, TValue>
// cua TanStack Table nen dung duoc cho MOI kieu du lieu bang, khong rang buoc field cu the nao
export function SortableHeaderCell<TData, TValue>({ header }: { header: Header<TData, TValue> }) {
  const canSort = header.column.getCanSort();
  const sorted = header.column.getIsSorted(); // false | "asc" | "desc"

  return (
    <th
      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
      style={{ cursor: canSort ? "pointer" : "default", userSelect: "none", whiteSpace: "nowrap" }}
    >
      {flexRender(header.column.columnDef.header, header.getContext())}
      {/* mui ten chi huong sort - "⇅" khi cot co the sort nhung dang KHONG sort (trung lap), "▲"/"▼" khi
          dang sort tang/giam dan. Dung ky tu unicode co san, KHONG can them dependency icon moi
          (@ant-design/icons chua co trong package.json) */}
      {canSort && (
        <span style={{ marginLeft: "4px", opacity: sorted ? 1 : 0.4 }}>
          {sorted === "asc" ? "▲" : sorted === "desc" ? "▼" : "⇅"}
        </span>
      )}
    </th>
  );
}

export default SortableHeaderCell;
