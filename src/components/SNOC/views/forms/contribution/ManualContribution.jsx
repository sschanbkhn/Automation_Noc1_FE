import React, { useState } from "react";
import ContributionWizard from "./ContributionWizard";
import TopNavbarHealth from "../../dashboard/DashOrigin/TopNavbarHealth";

export default function ManualContribution() {
  const [resetKey, setResetKey] = useState(0);

  const handleDone = () => setResetKey((k) => k + 1);

  return (
    <>
      <TopNavbarHealth />
      <div className="p-3">
        <h5 className="mb-3">✍️ Thêm lệnh/hàm thủ công</h5>
        <p className="text-muted small">
          Tự viết hàm phân tích và câu lệnh trên thiết bị — qua đúng quy trình sandbox test,
          admin duyệt, deploy chạy thật.
        </p>
        <ContributionWizard key={resetKey} onDone={handleDone} />
      </div>
    </>
  );
}
