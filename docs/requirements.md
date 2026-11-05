1. Mô tả bài toán

Khách hàng giả định: một cửa hàng thời trang nhỏ, hiện bán qua Facebook/Zalo và chốt đơn thủ công. Chủ shop gặp các vấn đề sau:

Khách phải nhắn tin hỏi size, màu, còn hàng hay không.
Đơn hàng ghi tay hoặc trong tin nhắn nên dễ nhầm, dễ sót.
Tồn kho không được theo dõi, có khi bán quá số lượng đang có.

Mục tiêu: một website để khách tự xem sản phẩm, chọn size/màu, đặt hàng, còn chủ shop quản lý sản phẩm, tồn kho và đơn hàng ở một nơi.

2. Người dùng và quyền hạn
Vai trò	Được làm	Không được làm
Khách vãng lai	Xem, tìm kiếm, lọc sản phẩm; đăng ký, đăng nhập	Đặt hàng
Khách hàng	Mọi thứ của khách vãng lai, cộng thêm giỏ hàng, đặt hàng, xem lịch sử đơn, hủy đơn đang chờ xử lý, sửa hồ sơ	Truy cập trang quản trị, xem đơn của người khác
Admin	Quản lý sản phẩm, danh mục, tồn kho, đơn hàng (đổi trạng thái), xem danh sách khách	Xem mật khẩu khách hàng
3. Chức năng theo mức ưu tiên

P0, bắt buộc có (MVP):

Đăng ký, đăng nhập, đăng xuất
Danh sách sản phẩm, chi tiết sản phẩm (size, màu, tồn kho)
Tìm kiếm theo tên, lọc theo danh mục và khoảng giá, phân trang
Giỏ hàng
Đặt hàng (COD) kèm địa chỉ giao hàng
Lịch sử đơn hàng của khách
Admin: CRUD sản phẩm, danh mục
Admin: xem đơn hàng và đổi trạng thái (Chờ xử lý → Đang giao → Hoàn tất / Đã hủy)
Tự động trừ tồn kho khi đặt hàng

P1, nên có: upload ảnh sản phẩm, email xác nhận đơn, hồ sơ cá nhân và sổ địa chỉ.

P2, mở rộng: đánh giá sản phẩm, mã giảm giá, dashboard doanh thu, cổng thanh toán online.

4. Ví dụ user story và tiêu chí nghiệm thu

Mình viết hai ví dụ để bạn thấy cách làm. Các story còn lại sẽ viết cùng bạn khi vào từng bài.

Story: Đặt hàng. Là khách hàng đã đăng nhập, tôi muốn đặt hàng từ giỏ hàng để nhận sản phẩm tại nhà.

Phải nhập đủ họ tên, số điện thoại, địa chỉ mới đặt được.
Nếu sản phẩm không đủ tồn kho, hệ thống báo lỗi rõ ràng và không tạo đơn.
Đặt thành công thì giỏ hàng được làm trống, tồn kho giảm đúng số lượng, đơn có trạng thái “Chờ xử lý”.
Giá trong đơn được tính ở backend, không tin giá do frontend gửi lên.

Story: Quản lý đơn. Là admin, tôi muốn đổi trạng thái đơn để khách biết đơn đang ở đâu.

Chỉ tài khoản admin gọi được API này (kiểm tra ở backend).
Không được chuyển trạng thái ngược vô lý (ví dụ từ “Hoàn tất” về “Chờ xử lý”).
Khi hủy đơn, tồn kho được hoàn lại.
5. Yêu cầu phi chức năng
Responsive trên điện thoại, tablet, máy tính.
Bảo mật: mật khẩu hash, phân quyền ở backend, validate dữ liệu ở server, không đẩy secret lên GitHub.
Trải nghiệm: có trạng thái loading, lỗi, danh sách rỗng, thông báo thành công.
Chất lượng: code tách lớp rõ ràng, có README và .env.example, có test cho đăng nhập và đặt hàng.