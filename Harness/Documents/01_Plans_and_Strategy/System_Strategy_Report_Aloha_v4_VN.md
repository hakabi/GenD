# Ghi chú Chiến lược Hệ thống — Chuẩn hóa Phân loại Test Harness cho Aloha

**Người soạn:** BA · **Đối tượng:** Product Owner / Lãnh đạo · **Epic:** QG-138
**Phạm vi:** Nền tảng tài chính Aloha · Hệ thống automation Harness · **Ngày:** 06/08/2026
**Chuẩn tham chiếu:** [`Aloha_Test_Case_Taxonomy.md`](./Aloha_Test_Case_Taxonomy.md) · **Kế hoạch:** [`Harness_Case_Classification_Plan.md`](../00_Active/Harness_Case_Classification_Plan.md)
**English:** [`System_Strategy_Report_Aloha_v4_EN.md`](./System_Strategy_Report_Aloha_v4_EN.md) — **bản tiếng Anh là bản gốc có hiệu lực.** File này là bản đọc tham khảo.

> **Mục đích.** Một tài liệu đọc-một-lần cho lãnh đạo, giải thích *vì sao* cần chuẩn hóa phân loại test trong Harness, và *vì sao lời giải là ba trường đóng chứ không phải nhãn tự do* — được viết để có thể kiểm chứng trên hệ thống thật, không phải trên slide.

---

## 1. Vấn đề, bằng con số đo được

Test case trong Harness được sinh ra từ prompt dạng văn bản tự do. Hai trường lẽ ra dùng để *gom nhóm* chúng — `Feature` và `Labels` — lại là văn bản tự do do con người hoặc LLM điền, và chúng đã sụp đổ. Đo trực tiếp trên API Harness ngày 06/08/2026:

| | |
|---|---|
| Số case trong catalog | **313** (245 aloha + 68 harness) |
| Số giá trị `feature` khác nhau | **203** |
| Trong đó, tiêu đề cắt cụt dùng một lần | **165** |
| `category` (tự gán) | **`default` cho cả 313** |
| Ý niệm "Risk" bị xé thành | **20 giá trị `feature`** |

**Trường `feature` không gom nhóm được gì cả — nó đang hoạt động như một ID thứ hai.** Chỉ riêng một ý niệm "Risk" đã trải ra trên **hai mươi** giá trị (`risk-dashboard`, `public-fund-risk`, `total-endowment-risk-tab`, …). Lẫn trong cùng các danh sách chọn đó còn có tên project, tên bộ suite và mã ticket — ba chiều khác nhau dùng chung một trường.

Đây không phải số dự phóng. Đây là những gì catalog đang chứa ngay lúc này.

---

## 2. Phản biện mà ghi chú này ra đời để trả lời

> *"QA đã có thể chọn hoặc gõ bất kỳ nhãn nào họ muốn. Vì sao lại áp một hệ phân loại cứng nhắc và làm chậm cả team?"*

Câu trả lời nằm ở sự khác biệt giữa **tự do thao tác thủ công** và **toàn vẹn dữ liệu**.

**2.1 Gõ tự do không phải là kiểm soát — đó là hỗn loạn có kiểm soát.** Các dropdown hiện nay đã ô nhiễm bởi những câu mô tả hành vi đội lốt nhãn (`calendar-table-is-displayed-when-clicking-the-calendar`). Nhập tự do không cho QA quyền kiểm soát; nó để mỗi request đẻ ra một giá trị mới. Đó chính xác là cách 313 case sinh ra 203 giá trị `feature`.

**2.2 Taxonomy lấy bớt việc khỏi QA — chứ không tạo thêm việc.**

| | Hiện nay (nhãn tự do) | Đề xuất (tự động phân loại) |
|---|---|---|
| QA phải làm gì | Nhớ lại hoặc cuộn qua hàng trăm nhãn cũ, bịa ra một nhãn dưới áp lực | Viết yêu cầu bằng tiếng Anh đời thường |
| Ai phân loại | Con người, thiếu nhất quán | Luật từ khóa xác định trước, LLM có ràng buộc chỉ cho phần còn lại |
| Việc còn lại của QA | Hy vọng nhãn trùng với thứ gì đó | Liếc qua bản xem trước đã điền sẵn và xác nhận |

Ba trường được điền **giúp** QA ngay tại khâu nhập liệu. QA không cần thuộc lòng bộ từ vựng — hệ thống đề xuất và QA rà lại. Khung này **giảm tải nhận thức; nó không thêm một biểu mẫu phải điền.**

---

## 3. Cái giá của sự sụp đổ cấu trúc, nếu để nguyên

Dựa trên con số ở §1, không phải giả định:

1. **Thất bại truy xuất.** "Chạy mọi case `risk`" không thực hiện được, vì cùng một ý niệm nằm dưới hai mươi giá trị. `--grep @risk` chỉ trả về phần tình cờ được gắn `@risk` và bỏ sót phần còn lại. Trên nền tảng tài chính, một test bị bỏ sót là một lỗi lọt ra production.
2. **Trùng lặp.** Khi không tìm được case sẵn có theo tên, người ta viết lại nó. Catalog phình về kích thước mà không tăng độ phủ. *(Lưu ý: nền tảng đã có sẵn khử-trùng-lặp theo ngữ nghĩa — Spec 039 — nên việc của ta là giới hạn kiểm tra đó theo nhãn, chứ không phải xây khử-trùng-lặp từ đầu. Xem §6.)*
3. **Mù độ phủ.** Một dashboard độ phủ dựng trên nhãn rác sẽ báo cáo sự tự tin giả — "Cash Forecast đã phủ hết" trong khi con số đó do các nhãn dùng-một-lần tạo ra. Lãnh đạo khi đó ra quyết định trên dữ liệu ảo.
4. **Gánh nặng bảo trì.** Khi một yêu cầu thay đổi, bộ từ vựng đóng chỉ cần cập nhật một khóa; còn nhãn tự do trôi dạt buộc phải truy lùng hàng trăm biến thể bằng tay.
5. **Chi phí.** Case dư thừa kéo dài thời gian chạy CI, và để LLM tự bịa nhãn thì tốn token để tạo ra chính mớ hỗn độn mà sau đó ta phải trả tiền dọn.

---

## 4. Đề xuất — ba *trường*, không phải năm *tầng*

Điểm quan trọng nhất cho cuộc thảo luận này: **đây không phải một cây năm tầng.** Một hệ phân cấp sâu mới đúng là sự phức tạp mà lãnh đạo có lý khi lo ngại. Nó dùng **đúng ba trường Harness đã có** — đặt một lần, truy vấn theo bất kỳ tổ hợp nào, tất cả trên **một màn hình**. Vẫn đa diện: `labels[]` đa trị và có namespace nên mang nhiều chiều cùng lúc mà không thêm cột:

| # | Trường | Ví dụ | Từ vựng |
|---|---|---|---|
| 1 | **`feature`** (`area/sub-area`) | `cash-forecast/hypothetical-flows` | đóng, **tối đa 2 tầng** |
| 2 | **`category`** | `negative` | đóng |
| 3 | **`labels[]`** (có namespace) | `suite:regression` · `fund:total-endowment` · `env:lab` · `metric:nav` · `jira:KS-963` | đóng |

*(Cộng `project` — bộ chọn app sẵn có, chọn một lần, không phải trường theo từng case.)*

Hai lựa chọn thiết kế đặc biệt đáng nói với lãnh đạo:

- **`feature` bị giới hạn ở 10 vùng nghiệp vụ, sâu 2 tầng — cố tình đóng băng.** Mỗi giá trị mới là một thất bại truy xuất trong tương lai. Sự phình to bị chặn ngay từ thiết kế.
- **`data-integrity` là một loại test riêng, tách khỏi `negative`.** Trên nền tảng tài chính, "con số bị sai" là một lỗi khác biệt và nghiêm trọng hơn "cái nút bị hỏng" — nó cần Product Owner làm trọng tài đối chiếu. Tách nó ra là một tấm chắn về tính đúng đắn tài chính, không phải thủ tục quan liêu.

---

## 5. Trông ra sao trong công cụ — "Smart Matrix Ingest"

```
+-------------------------------------------------------------------------+
| HARNESS — NHẬP TEST CASE                                                |
+-------------------------------------------------------------------------+
| Prompt: [ Test the hypothetical flows in Cash Forecast and assert the  |
|           NAV error on an invalid amount... ]                           |
+-------------------------------------------------------------------------+
| Xem trước phân loại tự động (luật xác định + LLM ràng buộc):            |
|   Project   : aloha                              (sẵn có)              |
|   Feature   : cash-forecast/hypothetical-flows   (luật + LLM · 0,93)   |
|   Category  : negative                           (khớp luật từ khóa)   |
|   Labels[]  : suite:regression · fund:total-endowment · env:lab ·       |
|              pri:P1 · metric:nav · jira:KS-963                          |
+-------------------------------------------------------------------------+
| Trạng thái: SẴN SÀNG                             [ Xác nhận & Ghi ]     |
+-------------------------------------------------------------------------+
```

- **Kiểm tra mềm.** Một giá trị ngoài từ vựng sẽ bật gợi ý ("có phải bạn muốn *cash-forecast*?"), không bao giờ chặn cứng — QA luôn có thể ghi đè.
- **Heatmap độ phủ.** Khi nhãn đã đáng tin, một lưới `feature` × `category` cho lãnh đạo thấy chỗ nào độ phủ còn mỏng — minh bạch, không bị nhãn rác bóp méo.

---

## 6. Phạm vi trung thực — cái gì đã xây, cái gì còn lại

Đây **không phải một dự án làm mới từ đầu.** Phần lớn bộ máy xung quanh đã lên nền tảng trong các ngày 1–3 tháng 8. Phần còn lại **chủ yếu là quản trị, không phải xây dựng** — điều này khiến đề xuất rẻ hơn nhiều so với cảm nhận ban đầu.

| Năng lực | Tình trạng | Việc còn lại của ta |
|---|---|---|
| Bộ lọc facet trên trang Cases | ✅ **Đã lên 3/8** | không còn — xong |
| Khử trùng lặp ngữ nghĩa (Chroma / ANN, Spec 039) | ✅ **Đã có** | giới hạn kiểm tra theo nhãn |
| Test groups (CRUD, lịch chạy, lồng nhau) | ✅ **Đã lên 3/8** | thêm chế độ thành viên *theo truy vấn* |
| Đóng từ vựng cho `Feature` / `Labels` (**VOCAB**) | ⬜ cần xây — **làm trước tiên** | thay đổi cốt lõi |
| Khu vực con của `feature` + `labels[]` có namespace (**MODEL**) | ⬜ nhỏ | `Category`/`Labels` đã có |
| Phân loại tại khâu nhập (**CLASSIFY**) | ⬜ cần xây | từ vựng đọc từ Knowledge base |
| Hàng đợi "Cần gắn nhãn" (**QUEUE**) | ⬜ cần xây | nhân bản mẫu triage của Case Review |
| Gắn nhãn lại 313 case cũ (**BACKFILL**) | ⬜ sau VOCAB | di trú một lần, đã biết phạm vi |
| Heatmap độ phủ (**HEATMAP**) | ⬜ làm cuối | chỉ hữu ích khi nhãn đã thật |

**Đích di trú:** 203 giá trị `feature` hiện tại co lại còn **~45 nhóm lá ổn định** cho khoảng ~260–320 case khi phủ đầy đủ — tức khoảng 6–15 case mỗi nhóm thay vì ≈1,5.

---

## 7. Làm sao để phân loại luôn đáng tin

Câu hỏi hiển nhiên của lãnh đạo là *"nếu AI gắn sai nhãn một test tài chính thì sao?"* — nên thiết kế mặc định rằng đôi khi nó sẽ sai, và bao vây rủi ro đó:

- **Cổng độ tin cậy.** Một phân loại **≥ 0,80** được áp dụng tự động; **dưới ngưỡng đó nó vào hàng đợi "Cần gắn nhãn" cho người xử lý** thay vì đoán bừa.
- **Bộ phân loại không thể bịa giá trị.** Nó bị ràng buộc vào danh sách được duyệt bằng schema, không phải bằng một lời nhắc lịch sự — nếu không có gì khớp, nó trả về `unclassified` kèm lý do, và đó thành một việc cần làm, không bao giờ là một nhãn sai âm thầm.
- **Độ chính xác đo được.** Một bộ chuẩn (golden set) gồm 30–50 case gắn nhãn tay giữ bộ phân loại ở mức **≥ 90% cho `feature`, ≥ 80% cho khu vực con (`sub-area`)**, kiểm lại định kỳ để phát hiện trôi dạt sớm.

---

## 8. Kiểm tra tính tương thích và bước tiếp theo

**Có một điều phải xác nhận trước khi công bố bộ từ vựng này.** Nền tảng đã mang sẵn một luồng công việc gọi là *"Phase A taxonomy"* (commit `5235d30`, 4/8 — *"prefer managed app_project for Phase A taxonomy"*). Trước khi bộ từ vựng Aloha được sao vào Knowledge base, cần PO xác nhận hai bên quan hệ ra sao:

1. "Phase A taxonomy" phân loại cái gì — case, project, hay thứ khác?
2. Nó định nghĩa một bộ từ vựng có kiểm soát, hay chỉ một mô hình dữ liệu?
3. Bộ từ vựng Aloha nên **nằm bên trong nó, mở rộng nó, hay thay thế nó?**

Vì vậy ghi chú này đề xuất bộ từ vựng Aloha như **lớp phân loại chuyên biệt cho miền Aloha**, thiết kế để cắm vào bất kỳ khung quản trị nào PO chọn — *không phải* một hệ thống mới cạnh tranh. Xác nhận sự tương thích đó là hành động đầu tiên, trước mọi triển khai.

**Trình tự đề xuất:** xác nhận tương thích Phase A → lên **VOCAB** (đóng các trường) → **MODEL** / **CLASSIFY** / **QUEUE** → **BACKFILL** 313 case → thêm chế độ thành viên theo truy vấn cho groups → **HEATMAP** cuối cùng.

---

## 9. Kết luận

Chuẩn hóa quanh ba trường không đặt gánh nặng lên QA — nó *lấy đi* quyết định gắn nhãn khỏi QA và giao cho luật xác định, có LLM dự phòng và một lưới an toàn do con người trực. Đây phần lớn là một thay đổi quản trị đặt lên trên bộ máy nền tảng đã lên sẵn. Và trên một nền tảng tài chính, một nền móng phân loại sạch không phải là sự gọn gàng cho vui — nó là thứ giữ cho một test Risk hay NAV không âm thầm biến mất.

*Do BA soạn dưới Epic QG-138. Số liệu đã kiểm chứng trên API Harness thật, ngày 06/08/2026.*
