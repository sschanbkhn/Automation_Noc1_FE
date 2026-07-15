import React from "react";
import { Alert } from "antd";

// DA KIEM TRA TOAN BO BE (main.py chi co 6 router: stations/cr/sse/sessions/qos/jobs) - KHONG co API nao
// tra ve so lieu thong ke tong hop (tong so session, so thanh cong/that bai...). GET /sessions chi tra ve
// { total, data } voi "total" la TONG SO BAN GHI KHOP BO LOC hien tai (vd status=DONE), khong phai thong ke
// theo tung trang thai cung luc. KHONG tu dem tay tu du lieu 1 trang o FE (page size chi 20 ban ghi/trang
// theo schema SessionsQueryParams) vi se sai hoan toan so voi tong the (co the hang tram/nghin session that)
// -> hien thong bao ro rang thay vi bia so lieu sai, cho BE bo sung API rieng sau
const StatsStrip: React.FC = () => {
  return (
    <Alert
      type="info"
      showIcon
      message="Chua co API tong hop"
      description="BE hien chua co endpoint tra ve so lieu thong ke tong quan (tong so session, ty le thanh cong/that bai...). Widget nay se duoc bo sung sau khi BE cung cap API tuong ung."
      style={{ marginBottom: "1rem" }}
    />
  );
};

export default StatsStrip;
