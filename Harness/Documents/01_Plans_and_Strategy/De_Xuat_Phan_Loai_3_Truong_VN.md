# Đề xuất phân loại test Harness — Mô hình 3 trường

**Người soạn:** BA · **Đối tượng:** PO / Lãnh đạo · **Epic:** QG-138 · **Ngày:** 6/8/2026
**Trạng thái:** Bản chốt đề xuất (thay khung trình bày "5 trục" bằng "3 trường")
**Bằng chứng:** đo trực tiếp trên API Harness `/api/platform/cases`, 6/8/2026
**Chuẩn từ vựng:** [`Aloha_Test_Case_Taxonomy.md`](./Aloha_Test_Case_Taxonomy.md) *(cần cập nhật theo bản này — xem §8)*

---

## 1. Chốt: đúng 3 trường Harness đã có sẵn

Không thêm trường mới. Dùng lại **đúng 3 trường** đang có trong Harness — chỉ **đóng từ vựng** và **thêm namespace**:

| # | Trường (đã có trong Harness) | Kiểu | Vai trò |
|---|---|---|---|
| 1 | **`feature`** | đơn trị, **đóng**, ≤ 2 tầng | Vùng chức năng + vùng con, ví dụ `risk/dashboard` |
| 2 | **`category`** | đơn trị, **đóng** | Loại test: `positive · negative · boundary · security · data-integrity` |
| 3 | **`labels[]`** | đa trị, **đóng, có namespace** | Mọi chiều cắt ngang: suite, quỹ, môi trường, ưu tiên, metric, ticket |

> `project` (aloha/harness) **không** tính là trường phân loại — nó là bộ chọn app có sẵn, chọn một lần ở sidebar.

## 2. Định nghĩa từng trường

**Trường 1 — `feature`** *(đơn trị, đóng, tối đa 2 tầng)*
10 vùng đóng băng: `navigation · overview · risk · scenario-test · return-public · return-private · liquidity · search-export · cash-forecast · fund-admin`. Tầng 2 (`sub_area`) mở rộng **chỉ khi được duyệt**. Không sâu quá 2 tầng.

**Trường 2 — `category`** *(đơn trị, đóng)*
`positive · negative · boundary · security · data-integrity`.
`data-integrity` tách riêng khỏi `negative` có chủ đích: trên nền tảng tài chính, "con số sai" là lỗi khác và nặng hơn "nút hỏng", cần PO làm trọng tài.

**Trường 3 — `labels[]`** *(đa trị, đóng, CÓ NAMESPACE)*
Đây là trường gánh mọi chiều cắt ngang. Mỗi giá trị **bắt buộc có tiền tố namespace**:

| Namespace | Giá trị |
|---|---|
| `suite:` | `smoke · regression · bug-repro · exploratory · uat` |
| `fund:` | `total-endowment · public · private · pipeline` |
| `env:` | `lab · conceptia` |
| `pri:` | `P1 · P2 · P3` |
| `metric:` | `nav · beta · risk · mtd · qtd · fytd · rating · unfunded · illiquid · fad` |
| `jira:` | mọi mã ticket, ví dụ `KS-963` |
| vòng đời | `writes-data · flaky · quarantine · deprecated` |

## 3. "3 trường" nhưng KHÔNG mất chiều nào — điểm hết lấn cấn

Đây là chỗ dễ nhầm nhất, nói cho rõ một lần:

- **Trường** = cột dữ liệu trên màn hình. Ta có **3**.
- **Chiều phân loại** = mẩu thông tin để truy vấn (vùng, ý định, suite, quỹ, môi trường, metric, ưu tiên, ticket).

Ba trường vẫn giữ **đủ mọi chiều**, vì trường `labels[]` chứa nhiều chiều cùng lúc nhờ namespace. Ví dụ `fund:public` và `metric:nav` là hai chiều khác nhau, cùng nằm trong `labels[]` nhưng vẫn truy vấn riêng được (`labels chứa metric:nav`).

> **Vậy: 3 trường, đủ chiều.** Ta không vứt bỏ chiều nào — chỉ gói các chiều cắt ngang vào một trường có namespace thay vì mỗi chiều một cột.

## 4. Hai điều bất di bất dịch (giữ nguyên)

1. **Đóng từ vựng** — cả 3 trường chỉ nhận giá trị từ danh sách được duyệt. Đây là thứ kéo 203 → ~45 giá trị. Còn nhập tự do là còn sụp.
2. **`labels[]` bắt buộc có namespace** — không có tiền tố thì `labels[]` biến thành đúng cái túi rác 209-giá-trị hiện tại (đang lẫn `FNC-001`, `aloha`, tiêu đề cắt cụt). Namespace là thứ giữ nó không sụp.

## 5. Ví dụ — một case đi qua 3 trường

Prompt: *"Test hypothetical flows trong Cash Forecast, kiểm tra lỗi NAV khi nhập số tiền không hợp lệ, quỹ Total Endowment, môi trường lab, ticket KS-963."*

```json
project:  "aloha"                         // bộ chọn sẵn có, không tính là trường phân loại
feature:  "cash-forecast/hypothetical-flows"
category: "negative"
labels:   ["suite:regression", "fund:total-endowment", "env:lab",
           "pri:P1", "metric:nav", "jira:KS-963"]
```

Truy vấn mở ra ngay: `feature:risk` (mọi case Risk, mọi quỹ) · `labels chứa suite:smoke` (bộ smoke trước deploy) · `labels chứa metric:nav` (NAV đổi thì chạy lại gì) · lưới `feature × category` (heatmap độ phủ).

## 6. Cần đổi gì trong Harness — rất ít

Vì dùng lại 3 trường đã có, không có schema mới:

- **`feature`**: thay ô nhập tự do bằng chọn từ danh sách đóng; cho phép tầng 2 `sub_area`.
- **`category`**: đang tự gán = `"default"` cho cả 313 case → bật phân loại thật vào 5 giá trị đóng.
- **`labels[]`**: đóng danh sách + bắt buộc namespace; bộ gợi ý đọc từ Knowledge base.
- **`project`**: giữ nguyên (đang tách 68 case harness lẫn vào 245 case aloha).

## 7. Vì sao 3 trường mà không sụp như hiện tại

Hiện tại cũng là 3 trường (feature + category + labels) — nhưng **free-text**. Đo thật 6/8: 203 giá trị feature / 313 case, 165 dùng đúng 1 lần; category = `default` cho cả 313; label pool lẫn Jira + tên project; Risk xé thành **20** giá trị vì quỹ nhồi vào feature. Sự khác biệt giữa "hỏng" và "chạy" **không phải số trường** — mà là **đóng từ vựng + namespace** (§4). Cùng 3 trường, thêm hai kỷ luật đó là đủ.

## 8. Quan hệ với chuẩn "5 trục" trước đây

Mô hình 3 trường **không mâu thuẫn** với taxonomy 5 trục — nó là **cách gói gọn của cùng thông tin**: gộp trục `label` (suite) và trục `tags[]` (context) vào một trường `labels[]` có namespace, và coi `project` là bộ chọn sẵn có. Danh sách giá trị **giữ nguyên**. Đây là bản chốt để trình bày; [`Aloha_Test_Case_Taxonomy.md`](./Aloha_Test_Case_Taxonomy.md) cần cập nhật §0–§2 theo khung 3 trường (giá trị không đổi).

---

*BA soạn dưới Epic QG-138. Mọi con số kiểm chứng trực tiếp trên Harness.*
