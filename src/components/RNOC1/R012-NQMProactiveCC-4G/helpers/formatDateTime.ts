import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// BE (FastAPI/PostgreSQL timestamptz) tra ve KHONG dong nhat: created_at co hau to "Z" (UTC ro rang),
// nhung executed_at/evaluated_at van la chuoi "naive" thieu Z (da xac nhan qua goi that GET /sessions?size=1
// ngay 21/07/2026). Neu dung dayjs(value) thuong, chuoi thieu Z se bi hieu la GIO DIA PHUONG cua trinh duyet
// (sai), con chuoi co Z se ra dung -> "cot nay dung cot kia sai" du ca 2 deu la 1 loai du lieu.
// Dung dayjs.utc(value) LUON ep hieu chuoi dau vao la UTC bat ke co Z hay khong (neu co offset/Z, dayjs van
// tinh dung sang UTC), roi .tz() moi doi sang GMT+7 - xu ly dung DONG NHAT cho ca 2 dinh dang BE dang tra.
export const formatDateTime = (value: string | null): string =>
  value ? dayjs.utc(value).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss") : "-";
