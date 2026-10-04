import React, { useState } from "react";
import { Button, Checkbox, Popover } from "antd";
import { FilterFilled } from "@ant-design/icons";
import { R012_COLORS } from "../theme";

// TACH (04/10/2026, yeu cau truc tiep user) tu VendorFilterHeader rieng trong StationSearchGrid.tsx thanh
// component DUNG CHUNG cho MOI cot kieu "loc theo danh sach gia tri co san, nhieu lua chon cung luc" trong
// module (lan dau dung cho Vendor + Khu vuc cua StationSearchGrid.tsx, co the tai su dung cho cot khac sau
// nay) - giong tinh than SortableHeaderCell (file canh day) dung chung cho PHAN sort cua <th>, component nay
// dung chung cho NOI DUNG ben trong 1 header can loc kieu checkbox nhieu chon, bam tieu de/icon -> bung
// Popover checkbox doc + nut "Loc"/"Bo loc", giong UX filter cot Excel / antd Table built-in.
export interface ColumnCheckboxFilterHeaderProps {
  // nhan cot hien thi canh icon loc (vd "Vendor", "Khu vuc")
  label: string;
  // danh sach lua chon hien trong popover - KHONG gioi han kieu string lieral cu the nao, moi cot tu truyen
  // dung danh sach rieng (vd VENDOR_OPTIONS/KHU_VUC_OPTIONS)
  options: { label: string; value: string }[];
  // gia tri DANG ap dung that su (dieu khien goi API + mau icon), KHAC voi lua chon dang tick tam trong popover
  appliedValue: string[];
  // goi khi bam "Loc" - truyen danh sach dang tick trong popover luc do
  onApply: (value: string[]) => void;
  // goi khi bam "Bo loc" - xoa het lua chon
  onClear: () => void;
}

export function ColumnCheckboxFilterHeader({ label, options, appliedValue, onApply, onClear }: ColumnCheckboxFilterHeaderProps) {
  const [open, setOpen] = useState(false);
  // "pending": lua chon dang tick TRONG popover, chua ap dung - tach voi "appliedValue" de giong dung hanh
  // vi filter cot that: tick xong phai bam "Loc" moi ap dung, bam ra ngoai popover (khong qua nut) thi HUY
  // cac tick do, giu nguyen bo loc cu dang ap dung.
  const [pending, setPending] = useState<string[]>(appliedValue);

  // moi lan BUNG popover len, dong bo lai pending = gia tri DANG ap dung that su - tranh truong hop lan truoc
  // nguoi dung tick linh tinh roi bam ra ngoai (huy), lan sau mo lai van con thay tick cu chua ap dung
  const handleOpenChange = (next: boolean) => {
    if (next) {
      setPending(appliedValue);
    }
    setOpen(next);
  };

  const handleLoc = () => {
    onApply(pending);
    setOpen(false);
  };

  const handleBoLoc = () => {
    setPending([]);
    onClear();
    setOpen(false);
  };

  // dang co loc (it nhat 1 gia tri dang ap dung that su, khong phai dang tick do trong popover) -> icon to mau
  const isFiltered = appliedValue.length > 0;

  return (
    <Popover
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomLeft"
      content={
        // chan click lan len <th> ngoai (SortableHeaderCell) - phong truong hop sau nay 1 cot dung component
        // nay lai VUA co the sort VUA co the loc (hien tai ca Vendor lan Khu vuc deu enableSorting:false)
        <div
          style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "150px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox.Group
            options={options}
            value={pending}
            onChange={(checked) => setPending(checked as string[])}
            style={{ display: "flex", flexDirection: "column", gap: "6px" }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "4px",
              paddingTop: "8px",
              borderTop: `1px solid ${R012_COLORS.tableBorder}`,
            }}
          >
            <Button size="small" type="link" style={{ padding: 0 }} onClick={handleBoLoc}>
              Bo loc
            </Button>
            <Button size="small" type="primary" onClick={handleLoc}>
              Loc
            </Button>
          </div>
        </div>
      }
    >
      <span
        style={{ display: "inline-flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
        onClick={(e) => e.stopPropagation()}
      >
        {label}
        {/* icon to mau (amber, mau "noi bat" da dung san cho chartCrDay trong theme.ts) khi dang co loc,
            mau nhat/trong suot tren nen header dam khi chua loc gi - NOC biet ngay cot nao dang bi loc */}
        <FilterFilled style={{ color: isFiltered ? R012_COLORS.chartCrDay : "rgba(255,255,255,0.65)" }} />
      </span>
    </Popover>
  );
}

export default ColumnCheckboxFilterHeader;
