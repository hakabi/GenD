
1/ Mục đích Harness này: Tạo 1 quy trình automation test dựa trên LLM kết hợp playwright cho QA để test các tính nămg của trang Aloha Page
------------------------------
2/ Tính Năng Chính Của Harness
.Single Test Case: Tạo một test case đã có sẵn; hệ thống kiểm tra trùng lặp tự động, nếu trùng sẽ báo "duplicate" và không cho tạo mới.
.Test Feature (New): Mô tả tính năng → AI tự động sinh ra danh sách test case theo nhóm (positive, negative, security, boundary…).
.Execute Feature: Tương tự Test Feature nhưng chạy test luôn thay vì chỉ tạo.
.Test Bug: Tạo test case cho một bug cụ thể; test case này phải fail khi chạy lần đầu vì bug chưa được sửa.
.Tag: Gắn nhãn cho test case để lọc và chạy hàng loạt theo nhóm tính năng.
.Fallback cơ chế: Nếu automation script không chạy được, hệ thống tự động chuyển sang chạy bằng AI.
.Vấn Đề Còn Mở, cần giải quyết sau:
- Nhóm test case theo feature/người dùng: Hiện tại tất cả test case nằm chung một danh sách, chưa có cách lọc riêng theo feature hoặc theo người tạo.
- Một số trường thông tin (như tag, level) chưa hiển thị trên màn hình chính, cần bổ sung.
- Hướng dẫn sử dụng trong giao diện còn sơ khai, sẽ thêm dần.
- Test trên mobile/app chưa được hỗ trợ, sẽ tính sau.
------------------------------
3/ Mẫu Prompt Test:
Project: aloha
Go to aloha.conceptia.com
Click on Public Fund tab
Expand the categories line (in the table listing categories and measures)
Expand more if needed until we see a final fund which cannot be expand
Click on the Fund
Validate that the Rating dialog for Fund appears