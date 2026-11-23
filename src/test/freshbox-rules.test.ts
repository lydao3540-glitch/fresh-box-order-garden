import { describe, expect, it } from "vitest";
import { computeCart, findProduct } from "@/lib/catalog";
import { generateOrderCode, validateOrderForm } from "@/lib/order-rules";
import { summarizeOrders } from "@/lib/admin-stats";
import { buildOrderEmail, ORDER_NOTIFY_EMAIL } from "@/lib/order-email.server";

describe("Fresh Box rules", () => {
  it("has exactly the 5 products at the agreed prices", () => {
    expect(findProduct("mini")?.price).toBe(25000);
    expect(findProduct("mix")?.price).toBe(35000);
    expect(findProduct("premium")?.price).toBe(45000);
    expect(findProduct("office")?.price).toBe(50000);
    expect(findProduct("family")?.price).toBe(65000);
  });

  it("totals the cart from catalog prices and drops unknown items", () => {
    const cart = computeCart([
      { id: "mini", quantity: 2 },
      { id: "family", quantity: 1 },
      { id: "fake", quantity: 9 },
    ]);
    expect(cart.count).toBe(3);
    expect(cart.total).toBe(115000);
  });

  it("creates order codes like FB241123-7KQ2 using Vietnam date", () => {
    const code = generateOrderCode(new Date("2026-11-23T20:00:00Z"));
    expect(code).toMatch(/^FB261124-[A-Z2-9]{4}$/);
  });

  it("requires name, phone and address and accepts COD or bank transfer only", () => {
    const base = { customerName: "Lan", phone: "0382 696 117", email: "", address: "12 Lê Lợi, Q1, HCM", note: "", paymentMethod: "cod" };
    expect(validateOrderForm(base).errors).toEqual({});
    expect(validateOrderForm({ ...base, paymentMethod: "bank" }).errors).toEqual({});
    expect(validateOrderForm({ ...base, paymentMethod: "momo" }).errors.paymentMethod).toBeTruthy();
    expect(validateOrderForm({ ...base, phone: "12345" }).errors.phone).toBeTruthy();
    expect(validateOrderForm({ ...base, address: "" }).errors.address).toBeTruthy();
  });

  it("sends order emails to the owner's Gmail with code, customer, items and total", () => {
    expect(ORDER_NOTIFY_EMAIL).toBe("lamhuyentham1205@gmail.com");
    const { subject, text } = buildOrderEmail({
      code: "FB261123-ABCD",
      createdAt: "2026-11-23T10:00:00Z",
      customerName: "Nguyễn Lan",
      phone: "0382696117",
      email: null,
      address: "12 Lê Lợi",
      note: null,
      paymentMethod: "cod",
      paymentMethodLabel: "Thanh toán khi nhận hàng (COD)",
      status: "pending",
      items: [{ id: "mix", name: "Fresh Box Mix", price: 35000, quantity: 2, lineTotal: 70000 }],
      totalQuantity: 2,
      total: 70000,
    });
    expect(subject).toContain("FB261123-ABCD");
    expect(text).toContain("Nguyễn Lan");
    expect(text).toContain("0382696117");
    expect(text).toContain("Fresh Box Mix × 2");
    expect(text).toContain("70.000 VNĐ");
  });

  it("excludes cancelled orders from revenue", () => {
    const row = { created_at: "2026-11-23T03:00:00Z", customer_name: "A", phone: "0900000000", email: null, address: "x" };
    const s = summarizeOrders(
      [
        { ...row, status: "delivered", total: 50000 },
        { ...row, status: "pending", total: 25000 },
        { ...row, status: "cancelled", total: 65000 },
      ],
      new Date("2026-11-23T05:00:00Z"),
    );
    expect(s.deliveredRevenue).toBe(50000);
    expect(s.activeRevenue).toBe(75000);
    expect(s.todayRevenue).toBe(75000);
    expect(s.customers[0]?.spent).toBe(75000);
  });
});
