import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { addWithFeedback, ProductCard, QtyStepper } from "@/components/freshbox/cart-ui";
import { icons } from "@/components/freshbox/icons";
import { findProduct, formatVND, MAX_QTY_PER_ITEM, PRODUCTS } from "@/lib/catalog";

export const Route = createFileRoute("/chi-tiet")({
  validateSearch: (s: Record<string, unknown>): { sp?: string } => (typeof s["sp"] === "string" ? { sp: s["sp"] } : {}),
  head: ({ match }) => {
    const p = findProduct(match.search.sp);
    const title = p ? `${p.name} – ${p.tagline} | FRESH BOX` : "Chi tiết sản phẩm – FRESH BOX";
    const desc = p?.short ?? "Xem chi tiết hộp trái cây gọt sẵn Fresh Box: thành phần, khối lượng, giá bán và đặt hàng nhanh.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: Detail,
});

function Detail() {
  const { sp } = Route.useSearch();
  const p = findProduct(sp);
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  useEffect(() => setQty(1), [sp]);

  return (
    <div className="container">
      {!p ? (
        <div className="empty-state" style={{ padding: "80px 0" }}>
          <div className="empty-state__art">🍍</div>
          <h2>Không tìm thấy sản phẩm</h2>
          <p>Sản phẩm bạn tìm có thể đã ngừng bán hoặc đường dẫn chưa đúng.</p>
          <Link className="btn" to="/san-pham">
            Xem tất cả sản phẩm
          </Link>
        </div>
      ) : (
        <div key={p.id}>
          <nav className="breadcrumb" aria-label="Đường dẫn" style={{ paddingTop: 28 }}>
            <Link to="/">Trang chủ</Link> / <Link to="/san-pham">Sản phẩm</Link> / {p.name}
          </nav>
          <div className="detail">
            <div className="detail__media load-in">
              <img src={p.image} alt={p.name} width={800} height={800} fetchPriority="high" />
              {p.badge ? <span className="badge">{p.badge}</span> : null}
            </div>
            <div className="load-in load-in-1">
              <span className="eyebrow">{p.tagline}</span>
              <h1>{p.name}</h1>
              <div className="detail__price">{formatVND(p.price)}</div>
              <p className="detail__desc">{p.description}</p>
              <dl className="specs">
                <div>
                  <dt>Khối lượng</dt>
                  <dd>{p.weight}</dd>
                </div>
                <div>
                  <dt>Phù hợp</dt>
                  <dd>{p.serves}</dd>
                </div>
                <div>
                  <dt>Bảo quản</dt>
                  <dd>4–8°C, dùng trong ngày</dd>
                </div>
              </dl>
              <p style={{ fontWeight: 700, color: "var(--green-900)", marginBottom: 8 }}>Thành phần trái cây</p>
              <div className="fruit-chips">
                {p.fruits.map((f) => (
                  <span key={f}>{f}</span>
                ))}
              </div>
              <div className="detail__buy">
                <QtyStepper lg min1 value={qty} onChange={(q) => setQty(Math.min(MAX_QTY_PER_ITEM, Math.max(1, q)))} />
                <button type="button" className="btn btn--lg" onClick={() => addWithFeedback(p.id, qty)}>
                  {icons.cart} Thêm vào giỏ
                </button>
                <button
                  type="button"
                  className="btn btn--butter btn--lg"
                  onClick={() => {
                    addWithFeedback(p.id, qty);
                    navigate({ to: "/dat-hang" });
                  }}
                >
                  Mua ngay
                </button>
                <div className="detail__subtotal">
                  Thành tiền: <strong>{formatVND(p.price * qty)}</strong>
                </div>
              </div>
              <ul className="detail__perks">
                <li>{icons.check} Sơ chế và đóng gói trong ngày giao</li>
                <li>{icons.check} Kèm nĩa gỗ và khăn giấy</li>
                <li>{icons.check} Thanh toán khi nhận hàng hoặc chuyển khoản</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <span className="eyebrow">Có thể bạn cũng thích</span>
          <h2>Hộp trái cây khác</h2>
        </div>
        <div className="products-grid">
          {PRODUCTS.filter((x) => x.id !== sp)
            .slice(0, 4)
            .map((x, i) => (
              <ProductCard key={x.id} p={x} i={i} />
            ))}
        </div>
      </section>
    </div>
  );
}
