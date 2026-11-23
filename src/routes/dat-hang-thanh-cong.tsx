import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { icons } from "@/components/freshbox/icons";
import { Receipt } from "@/components/freshbox/order-view";
import type { PublicOrder } from "@/lib/order-rules";
import { SHOP } from "@/lib/shop";
import { toast } from "@/lib/ui-store";

export const Route = createFileRoute("/dat-hang-thanh-cong")({
  validateSearch: (s: Record<string, unknown>): { ma?: string } => (typeof s["ma"] === "string" ? { ma: s["ma"] } : {}),
  head: () => ({
    meta: [
      { title: "Đặt hàng thành công – FRESH BOX" },
      { name: "description", content: "Cảm ơn bạn đã đặt hàng tại Fresh Box." },
      { property: "og:title", content: "Đặt hàng thành công – FRESH BOX" },
      { property: "og:description", content: "Cảm ơn bạn đã đặt hàng tại Fresh Box." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Success,
});

function Success() {
  const { ma = "" } = Route.useSearch();
  const [order, setOrder] = useState<PublicOrder | null | undefined>(undefined);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("freshbox-last-order") || "null") as PublicOrder | null;
      setOrder(saved && saved.code === ma ? saved : null);
    } catch {
      setOrder(null);
    }
  }, [ma]);

  return (
    <div className="container success" aria-live="polite">
      {order === undefined ? (
        <div className="skeleton" style={{ height: 420 }} />
      ) : !order ? (
        <div className="success__head">
          <h1>Tra cứu đơn hàng</h1>
          <p className="muted">
            Để xem lại chi tiết đơn{ma ? <strong> {ma}</strong> : null}, vui lòng tra cứu bằng mã đơn và số điện thoại.
          </p>
          <Link className="btn" to="/tra-cuu" search={ma ? { ma } : {}}>
            Tra cứu đơn hàng
          </Link>
        </div>
      ) : (
        <>
          <div className="success__head">
            <div className="success__check">{icons.check}</div>
            <h1>Đặt hàng thành công!</h1>
            <p className="muted">
              Cảm ơn <strong>{order.customerName}</strong>. Fresh Box đã nhận đơn hàng của bạn và sẽ gọi tới số{" "}
              <strong>{order.phone}</strong> để xác nhận trong thời gian sớm nhất.
            </p>
            <p style={{ marginTop: 18 }}>Mã đơn hàng của bạn</p>
            <span className="order-code">
              {order.code}
              <button
                className="copy-btn"
                type="button"
                aria-label="Sao chép mã đơn"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(order.code);
                    toast("Đã sao chép mã đơn hàng");
                  } catch {
                    toast(order.code);
                  }
                }}
              >
                {icons.copy}
              </button>
            </span>
            <p className="muted" style={{ fontSize: ".88rem", marginTop: 12 }}>
              Lưu lại mã này để tra cứu trạng thái đơn hàng.
            </p>
          </div>
          {order.paymentMethod === "bank" ? (
            <div className="notice" style={{ margin: "0 0 24px" }}>
              {icons.bank}
              <div>
                {SHOP.bank.bankName && SHOP.bank.accountNumber ? (
                  <p>
                    <strong>Thông tin chuyển khoản</strong>
                    <br />
                    Ngân hàng: <strong>{SHOP.bank.bankName}</strong> · STK: <strong>{SHOP.bank.accountNumber}</strong> · Chủ TK:{" "}
                    <strong>{SHOP.bank.accountHolder}</strong>
                    <br />
                    Nội dung: <strong>{order.code}</strong>
                  </p>
                ) : (
                  <p>
                    Nhân viên Fresh Box sẽ gọi xác nhận và gửi thông tin chuyển khoản. Vui lòng ghi nội dung chuyển khoản là{" "}
                    <strong>{order.code}</strong>.
                  </p>
                )}
              </div>
            </div>
          ) : null}
          <Receipt o={order} />
          <div className="success__actions">
            <Link className="btn" to="/tra-cuu" search={{ ma: order.code }}>
              Theo dõi đơn hàng
            </Link>
            <Link className="btn btn--ghost" to="/san-pham">
              Tiếp tục mua sắm
            </Link>
            <a className="btn btn--ghost" href={`tel:${SHOP.phone}`}>
              Gọi {SHOP.phone}
            </a>
          </div>
        </>
      )}
    </div>
  );
}
