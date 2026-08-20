# Memo — Phân loại test Harness: "feature + label" đã đủ chưa?

**Gửi:** PO / Ban lãnh đạo · **Từ:** BA · **Ngày:** 6/8/2026 · **Epic:** QG-138
**Bằng chứng:** đo trực tiếp trên API Harness (`/api/platform/cases`) ngày 6/8/2026
**Kèm theo:** [`Why_Three_Fields_Dashboard_VN.html`](./Why_Three_Fields_Dashboard_VN.html)

---

## Câu hỏi của sếp

> *"Phân loại theo `feature` 2 tầng, rồi `label`, có đủ không? Có cần 5 trục không? — Harness vốn đã đánh dấu được feature và label rồi."*

## Trả lời một câu

**"feature + label" không phải một phương án đơn giản hơn để cân nhắc — nó chính là cấu hình đang chạy hôm nay, và số liệu cho thấy nó đã sụp.** Vấn đề cần giải không phải *"thêm 5 trục lên trên feature+label"*, mà là *"feature+label một mình đã hỏng — tối thiểu cần gì để sửa"*.

## Bằng chứng (đếm thật trên Harness, 6/8/2026)

| Chỉ số | Giá trị thực |
|---|---|
| Tổng số case | **313** (245 aloha + 68 harness lẫn chung) |
| Số giá trị `feature` khác nhau | **203** |
| `feature` chỉ dùng cho đúng 1 case | **165** |
| Trường `category` | Tồn tại, nhưng = `"default"` cho **cả 313 case** — auto-phân-loại không phân loại gì |
| Trường `labels` trên case | **Không tồn tại**; pool gợi ý label (khi có người gõ) đã lẫn mã Jira (`FNC-001`), tên project (`aloha`, `harness`) |
| Ý niệm **Risk** | bị xé thành **20 giá trị feature** |
| Scenario / Rating / Overview / Search / Pipeline | 15 / 10 / 9 / 9 / 5 giá trị |

## Vì sao "feature 2 tầng" không đủ — lý do đo được, không phải suy luận

Feature không có chỗ cho **phạm vi quỹ** (Public / Private / Total Endowment), nên quỹ chui thẳng vào feature: `public-fund-risk`, `total-endowment-risk`, `total-endowment-risk-history`… Kết quả: **Risk = 20 giá trị**, và `--grep @risk` bỏ sót phần lớn case Risk. Tách quỹ ra một tag riêng → Risk gom về 1–2 giá trị sạch. Trên nền tảng tài chính, một test Risk bị bỏ sót là một lỗi lọt ra production.

## Hai điều bất di bất dịch (sửa được sự sụp đổ — độc lập với số trường)

1. **Đóng từ vựng** — bỏ nhập tự do trên feature và label. Đây mới là thứ kéo 203 → ~45. Dù 2 hay 5 trường, còn free-text thì còn sụp.
2. **Đưa phạm vi quỹ (và metric / môi trường / Jira) ra khỏi feature**, vào một trường có namespace. Nếu không, Risk vĩnh viễn là 20 giá trị.

## Chốt: mô hình 3 trường — đúng 3 trường Harness đã có

**Đề xuất là 3 trường**, dùng lại đúng ba trường Harness đang có, chỉ đóng từ vựng + thêm namespace:

1. **`feature`** — đơn trị, đóng, ≤ 2 tầng (`area/sub-area`).
2. **`category`** — đơn trị, đóng (`positive · negative · boundary · security · data-integrity`); hiện 100% = `default`, kích hoạt là miễn phí.
3. **`labels[]`** — đa trị, đóng, **có namespace**: gánh toàn bộ chiều cắt ngang — `suite:`, `fund:`, `env:`, `pri:`, `metric:`, `jira:`.

*(`project` là bộ chọn app sẵn có, không tính là trường phân loại.)*

**3 trường nhưng không mất chiều nào** — `labels[]` mang nhiều chiều nhờ namespace (`fund:public` và `metric:nav` vẫn truy vấn riêng được). Đây không phải phương án "nhẹ hơn 5 trục" — nó **chính là** mô hình đó, gói vào đúng số cột Harness đang có. Chi tiết: [`De_Xuat_Phan_Loai_3_Truong_VN.md`](./De_Xuat_Phan_Loai_3_Truong_VN.md).

## Khuyến nghị

- **Không đóng khung là "2 vs 5".** feature + label đã là hiện trạng và đã hỏng.
- **Chốt tối thiểu:** đóng từ vựng + kéo quỹ ra khỏi feature. Kích hoạt `category` (đang bỏ không). Giữ `project` (đang làm việc thật).
- **Chốt mô hình 3 trường** (feature · category · labels[] có namespace) — giữ nguyên hai điều bất di bất dịch ở trên.
- **Điều KHÔNG được làm:** giữ feature/label free-text, hoặc nhét quỹ/suite/metric vào trong feature hay vào một túi label mở. Đó đúng là thứ đã tạo ra 203 giá trị và 20 biến thể Risk.

## Bước tiếp theo

1. PO duyệt mô hình 3 trường + hai điều bất di bất dịch.
2. Làm **VOCAB** trước (đóng từ vựng) — chặn được cả feature lẫn label khỏi drift.
3. Xác nhận quan hệ với **"Phase A taxonomy"** trước khi công bố từ vựng. *(Ghi chú: endpoint `/api/platform/taxonomy/suggestions` đã tồn tại nhưng chỉ là autocomplete không kiểm soát; `/api/platform/taxonomy` gốc trả 404 — phía server chưa có bộ từ vựng có kiểm soát.)*

*BA soạn dưới Epic QG-138. Mọi con số kiểm chứng được trực tiếp trên Harness.*
