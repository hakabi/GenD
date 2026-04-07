# KS-939 Requirements Comparison — Run 1 vs Run 2

**Skill:** `analyze-synthesize-ks-ticket`
**Source Ticket:** KS-939 — Cash Forecast UI Specs
**Comparison Date:** 2026-03-31
**Author:** AI (Antigravity) — generated automatically after second skill run

| File | Run | Date |
|---|---|---|
| `KS-939_requirements.md` | Run 1 | 2026-03-31 (first synthesis during skill creation) |
| `KS-939_requirements_20260331.md` | Run 2 | 2026-03-31T14:34 (live skill execution) |

> [!NOTE]
> This document is auto-generated for audit and traceability purposes.
> It captures what changed between two consecutive runs of the same skill on the same ticket,
> demonstrating how additional comments (fetched live) improve requirement fidelity.

---

## 1. Top-level Metadata Differences

| Tiêu chí | Run 1 | Run 2 |
|---|---|---|
| **Số comments phân tích** | 15 | **16** (+1 comment mới nhất tuan tran 2026-03-31) |
| **Số Functional Areas** | 7 (FA7 chỉ là placeholder TBD) | 7 (FA5 mới thêm; "Dashboard Initial Load" chuyển sang Open Questions) |
| **Run timestamp** | ❌ Không có | ✅ `Run: 2026-03-31T14:34` |
| **Participant list** | ❌ Không có | ✅ Bảng 3 participants với vai trò rõ ràng |

---

## 2. Functional Areas — So sánh chi tiết

### 2.1 FA mới hoàn toàn trong Run 2

**Functional Area 5: Trailing 30-day / 90-day Net Cash Flow Summary** — hoàn toàn **không có** trong Run 1.

Run 2 bổ sung đầy đủ 4 headings bắt buộc (strict QA standard):

```markdown
## Functional Area 5: Trailing 30-day / 90-day Net Cash Flow Summary

*Test Objective:*
Verify the dashboard correctly displays trailing 30-day and 90-day net cash flow totals
and daily averages, sourced from the daily scheduler-loaded data.

*Preconditions:*
- Daily scheduler has run and populated trailing 30-day/90-day summary data in the DB
- Dashboard is loaded

*Test Steps:*
1. Navigate to the Cash Forecast Dashboard.
2. Locate the trailing 30-day and 90-day summary values (totals and daily averages).
3. Verify the values reflect data loaded by the daily scheduler (not user-triggered calculations).
4. Confirm the display updates after the next scheduler run (next business day).

*Expected Result:*
- Trailing 30-day and 90-day net cash flow totals and daily averages are displayed correctly.
- Values come from the daily scheduled data load — not on-demand API calls.
- Data source: datalake API raw output; compute server performs calculations on top of it.
```

### 2.2 Bảng ánh xạ số thứ tự FA

| FA Run 1 | FA Run 2 | Ghi chú |
|---|---|---|
| FA1: Net Cash Flow Chart | FA1: Net Cash Flow Chart | Giống nhau, Run 2 chi tiết hơn |
| FA2: Historical Capital Calls & Distributions | FA2: Historical Capital Calls & Distributions | Giống nhau, Run 2 thêm Sub-req |
| FA3: Start/End Date Filter | FA3: Start/End Date Filter | Giống nhau, Run 2 thêm validation Start > End |
| FA4: Time Interval Switching | FA4: Time Interval Switching | Giống nhau |
| FA5: Details Tab — Beta Columns | *(chuyển lên)* FA6: Details Tab | Đổi số thứ tự |
| FA6: Fixed Income & Total Cash | *(chuyển lên)* FA7: Fixed Income & Total Cash | Đổi số thứ tự |
| FA7: Dashboard Initial Load (TBD placeholder) | ❌ **Loại bỏ** → moved to Open Questions | Xử lý đúng hơn |
| ❌ Không có | **FA5: Trailing 30/90-day Summary** | **MỚI** |

### 2.3 Chi tiết thay đổi trong các FA chung

#### FA1 — Net Cash Flow Combination Chart

| Element | Run 1 | Run 2 |
|---|---|---|
| Test Objective | Chung chung: "using data from the compute server JSON output" | Cụ thể hơn: map rõ ràng từng series trong câu mô tả |
| Test Steps | 5 steps | **6 steps** — thêm Step 5: *"Confirm the Derivative Notional Value (if displayed) reflects today's date — no date picker present"* |
| Expected Result | 5 bullets | **6 bullets** — thêm: *"Derivative Notional Value (from body.base.deriv_notional_value) is always 'as of today' — no user-selectable date"* |

#### FA Details Tab (Run 1: FA5 → Run 2: FA6)

| Element | Run 1 | Run 2 |
|---|---|---|
| Preconditions | 2 items | **3 items** — thêm: `cash_forecast_response.json` schema is available for reference |
| Test Steps | 6 steps | **7 steps** — thêm Step 7: *"Verify other columns in the table match the daily-loaded data columns"* |
| Expected Result | 4 bullets | Giữ 4 bullets nhưng diễn đạt rõ hơn: *"Table includes both loaded data columns and computed columns — all in one view"* |
| Sub-req | 2 items | **3 items** — thêm file reference: `cash_forecast_response.json` (attached by Jerry Luo 2026-03-25) |

#### FA Fixed Income & Total Cash (Run 1: FA6 → Run 2: FA7)

| Element | Run 1 | Run 2 |
|---|---|---|
| Test Steps | 4 steps | **5 steps** — thêm Step 5: *"Simulate adding/removing an account in the datalake and verify the list updates dynamically"* |

---

## 3. Dashboard Initial Load — Cách xử lý khác nhau

> [!IMPORTANT]
> Đây là quyết định thiết kế quan trọng nhất giữa hai lần run.

| | Run 1 | Run 2 |
|---|---|---|
| **Vị trí** | Functional Area 7 (riêng biệt) | Open Questions (không tạo FA) |
| **Lý do** | Tạo placeholder đầy đủ per skill template | Dữ liệu chưa đủ để viết Test Steps/Expected Result có giá trị — tạo FA giả sẽ gây hiểu nhầm |
| **Body** | `[TBD — Pending response from Jerry Luo and Kathleen Bui]` | Mô tả câu hỏi chi tiết: *"This determines whether the charts are populated on initial render or only after a user action"* |
| **Đánh giá** | ⚠️ Đúng format nhưng thiếu giá trị thực tế | ✅ Đúng bản chất hơn — Open Question chưa thể thành FA |

---

## 4. Epic Context / Scope — Khác biệt

| Scope Item | Run 1 | Run 2 |
|---|---|---|
| Derivative Notional Value | ❌ Không liệt kê riêng trong Scope | ✅ *"Derivative Notional Value display (always 'as of today')"* |
| Trailing 30/90-day | ❌ Không liệt kê | ✅ *"Trailing 30-day / 90-day net cash flow totals & daily averages"* |
| Beta columns label | *"Beta columns"* (chung chung) | *"Beta, Beta Contribution, Beta Impact columns"* (đầy đủ) |
| Compute server port | ❌ Không đề cập | ✅ *"Compute server API (port 5001)"* |
| Dashboard initial load | *"Dashboard initial load data source clarification"* | ✅ *"Dashboard initial load data source (open — see Open Questions)"* — rõ trạng thái |

### Preconditions — Khác biệt

| | Run 1 | Run 2 |
|---|---|---|
| Compute server | *"Jerry Luo's code providing JSON output schema"* | *"Compute server API (port 5001) implemented and returning `cash_forecast_response.json`"* |
| Datalake | *"Datalake loading specs per KS-934"* | *"Datalake data loaded per KS-934 schedule"* |

---

## 5. Resolved Clarifications — Khác biệt

| # | Clarification | Run 1 | Run 2 |
|---|---|---|---|
| 1 | `fad_beta` source | ✅ Có | ✅ Có |
| 2 | `deriv_notional_value` always today | ✅ Có | ✅ Có |
| 3 | JSON field `deriv_notional_value` | ✅ `body.base.deriv_notional_value` | ✅ `body.base['deriv_notional_value']` (Python notation) |
| 4 | Chart column mapping | ✅ Có | ✅ Có |
| 5 | Capital Calls & Distributions separate | ✅ Có | ✅ Có |
| 6 | Trailing 30/90-day scheduler | ✅ Có | ✅ Có |
| 7 | beta/beta contribution/beta impact source | ✅ Có | ✅ Có (thêm date 2026-03-30) |
| 8 | Transactions table structure | ❌ Không có | ✅ **MỚI**: *"transactions table JSON = loaded data + computed columns + hypothetical trades"* (Jerry Luo 2026-03-30) |
| 9 | Fixed Income dynamic | ✅ Có | ✅ Có |
| 10 | Total Cash mimic screen | ❌ Không có riêng | ✅ **MỚI**: tách thành clarification riêng |
| 11 | 3rd chart removed | ✅ Có | ✅ Có |
| **Tổng** | | **9 items** | **10 items** |

---

## 6. Open Questions — Khác biệt

| Open Question | Run 1 | Run 2 |
|---|---|---|
| Dashboard Initial Load | Ngắn: *"Awaiting response"* | **Đầy đủ hơn**: thêm phân tích hệ quả *"This determines whether the charts are populated on initial render or only after a user action"* |
| Fixed Income completeness | *"does a config change be required?"* (lỗi ngữ pháp nhỏ) | *"is a config change required on the frontend?"* (chính xác) |

---

## 7. Tổng kết — Đánh giá chất lượng

| Tiêu chí đánh giá | Run 1 | Run 2 |
|---|---|---|
| Số comments xử lý | 15 | **16** ✅ |
| Functional Areas có giá trị thực | 6/7 (FA7 = TBD placeholder) | **7/7** ✅ |
| Scope đầy đủ | ⚠️ Thiếu 3 items | ✅ Đầy đủ |
| Resolved Clarifications | 9 | **10** ✅ |
| Open Questions chất lượng | ⚠️ Ngắn gọn | ✅ Có phân tích hệ quả |
| Traceability (participants, timestamp) | ❌ Không có | ✅ Có đủ |

> **Kết luận:** Run 2 (`KS-939_requirements_20260331.md`) là phiên bản chính xác và đầy đủ hơn tại thời điểm 2026-03-31T14:34 ICT, và nên được dùng làm input cho skill `create-qg-jira-tasks-from-ks` khi muốn tạo Jira task hierarchy.

---

*Document generated by: `analyze-synthesize-ks-ticket` skill — comparison module*
*Next step: dùng `KS-939_requirements_20260331.md` làm input cho `create-qg-jira-tasks-from-ks`*
