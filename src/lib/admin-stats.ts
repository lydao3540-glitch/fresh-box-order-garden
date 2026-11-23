// Tính doanh thu và danh sách khách hàng cho trang quản lý.
import { ORDER_STATUSES, type OrderStatus } from "./catalog";

export type StatOrder = {
  status: string;
  total: number;
  created_at: string;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
};

const vnDay = (d: Date) => new Date(d.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10);

export function summarizeOrders(rows: StatOrder[], now = new Date()) {
  const byStatus = Object.fromEntries(Object.keys(ORDER_STATUSES).map((k) => [k, 0])) as Record<OrderStatus, number>;
  let deliveredRevenue = 0;
  let activeRevenue = 0;
  let todayRevenue = 0;
  let todayOrders = 0;
  const today = vnDay(now);
  const customers = new Map<
    string,
    { name: string; phone: string; email: string | null; address: string; orders: number; spent: number; lastOrderAt: string }
  >();

  for (const o of rows) {
    if (o.status in byStatus) byStatus[o.status as OrderStatus]++;
    const cancelled = o.status === "cancelled";
    if (o.status === "delivered") deliveredRevenue += o.total;
    if (!cancelled) activeRevenue += o.total;
    if (vnDay(new Date(o.created_at)) === today) {
      todayOrders++;
      if (!cancelled) todayRevenue += o.total;
    }
    const c = customers.get(o.phone);
    if (!c) {
      customers.set(o.phone, {
        name: o.customer_name,
        phone: o.phone,
        email: o.email,
        address: o.address,
        orders: 1,
        spent: cancelled ? 0 : o.total,
        lastOrderAt: o.created_at,
      });
    } else {
      c.orders++;
      if (!cancelled) c.spent += o.total;
      if (o.created_at > c.lastOrderAt) {
        Object.assign(c, { name: o.customer_name, email: o.email ?? c.email, address: o.address, lastOrderAt: o.created_at });
      }
    }
  }
  return {
    totalOrders: rows.length,
    byStatus,
    deliveredRevenue,
    activeRevenue,
    todayRevenue,
    todayOrders,
    customers: [...customers.values()].sort((a, b) => b.lastOrderAt.localeCompare(a.lastOrderAt)),
  };
}
