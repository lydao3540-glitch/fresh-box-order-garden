import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { CartLineItem } from "@/components/freshbox/cart-ui";
import { icons } from "@/components/freshbox/icons";
import { formatNumber, formatVND, PRODUCTS } from "@/lib/catalog";
import { addToCart, clearCart, useCart } from "@/lib/cart";
import { validateOrderForm, type OrderFieldErrors, type OrderFormValues } from "@/lib/order-rules";
import { createOrder } from "@/lib/orders.functions";
import { SHOP } from "@/lib/shop";
import { toast } from "@/lib/ui-store";

export const Route = createFileRoute("/dat-hang")({
  head: () => ({
    meta: [
      { title: "Đặt hàng – FRESH BOX" },
      { name: "description", content: "Đặt hộp trái cây gọt sẵn Fresh Box: điền thông tin giao hàng, chọn thanh toán COD hoặc chuyển khoản." },
      { property: "og:title", content: "Đặt hàng – FRESH BOX" },
      { property: "og:description", content: "Đặt hộp trái cây gọt sẵn Fresh Box chỉ trong 1 phút." },
    ],
  }),
  component: Checkout,
});

const CUSTOMER_KEY = "freshbox-customer";
const LAST_ORDER_KEY = "freshbox-last-order";

const EMPTY: OrderFormValues = { customerName: "", phone: "", email: "", address: "", note: "", paymentMethod: "cod" };

function FieldError({ id, msg }: { id: string; msg?: string | undefined }) {
  return (
    <div className="field-error" id={id} style={msg ? { display: "flex" } : undefined}>
      {msg}
    </div>
  );
}

function Checkout() {
  const cart = useCart();
  const navigate = useNavigate();
  const submit = useServerFn(createOrder);
  const [values, setValues] = useState<OrderFormValues>(EMPTY);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<OrderFieldErrors>({});
  const [summaryErrors, setSummaryErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const errorsRef = useRef<HTMLDivElement>(null);

  // Ghi nhớ thông tin khách trên thiết bị này
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CUSTOMER_KEY) || "null") as Partial<OrderFormValues> | null;
      if (saved) setValues((v) => ({ ...v, ...pick(saved) }));
    } catch {
      /* ignore */
    }
  }, []);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name as keyof OrderFormValues;
    const next = { ...values, [name]: e.target.value };
    setValues(next);
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: validateOrderForm(next).errors[name] }));
  };
  const onBlur = (name: keyof OrderFormValues) => {
    if (values[name].trim() || errors[name]) setErrors((prev) => ({ ...prev, [name]: validateOrderForm(values).errors[name] }));
  };

  const showSummary = (errs: OrderFieldErrors, extra?: string) => {
    const msgs = Object.values(errs).filter(Boolean) as string[];
    if (extra) msgs.push(extra);
    setSummaryErrors(msgs);
    if (msgs.length) requestAnimationFrame(() => errorsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const { values: clean, errors: errs } = validateOrderForm(values);
    const cartError = cart.lines.length ? undefined : "Giỏ hàng đang trống – vui lòng chọn ít nhất một sản phẩm.";
    setErrors(errs);
    if (Object.keys(errs).length || cartError) return showSummary(errs, cartError);
    showSummary({});
    setSubmitting(true);
    try {
      const res = await submit({
        data: { ...clean, website, items: cart.lines.map((l) => ({ id: l.id, quantity: l.quantity })) },
      });
      if (!res.ok) {
        if (res.fields) setErrors(res.fields);
        showSummary(res.fields ?? {}, res.fields ? undefined : res.error);
        setSubmitting(false);
        return;
      }
      localStorage.setItem(
        CUSTOMER_KEY,
        JSON.stringify({ customerName: clean.customerName, phone: clean.phone, address: clean.address, email: clean.email }),
      );
      sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(res.order));
      clearCart();
      navigate({ to: "/dat-hang-thanh-cong", search: { ma: res.order.code } });
    } catch {
      showSummary({}, "Mất kết nối mạng. Vui lòng kiểm tra Internet và thử lại.");
      toast("Không gửi được đơn hàng, vui lòng thử lại.", { type: "error" });
      setSubmitting(false);
    }
  };

  const inCart = new Set(cart.lines.map((l) => l.id));
  const rest = PRODUCTS.filter((p) => !inCart.has(p.id));
  const fieldClass = (k: keyof OrderFormValues, extra = "") => `field ${extra} ${errors[k] ? "has-error" : ""}`;
  const bank = SHOP.bank;

  return (
    <>
      <section className="page-hero" style={{ paddingBottom: 28 }}>
        <div className="container">
          <nav className="breadcrumb" aria-label="Đường dẫn">
            <Link to="/">Trang chủ</Link> / <Link to="/san-pham">Sản phẩm</Link> / Đặt hàng
          </nav>
          <h1 className="load-in">
            Đặt hàng <span className="scribble">nhanh</span>
          </h1>
          <p className="load-in load-in-1">
            Chỉ cần họ tên, số điện thoại và địa chỉ – Fresh Box sẽ gọi xác nhận và giao trái cây tươi đến bạn.
          </p>
        </div>
      </section>

      <div className="container checkout">
        <form id="checkout-form" noValidate onSubmit={onSubmit}>
          <div className="notice notice--error" role="alert" tabIndex={-1} hidden={!summaryErrors.length} ref={errorsRef}>
            {icons.alert}
            <div>
              <p>
                <strong>Chưa thể gửi đơn hàng</strong>
              </p>
              <ul>
                {summaryErrors.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          <section className="panel load-in">
            <h2>
              <span className="num">1</span> Thông tin giao hàng
            </h2>
            <div className="form-grid">
              <div className={fieldClass("customerName")}>
                <label htmlFor="customerName">
                  Họ và tên <span className="req">*</span>
                </label>
                <input
                  className="input"
                  id="customerName"
                  name="customerName"
                  autoComplete="name"
                  maxLength={120}
                  placeholder="Nguyễn Văn A"
                  value={values.customerName}
                  onChange={onChange}
                  onBlur={() => onBlur("customerName")}
                  aria-invalid={!!errors.customerName || undefined}
                  aria-describedby="customerName-error"
                />
                <FieldError id="customerName-error" msg={errors.customerName} />
              </div>
              <div className={fieldClass("phone")}>
                <label htmlFor="phone">
                  Số điện thoại <span className="req">*</span>
                </label>
                <input
                  className="input"
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={15}
                  placeholder="09xx xxx xxx"
                  value={values.phone}
                  onChange={onChange}
                  onBlur={() => onBlur("phone")}
                  aria-invalid={!!errors.phone || undefined}
                  aria-describedby="phone-error"
                />
                <FieldError id="phone-error" msg={errors.phone} />
              </div>
              <div className={fieldClass("address", "full")}>
                <label htmlFor="address">
                  Địa chỉ giao hàng <span className="req">*</span>
                </label>
                <input
                  className="input"
                  id="address"
                  name="address"
                  autoComplete="street-address"
                  maxLength={400}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                  value={values.address}
                  onChange={onChange}
                  onBlur={() => onBlur("address")}
                  aria-invalid={!!errors.address || undefined}
                  aria-describedby="address-error"
                />
                <FieldError id="address-error" msg={errors.address} />
              </div>
              <div className={fieldClass("email", "full")}>
                <label htmlFor="email">
                  Email <span className="hint">(không bắt buộc – để nhận xác nhận khi cần)</span>
                </label>
                <input
                  className="input"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={200}
                  placeholder="ban@email.com"
                  value={values.email}
                  onChange={onChange}
                  onBlur={() => onBlur("email")}
                  aria-invalid={!!errors.email || undefined}
                  aria-describedby="email-error"
                />
                <FieldError id="email-error" msg={errors.email} />
              </div>
            </div>
          </section>

          <section className="panel load-in load-in-1">
            <h2>
              <span className="num">2</span> Phương thức thanh toán
            </h2>
            <div className="pay-options" role="radiogroup" aria-label="Phương thức thanh toán">
              <div className="pay-option">
                <input
                  type="radio"
                  id="pay-cod"
                  name="paymentMethod"
                  value="cod"
                  checked={values.paymentMethod === "cod"}
                  onChange={onChange}
                />
                <label htmlFor="pay-cod">
                  <span className="pay-icon">{icons.cash}</span>
                  <span>
                    <strong>Thanh toán khi nhận hàng (COD)</strong>
                    <small>Trả tiền mặt cho shipper</small>
                  </span>
                </label>
              </div>
              <div className="pay-option">
                <input
                  type="radio"
                  id="pay-bank"
                  name="paymentMethod"
                  value="bank"
                  checked={values.paymentMethod === "bank"}
                  onChange={onChange}
                />
                <label htmlFor="pay-bank">
                  <span className="pay-icon">{icons.bank}</span>
                  <span>
                    <strong>Chuyển khoản ngân hàng</strong>
                    <small>Chuyển khoản theo mã đơn hàng</small>
                  </span>
                </label>
              </div>
            </div>
            {values.paymentMethod === "bank" ? (
              <div className="notice">
                {bank.bankName && bank.accountNumber ? (
                  <div>
                    <p>
                      <strong>Thông tin chuyển khoản</strong>
                    </p>
                    <p>
                      Ngân hàng: <strong>{bank.bankName}</strong>
                      <br />
                      Số tài khoản: <strong>{bank.accountNumber}</strong>
                      <br />
                      Chủ tài khoản: <strong>{bank.accountHolder}</strong>
                    </p>
                    <p>
                      Nội dung chuyển khoản: <strong>mã đơn hàng</strong> (hiển thị ngay sau khi đặt hàng).
                    </p>
                  </div>
                ) : (
                  <p>
                    Sau khi đặt hàng, nhân viên Fresh Box sẽ gọi xác nhận và gửi thông tin chuyển khoản cho bạn. Vui lòng ghi{" "}
                    <strong>mã đơn hàng</strong> trong nội dung chuyển khoản.
                  </p>
                )}
              </div>
            ) : null}
            <FieldError id="paymentMethod-error" msg={errors.paymentMethod} />
          </section>

          <section className="panel load-in load-in-2">
            <h2>
              <span className="num">3</span> Ghi chú đơn hàng
            </h2>
            <div className={fieldClass("note")}>
              <label htmlFor="note" className="sr-only">
                Ghi chú
              </label>
              <textarea
                className="input"
                id="note"
                name="note"
                maxLength={1000}
                placeholder="Ví dụ: giao trước 11h, không lấy dứa, gọi trước khi giao…"
                value={values.note}
                onChange={onChange}
              />
              <FieldError id="note-error" msg={errors.note} />
            </div>
            <div className="hp" aria-hidden="true">
              <label>
                Website <input name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </label>
            </div>

            <button type="submit" className={`btn btn--lg btn--block mt-2 ${submitting ? "is-loading" : ""}`} disabled={submitting}>
              {submitting ? (
                <span>
                  <span className="spinner" aria-hidden="true"></span> Đang gửi đơn hàng…
                </span>
              ) : (
                <span>{cart.count ? `Xác nhận đặt hàng · ${formatVND(cart.total)}` : "Xác nhận đặt hàng"}</span>
              )}
            </button>
          </section>
        </form>

        <aside className="summary">
          <div className="panel">
            <h2 style={{ justifyContent: "space-between" }}>
              Đơn hàng của bạn{" "}
              <span className="status-pill" data-status="delivered">
                {cart.count} hộp
              </span>
            </h2>
            <div>
              {cart.lines.length ? (
                cart.lines.map((l) => <CartLineItem key={l.id} line={l} />)
              ) : (
                <div className="empty-state" style={{ padding: "20px 0 6px" }}>
                  <div className="empty-state__art">🥝</div>
                  <h3>Chưa có sản phẩm nào</h3>
                  <p>Thêm nhanh một hộp bên dưới để bắt đầu đặt hàng.</p>
                </div>
              )}
            </div>
            {rest.length ? (
              <div className="quick-add">
                <p>{cart.lines.length ? "Thêm sản phẩm khác" : "Chọn sản phẩm"}</p>
                <div className="quick-add__list">
                  {rest.map((p) => (
                    <button key={p.id} type="button" className="chip-btn" onClick={() => addToCart(p.id, 1)}>
                      + {p.name.replace("Fresh Box ", "")} · {formatNumber(p.price)}đ
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="summary__rows">
              <div className="summary__row">
                <span>Tạm tính</span>
                <span>{formatVND(cart.total)}</span>
              </div>
              <div className="summary__row">
                <span>Phí giao hàng</span>
                <span>Nhân viên báo khi xác nhận</span>
              </div>
              <div className="summary__row summary__row--total">
                <span>Tổng tiền hàng</span>
                <strong>{formatVND(cart.total)}</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function pick(saved: Partial<OrderFormValues>): Partial<OrderFormValues> {
  const out: Partial<OrderFormValues> = {};
  for (const k of ["customerName", "phone", "address", "email"] as const) {
    const v = saved[k];
    if (typeof v === "string" && v) out[k] = v;
  }
  return out;
}
