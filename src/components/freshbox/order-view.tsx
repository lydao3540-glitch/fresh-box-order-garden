import { formatVND, ORDER_STATUSES, type OrderStatus } from "@/lib/catalog";
import type { PublicOrder } from "@/lib/order-rules";

const FLOW: OrderStatus[] = ["pending", "confirmed", "preparing", "shipping", "delivered"];

export function StatusPill({ status }: { status: string }) {
  return (
    <span className="status-pill" data-status={status}>
      {ORDER_STATUSES[status as OrderStatus] ?? status}
    </span>
  );
}

export function formatDate(d: string) {
  return new Date(d).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function Timeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="notice notice--error">
        <p>
          Đơn hàng này <strong>đã bị hủy</strong>. Nếu cần hỗ trợ, vui lòng liên hệ Fresh Box.
        </p>
      </div>
    );
  }
  const idx = FLOW.indexOf(status as OrderStatus);
  return (
    <ol className="timeline" aria-label="Tiến trình đơn hàng">
      {FLOW.map((s, i) => (
        <li key={s} className={`${i <= idx ? "done" : ""} ${i === idx ? "current" : ""}`} aria-current={i === idx ? "step" : undefined}>
          {ORDER_STATUSES[s]}
        </li>
      ))}
    </ol>
  );
}

export function Receipt({ o }: { o: PublicOrder }) {
  return (
    <div className="receipt">
      <h3 style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        Trạng thái đơn hàng <StatusPill status={o.status} />
      </h3>
      <Timeline status={o.status} />
      <h3>Sản phẩm</h3>
      <table className="items-table">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th className="num">SL</th>
            <th className="num">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {o.items.map((i) => (
            <tr key={i.id}>
              <td>
                <strong>{i.name}</strong>
                <br />
                <small className="muted">{formatVND(i.price)} / hộp</small>
              </td>
              <td className="num">× {i.quantity}</td>
              <td className="num">{formatVND(i.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Tổng tiền ({o.totalQuantity} hộp)</td>
            <td></td>
            <td className="num grand">{formatVND(o.total)}</td>
          </tr>
        </tfoot>
      </table>
      <h3>Thông tin giao hàng</h3>
      <dl className="kv">
        <dt>Mã đơn hàng</dt>
        <dd>{o.code}</dd>
        <dt>Thời gian đặt</dt>
        <dd>{formatDate(o.createdAt)}</dd>
        <dt>Họ và tên</dt>
        <dd>{o.customerName}</dd>
        <dt>Số điện thoại</dt>
        <dd>{o.phone}</dd>
        {o.email ? (
          <>
            <dt>Email</dt>
            <dd>{o.email}</dd>
          </>
        ) : null}
        <dt>Địa chỉ giao hàng</dt>
        <dd>{o.address}</dd>
        <dt>Thanh toán</dt>
        <dd>{o.paymentMethodLabel}</dd>
        <dt>Ghi chú</dt>
        <dd>{o.note ? o.note : <span className="muted">Không có</span>}</dd>
      </dl>
    </div>
  );
}
