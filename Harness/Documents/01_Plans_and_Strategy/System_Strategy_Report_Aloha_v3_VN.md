# Báo cáo Chiến lược & Kiến trúc Hệ thống: Tối ưu hóa Phân loại Kiểm thử Harness (Dự án Aloha - Phiên bản Hoàn thiện & Phản biện Lãnh đạo)

**Chuyên gia Tác giả:** Chuyên gia Phân tích Dịch vụ & Dữ liệu Cấp cao (Senior BA & Data Analyst với 20+ năm kinh nghiệm)  
**Đối tượng Báo cáo:** Ban lãnh đạo / Product Owner (PO)  
**Phạm vi:** Nền tảng Tài chính Aloha & Hệ thống Tự động hóa Harness  
**Ngày cập nhật:** Tháng 8 năm 2026  

---

## 1. Lời nói đầu: Góc nhìn Kiến trúc Hệ thống Phức hợp

Với hơn hai thập kỷ kinh nghiệm tư vấn và triển khai các hệ thống kỹ thuật phức tạp—từ các mô hình xử lý tín hiệu tài chính đa chiều, các thuật toán phân tích dòng tiền thời gian thực cho đến các kiến trúc kho dữ liệu quy mô lớn—tôi đúc rút ra một định luật bất biến: **Một hệ thống thông minh không thể vận hành trên một nền tảng dữ liệu nhiễu loạn.**

Trong dự án tự động hóa kiểm thử Harness của nền tảng Aloha hiện tại, chúng ta đang đối mặt với một cuộc khủng hoảng cấu trúc kinh điển: **287 test cases sinh ra tới 237 giá trị phân nhóm khác nhau** (trong đó hơn 200 giá trị là chuỗi văn bản đơn lẻ, tự do do con người hoặc LLM nhập vào). Báo cáo này đúc kết khung giải pháp chiến lược, phân tích sâu sắc các hệ lụy sụp đổ cấu trúc và trực tiếp giải đáp bài toán phản biện từ cấp quản lý về tính hiệu quả của việc phân loại đa trục.

---

## 2. Giải đáp Phản biện Lãnh đạo: "QA đã có quyền tự gắn nhãn ngay từ đầu, tại sao phải làm phân loại 5 trục cho rối?"

Một câu hỏi phản biện rất thực tế từ cấp quản lý thường gặp là: *"Hiện nay QA đã có thể chủ động chọn nhãn (feature, label) trên giao diện input, tại sao lại phải phức tạp hóa vấn đề bằng một hệ thống phân loại 5 trục cứng nhắc? Điều này có làm chậm thao tác của đội ngũ không?"*

Dưới lăng kính của một Chuyên gia Phân tích Dữ liệu và Kiến trúc Hệ thống Cấp cao, câu trả lời nằm ở sự khác biệt bản chất giữa **"Quyền tự do gắn nhãn thủ công" (Manual Freedom)** và **"Sự toàn vẹn dữ liệu hệ thống" (Data Integrity)**:

### 1. Ảo tưởng về sự kiểm soát (The Illusion of Control)
Nhìn vào thực tế giao diện hiện tại của Harness (như minh họa trong các hình chụp UI), danh sách thả xuống (dropdown) đang bị ô nhiễm nặng nề bởi các chuỗi văn bản dài lê thê, mang tính mô tả hành vi thay vì đóng vai trò nhãn phân loại (ví dụ: `calendar-table-is-displayed-when-clicking-the-calendar`, `category-value-actual-net-cap-calls-dist-renders`). 
*   **Thực trạng:** Khi để QA tự do gõ hoặc chọn mà không có một bộ khung từ vựng đóng (Closed Vocabulary), con người theo tâm lý tự nhiên sẽ viết ra những câu dài theo ý hiểu chủ quan tại thời điểm đó. 
*   **Hậu quả:** Đây không phải là "kiểm soát", mà thực chất là **sự hỗn loạn có kiểm soát (Controlled Chaos)**. Nó dẫn thẳng đến việc 287 test cases đẻ ra tới 237 tag khác nhau.

### 2. Gánh nặng nhận thức (Cognitive Overload) vs. Tự động hóa hệ thống
*   **Mô hình cũ (QA tự nhớ & tự chọn):** QA nhận một request mới (ví dụ: dán link Jira hoặc mô tả luồng tính năng), họ phải tự động não nhớ xem hệ thống đang có những tag nào, hoặc phải cuộn qua một danh sách hàng trăm dòng rác để tìm kiếm. Điều này gây ức chế, tốn thời gian và tỷ lệ sai sót cực cao.
*   **Mô hình 5 trục đề xuất (Zero-Effort Ingestion):** QA **không cần phải nhớ**. Khi QA nhập mô tả, hệ thống kết hợp *Quy tắc từ khóa tất định (Deterministic Rules)* và *LLM dự phòng có giới hạn* để tự động điền sẵn toàn bộ 5 trục (`project`, `feature`, `sub_area`, `category`, `label`, `tags[]`). QA chỉ cần nhìn qua bản xem trước (Preview) và bấm xác nhận trong 1 giây. Khung 5 trục không làm rối QA, mà **giải phóng QA khỏi gánh nặng tư duy thủ công**.

---

## 3. 5 Hậu quả Sụp đổ Cấu trúc Khi Bỏ qua Phân loại Đa trục

Nếu tiếp tục duy trì cách gắn nhãn tự do trên 2 trường lỏng lẻo, hệ thống dữ liệu kiểm thử của Aloha sẽ phải gánh chịu 5 hậu quả trực tiếp:

1. **"Điếc" Thu hồi Thông tin (Information Retrieval Failure):**  
   Khi Product Owner yêu cầu chạy toàn bộ test case liên quan đến `feature: risk`, hệ thống chỉ tìm thấy 20% vì 80% còn lại bị chôn vùi dưới các tag tự bịa như `@public-fund-risk`. Lỗi lọt ra Production.
2. **Hiệu ứng "Bóng ma" & Nhân bản Dữ liệu (Ghost Duplication):**  
   Vì không tìm thấy test case cũ do bị đặt tên sai, đội ngũ viết đè những test case trùng lặp mới, khiến database phình to vô ích (ví dụ: 1.000 test thực tế biến thành 4.000 test rác).
3. **Mù lòa về Độ Phủ (Coverage Blindness):**  
   Biểu đồ nhiệt (Heatmap) trên Dashboard báo cáo "Cash Forecast đã cover 100%", nhưng thực chất con số đó đến từ các tag rác. Ban lãnh đạo ra quyết định chiến lược dựa trên dữ liệu ảo (Hallucinated Data).
4. **Ác mộng Bảo trì (Maintenance Nightmare):**  
   Khi nghiệp vụ thay đổi, thay vì chỉ cần cập nhật 1 key chuẩn trong từ vựng đóng ($O(1)$), đội ngũ phải cào (crawl) và sửa thủ công hàng trăm biến thể tag tự chế dọc theo cơ sở dữ liệu ($O(N)$).
5. **Lãng phí Tài nguyên Hệ thống & Chi phí API (Resource & Cost Explosion):**  
   Thời gian chạy CI/CD kéo dài do test trùng lặp, đồng thời việc để LLM tự do sinh tag tốn kém số lượng Token khổng lồ.

---

## 4. Khung Kiến trúc Đề xuất: Phân loại Đa chiều (Faceted Multi-Axis Taxonomy)

Thay vì ép toàn bộ thông tin vào một cấu trúc cây đơn lẻ, chúng ta áp dụng mô hình **Phân loại Đa diện (Faceted Classification)** qua 5 trục:
1. **`project`:** Định danh phạm vi hệ thống (`aloha`, `harness`).
2. **`feature` & `sub_area`:** Giới hạn 10 khu vực nghiệp vụ chính, độ sâu tối đa 2 cấp (như `cash-forecast` / `hypothetical-flows`).
3. **`category`:** Phân định rõ mục đích (`positive`, `negative`, `boundary`, `security`, `data-integrity`).
4. **`label`:** Quản lý mục đích chạy (`smoke`, `regression`, `bug-repro`, `uat`).
5. **`tags[]`:** Nhãn bổ trợ theo namespace (`fund:`, `env:`, `metric:`, `jira:`).

---

## 5. Đề xuất Mô hình Giao diện: "Smart Matrix Ingest"

```
+-------------------------------------------------------------------------+
| HARNESS AI ASSISTANT - TEST CASE INGEST GATEWAY                         |
+-------------------------------------------------------------------------+
| Prompt Input:                                                           |
| [ Test the hypothetical flows in Cash Forecast and assert NAV error... ]|
+-------------------------------------------------------------------------+
| Automated Classification Preview (Deterministic Rules + LLM Fallback):  |
|  • Project  : [ aloha                ▼ ] (Locked)                       |
|  • Feature  : [ cash-forecast        ▼ ] (Matched via Keyword Rule)     |
|  • Sub-area : [ hypothetical-flows   ▼ ] (AI Confidence: 0.94 - High)   |
|  • Category : [ negative             ▼ ] (Matched via Keyword Rule)     |
|  • Labels   : [ regression         x ]                                  |
|  • Tags     : [ fund:total-endowment ] [ metric:nav ] [ jira:KS-963 ]     |
+-------------------------------------------------------------------------+
| [Status: VALIDATED - Ready to Commit]          [ Commit to Knowledge ]  |
+-------------------------------------------------------------------------+
```

*   **Cơ chế Gợi ý Thông minh & Soft Validation:** Giao diện hiển thị cảnh báo mềm khi phát hiện giá trị ngoài từ vựng đóng, đồng thời đề xuất ngay giá trị chuẩn xác bằng 1 cú nhấp chuột.
*   **Coverage Heatmap Dashboard:** Giúp ban lãnh đạo nhìn xuyên thấu độ phủ thực tế của từng tính năng tài chính mà không sợ dữ liệu ảo.

---

## 6. Lộ trình Hành động & Cam kết Giá trị (ROI)

1. **Giai đoạn 1:** Thống nhất với ban lãnh đạo về việc chuẩn hóa từ vựng đóng 5 trục nhằm dứt điểm tình trạng ô nhiễm tag hiện tại.
2. **Giai đoạn 2:** Viết migration script map 237 giá trị cũ xuống 45 nhóm chuẩn.
3. **Giai đoạn 3:** Tích hợp bộ lọc tự động và trực quan hóa Dashboard độ phủ trên Harness.

**Kết luận cuối cùng:** Chuẩn hóa theo 5 trục không làm rối QA, mà là "chiếc khiên" bảo vệ chất lượng dữ liệu của nền tảng tài chính Aloha trước cạm bẫy của sự hỗn loạn thủ công.
