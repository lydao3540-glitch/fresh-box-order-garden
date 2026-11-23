import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { icons } from "@/components/freshbox/icons";
import { Receipt } from "@/components/freshbox/order-view";
import { lookupOrder } from "@/lib/orders.functions";

export const Route = createFileRoute("/tra-cuu")({
  validateSearch: (s: Record<string, unknown>): { ma?: string } => (typeof s["ma"] === "string" ? { ma: s["ma"] } : {}),
  head: () => ({
    meta: [
      { title: "Tra cứu đơn hàng – FRESH BOX" },
      { name: "description", content: "Tra cứu trạng thái đơn hàng Fresh Box bằng mã đơn hàng và số điện thoại." },
      { property: "og:title", content: "Tra cứu đơn hàng – FRESH BOX" },
      { property: "og:description", content: "Theo dõi đơn hàng Fresh Box bằng mã đơn và số điện thoại." },
    ],
  }),
  component: Lookup,
});

const ErrorBox = ({ msg }: { msg: string }) => (
  <div className="notice notice--error">
    {icons.alert}
    <p>{msg}</p>
  </div>
);

function Lookup() {
  const { ma } = Route.useSearch();
  const lookup = useServerFn(lookupOrder);
  const [code, setCode] = useState(ma ?? "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReactNode>(null);
  const auto = useRef(false);

  const run = async (c: string, p: string) => {
    const cc = c.trim().toUpperCase();
    if (!cc || !p.trim()) {
      setResult(<ErrorBox msg="Vui lòng nhập đầy đủ mã đơn hàng và số điện thoại." />);
      return;
    }
    setLoading(true);
    setResult(<div className="skeleton" style={{ height: 300 }} />);
    try {
      const res = await lookup({ data: { code: cc, phone: p } });
      setResult(res.order ? <Receipt o={res.order} /> : <ErrorBox msg="Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn và số điện thoại." />);
    } catch {
      setResult(<ErrorBox msg="Mất kết nối, vui lòng thử lại." />);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let savedPhone = "";
    try {
      savedPhone = (JSON.parse(localStorage.getItem("freshbox-customer") || "null") as { phone?: string } | null)?.phone ?? "";
    } catch {
      /* ignore */
    }
    if (savedPhone) setPhone(savedPhone);
    if (!auto.current && ma && savedPhone) {
      auto.current = true;
      void run(ma, savedPhone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void run(code, phone);
  };

  return (
    <>
      <section className="page-hero">
        <div className="container lookup" style={{ paddingBottom: 0 }}>
          <nav className="breadcrumb" aria-label="Đường dẫn">
            <Link to="/">Trang chủ</Link> / Tra cứu đơn hàng
          </nav>
          <h1 className="load-in">
            Theo dõi <span className="scribble">đơn hàng</span>
          </h1>
          <p className="load-in load-in-1">Nhập mã đơn hàng (ví dụ FB241123-7KQ2) và số điện thoại đã dùng khi đặt hàng.</p>
        </div>
      </section>
      <div className="container lookup">
        <form className="panel lookup-form load-in load-in-2" noValidate onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="lk-code">Mã đơn hàng</label>
            <input
              className="input"
              id="lk-code"
              name="code"
              placeholder="FB241123-XXXX"
              autoComplete="off"
              style={{ textTransform: "uppercase" }}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="lk-phone">Số điện thoại</label>
            <input
              className="input"
              id="lk-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              placeholder="09xx xxx xxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <button className={`btn ${loading ? "is-loading" : ""}`} type="submit" disabled={loading}>
            Tra cứu
          </button>
        </form>
        <div aria-live="polite">{result}</div>
      </div>
    </>
  );
}
