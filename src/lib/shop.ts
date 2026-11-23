// Thông tin cửa hàng – chỉnh sửa tại đây, toàn bộ website tự cập nhật.
export const SHOP = {
  name: "FRESH BOX",
  slogan: "Tươi ngon mỗi ngày – Tiếp thêm năng lượng",
  phone: "0382696117",
  email: "lamhuyentham1205@gmail.com",
  address: "Đang cập nhật địa chỉ cửa hàng",
  openingHours: "7:00 – 21:00, tất cả các ngày trong tuần",
  // Thông tin chuyển khoản. Để trống thì website báo khách rằng nhân viên
  // gửi thông tin chuyển khoản khi gọi xác nhận đơn.
  bank: { bankName: "", accountNumber: "", accountHolder: "" },
  social: {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    zalo: "https://zalo.me/0382696117",
  },
} as const;
