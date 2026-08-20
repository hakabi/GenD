# Harness — Phân loại Test Case: Kế hoạch, Đặc tả & Trạng thái

**Owner:** BA · **Phiên bản:** 1.5 · **Tạo ngày:** 3 tháng 8, 2026 · **Bảng trạng thái cập nhật lần cuối:** 6 tháng 8, 2026
**Epic:** [QG-138 — Harness Automation Test](https://gendvn.atlassian.net/browse/QG-138)
**Mockup:** [`Harness_TestCaseFactory_Workflow_Mockup.html`](../03_Mockups/Harness_TestCaseFactory_Workflow_Mockup.html) · bản tổng quan: [`Harness_Workflow_Overview_Mockup.html`](../03_Mockups/Harness_Workflow_Overview_Mockup.html)
**Bộ chuẩn (standard):** [`Aloha_Test_Case_Taxonomy.md`](../01_Plans_and_Strategy/Aloha_Test_Case_Taxonomy.md) — bộ từ vựng nằm ở file đó
**Theo dõi release:** [`Harness_Release_Log.md`](./Harness_Release_Log.md) — Harness deploy nhiều lần mỗi ngày

> 🇻🇳 **Đây là bản dịch tiếng Việt của [`Harness_Case_Classification_Plan.md`](./Harness_Case_Classification_Plan.md).**
> Bản tiếng Anh là **bản gốc có hiệu lực** — khi hai bản khác nhau, lấy bản tiếng Anh làm chuẩn.
> Khi cập nhật nội dung, sửa bản tiếng Anh trước rồi dịch lại phần đã sửa.
> Các thuật ngữ kỹ thuật, tên trường, tên file, mã commit và nội dung code được giữ nguyên tiếng Anh
> vì đó là những gì hiển thị trong hệ thống.

> **Đây là tài liệu duy nhất cho sáng kiến này.** Đề xuất (§1–§5), trạng thái triển khai (§6), chỉ số theo dõi (§7),
> **bảng đối chiếu khác biệt (§8)**, các quyết định còn treo (§9) và backlog tương lai (§10).
>
> **§6 là nơi duy nhất ghi nhận trạng thái.** Cập nhật ở đó, không ghi ở chỗ nào khác.
>
> **§8 là nơi để xem đề xuất của chúng ta khác gì so với những gì Harness thực sự đang làm hiện nay.**
> Harness đang được phát triển song song với kế hoạch này; một số hạng mục đã được làm xong, và một hạng mục
> có thể trùng lặp với công việc đang có. Đọc §8 trước khi trình bày bất cứ thứ gì với PO.
>
> **Cập nhật cách trình bày (6/8 — v1.5).** Bộ chuẩn nay diễn đạt bằng **ba trường** — `feature`
> (`area/sub-area`) · `category` · `labels[]` đa trị có namespace — đúng ba trường Harness đã có. Khung "năm
> trục" cũ tách `label` (suite) và `tags[]` thành cột riêng; nay chúng nằm **trong `labels[]`** với namespace
> (`suite:`, `fund:`, `env:`, `pri:`, `metric:`, `jira:`). `project` là bộ chọn sẵn có, không phải trường phân
> loại. **Từ vựng không đổi** — xem taxonomy v3.0 và `De_Xuat_Phan_Loai_3_Truong_VN.md`.

---

## 1. Tóm tắt — một trang dành cho PO

**Vấn đề.** Test case được sinh ra từ các prompt dạng văn bản tự do. Hai trường lẽ ra dùng để nhóm chúng lại — `Feature` và `Labels` — là văn bản tự do do LLM điền, và chúng đã sụp đổ.

**Số liệu đo trên hệ thống thật — cập nhật live 6 tháng 8, 2026 (`/api/platform/cases`):**

| | 4/8 | **Live 6/8** |
|---|---|---|
| Số case trong catalog | 287 | **313** (245 aloha + 68 harness) |
| Số giá trị `feature` khác nhau | ~237 | **203** |
| `feature` dùng đúng 1 lần | ~202 | **165** |
| `category` | — | **`default` cho cả 313** |
| Risk bị xé thành | 7 | **20 giá trị `feature`** |

**Trường `feature` đang không nhóm được gì cả — nó hoạt động như một mã ID thứ hai.**

**Đề xuất.** Cung cấp cho Harness một **bộ từ vựng đóng** cho chính những trường đã có sẵn, phân loại từng request ngay tại thời điểm tiếp nhận, và cho phép định nghĩa thành viên của nhóm bằng một câu truy vấn thay vì một danh sách tick tay.

**Vì sao là bây giờ.** `Feature` vừa là **một thư mục trên ổ đĩa**, vừa là **một Playwright tag**. Mỗi giá trị bị trôi dạt sẽ làm phân mảnh vĩnh viễn test repo và làm hỏng việc chạy theo tag. Chờ đợi không có nghĩa là "nhãn sẽ lộn xộn hơn một chút sau này" — mà là sẽ có nhiều thư mục hơn phải di chuyển và quá trình backfill sẽ dài hơn.

**Chi phí.** Ít hơn ước tính ban đầu. Bộ lọc theo facet đã ra ngày 3/8, cơ chế dedupe ngữ nghĩa đã ra ngày 1/8, và Test groups đã ra ngày 3/8. Phần còn lại chủ yếu là **quản trị (governance)**, không phải xây dựng — xem §8.

---

## 2. Vấn đề, kèm bằng chứng

Tất cả đều quan sát trực tiếp trên hệ thống thật, không phải suy đoán.

**2.1 Bộ từ vựng đã sụp đổ.** 237 giá trị khác nhau cho 287 case. Khoảng 35 giá trị thực sự có nghĩa cho thấy rõ kiểu trôi dạt:

| Cùng một ý định | Các giá trị đang thực sự được dùng |
|---|---|
| **Risk** | `risk-dashboard` · `risk-history` · `risk-scenario-testing` · `public-fund-risk` · `total-endowment-risk` · `total-endowment-risk-history` · `total-endowment-risk-tab` |
| **Pipeline** | `pipeline` · `pipeline-navigation` · `pipeline-tab` |
| **Search** | `search` · `fund-search` · `search-and-navigation` |
| **Overview** | `endowment-overview` · `overview-fund-selection` · `public-fund-overview` |
| **Rating** | `rating` · `fund-rating` |

Riêng Risk đã có bảy giá trị. Trộn lẫn trong cùng danh sách chọn còn có tên project (`aloha`, `harness`), tên bộ test (`regression`, `demo-only`) và mã ticket (`FNC-001`, `PL-UI`, `UI-001`) — **ba trục khác nhau đang dùng chung một trường**.

**2.2 Khoảng 202 giá trị còn lại là tên case bị cắt cụt**, cắt giữa từ ở khoảng 47 ký tự:

```
all-cases-list-loads-with-pagination-or-scrollab
app-redirects-to-case-review-with-case-review-pa
application-loads-without-redirect-loop-and-disp
calendar-table-is-displayed-when-clicking-the-ca
```

Một giá trị chỉ áp dụng cho đúng một case thì không nhóm được gì.

**2.3 `Feature` gánh hai vai trò cùng lúc.** Dòng hướng dẫn trong UI: *"Folder the generated test lands in. Auto-detected if left blank."* Các artefact được sinh ra:

```
tests/playwright/aloha/generated/public-fund-risk/risk-model-dashboard-…-461dc2.spec.ts
… @aloha @public-fund-risk @qops › Click Risk tab and verify dashboard elements
```

Vì vậy `--grep @risk` không trả về gì hữu ích, bởi tag thực tế là `@public-fund-risk`, `@risk-dashboard`, hay `@total-endowment-risk-tab` tuỳ vào ai viết prompt.

**2.4 Khối lượng vẫn đang tăng.** Khoảng 94 hành vi có thể kiểm thử riêng biệt trên Aloha; khoảng 260–320 case nếu phủ đủ mọi phạm vi quỹ. Catalog hiện đã ở mức 287.

---

## 3. Phạm vi

**Trong phạm vi** — bộ từ vựng đóng có quản trị; phân loại tự động tại thời điểm tiếp nhận kèm phương án dự phòng cho người; phát hiện trùng lặp có giới hạn theo nhãn; định nghĩa thành viên nhóm bằng truy vấn.

**Ngoài phạm vi** — cách case được sinh ra hoặc thực thi; tên các bước nội bộ (`crew_phase_a_build`, `render_nlonly_spec`, …) mà team đang dựa vào; bản thân ứng dụng Aloha; viết lại các case hiện có (BACKFILL chỉ gán lại nhãn, không viết lại nội dung).

---

## 4. Cách hoạt động

Toàn bộ luồng được vẽ trong [mockup luồng công việc](../03_Mockups/Harness_TestCaseFactory_Workflow_Mockup.html). Diễn giải bằng lời — **mỗi hạng mục ở §5 đều được in đậm tại vị trí nó xuất hiện**, nên phần này đồng thời là bản đồ dẫn vào các đặc tả:

QA viết một request bằng tiếng Anh thông thường, có thể nêu thêm khu vực (area) nếu muốn. Harness kiểm tra tính hợp lệ của request (**`VALIDATE`** — hiện nay kiểm tra này mỏng hơn nhiều so với vẻ ngoài của nó), rồi phân loại (**`CLASSIFY`**) — trước tiên là các luật từ khoá xác định vì chúng không tốn chi phí, sau đó mới đến LLM cho những gì luật chưa xử lý được, và luôn chỉ chọn trong danh sách đóng do Knowledge base cung cấp (**`VOCAB`**). Nếu bộ phân loại không đủ tự tin, request sẽ rơi vào hàng đợi "Needs labeling" (**`QUEUE`**) thay vì bị đoán bừa.

Request sau đó được kiểm tra trùng lặp với các request trước đó trong cùng khu vực. Harness dựng các bước test, mở rộng thành một nhóm case khi chế độ yêu cầu, và mỗi case sinh ra sẽ **kế thừa nhãn và `sub_area` của request cha** (**`MODEL`**) — chỉ khác nhau ở loại test giữa các case anh em. Mỗi case được đối chiếu với các case hiện có trong cùng nhóm trước khi vào catalog.

QA rà soát và xác nhận, phần automation được dựng và chạy, các lỗi được phân loại (triage). Vì mọi case đều mang nhãn, các lỗi sẽ tự gom cụm theo khu vực thay vì đổ về dưới dạng một danh sách phẳng.

Cuối cùng, nhãn làm cho catalog có thể điều hướng được: nhóm có thể định nghĩa bằng truy vấn để case mới tự động gia nhập (**`GROUPS`**), một lưới độ phủ cho thấy tổ hợp khu vực × loại test nào đang trống (**`HEATMAP`**), và một truy vấn tác động trả lời được case nào có liên quan tới một chỉ số tài chính cụ thể. Chính các khoảng trống đó dẫn dắt request tiếp theo — vòng lặp khép kín.

> **Hai hạng mục cố ý không xuất hiện ở trên.** **`BACKFILL`** là một đợt di chuyển dữ liệu một lần trên 287
> case hiện có, không thuộc luồng vận hành thường xuyên mô tả ở đây. **`FILTERS`** đã được nền tảng bàn giao
> ngày 3/8, nên không còn công việc tương lai nào để mô tả.
>
> **Hai bước kiểm tra trùng lặp** ở đoạn thứ hai chính là Gate C (mức request) và Gate E (mức case) trong
> mockup. Cả hai đều không phải hạng mục xây mới — Harness đã có sẵn cơ chế dedupe bằng vector/ANN, nên phần
> đóng góp của chúng ta là giới hạn nó theo nhãn. Xem §8 D3.

**Bộ từ vựng không được định nghĩa ở đây.** Nó nằm trong [`Aloha_Test_Case_Taxonomy.md`](../01_Plans_and_Strategy/Aloha_Test_Case_Taxonomy.md) để có thể copy nguyên văn vào Knowledge base dưới tên `project/aloha/ALOHA-TAXONOMY.md`.

### 4.1 Ví dụ minh hoạ

Một request có thật — `#c1017339-45b`, gửi ngày 3/8/2026. Dưới đây là cách nó đi qua luồng theo §5, và sau đó là những gì thực sự đã xảy ra với nó trong ngày hôm đó.

**QA viết gì**

```
Project: aloha
Area: risk                        ← không bắt buộc; bộ phân loại tự suy ra nếu bỏ trống
Go to workbench-app.lab.gend.vn
Assume the menu 'Public Fund' is displayed.
Click on the 'Risk' tab.
Verify the 'Risk Model Dashboard' is displayed.
Verify the 'Total Risk' table is displayed.
Verify the 'Download Report' button is displayed.
```

**Request đi qua các bước**

| # | Bước | Hạng mục | Điều gì xảy ra |
|---|---|---|---|
| 1 | Gate A | **`VALIDATE`** | Có `Project: aloha` ✓ · có URL đích ✓ · `Risk` đúng là một tab có thật của Aloha ✓ → đi qua không cần hỏi. Nếu người viết gõ nhầm `Fun Setup`, hệ thống sẽ gợi ý *"ý bạn là Fund Setup?"* **trước khi** submit, chứ không phải sau một lần chạy thất bại |
| 2 | Luật từ khoá | **`CLASSIFY`** | `'Risk' tab` → `feature: risk` · `'Public Fund'` → `fund:public` · `workbench-app.lab.gend.vn` → `env:lab` · `Total Risk` → `metric:risk`. Xác định, không tốn token |
| 3 | Lượt LLM | **`CLASSIFY`** + **`VOCAB`** | Chỉ còn `sub_area` chưa xác định. LLM chọn `dashboard` từ danh sách đóng. **Không thể tự bịa ra `public-fund-risk`** — giá trị đó không có trong bộ từ vựng |
| 4 | Gate B | **`QUEUE`** | Độ tin cậy `0,94` ≥ 0,80 → áp dụng tự động. Nếu thấp hơn ngưỡng, request sẽ nằm chờ trong hàng đợi Needs-labeling thay vì bị đoán bừa |
| 5 | Gate C | *(§8 D3)* | Chỉ đối chiếu trùng lặp với các request trước đó trong `aloha/risk/dashboard` — khoảng 7 ứng viên, không phải 287 |
| 6 | Sinh case | *(đã có)* | Chế độ Test Feature mở rộng thành một nhóm case: positive / negative / boundary |
| 7 | Kế thừa | **`MODEL`** | Mọi case con đều kế thừa `feature:risk`, `sub_area:dashboard`, `fund:public`, `env:lab`, `metric:risk`. Chỉ `category` là khác nhau giữa các case anh em |
| 8 | Gate E | *(§8 D3)* | Từng case sinh ra được đối chiếu với chính ~7 ứng viên đó trước khi vào catalog |

**Bộ nhãn cuối cùng mà case mang theo**

```json
{ "project": "aloha", "feature": "risk/dashboard",
  "category": "positive",
  "labels": ["suite:smoke", "fund:public", "env:lab", "pri:P1", "metric:risk"] }
```

**Những gì mở ra ngay khi case vào catalog**

| Truy vấn | Trả về |
|---|---|
| `--grep @risk` | mọi case Risk, trên cả bốn tab quỹ |
| `feature:risk AND labels chứa suite:smoke` | một bộ **`GROUPS`** mà case này **tự gia nhập, không ai phải sửa nhóm** |
| `labels chứa metric:risk` | tập tác động — những gì cần chạy lại nếu công thức tính risk thay đổi |
| Ô **`HEATMAP`** `risk × negative` | cho biết tổ hợp đó đã được phủ hay chưa |

**Thực tế đã xảy ra với request này ngày 3/8**

| | Quan sát được |
|---|---|
| `Feature` | **`public-fund-risk`** — do LLM tự đặt. Nay đã thành một thư mục trên ổ đĩa *và* một Playwright tag |
| `Labels` | *(trống)* |
| Số case sinh ra | một, tên là **"Direct test"** |
| `--grep @risk` | không trả về gì — vì tag thực tế là `@public-fund-risk` |
| Chia sẻ giá trị nhóm với | không case nào khác |

Cùng một prompt, cùng một hệ thống. Khác biệt duy nhất là bộ từ vựng có được đóng lại hay không.

### 4.2 Vẫn ví dụ đó, ánh xạ lên ba trường

Taxonomy vẫn **đa diện (faceted)** — nhưng chuyển tải qua **ba trường**, định nghĩa trong
[`Aloha_Test_Case_Taxonomy.md`](../01_Plans_and_Strategy/Aloha_Test_Case_Taxonomy.md) §1
(bản tiếng Việt: [`Aloha_Test_Case_Taxonomy_VN.md`](../01_Plans_and_Strategy/Aloha_Test_Case_Taxonomy_VN.md)).
Dưới đây là nơi mỗi chiều trong ví dụ trên thực sự nhận được giá trị của nó:

| Trường | Chiều | Giá trị trong ví dụ | Được điền ở | Bởi |
|---|---|---|---|---|
| `project` *(sẵn có)* | app đang test | `aloha` | Phase 1 — dòng `Project:`, điền sẵn từ giá trị mặc định ở sidebar | *(đã có)* |
| **`feature`** | khu vực **+ khu vực con** | `risk/dashboard` | Phase 2 — `'Risk' tab` khớp từ khoá; khu vực con do lượt LLM | **`CLASSIFY`**, bị ràng buộc bởi **`VOCAB`** |
| **`category`** | loại test | `positive` | Phase 3 — gán cho từng case sinh ra | *(đã có — hiện đã tự gán)* |
| **`labels[]`** | suite + quỹ + env + ưu tiên + metric (có namespace) | `suite:smoke` · `fund:public` · `env:lab` · `pri:P1` · `metric:risk` | Phase 2, lượt luật — đều lấy từ nội dung prompt | **`MODEL`** biến thành mảng có namespace, **`CLASSIFY`** điền |

**Ba điều bảng này làm lộ ra.**

**Chỉ `category` là khác nhau giữa các case anh em.** Khi nhóm case mở rộng thành positive / negative / boundary,
`feature` và mọi giá trị `labels[]` được kế thừa **y hệt nhau** — `category` là biến số duy nhất. Đó chính xác là
ý nghĩa của "kế thừa nhãn của request cha", và cũng là lý do một nhóm case luôn đứng cùng nhau trong một nhóm.

**Bước tốn kém nhất lại làm ít việc nhất.** Lượt luật xác định điền khu vực của `feature` và mọi giá trị
`labels[]` — thẳng từ nội dung prompt. LLM chỉ được hỏi đúng một thứ: khu vực con của `feature`. Đó là toàn bộ
lập luận về chi phí cho thứ tự "luật trước, LLM sau".

**`feature` và `category` là đơn giá trị và đóng; `labels[]` là đa giá trị và có namespace.** Sự phân chia này là
có chủ ý: giá trị đơn và đóng làm cho việc nhóm trở nên xác định (một case thuộc đúng một nhóm lá), còn `labels[]`
đa giá trị có namespace là thứ cho phép các truy vấn cắt ngang. `metric:risk` và `fund:public` cắt **ngang qua**
các khu vực — điều chúng không bao giờ làm được nếu bị gộp vào `feature`.

**Và đó chính xác là chỗ đã sai.** Giá trị quan sát được `public-fund-risk` là **`feature` và một nhãn `fund:`
bị hàn dính vào một token duy nhất** — khu vực chức năng (`risk`) bị hàn vào phạm vi quỹ (`fund:public`). Một
giá trị làm hai việc chính là lý do tồn tại **hai mươi** biến thể Risk, là lý do `--grep @risk` không trả về gì
hữu ích, và là lý do 313 case sinh ra 203 giá trị `feature`.

| Truy vấn ở §4.1 | Dùng trường nào |
|---|---|
| `--grep @risk` | `feature` |
| `feature:risk AND labels chứa suite:smoke` | `feature` + `labels[]` |
| `labels chứa metric:risk` | `labels[]` |
| Lưới **`HEATMAP`** | **`feature` × `category`** — bản thân cái lưới *chính là* hai trường giao nhau |

---

## 5. Các thay đổi đề xuất

**Toàn bộ danh sách, theo thứ tự triển khai.** Các hạng mục được **đặt tên chứ không đánh số** — danh sách đã
thay đổi hai lần (FILTERS được nền tảng bàn giao, VALIDATE mới thêm sau), nên bất kỳ cách đánh số nào rồi
cũng lại lệch thứ tự. Các mục bên dưới trình bày theo đúng thứ tự này.

| | Hạng mục | Một dòng mô tả |
|---|---|---|
| 1 | **`VOCAB`** | Đóng bộ từ vựng cho `Feature` và `Labels` — **làm trước tiên** |
| 2 | **`MODEL`** | Thêm khu vực con cho `feature`; biến `labels[]` thành mảng có namespace |
| 3 | **`CLASSIFY`** | Phân loại từng request tại đầu vào |
| 4 | **`QUEUE`** | Hàng đợi "Needs labeling" cho kết quả có độ tin cậy thấp |
| 5 | **`BACKFILL`** | Phân loại lại 287 case hiện có — phải sau `VOCAB` |
| 6 | **`GROUPS`** | Thành viên nhóm theo truy vấn cho các nhóm đã có sẵn |
| 7 | **`HEATMAP`** | Lưới độ phủ trên Dashboard — làm sau cùng |
| — | **`VALIDATE`** | Kiểm tra hợp lệ request tại đầu vào (Gate A). **Nằm ngoài chuỗi** — không chặn hạng mục nào, có thể làm bất cứ lúc nào sau §9 quyết định 1. Được mô tả ở vị trí thứ hai bên dưới vì nó đi cặp với `VOCAB` trên cùng một dialog |
| ✅ | ~~`FILTERS`~~ | Bộ lọc facet trên danh sách Cases — **nền tảng đã bàn giao ngày 3/8** |

> **Ghi chú về cách đặt tên.** Các hạng mục này mang mã `T1`–`T9` cho tới ngày 4/8. Chúng được đổi tên vì các
> con số ngụ ý một thứ tự vốn không tồn tại, và vì `Harness_UXUI_Review.md` đã dùng `T1`–`T5` cho một nhóm
> chủ đề UX xuyên suốt hoàn toàn khác. Bảng ánh xạ nằm trong nhật ký thay đổi.

### VOCAB — Áp dụng bộ từ vựng đóng cho `Feature` và `Labels`

**Thay đổi có giá trị cao nhất, và là thay đổi phải ra trước tiên.** Cả hai trường hiện chấp nhận mọi giá trị, nên mỗi request đều có thể tạo ra một giá trị mới — đó là lý do 287 case sinh ra 237 giá trị. `Feature` trở thành một thư mục và một Playwright tag, nên thiệt hại là vĩnh viễn chứ không chỉ là vấn đề thẩm mỹ.

Thay ô nhập tự do bằng việc chọn từ danh sách đã duyệt. Người viết nếu cần giá trị mới thì gửi yêu cầu; yêu cầu đó chuyển tới người sở hữu bộ từ vựng (§9, quyết định 3).

*Được chấp nhận khi:*
- `Feature` và `Labels` chỉ có thể nhận giá trị đã duyệt, cả **từ UI lẫn từ luồng LLM**
- Người viết có thể yêu cầu giá trị mới mà không bị chặn việc hoàn tất request
- Giá trị chưa được duyệt sẽ hiển thị thông báo rõ ràng kèm gợi ý giá trị hợp lệ gần nhất
- Các giá trị cũ vẫn hiển thị trên case cũ — không phá vỡ dữ liệu quá khứ

### VALIDATE — Kiểm tra hợp lệ request tại đầu vào (Gate A)

**Thanh đo `1 / 2 required` không kiểm tra đúng như vẻ ngoài của nó.** Đã xác minh ngày 3/8 bằng cách đọc badge của từng trường trên dialog mới mở, sau đó đọc logic trong `QOps_Harness/index.html`:

```js
if (p.request_mode) filled++;                    // luôn đúng — request_mode có giá trị mặc định
if (p.user_input.trim()) filled++;               // prompt — điều kiện duy nhất có thể thất bại
if (p.session_file || p.request_mode) filled++;  // luôn đúng — xem §10
submitBtn.disabled = !p.user_input.trim() || !ticketOk;
```

Luật thực tế chỉ là **"prompt không được để trống"**. Không có gì kiểm tra `Project: aloha` có tồn tại hay viết đúng chính tả không, có URL hay không, hay tên feature có thật hay không — đây chính là lỗi nằm sau open case đang treo (một lỗi gõ nhầm kiểu "Fun Setup" sẽ thất bại âm thầm *sau khi* chạy, chứ không phải trước đó).

Đây là **một năng lực mới, không phải một cải tiến**. Hành vi khi phát hiện lỗi do PO quyết định — §9 quyết định 1; khuyến nghị là gợi ý tự động, tuyệt đối không chặn.

*Được chấp nhận khi:*
- Request thiếu project, thiếu đích đến, hoặc thiếu hành động nhận diện được sẽ bị cảnh báo **trước khi** submit
- Cảnh báo nêu rõ vấn đề và đưa ra giá trị đã sửa để chấp nhận chỉ bằng một cú nhấp
- Lỗi gõ nhầm tên feature hoặc tên menu được đưa ra dưới dạng gợi ý
- Người viết luôn có thể bỏ qua và submit

> **Bản thân thanh đo readiness nằm ngoài phạm vi VALIDATE — PO là người sở hữu nó.** Ngày 4/8, PO xác nhận
> thanh đo này *lẽ ra hiển thị số trường còn cần nhập*, rằng hiện nó đang lệch, và rằng nó sẽ
> **hoặc bị bỏ đi, hoặc được sửa lại cho đúng**. Nguyên nhân nhiều khả năng nằm ở §10.
>
> **Giữ hai việc này tách bạch.** Sau khi sửa, dialog sẽ báo trung thực "0 trường còn cần nhập" —
> và vẫn chấp nhận một request có lỗi gõ nhầm `Fun Setup`. VALIDATE chưa hoàn thành cho tới khi có thứ gì đó
> kiểm tra được **nội dung**.

### MODEL — Thêm khu vực con cho `feature`; biến `labels[]` thành mảng có namespace

`category` đã tồn tại và được gán tự động; ô chọn nhiều giá trị `Labels` cũng đã có. Thứ còn thiếu là cấp thứ hai của `feature` (khu vực con) và quy ước namespace cho `labels[]`.

*Được chấp nhận khi:*
- `feature` của một case có thể mang khu vực con (`area/sub-area`, ≤ 2 tầng)
- `labels[]` nhận nhiều giá trị **có namespace** (`suite:`, `fund:`, `env:`, `pri:`, `metric:`, `jira:`) và trả về dưới dạng danh sách từ API
- Cả hai đều hiển thị trên panel chi tiết case và trong mọi bản export

### CLASSIFY — Phân loại tại thời điểm tiếp nhận

Luật từ khoá xác định chạy trước, LLM xử lý phần còn lại, bộ từ vựng đọc từ Knowledge base — vốn đã đưa file markdown theo từng project vào agent sinh case, nên không cần kho cấu hình mới. Bộ phân loại tuyệt đối không được tự tạo giá trị; nếu không có gì phù hợp thì trả về `unclassified` kèm giải thích.

*Được chấp nhận khi:*
- Mọi request mới đều nhận được `project`, `feature` (kèm khu vực con), `category` và `labels[]` có namespace
- Bộ phân loại trả về điểm tin cậy (confidence) và một dòng lý do ngắn
- Không bao giờ sinh ra giá trị ngoài bộ từ vựng; thay vào đó trả về `unclassified`
- Cập nhật file markdown trong Knowledge là cập nhật luôn bộ phân loại

### QUEUE — Hàng đợi "Needs labeling"

Nơi các request có độ tin cậy thấp và các request `unclassified` chờ người xử lý. Panel triage trong Case Review đã hiện thực đúng mô hình này — nhân bản lại.

*Được chấp nhận khi:*
- Request dưới ngưỡng tin cậy xuất hiện trong một hàng đợi riêng thay vì được áp dụng tự động
- Người rà soát có thể gán giá trị đúng ngay trên một màn hình, không cần mở lại request
- Hàng đợi hiển thị số lượng, để nhìn thấy được khi nó phình to
- Khi xử lý xong một mục, hệ thống ghi lại ai là người gán nhãn

### BACKFILL — Gán nhãn lại toàn bộ case hiện có (backfill)

Chạy bộ phân loại trên toàn catalog. Phải làm **sau** VOCAB, nếu không case sẽ bị gán nhãn hai lần. **Phạm vi hiện đã biết rõ: 287 case, ~237 giá trị khác nhau, ~202 trong số đó chỉ dùng một lần.**

*Được chấp nhận khi:*
- Mọi case hiện có đều đã đi qua bộ phân loại
- Kết quả có độ tin cậy thấp đi vào hàng đợi QUEUE thay vì được áp dụng âm thầm
- Có báo cáo trước/sau cho thấy số giá trị khác nhau giảm dần về mức mục tiêu
- Không thay đổi gì trên case ngoài các trường phân loại

### GROUPS — Định nghĩa thành viên nhóm bằng truy vấn *(đã viết lại — xem §8 D2)*

**Test groups đã ra ngày 3/8 và thành viên nhóm là một danh sách tĩnh.** Trình soạn nhóm cung cấp *Add cases from catalog* — lọc, tick chọn, **Add selected** — kèm nút **Remove** trên từng dòng. Các bộ lọc chỉ là công cụ tìm kiếm, không phải luật xác định thành viên; không có gì được đánh giá lại, nên **một case mới khớp điều kiện sẽ KHÔNG tự gia nhập nhóm** cho tới khi có người nhớ ra và tick vào.

Vì vậy GROUPS bản gốc ("xây dựng bộ test dạng saved-query") đã lỗi thời. Phần còn lại nhỏ hơn nhiều: **bổ sung chế độ định nghĩa thành viên bằng truy vấn cho các nhóm đã có sẵn.**

*Được chấp nhận khi:*
- Một nhóm có thể được định nghĩa bằng bộ lọc đã lưu (ví dụ `feature:risk AND label:smoke`) thay vì danh sách tường minh
- Một case mới tạo khớp bộ lọc sẽ xuất hiện trong nhóm mà không ai phải sửa nhóm
- Nhóm tĩnh và nhóm theo truy vấn có thể cùng tồn tại; các nhóm hiện có không bị ảnh hưởng
- Nhóm hiển thị số case đang khớp trước khi chạy

### HEATMAP — Bản đồ nhiệt độ phủ (coverage heatmap)

Một lưới `feature` × `category` đếm số case trên Dashboard. Ô trống chính là backlog. Làm sau cùng — chỉ đáng nhìn khi đã có dữ liệu nhãn thật.

*Được chấp nhận khi:*
- Lưới hiển thị số lượng cho mọi tổ hợp khu vực × loại test
- Ô trống và ô thưa được phân biệt rõ về mặt thị giác
- Nhấp vào một ô sẽ mở danh sách Cases đã lọc theo ô đó

### ~~FILTERS — Bộ lọc facet trên danh sách Cases~~ ✅ **ĐÃ BÀN GIAO 3/8/2026**

Đã ra mắt qua `feat(web-ui): add CaseFilterBar and wire Cases toolbars`. Trang All cases hiện lọc theo **Search · Feature · Labels · Status · Reason**, với Feature và Labels là ô chọn nhiều giá trị. Hạng mục tìm kiếm prompt của QG-139 cũng được bao phủ bởi cùng công việc này. **Không cần hành động thêm.**

---

## 6. Trạng thái — **nơi duy nhất ghi nhận trạng thái**

**Cập nhật lần cuối:** 4 tháng 8, 2026 · **Người cập nhật:** BA

Các giá trị trạng thái: `Idea` · `Specified` · `In Jira` · `In progress` · `Built` · `Verified` · `Delivered by platform`

| # | Thay đổi | Trạng thái | Jira | Ghi chú |
|---|---|---|---|---|
| VOCAB | Bộ từ vựng đóng cho `Feature` + `Labels` | Specified | — | **Làm trước tiên.** 237 giá trị / 287 case. Chặn BACKFILL |
| VALIDATE | Kiểm tra hợp lệ request tại đầu vào (Gate A) | Specified | — | Không phải cải tiến — kiểm tra hiện tại chỉ là "prompt không trống". Đang chờ §9 quyết định 1. Thanh đo readiness là việc riêng do PO sở hữu |
| MODEL | Thêm khu vực con `feature`; `labels[]` có namespace | Specified | — | Nhỏ hơn dự kiến — `Labels` và `Category` đã có sẵn |
| CLASSIFY | Phân loại tại đầu vào | Specified | — | Bộ từ vựng lấy từ Knowledge |
| QUEUE | Hàng đợi "Needs labeling" | Specified | — | Nhân bản mô hình triage của Case Review |
| BACKFILL | Backfill case hiện có | Specified | — | **Phạm vi đã rõ: 287 case.** Phải sau VOCAB |
| GROUPS | Thành viên nhóm theo truy vấn | Specified (**đã viết lại**) | — | Test groups ra ngày 3/8 với thành viên tĩnh. Giờ là phần bổ sung, không phải xây mới |
| HEATMAP | Coverage heatmap | Specified | — | Làm sau cùng |
| ~~FILTERS~~ | ~~Bộ lọc facet trên danh sách Cases~~ | ✅ **Nền tảng đã bàn giao** | — | Ra ngày 3/8 (`603ecde`). Đã đóng |

**Thứ tự triển khai:** VOCAB → MODEL → CLASSIFY → QUEUE → BACKFILL → GROUPS → HEATMAP
**VALIDATE nằm ngoài chuỗi này** — nó không chặn hạng mục nào và có thể ra bất cứ lúc nào sau khi PO chốt §9 quyết định 1. Ghép nó chung với VOCAB sẽ hiệu quả: cả hai đều sửa dialog New Request.

**Số liệu nền đã đo (4/8/2026)** — đo lại sau BACKFILL:

| Chỉ số | Giá trị |
|---|---|
| Số case trong catalog | 287 |
| Số giá trị `Feature` / `Labels` khác nhau | ~237 |
| Giá trị chỉ dùng một lần (tên case bị cắt) | ~202 |
| Giá trị có nghĩa | ~35 |
| Mục tiêu sau VOCAB + BACKFILL | ~45 nhóm lá |

**Các sản phẩm hỗ trợ**

| Sản phẩm | Trạng thái |
|---|---|
| Bộ chuẩn taxonomy (`Aloha_Test_Case_Taxonomy.md`) | Bản nháp v2.x — chờ PO duyệt |
| Mockup luồng công việc | Đã đối chiếu với hệ thống thật ngày 4/8/2026 |
| Đưa bộ từ vựng lên Knowledge dưới tên `project/aloha/ALOHA-TAXONOMY.md` | Chưa bắt đầu — **đang bị chặn bởi §9 quyết định 5 (Phase A taxonomy)** |
| Golden set 30–50 case gán nhãn thủ công | Chưa bắt đầu |
| Số liệu nền của catalog | ✅ Đã lấy ngày 4/8 — xem bảng trên |

---

## 7. Cách chúng ta theo dõi

| Chỉ số | Mục tiêu | Vì sao quan trọng |
|---|---|---|
| **Số giá trị `Feature` khác nhau** | 237 → ~45 | Dấu hiệu rõ nhất cho thấy bộ từ vựng có đang giữ vững hay không |
| **% case đã được phân loại** | > 95% | Phần còn lại chính là backlog "Needs labeling" |
| **Độ sâu hàng đợi Needs labeling** | ổn định, không tăng | Hàng đợi phình to nghĩa là bộ từ vựng không khớp thực tế — sửa bộ từ vựng, đừng sửa hàng đợi |
| **Độ chính xác bộ phân loại trên golden set** | ≥ 90% `feature`, ≥ 80% `sub_area` | Ngăn trôi dạt âm thầm |
| **Kích thước nhóm lá** | 8–15 case | Trên ~25 thì tách, dưới 3 thì gộp |
| **Khoảng trống trên lưới độ phủ** | thu hẹp dần | Chính là backlog, được nhìn thấy |

**Nếu VALIDATE được triển khai:** theo dõi tần suất việc kiểm tra làm gián đoạn người dùng, và tần suất gợi ý được chấp nhận nguyên trạng. Gián đoạn ~5% là một lưới an toàn; 80% nghĩa là giá trị mặc định sai chứ không phải người dùng sai. Tỷ lệ chấp nhận gần 100% nghĩa là hệ thống lẽ ra nên tự sửa và chỉ thông báo lại.

**Mới có sẵn:** `feat(web-ui): show last Playwright duration on cases and requests` (4/8) lưu lại thời lượng chạy. Thời lượng theo từng khu vực feature sẽ cho thấy phần nào của Aloha tốn thời gian kiểm thử nhất — ứng viên bổ sung khi nhãn đã đáng tin cậy.

---

## 8. Bảng đối chiếu khác biệt — hệ thống khác gì so với kế hoạch này

**Đọc phần này trước khi trình bày bất cứ điều gì.** Harness đang được phát triển song song. Mọi dòng đều đã được xác minh trên hệ thống thật hoặc trong release notes; không dòng nào là suy đoán từ tài liệu.

| # | Kế hoạch này đề xuất | Hệ thống thực tế đang làm gì | Kết luận | Hành động |
|---|---|---|---|---|
| **D1** | **FILTERS** — xây bộ lọc facet cho danh sách Cases | Đã ra ngày 3/8: Search · Feature · Labels · Status · Reason, chọn nhiều giá trị | ✅ **Đã bàn giao** | Đóng FILTERS. Không cần làm gì |
| **D2** | **GROUPS** — bộ test dạng saved-query để case tự gia nhập | **Test groups** ra ngày 3/8 kèm lịch cron, webhook, lồng nhóm, chạy thủ công, trạng thái/lịch sử — nhưng **thành viên là danh sách tĩnh tick tay** | ⚠️ **Một phần, hình dạng khác** | Viết lại GROUPS thành *bổ sung thành viên theo truy vấn cho nhóm đã có*. Nhỏ hơn nhiều |
| **D3** | **Gate C / E** — xây dựng phát hiện trùng lặp có giới hạn theo nhãn | Spec 039 (1/8) đã có **Chroma vector index kèm ANN shortlisting trong layered dedup search** | ⚠️ **Cơ chế khác, mang tính bổ trợ** | Diễn đạt lại thành *"giới hạn ANN shortlist hiện có theo nhãn"*, không phải *"xây dựng dedupe"*. Lập luận rẻ hơn |
| **D4** | Taxonomy của chúng ta là hệ phân loại cho case của Aloha | Đã tồn tại một **"Phase A taxonomy"** — `fix(catalog): prefer managed app_project for Phase A taxonomy`, 4/8 | 🔴 **Chưa rõ — có thể trùng lặp** | **Đang chặn.** §9 quyết định 5. Chưa công bố bộ từ vựng cho tới khi có câu trả lời |
| **D5** | Mã case dạng `ALO-CF-HYPFLOW-003` | `case_id` hiện là **định danh duy nhất của catalog**, kèm CLI sửa lỗi (`repair-catalog-case-ids --apply`), 3/8 | ⚠️ **Nguy cơ xung đột** | Mã của chúng ta phải nằm **song song** với `case_id`, không bao giờ thay thế. Coi mã của ta là bí danh hiển thị/nhóm |
| **D6** | Bộ từ vựng triage có 6 giá trị (`unlabeled / product_bug / test_bug / flaky / env / wont_fix`) | Bộ lọc **Reason** thực tế có **4**: `Unlabeled · Product bug · Test defect · Feature unavailable` | ✏️ **Đính chính** | Danh sách 6 giá trị lấy từ bản thiết kế trong repo, không phải sản phẩm. Bản chạy thật mới là chuẩn — xem §11 |
| **D7** | Cần xây dựng nhóm từ đầu | Nhóm đã có lịch cron, webhook, lồng cha/con kèm resolve set, chạy thủ công, trạng thái & lịch sử, và tab **Groups** trên từng case | ✅ **Hệ thống đi trước kế hoạch** | Tiếp nhận những gì đã có. Không đặc tả lại bất cứ phần nào |
| **D8** | ~45 nhóm lá cho ~300 case (6–15 case mỗi nhóm) | 237 giá trị khác nhau cho 287 case — **≈ 1,2 case mỗi giá trị** | 🔴 **Khoảng cách đã định lượng** | Mục tiêu không đổi; khoảng cách tới nó nay đã đo được. Củng cố VOCAB và xác định quy mô BACKFILL |
| **D9** | `Feature` là văn bản tự do do LLM điền | Đã xác nhận — và nó được điền bằng **tên case bị cắt cụt** cho ~202 trong 287 case | ✅ **Đã xác nhận, tệ hơn mô tả ban đầu** | Đã phản ánh trong §2 |

**Cách dùng bảng này.** Khi một hạng mục T bị chất vấn, xem ở đây trước — câu trả lời thường là nền tảng đã làm một phần rồi. Khi thêm một đề xuất mới, hãy thêm một dòng vào đây thay vì mặc định rằng hệ thống chưa có.

---

## 9. Các quyết định còn treo

**5. 🔴 "Phase A taxonomy" là gì? — PO. ĐANG CHẶN.**

> `fix(catalog): prefer managed app_project for Phase A taxonomy` — 4/8/2026, commit `5235d30`

Đã tồn tại một luồng công việc taxonomy với cách đặt tên theo giai đoạn riêng, và nó đang được làm tích cực. **Chưa đưa bộ từ vựng của chúng ta lên Knowledge base, và chưa trình bày với PO như một ý tưởng mới, cho tới khi có câu trả lời.**

*Các câu hỏi cần đặt:*
1. Phase A taxonomy phân loại cái gì — case, project, hay thứ khác?
2. Nó được tài liệu hoá ở đâu, và có Phase B không?
3. Nó có định nghĩa một bộ từ vựng có kiểm soát, hay chỉ là một mô hình dữ liệu?
4. Bộ từ vựng Aloha của chúng ta nên nằm bên trong nó, mở rộng nó, hay thay thế nó?

*Trước khi có câu trả lời, hãy coi §§2–7 của kế hoạch này là đề xuất cho một vị trí có thể đã có người chiếm.*

**1. Hành vi của Gate A — PO.** Chặn và bắt sửa, gợi ý bản sửa để xác nhận bằng một cú nhấp, hay chỉ cảnh báo? *Khuyến nghị: gợi ý tự động.* Chặn sẽ biến QA thành người đi định dạng chuỗi ký tự; chỉ cảnh báo thì vẫn giữ nguyên các lỗi âm thầm như hiện nay.

> **Hãy đặt lại vấn đề khi trình bày với PO.** Câu hỏi lâu nay được bàn dưới dạng *"có nên siết chặt
> kiểm tra không?"* — nhưng VALIDATE đã chứng minh rằng **không hề có** kiểm tra nào ngoài việc prompt không trống.
> Lựa chọn không phải là chặt hơn hay lỏng hơn; mà là **có kiểm tra hay không**.
>
> **Đừng để quyết định này bị đóng lại chỉ vì thanh đo được sửa.** Đây là hai việc khác nhau:
>
> | | Trạng thái |
> |---|---|
> | Thanh đếm `n / n required` bị sai | PO xác nhận 4/8 — đang chờ sửa |
> | Không có gì kiểm tra `Project:`, URL, hay lỗi gõ nhầm | **Còn treo — chính là quyết định này** |

**2. Backfill hay chỉ gán nhãn từ nay về sau — PO.** Gán nhãn lại toàn catalog (BACKFILL) hay chỉ gán cho case mới? *Khuyến nghị: backfill* — 287 case với 202 giá trị dùng một lần sẽ không tự biến mất theo thời gian, và các thư mục `Feature` dù sao cũng là chi phí di chuyển phải trả.

**3. Ai sở hữu bộ từ vựng — PO.** Ai duyệt một khu vực hoặc khu vực con mới: PO một mình, hay PO cùng QA Lead? Không có người sở hữu rõ ràng thì danh sách hoặc đóng băng, hoặc trôi dạt.

**4. Thêm `lab` vào enum Environment — PO/dev.** Các giá trị hiện có là `Platform default` / `sandbox` / `production`; trong khi QA Test Plan quy định `workbench-app.lab.gend.vn`. URL trong prompt vẫn thắng khi chạy thật, nên đây chỉ là vấn đề hình thức — nhưng khung chat lại nói *"I've set the environment to sandbox as requested"* trong khi không ai yêu cầu điều đó.

**6. Golden set — BA/QA.** Ai sẽ gán nhãn thủ công 30–50 case dùng để đo độ chính xác của bộ phân loại? File `Harness_Golden_Case_Template.xlsx` có thể đã tồn tại — trong repo chỉ còn lại một file khoá mồ côi.

---

## 10. Backlog

**Từ công việc phân loại**

- **Phát hiện bao hàm (subsumption).** Kiểm tra trùng lặp có ba kết quả chứ không phải hai: trùng hoàn toàn, trùng về ngữ nghĩa, và *bao hàm* — một case mới là tập cha của case đã có (case cũ kiểm tra NAV là số; case mới kiểm tra NAV **và** Beta). Trường hợp bao hàm sẽ vượt qua kiểm tra trùng lặp và được tạo thành một bản sinh đôi gần giống. Đây là tình huống phổ biến nhất trong thực tế, và là nguyên nhân âm thầm làm phình catalog. Hành động đúng: *"mở rộng case đã có?"*
- **Cấp độ 3 — sinh case dựa trên độ phủ.** Heatmap đề xuất các request để lấp ô trống. Chỉ có ý nghĩa khi HEATMAP đã có dữ liệu thật.
- **Mở rộng facet `metric:`** khi Aloha bổ sung chỉ số mới.

**Các lỗi liền kề phát hiện khi kiểm chứng**

- **Điều kiện chết trong thanh đo readiness — nhiều khả năng là nguyên nhân của sự lệch mà PO mô tả.** Trong `QOps_Harness/index.html` → `updateReadiness()`:

  ```js
  if (p.request_mode) filled++;                    // luôn đúng — request_mode có giá trị mặc định
  if (p.user_input.trim()) filled++;               // prompt — điều kiện duy nhất có thể thất bại
  if (p.session_file || p.request_mode) filled++;  // luôn đúng — vế `|| p.request_mode` khiến
                                                   // nửa kiểm tra session_file không bao giờ chạy tới
  ```

  Hai trong ba điều kiện không bao giờ thất bại, nên bộ đếm luôn báo dư. **Gửi thông tin này cho PO trước khi anh ấy quyết định** — biết nguyên nhân chỉ là một toán tử `||` bị kẹt thì nhiều khả năng *sửa lại* sẽ rẻ hơn *bỏ đi*.

- **Dialog New request mở ra đã mang sẵn nội dung của request trước** và không xoá được; không thể bỏ chọn dòng trong hàng đợi. Ticket lỗi đã soạn ngày 3/8. Có thể là hồi quy từ `d0b06e7` / `603ecde`, cả hai đều chạm vào UI Cases/Groups vào tối hôm trước khi lỗi được phát hiện.
- **Hiển thị spec slug trong Case Review.** UI hiển thị "Direct test"; trong khi spec sinh ra là `risk-model-dashboard-total-risk-table-and-download-report-461dc2`. Cái tên tốt đã có sẵn — chỉ là không được hiển thị.
- **Kết quả lỗi dừng ở mức quá cao.** Một lần chạy thất bại chỉ báo `Playwright run failed (exit 1)` mà không nêu assertion nào đã thất bại. Đây chính là hạng mục "output tracking" của QG-139, tái hiện ngày 3/8.
- **Sửa thông báo xác nhận sai sự thật** mô tả ở §9 quyết định 4.

---

## 11. Tham chiếu

| Thuật ngữ | Ý nghĩa |
|---|---|
| **Axis / facet (trục / khía cạnh)** | Một chiều phân loại độc lập. Mỗi case có một giá trị trên từng trục, chứ không phải một nhãn tổng |
| **Area (khu vực)** | Module Aloha mà case thuộc về. Lưu trong trường `feature` của Harness |
| **Sub-area (khu vực con)** | Cấp thứ hai dưới area, ví dụ `risk/dashboard`. Sâu tối đa hai cấp |
| **Leaf group (nhóm lá)** | Một cặp area + sub-area. Quy mô mục tiêu 8–15 case |
| **Query-defined group** | Nhóm có thành viên là một bộ lọc đã lưu. Case gia nhập bằng cách khớp điều kiện — *không phải* cách nhóm hoạt động hiện nay (§8 D2) |
| **Golden set** | 30–50 case gán nhãn thủ công, dùng để đo độ chính xác của bộ phân loại theo thời gian |
| **`unclassified`** | Câu trả lời trung thực "tôi không biết" của bộ phân loại. Là hàng đợi công việc, không bao giờ là điểm dừng |
| **Reason** *(trên hệ thống thật)* | Trường triage của Harness. **Bốn** giá trị: `Unlabeled` · `Product bug` · `Test defect` · `Feature unavailable`. Khác với `category` (positive/negative/…) |

**Tài liệu liên quan**

| Tài liệu | Nội dung |
|---|---|
| [`Harness_Case_Classification_Plan.md`](./Harness_Case_Classification_Plan.md) | **Bản gốc tiếng Anh — bản có hiệu lực** |
| [`Aloha_Test_Case_Taxonomy.md`](../01_Plans_and_Strategy/Aloha_Test_Case_Taxonomy.md) | Bộ từ vựng và quy tắc quản trị — chính là bộ chuẩn |
| [`Harness_Release_Log.md`](./Harness_Release_Log.md) | Theo dõi deploy + phân tích tác động + danh sách cần quan sát |
| [`Harness_TestCaseFactory_Workflow_Mockup.html`](../03_Mockups/Harness_TestCaseFactory_Workflow_Mockup.html) | Bản vẽ chi tiết luồng công việc |
| [`Harness_Workflow_Overview_Mockup.html`](../03_Mockups/Harness_Workflow_Overview_Mockup.html) | Tổng quan một màn hình, dùng để trình bày |
| [`QA_Test_Plan.md`](../04_QA_Reference/QA_Test_Plan.md) | Kế hoạch của QA; §3 là hạt giống của taxonomy này, §9 liệt kê các yêu cầu công cụ của họ |
| [`Harness_UXUI_Review.md`](../02_Reviews_and_Analysis/Harness_UXUI_Review.md) | Rà soát từng màn hình + chỉ mục ticket QG-138 |

---

## Nhật ký thay đổi

| Ngày | Phiên bản | Thay đổi |
|---|---|---|
| 2026-08-04 | 1.4 | **Đổi tên toàn bộ hạng mục từ `T1`–`T9` sang mã định danh mang nghĩa** và sắp xếp lại §5 theo đúng thứ tự triển khai. Các con số ngụ ý một trình tự vốn không tồn tại, đồng thời trùng với nhóm chủ đề UX `T1`–`T5` hoàn toàn khác trong `Harness_UXUI_Review.md`. Bảng ánh xạ: `T2`→**VOCAB** · `T9`→**VALIDATE** · `T1`→**MODEL** · `T3`→**CLASSIFY** · `T4`→**QUEUE** · `T8`→**BACKFILL** · `T6`→**GROUPS** · `T7`→**HEATMAP** · `T5`→**FILTERS**. Bổ sung bảng mục lục ở đầu §5 |
| 2026-08-04 | 1.3 | Khảo sát trực tiếp Test groups và catalog Cases. **Bổ sung §8 bảng đối chiếu khác biệt.** Đóng FILTERS vì đã bàn giao; viết lại GROUPS (nhóm đã có, thành viên là tĩnh); đo số liệu nền 287 case / ~237 giá trị; đính chính `Reason` còn 4 giá trị; **nêu Phase A taxonomy thành quyết định chặn số 5** |
| 2026-08-04 | 1.2 | PO xác nhận thanh đếm readiness bị lệch. Đưa nó ra khỏi phạm vi VALIDATE; củng cố §9 quyết định 1; nâng điều kiện chết `session_file` lên thành nguyên nhân gốc nhiều khả năng |
| 2026-08-03 | 1.1 | Bổ sung VALIDATE — kiểm tra hợp lệ request tại đầu vào |
| 2026-08-03 | 1.0 | Khởi tạo |

---

*Bản dịch tiếng Việt lập ngày 4/8/2026 từ bản gốc v1.3. Khi bản gốc thay đổi, cập nhật bản gốc trước rồi dịch lại phần tương ứng.*
