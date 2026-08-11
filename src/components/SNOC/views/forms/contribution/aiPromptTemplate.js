// Prompt mẫu để người dùng copy sang AI ngoài (ChatGPT/Claude/Gemini...) nhờ viết hàm
// phân tích, rồi paste kết quả ngược vào ô "Hàm phân tích" của luồng thủ công
// AI-Contribution. Toàn bộ ràng buộc dưới đây lấy đúng từ sandbox thật
// (api/nornirps/sandbox_executor.py) + quy ước format alert thật
// (api/nornirps/utils/ssh_nornir.py::format_alerts_grouped_by_command) — sai bất kỳ
// điều nào cũng khiến hàm AI sinh ra fail sandbox hoặc bị hệ thống âm thầm bỏ qua.
const ALLOWED_BUILTINS_LIST = [
  "print", "len", "range", "str", "int", "float", "list", "dict", "set", "bool", "any", "all",
  "enumerate", "sorted", "reversed", "zip", "map", "filter", "next", "iter",
  "sum", "min", "max", "round", "abs", "pow", "divmod", "tuple", "frozenset", "isinstance",
  "ValueError", "IndexError", "KeyError", "TypeError", "AttributeError", "StopIteration",
  "ZeroDivisionError", "RuntimeError", "Exception",
].join(", ");

export function buildContributionPrompt({
  platform = "",
  fn_name = "",
  command_pattern = "",
  device_command = "",
  description = "",
  sample_output = "",
} = {}) {
  const fnName = fn_name || "ten_ham";

  return `Bạn là chuyên gia viết hàm phân tích log/output thiết bị viễn thông (Nornir/SSH healthcheck) bằng Python thuần.

## Nhiệm vụ
Viết CHÍNH XÁC 1 hàm Python tên \`${fnName}\` để phân tích output của lệnh sau đây chạy trên thiết bị nền tảng \`${platform || "(chưa điền)"}\`.

- Lệnh thiết bị: ${device_command || "(chưa điền)"}
- Command pattern (giá trị của tham số cmd khi gọi hàm): ${command_pattern || "(chưa điền)"}

Mô tả & tiêu chí phát hiện lỗi:
${description || "(chưa điền)"}

Sample output thực tế (chỉ dùng để hiểu định dạng, KHÔNG hardcode giá trị cụ thể trong code):
\`\`\`
${sample_output || "(chưa điền)"}
\`\`\`

## Chữ ký hàm BẮT BUỘC
\`\`\`python
def ${fnName}(output: str, cmd: str, **_) -> list[dict]:
    ...
\`\`\`

- \`output\`: toàn bộ text output của lệnh trên thiết bị (dạng như sample ở trên).
- \`cmd\`: chuỗi command_pattern được truyền vào — LUÔN gán lại y nguyên vào key "command" của mỗi dict trả về, không tự chế chuỗi khác.
- \`**_\` luôn giữ ở cuối signature, kể cả khi có thêm tham số cấu hình bên dưới — bắt buộc để tương thích ngược.

## Tham số cấu hình được (threshold...) — có thể khai báo NHIỀU tham số, không chỉ 1
Có thể thêm 0, 1 hoặc NHIỀU tham số cấu hình vào giữa \`cmd\` và \`**_\`, ví dụ (tham khảo hàm thật \`hlr_analyze_ntpq\` trong codebase):

\`\`\`python
def hlr_analyze_ntpq(
    output: str, cmd: str, *,
    reach_threshold: int = 300,
    offset_threshold: float = 10.0,
    jitter_threshold: float = 2.0,
    **_,
) -> list[dict]:
    ...
\`\`\`

Quy tắc bắt buộc cho mỗi tham số thêm:
- PHẢI có giá trị mặc định (\`= ...\`).
- Giá trị mặc định PHẢI thuộc kiểu \`int\`, \`float\`, \`bool\`, hoặc \`str\` — TUYỆT ĐỐI KHÔNG dùng \`None\`/\`list\`/\`dict\`/\`Optional[...] = None\` làm mặc định cho tham số cấu hình (hệ thống suy luận kiểu hiển thị trên UI từ kiểu giá trị mặc định; 4 kiểu trên mới nhận đúng, kiểu khác sẽ bị hiểu sai).
- Sau khi deploy, MỖI tham số như vậy tự động thành 1 ô cấu hình riêng trên Analysis Params UI — không cần code thêm gì. Vì tên tham số hiển thị trực tiếp cho admin, hãy đặt tên rõ nghĩa (vd \`reach_threshold\`, \`max_age_days\`, \`min_count\`...).
- Nếu tiêu chí ở phần Mô tả phía trên có nhắc tới nhiều ngưỡng khác nhau (ví dụ 2-3 ngưỡng riêng biệt cho từng chỉ số), hãy khai báo TỪNG ngưỡng là 1 tham số riêng thay vì gộp chung 1 tham số duy nhất.
- Nếu tiêu chí không cần ngưỡng cấu hình được, không bắt buộc phải thêm tham số nào — giữ signature tối giản \`def ${fnName}(output: str, cmd: str, **_) -> list[dict]:\`.

## Ràng buộc môi trường chạy (sandbox) — PHẢI tuân thủ tuyệt đối
1. TUYỆT ĐỐI KHÔNG được viết bất kỳ dòng \`import\` nào (kể cả \`import re\`) — code sẽ bị từ chối ngay nếu có import.
2. Các tên sau đã có sẵn trong scope, dùng thẳng KHÔNG cần import: \`re, List, Dict, Tuple, Optional, Any, Union, Iterable, datetime, timedelta, timezone, Counter, OrderedDict, defaultdict\`.
3. Chỉ được dùng các builtin sau: ${ALLOWED_BUILTINS_LIST}. KHÔNG dùng \`open/eval/exec/__import__/os/sys/subprocess\` hay bất kỳ thư viện ngoài nào.
4. Không có mạng, không file I/O, không thread/process. Có thể viết thêm hàm phụ trợ (helper) khác trong cùng đoạn code nếu cần, miễn hàm chính tên đúng \`${fnName}\`.
5. Code chạy có timeout 10 giây — không viết vòng lặp/đệ quy có thể chạy vô hạn.

## Kết quả trả về BẮT BUỘC
- Return kiểu \`list[dict]\`. Nếu output bình thường, không có gì bất thường → \`return []\` (không phải \`None\`, không phải bỏ trống \`return\`).
- Mỗi phần tử trong list là 1 dict đại diện 1 cảnh báo, PHẢI có tối thiểu 3 key:
  - \`"command"\`: luôn gán bằng biến \`cmd\` (y nguyên, không đổi định dạng).
  - \`"status"\`: chuỗi PHẢI CHÍNH XÁC là \`"ALERT"\` (viết hoa toàn bộ) — hệ thống chỉ nhận diện đúng chuỗi này để gộp và hiển thị cảnh báo; các giá trị khác như \`"WARN"/"OK"/"CRITICAL"\` sẽ bị bỏ qua ÂM THẦM ở tầng báo cáo (không lỗi, chỉ đơn giản là không ai thấy cảnh báo đó).
  - \`"note"\`: chuỗi mô tả ngắn gọn, dễ hiểu, nêu rõ giá trị thực tế so với ngưỡng/điều kiện vi phạm (ví dụ: \`f"{mount_point} usage {usage_percent}% > {threshold}%"\`).
- Có thể thêm các key phụ tuỳ chọn để lưu thêm dữ liệu (ví dụ \`"mount_point"\`, \`"usage_percent"\`, \`"alarm_id"\`...) — không bắt buộc, không ảnh hưởng logic.

## Ví dụ tham khảo phong cách (hàm thật trong codebase, không cần copy nguyên — chỉ tham khảo cấu trúc)
\`\`\`python
def hlr_analyze_prcstate(output: str, cmd: str, **_) -> list[dict]:
    notes = []
    lines = [ln.strip().lower() for ln in output.strip().splitlines() if ln.strip()]
    active_ok = any(re.search(r'^active\\s+node\\s+is\\s+up\\s+and\\s+working$', ln) for ln in lines)
    if not active_ok:
        notes.append({
            "command": cmd,
            "status": "ALERT",
            "note": "Active node not OK",
        })
    return notes
\`\`\`

## Yêu cầu output của bạn (AI)
CHỈ trả về đúng đoạn code Python của hàm (có thể bọc trong \`\`\`python ... \`\`\` hoặc không đều được). KHÔNG kèm giải thích, KHÔNG kèm text ngoài code, KHÔNG đổi tên hàm khác \`${fnName}\`.`;
}
