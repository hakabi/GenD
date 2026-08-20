# Taxonomy Test Case cho Aloha — bộ chuẩn

**Phiên bản:** 3.0 · **Owner:** BA · **Trạng thái:** Bản nháp — **chưa công bố lên Knowledge** · **Sửa lần cuối:** 6 tháng 8, 2026

> 🇻🇳 **Đây là bản dịch tiếng Việt của [`Aloha_Test_Case_Taxonomy.md`](./Aloha_Test_Case_Taxonomy.md).**
> Bản tiếng Anh là **bản gốc có hiệu lực** — khi hai bản khác nhau, lấy bản tiếng Anh làm chuẩn.
> Khi cập nhật, sửa bản tiếng Anh trước rồi dịch lại phần đã sửa.
>
> ⚠️ **Bản dịch này chỉ dành cho người đọc — TUYỆT ĐỐI KHÔNG đưa file này lên Knowledge base.**
> File được đưa lên Knowledge phải là **bản tiếng Anh**, vì bộ phân loại (classifier) đọc trực tiếp từ đó và
> mọi giá trị trong bộ từ vựng đều là định danh tiếng Anh. Đưa nhầm bản tiếng Việt lên sẽ khiến bộ phân loại
> nhận hai phiên bản mâu thuẫn của cùng một danh sách.
>
> Vì lý do đó, **toàn bộ giá trị trong bộ từ vựng được giữ nguyên tiếng Anh** — chúng là định danh chứ không
> phải văn bản. Chỉ phần diễn giải được dịch.

> ⛔ **Đang bị chặn trước khi công bố.** Nền tảng đã tồn tại một **"Phase A taxonomy"**
> (`fix(catalog): prefer managed app_project for Phase A taxonomy`, 4/8/2026). Cho tới khi PO xác nhận nó bao
> phủ những gì, file này chưa được copy vào Knowledge base — xem quyết định 5 trong
> [`Harness_Case_Classification_Plan.md`](../00_Active/Harness_Case_Classification_Plan.md) §9
> (bản tiếng Việt: [`Harness_Case_Classification_Plan_VN.md`](../00_Active/Harness_Case_Classification_Plan_VN.md)).

> **File này chỉ chứa bộ từ vựng — không có gì khác.** Đề xuất, kế hoạch triển khai, trạng thái và các quyết
> định còn treo nằm trong [`Harness_Case_Classification_Plan.md`](../00_Active/Harness_Case_Classification_Plan.md).

> **v3.0 — ba trường, không phải năm trục.** Bộ chuẩn nay được diễn đạt bằng **ba trường Harness đã có sẵn** —
> `feature`, `category`, `labels[]` — thay cho năm trục riêng. Không mất thông tin: các chiều cắt ngang (suite,
> quỹ, môi trường, ưu tiên, metric, ticket) nằm trong trường `labels[]` đa trị **có namespace**. **Mọi giá trị
> từ vựng giữ nguyên như v2.1** — chỉ đổi cách trình bày và chỗ chứa của suite/tags. Xem
> [`De_Xuat_Phan_Loai_3_Truong_VN.md`](./De_Xuat_Phan_Loai_3_Truong_VN.md) và bản EN v3.0.

---

## 0. Tên trường chuẩn

Đối tượng case của Harness vốn đã mang sẵn ba trường phân loại này, cộng một bộ chọn project và một trường
triage lỗi riêng. `QA_Test_Plan.md` §3 lại dùng cùng một số từ cho những thứ khác nhau, nên phải chọn một cách
gọi làm chuẩn. **Tên trường của Harness là chuẩn** — vì chúng đã có sẵn trong code, trong API và trên màn hình.

| Khái niệm | Trường chuẩn | QA_Test_Plan §3 gọi là |
|---|---|---|
| Module Aloha (Risk, Overview, …) + khu vực con | **`feature`** (`area/sub-area`, ≤ 2 tầng) | "Category" |
| Ý định kiểm thử (positive / negative / …) | **`category`** | "Tags → Type" |
| Mọi chiều cắt ngang (suite, quỹ, env, metric, ưu tiên, ticket) | **`labels[]`** (có namespace, đa trị) | "Tags → Type" |
| Ứng dụng đang được kiểm thử | `project` *(bộ chọn sẵn có — chọn một lần, không phải trường phân loại)* | — |
| Phân loại nguyên nhân lỗi | `triage` / **`Reason`** trên UI | "Triage" |

Khi đọc kế hoạch của QA, hãy quy đổi theo bảng trên.

> **`Reason` không phải là `category`.** Trang Cases trên hệ thống thật có bộ lọc **Reason** — đó là trường
> *triage* (vì sao một lần chạy thất bại), gồm bốn giá trị: `Unlabeled` · `Product bug` · `Test defect` ·
> `Feature unavailable`. Nó được gán **sau khi** chạy. Còn `category` (§2.3) được gán **khi viết case** và mô
> tả ý định. Hai trục hoàn toàn khác nhau, nhưng trên thanh lọc thì trông đều giống "loại".

---

## 1. Ba trường, nhiều chiều

Một case không bao giờ chỉ là một thứ. `scenario-negative-input-no-nan` vừa là Scenario Test, **vừa** là
negative, **vừa** là P1, **vừa** chỉ chạy trên lab, **và** có liên quan tới NAV. Nên phân loại vẫn **đa diện
(faceted)** — nhưng được chuyển tải qua **ba trường**, không phải năm cột riêng. Mấu chốt: `labels[]` là trường
**đa trị và có namespace**, nên nó mang nhiều chiều cùng lúc (`fund:public` và `metric:nav` là hai chiều khác
nhau, cùng nằm trong một trường, vẫn truy vấn riêng được).

**Ba trường (cột trên màn hình):**

| # | Trường | Bộ từ vựng | Số giá trị mỗi case |
|---|---|---|---|
| 1 | **`feature`** (`area/sub-area`) | đóng, ≤ 2 tầng | đúng 1 khu vực (+ khu vực con tuỳ chọn) |
| 2 | **`category`** | đóng | đúng 1 |
| 3 | **`labels[]`** | đóng, **có namespace** | 0 hoặc nhiều |

**Cộng một bộ chọn sẵn có:** `project` (`aloha` / `harness` / `dynamo`) — chọn một lần ở sidebar, không gắn theo
từng case.

> **Ba trường, nhưng không mất chiều nào.** Các chiều (khu vực, khu vực con, ý định, suite, quỹ, môi trường, ưu
> tiên, metric, ticket) đều còn — `feature` và `category` đơn trị; phần còn lại nằm trong `labels[]` có
> namespace. Số trường là ba; số chiều không đổi.

---

## 2. Bộ từ vựng

> Mọi giá trị dưới đây là **định danh, giữ nguyên tiếng Anh**. Không dịch chúng.

### 2.1 `project`
`aloha` · `harness` · `dynamo` *(dự phòng)*

### 2.2 `feature` — 10 khu vực, đã đóng băng

Cấp 1 là danh sách đóng. Cấp 2 chỉ được mở rộng **khi có phê duyệt**. **Độ sâu tối đa là hai cấp** — cây sâu
hơn sẽ mục ruỗng.

| Khu vực | Khu vực con |
|---|---|
| `navigation` | `app-load` · `session-auth` · `fund-tabs` · `tab-switching` · `deep-link` · `browser-history` |
| `overview` | `header-metrics` · `asset-tree` · `sort` · `filters` · `rating-dialog` · `charts` · `fad-percent` · `benchmarks` |
| `risk` | `dashboard` · `total-risk-table` · `allocation-chart` · `top-contributors` · `top-ten-tables` · `subtabs` · `parameters` · `history` · `report-download` |
| `scenario-test` | `input-table` · `recalculation` · `prior-day-comparison` · `row-expansion` · `search-filter` · `print` · `reset-on-refresh` |
| `return-public` | `tab-load` · `returns-table` · `period-metrics` |
| `return-private` | `tab-load` · `returns-table` · `period-metrics` |
| `liquidity` | `tab-load` · `liquidity-table` |
| `search-export` | `fund-search` · `search-empty-state` · `excel-export` · `csv-export` · `print` |
| `cash-forecast` | `cf-navigation` · `forecast-params` · `summary-card` · `projected-balance-chart` · `hypothetical-flows` · `calculate-impact` · `drill-down` · `historical-net-flow` · `historical-calls-distributions` · `pct-of-nav-table` · `details-transactions` · `fad-beta-autofetch` · `cf-export` |
| `fund-admin` | `fund-setup` · `upload` · `permissions` |

Nếu không có giá trị nào phù hợp, dùng **`unclassified`** và gửi yêu cầu bổ sung từ vựng.
**Tuyệt đối không tự tạo giá trị mới.**

### 2.3 `category` — loại test
`positive` · `negative` · `boundary` · `security` · `data-integrity`

`data-integrity` được tách riêng khỏi `negative` một cách có chủ ý: trên một nền tảng tài chính, "con số bị
sai" là một loại lỗi khác hẳn với "cái nút bị hỏng" — khác mức độ nghiêm trọng, khác người chịu trách nhiệm,
và cần Product Owner làm người phán quyết. *(`accessibility` tạm hoãn.)*

### 2.4 `labels[]` — đa trị, có namespace

**Trường duy nhất này gánh mọi chiều cắt ngang.** Mỗi giá trị **bắt buộc có tiền tố namespace** (trừ các cờ vòng
đời). Đây là thứ giữ cho `labels[]` không sụp thành túi văn bản tự do như hiện nay.

| Namespace | Giá trị |
|---|---|
| `suite:` | `smoke` · `regression` · `bug-repro` · `exploratory` · `uat` |
| `fund:` | `total-endowment` · `public` · `private` · `pipeline` |
| `env:` | `lab` · `conceptia` |
| `pri:` | `P1` · `P2` · `P3` |
| `metric:` | `nav` · `beta` · `risk` · `mtd` · `qtd` · `fytd` · `rating` · `unfunded` · `illiquid` · `fad` |
| `jira:` | mã ticket bất kỳ, ví dụ `KS-963` |
| vòng đời *(không tiền tố)* | `writes-data` · `flaky` · `quarantine` · `deprecated` |

`suite:` chính là trường `label` cũ — nay nằm trong `labels[]`, có tiền tố, nên "thuộc bộ test nào" vẫn truy vấn
được (`labels chứa suite:smoke`).

`writes-data` thay thế cột "Conceptia-ready = Never" trong file inventory — cùng ý nghĩa, nhưng máy đọc được.

`metric:` tồn tại để trả lời câu hỏi *"công thức tính NAV vừa thay đổi — những case nào phải chạy lại?"* trên
toàn bộ các khu vực.

### 2.5 Định danh

- **Group ID** — `aloha/cash-forecast/hypothetical-flows`
- **Case ID** — `ALO-CF-HYPFLOW-003`
- **Tên case** — giữ nguyên quy ước: `<expected-behavior>-when-<action>`,
  ví dụ `rating-dialog-appears-when-clicking-final-fund`

---

## 3. Quy tắc gán nhãn

Phân loại diễn ra **ngay tại thời điểm tiếp nhận request**. Các đợt dọn dẹp về sau không bao giờ thực sự xảy ra.

1. **Chuẩn hoá** nội dung prompt.
2. **Lượt luật từ khoá** — đối sánh xác định. Không tốn chi phí nên chạy trước và xử lý phần lớn trường hợp.
3. **Lượt LLM** — chỉ dành cho phần luật chưa xử lý được, và chỉ chọn trong bộ từ vựng này.
4. **Cổng độ tin cậy** — từ 0,80 trở lên thì áp dụng tự động; thấp hơn thì chuyển cho người xử lý.

**Ràng buộc bắt buộc với bộ phân loại:** *chỉ chọn trong các danh sách ở §2. Nếu không giá trị nào phù hợp,
trả về `unclassified` kèm giải thích. Tuyệt đối không tạo giá trị mới. Mọi giá trị `labels[]` phải có namespace.*

Một số luật từ khoá tiêu biểu:

| Prompt có chứa | Gán |
|---|---|
| `Scenario Test tab` | `feature: scenario-test` |
| `Cash Forecast` + `Historical` | `feature: cash-forecast/historical-net-flow` |
| `Public Fund tab` | `labels: fund:public` |
| `Export Excel` | `feature: search-export/excel-export` |
| `NaN`, `not blank`, `numeric` | `category: data-integrity` |
| `NAV`, `Beta`, `% of FAD` | `labels: metric:nav`, `metric:beta`, `metric:fad` |
| `smoke`, `regression` | `labels: suite:smoke`, `suite:regression` |
| `workbench-app.lab.gend.vn` | `labels: env:lab` |

Định dạng kết quả bắt buộc của bộ phân loại — **ba trường cộng project ambient**:

```json
{
  "project":  "aloha",
  "feature":  "cash-forecast/hypothetical-flows",
  "category": "negative",
  "labels":   ["suite:regression", "fund:total-endowment", "env:lab", "pri:P1", "metric:nav", "jira:KS-963"],
  "confidence": 0.91,
  "rationale":  "Prompt saves a hypothetical flow then asserts an error on an invalid amount."
}
```

---

## 4. Quy tắc nhóm

**Một nhóm là một truy vấn đã lưu, không phải một thư mục.**
`project:aloha AND feature:cash-forecast AND labels chứa suite:smoke`.
Case mới khớp điều kiện sẽ tự động gia nhập; không có gì bị sao chép và không có gì bị lỗi thời.

**Chuỗi có thứ tự là ngoại lệ.** Chỉ dùng một trình tự tường minh khi trạng thái thực sự được mang từ bước này
sang bước kia — *nhập Scenario Flow → kiểm tra tính lại → refresh → kiểm tra đã reset*. Loại này tốn công bảo
trì hơn nên hãy dùng thật hạn chế.

**Quy tắc kích thước nhóm lá.** Hướng tới **8–15 case cho mỗi khu vực con**.

- Trên ~25 → tách khu vực con
- Dưới 3 → gộp lại

Đây là phép kiểm tra sức khoẻ giữ cho taxonomy trung thực khi catalog phình to. Bộ từ vựng ở trên được thiết
kế cho khoảng **45 nhóm lá** ứng với dự kiến ~260–320 case khi phủ đủ — nghĩa là khoảng 6 case mỗi nhóm ở thời
điểm hiện tại, và 12–15 khi phủ đủ.

---

## 5. Di chuyển — ánh xạ các giá trị hiện tại sang bộ từ vựng này

Đo trên catalog thật ngày 6 tháng 8, 2026: **313 case mang 203 giá trị `feature` khác nhau**, trong đó **165 là
tên case bị cắt cụt và chỉ dùng đúng một lần**. Khoảng 29 giá trị là có nghĩa. `category` = `default` cho cả 313;
`labels[]` gần như không dùng (và pool gợi ý của nó đã lẫn mã Jira và tên project). Đây chính là bảng
`alias → canonical` mà §6 yêu cầu.

### 5.1 Bảng ánh xạ bí danh

| Giá trị đang dùng hiện nay | Ánh xạ thành | |
|---|---|---|
| `public-fund-risk` · `total-endowment-risk` · `total-endowment-risk-tab` · `risk-dashboard` | `feature: risk/dashboard` | + `labels: fund:*` từ tiền tố |
| `risk-history` · `total-endowment-risk-history` | `feature: risk/history` | + `fund:` |
| `risk-scenario-testing` | `feature: risk/subtabs` | **không phải** `scenario-test` — đây là sub-tab của tab Risk |
| `scenario-test` | `feature: scenario-test/input-table` | |
| `endowment-overview` · `public-fund-overview` | `feature: overview/header-metrics` | + `labels: fund:*` |
| `overview-fund-selection` | `feature: overview/asset-tree` | |
| `rating` · `fund-rating` | `feature: overview/rating-dialog` | |
| `search` · `fund-search` · `search-and-navigation` | `feature: search-export/fund-search` | |
| `export-excel` | `feature: search-export/excel-export` | |
| `fund-nav-validation` | `feature: overview/header-metrics` + `labels: metric:nav` | |
| `cash-forecast` | `feature: cash-forecast/*` | đã đúng — chỉ cần bổ sung khu vực con |
| `pipeline` · `pipeline-tab` · `pipeline-navigation` | `feature: navigation/fund-tabs` + `labels: fund:pipeline` | |
| `private-fund` · `total-endowment` | `feature: navigation/fund-tabs` + `labels: fund:*` | |
| `fund-setup` · `total-endowment-upload` | `feature: fund-admin/fund-setup \| upload` | |
| `settings-projects` | `project: harness` — không phải case của Aloha | |
| `aloha` · `harness` *(dùng làm feature/label)* | thuộc `project` — sai trường, bỏ | |
| `regression` · `demo-only` | `labels: suite:regression` — thêm namespace | |
| `FNC-001` · `PL-UI` · `UI-001` | `labels: jira:*` — thêm namespace | |
| *~165 tên case bị cắt cụt* | **`unclassified`** → phân loại lại từ prompt gốc | |

### 5.2 Hai bài học mà bảng này ghi lại

**Phạm vi quỹ đã bị gộp nhầm vào khu vực chức năng.** `public-fund-risk` và `total-endowment-risk` là **cùng
một khu vực**, chỉ khác quỹ được kiểm thử. Chuyển phạm vi quỹ ra thành giá trị `labels: fund:*` chính là điều làm
**hai mươi** giá trị Risk trên hệ thống thật gộp lại thành một — và cũng chính là điều làm cho `--grep @risk` trả
về mọi case Risk trên cả bốn quỹ.

**Ba thứ đang dùng chung một trường `feature`.** Tên project, tên bộ test và mã ticket đều rơi vào cùng danh sách
chọn với khu vực chức năng. Nay mỗi thứ đã có chỗ: `project` (sẵn có), `labels: suite:*`, `labels: jira:*`.

---

## 6. Quản trị

| Quy tắc | Chi tiết |
|---|---|
| Nguồn chuẩn | Chính file này, có đánh phiên bản, được công bố lên Knowledge dưới tên `project/aloha/ALOHA-TAXONOMY.md` *(bản tiếng Anh)* |
| Quy trình thay đổi | BA đề xuất → PO duyệt → tăng phiên bản → chỉ phân loại lại các case đang `unclassified` |
| Bí danh | Duy trì bảng `alias → canonical` để giá trị cũ được chuyển tiếp thay vì rẽ nhánh |
| Nhịp rà soát | Hàng tháng — hàng đợi unclassified, kích thước nhóm lá, các yêu cầu bổ sung khu vực con đang chờ |
| Độ chính xác | Golden set 30–50 case gán nhãn thủ công; mục tiêu ≥ 90% với `feature`, ≥ 80% với khu vực con (`sub-area`) |

**Hai điều bất di bất dịch.** (1) **Từ vựng đóng** — cả ba trường chỉ nhận giá trị đã duyệt; nhập tự do chính là
thứ tạo ra 203 giá trị cho 313 case. (2) **`labels[]` có namespace** — giá trị không tiền tố bị từ chối; một túi
`labels[]` mở sẽ sụp y hệt `feature`.

**Chống lại việc phình to.** Bộ từ vựng được cố ý đóng băng ở 10 khu vực / 5 loại test / một bộ namespace cố định. Mỗi giá trị
mới là một thất bại tra cứu đang chờ xảy ra — một case được xếp vào giá trị mà không ai khác nghĩ tới khi đi tìm.

---

## Nhật ký thay đổi

| Ngày | Phiên bản | Thay đổi |
|---|---|---|
| 2026-08-06 | 3.0 | **Chuyển từ "năm trục" sang "ba trường"** (`feature` · `category` · `labels[]`). Gộp `label` (suite) và `tags[]` cũ vào một trường `labels[]` **có namespace**; `project` là bộ chọn sẵn có. **Giá trị từ vựng giữ nguyên.** Cập nhật baseline §5 sang số đo live 6/8 (313 case / 203 feature / 165 dùng 1 lần / Risk = 20 giá trị) |
| 2026-08-04 | 2.1 | Bổ sung §5 bảng di chuyển/ánh xạ bí danh, khởi tạo từ 35 giá trị có nghĩa trong catalog thật (287 case, ~237 giá trị). Làm rõ rằng trường **Reason** trên UI là triage chứ không phải `category`, và chỉ có bốn giá trị |
| 2026-08-03 | 2.0 | Rút gọn chỉ còn phần bộ chuẩn. Đề xuất, ticket, phát hiện thực tế và các câu hỏi treo được chuyển sang `Harness_Case_Classification_Plan.md` |
| 2026-08-03 | 1.1 | Bổ sung §10 các phát hiện đã kiểm chứng trên hệ thống thật |
| 2026-07-31 | 1.0 | Bản nháp đầu tiên |

---

*Bản dịch tiếng Việt lập ngày 4/8/2026 từ bản gốc v2.1. Khi bản gốc thay đổi, cập nhật bản gốc trước rồi dịch
lại phần tương ứng. **Chỉ bản tiếng Anh được đưa lên Knowledge base.***
