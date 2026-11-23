# Fresh Box Order Garden

Tiếp tục chỉnh sửa website Fresh Box hiện tại: https://fresh-box-website-def336.netlify.app

Giữ nguyên giao diện, màu sắc xanh lá – vàng kem và các chức năng đang hoạt động. Không tạo website mới, không thiết kế lại.

Chỉ thực hiện các yêu cầu sau:

1. Sản phẩm
Giữ 5 sản phẩm:

Mini: 25.000đ

Mix: 35.000đ

Premium: 45.000đ

Office: 50.000đ

Family: 65.000đ

Có ảnh, giá và nút thêm vào giỏ hàng.

2. Giỏ hàng
Cho phép thêm, xóa, tăng giảm số lượng, tự động tính tổng tiền và lưu giỏ hàng khi tải lại trang.

3. Đặt hàng
Tạo biểu mẫu gồm họ tên, số điện thoại, email, địa chỉ, ghi chú và phương thức thanh toán COD/chuyển khoản. Tự động tạo mã đơn và lưu đơn hàng vào cơ sở dữ liệu.

4. Gửi Gmail
Gmail nhận đơn: [ĐIỀN GMAIL].

Sử dụng Resend và Netlify Functions để tự động gửi thông tin đơn hàng về Gmail, gồm mã đơn, khách hàng, số điện thoại, địa chỉ, sản phẩm, số lượng và tổng tiền.

API Key phải được bảo mật bằng biến môi trường. Nếu thiếu cấu hình, hãy hướng dẫn tôi bổ sung. Không tạo chức năng gửi email giả.

5. Admin
Tạo trang /admin có đăng nhập, cho phép xem đơn hàng, thông tin khách hàng, doanh thu và cập nhật trạng thái đơn hàng.

Yêu cầu: Chỉ sửa những phần cần thiết, không thêm giới thiệu, chính sách hoặc tính năng phụ. Ưu tiên hoàn thiện giỏ hàng, đặt hàng và gửi Gmail. Kiểm tra chức năng thực tế trước khi hoàn thành.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://fresh-box-order-garden.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a80c0f5b-ab63-409e-b505-8b68d71fe824).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
