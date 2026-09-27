// Doc message loi THAT tu response cua BE R012, dung CHUNG cho toan module - truoc day moi noi tu viet
// lai logic nay (hoac khong doc gi ca, chi hien error.message chung chung kieu "Request failed with status
// code 422" - dong loi CUA AXIOS, khong lien quan gi den ly do that BE tu choi).
//
// BE R012 tra {error_code, message, session_id} qua DomainError handler (api/middleware/error_handler.py)
// -> doc "message" TRUOC. "detail" la format MAC DINH cua FastAPI, CHI xuat hien voi loi CHUA qua handler
// (vd loi validate Pydantic o tang framework, truoc khi toi duoc code nghiep vu) - va o dang do "detail" co
// the la MANG cac object mo ta tung truong sai (KHONG phai string) -> neu doc thang se hien "[object Object]"
// tren UI. Vi vay CHI nhan "detail" khi no la string, bo qua neu la mang/object.
//
// Thu tu uu tien: response.data.message -> response.data.detail (chi khi la string) -> err.message (loi
// mang/JS chung, vd axios timeout) -> macDinh (chuoi tieng Viet do noi goi tu quyet dinh, giu nguyen
// chuoi da co san o tung cho thay vi ep 1 chuoi chung cho moi tinh huong).
export const layThongBaoLoi = (err: unknown, macDinh?: string): string => {
  // ep any: err la unknown (co the la AxiosError, Error thuong, hoac bat ky gia tri nao khac tu catch/
  // useQuery.error) - cast day la cach da dung xuyen suot module nay (xem services/R012Service.ts) thay vi
  // tu dinh nghia type guard rieng cho 1 ham nho
  const e = err as any;

  const message = e?.response?.data?.message;
  if (typeof message === "string" && message !== "") {
    return message;
  }

  const detail = e?.response?.data?.detail;
  if (typeof detail === "string" && detail !== "") {
    return detail;
  }

  if (typeof e?.message === "string" && e.message !== "") {
    return e.message;
  }

  return macDinh ?? "Da xay ra loi, vui long thu lai";
};
