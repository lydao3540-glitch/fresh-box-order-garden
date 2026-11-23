import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { findProduct, formatNumber, formatVND, MAX_QTY_PER_ITEM, type CartLine, type Product } from "@/lib/catalog";
import { addToCart, removeFromCart, setQuantity } from "@/lib/cart";
import { bumpStore, toast } from "@/lib/ui-store";
import { icons } from "./icons";

export function QtyStepper({
  value,
  onChange,
  lg,
  min1,
}: {
  value: number;
  onChange: (q: number) => void;
  lg?: boolean;
  min1?: boolean;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const v = Math.floor(Number(draft));
    onChange(Number.isFinite(v) && v >= 1 ? Math.min(MAX_QTY_PER_ITEM, v) : 1);
  };
  return (
    <div className={`qty ${lg ? "qty--lg" : ""}`}>
      <button type="button" aria-label="Giảm số lượng" disabled={min1 && value <= 1} onClick={() => onChange(value - 1)}>
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={MAX_QTY_PER_ITEM}
        value={draft}
        aria-label="Số lượng"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
        }}
      />
      <button type="button" aria-label="Tăng số lượng" disabled={value >= MAX_QTY_PER_ITEM} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}

export function CartLineItem({ line }: { line: CartLine }) {
  return (
    <div className="cart-item">
      <Link to="/chi-tiet" search={{ sp: line.id }}>
        <img src={line.image} alt={line.name} width={76} height={76} loading="lazy" />
      </Link>
      <div>
        <Link className="cart-item__name" to="/chi-tiet" search={{ sp: line.id }}>
          {line.name}
        </Link>
        <div className="cart-item__price">{formatVND(line.price)} / hộp</div>
        <div className="cart-item__controls">
          <QtyStepper value={line.quantity} onChange={(q) => (q <= 0 ? removeFromCart(line.id) : setQuantity(line.id, q))} />
          <button type="button" className="remove-btn" aria-label={`Xóa ${line.name} khỏi giỏ`} onClick={() => removeFromCart(line.id)}>
            {icons.trash}
            <span>Xóa</span>
          </button>
        </div>
      </div>
      <div className="cart-item__line">{formatVND(line.lineTotal)}</div>
    </div>
  );
}

/** Thêm vào giỏ + phản hồi trực quan (toast, số giỏ nảy lên). */
export function addWithFeedback(id: string, qty = 1) {
  const p = findProduct(id);
  if (!p) return;
  addToCart(id, qty);
  toast(`Đã thêm ${qty} × ${p.name} vào giỏ`, { image: p.image, openCartAction: true });
  bumpStore.set(bumpStore.get() + 1);
}

function AddButton({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <button
      className={`add-btn ${added ? "is-added" : ""}`}
      type="button"
      aria-label={`Thêm ${product.name} vào giỏ`}
      onClick={() => {
        addWithFeedback(product.id, 1);
        setAdded(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setAdded(false), 1200);
      }}
    >
      {added ? icons.check : icons.plus}
    </button>
  );
}

export function ProductCard({ p, i = 0 }: { p: Product; i?: number }) {
  return (
    <article className={`product-card reveal reveal-delay-${i % 4}`}>
      <Link className="product-card__media" to="/chi-tiet" search={{ sp: p.id }} aria-label={`Xem chi tiết ${p.name}`}>
        <img src={p.image} alt={`${p.name} – ${p.tagline}`} width={800} height={800} loading="lazy" decoding="async" />
        {p.badge ? <span className="badge">{p.badge}</span> : null}
      </Link>
      <div className="product-card__body">
        <span className="product-card__tagline">{p.tagline}</span>
        <h3>
          <Link to="/chi-tiet" search={{ sp: p.id }}>
            {p.name}
          </Link>
        </h3>
        <p className="product-card__desc">{p.short}</p>
        <div className="fruit-chips">
          {p.fruits.map((f) => (
            <span key={f}>{f}</span>
          ))}
        </div>
        <div className="product-card__foot">
          <div className="price">
            {formatNumber(p.price)}
            <small>VNĐ</small>
          </div>
          <div className="product-card__actions">
            <Link className="btn btn--ghost btn--sm" to="/chi-tiet" search={{ sp: p.id }}>
              Chi tiết
            </Link>
            <AddButton product={p} />
          </div>
        </div>
      </div>
    </article>
  );
}
