import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { formatVND } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { SHOP } from "@/lib/shop";
import { bumpStore, closeCart, drawerStore, openCart, removeToast, toastStore } from "@/lib/ui-store";
import { CartLineItem } from "./cart-ui";
import { icons } from "./icons";

const NAV = [
  { to: "/", label: "Trang chủ" },
  { to: "/san-pham", label: "Sản phẩm" },
  { to: "/tra-cuu", label: "Tra cứu đơn hàng" },
] as const;

function usePath() {
  const p = useRouterState({ select: (s) => s.location.pathname });
  const clean = p.replace(/\/$/, "") || "/";
  return clean === "/chi-tiet" ? "/san-pham" : clean;
}

function Logo() {
  return (
    <Link className="logo" to="/" aria-label="Fresh Box – Trang chủ">
      <img src="/assets/img/logo.svg" alt="" width={44} height={44} />
      <span className="logo__text">
        <span className="logo__name">FRESH BOX</span>
        <span className="logo__sub">Hoa quả gọt sẵn</span>
      </span>
    </Link>
  );
}

function CartCount() {
  const { count } = useCart();
  const bump = bumpStore.use();
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !bump) return;
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  }, [bump]);
  return (
    <span ref={ref} className={`cart-count ${count > 0 ? "has-items" : ""}`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

function SiteHeader() {
  const path = usePath();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [path]);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="container header-inner">
        <Logo />
        <nav className={`main-nav ${open ? "is-open" : ""}`} id="main-nav" aria-label="Điều hướng chính">
          <ul>
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} aria-current={n.to === path ? "page" : undefined}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link className="btn btn--block mobile-cta" to="/dat-hang">
            Đặt hàng ngay {icons.arrow}
          </Link>
        </nav>
        <div className="header-actions">
          <Link className="login-link" to="/admin" title="Đăng nhập quản lý đơn hàng">
            {icons.user}
            <span>Đăng nhập</span>
          </Link>
          <button className="icon-btn" type="button" aria-label="Mở giỏ hàng" onClick={openCart}>
            {icons.cart}
            <CartCount />
          </button>
          <Link className="btn btn--sm header-cta" to="/dat-hang">
            Đặt hàng ngay
          </Link>
          <button
            className="icon-btn menu-toggle"
            type="button"
            aria-label="Mở menu"
            aria-expanded={open}
            aria-controls="main-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? icons.close : icons.menu}
          </button>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  const social = (
    [
      ["facebook", "Facebook"],
      ["instagram", "Instagram"],
      ["tiktok", "TikTok"],
      ["zalo", "Zalo"],
    ] as const
  ).filter(([k]) => SHOP.social[k]);
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Logo />
            <p className="footer-slogan">“{SHOP.slogan}”</p>
            <div className="socials">
              {social.map(([k, label]) => (
                <a key={k} href={SHOP.social[k]} target="_blank" rel="noopener noreferrer" aria-label={label}>
                  {icons[k]}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4>Khám phá</h4>
            <ul className="footer-links">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link to={n.to}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Đơn hàng</h4>
            <ul className="footer-links">
              <li>
                <Link to="/dat-hang">Đặt hàng ngay</Link>
              </li>
              <li>
                <Link to="/tra-cuu">Tra cứu đơn hàng</Link>
              </li>
              <li>
                <a href={`tel:${SHOP.phone}`}>Đặt số lượng lớn: {SHOP.phone}</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Liên hệ</h4>
            <ul className="footer-links footer-contact">
              <li>
                {icons.phone}
                <a href={`tel:${SHOP.phone}`}>{SHOP.phone}</a>
              </li>
              <li>
                {icons.mail}
                <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>
              </li>
              <li>
                {icons.pin}
                <span>{SHOP.address}</span>
              </li>
              <li>
                {icons.clock}
                <span>{SHOP.openingHours}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-wordmark" aria-hidden="true">
          FRESH BOX
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Fresh Box – Hoa quả gọt sẵn. Bảo lưu mọi quyền.</span>
          <span>Làm bằng 💚 và trái cây tươi mỗi ngày.</span>
        </div>
      </div>
    </footer>
  );
}

function CartDrawer() {
  const open = drawerStore.use();
  const cart = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);
  const path = usePath();

  useEffect(() => {
    document.documentElement.classList.toggle("drawer-open", open);
    if (!open) return;
    const last = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      last?.focus?.();
    };
  }, [open]);
  useEffect(() => closeCart(), [path]);

  return (
    <>
      <div className="drawer-backdrop" onClick={closeCart} />
      <aside className="drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" aria-hidden={!open}>
        <div className="drawer__head">
          <h2 id="cart-title">Giỏ hàng của bạn</h2>
          <button ref={closeRef} className="icon-btn" type="button" aria-label="Đóng giỏ hàng" onClick={closeCart}>
            {icons.close}
          </button>
        </div>
        <div className="drawer__body">
          {cart.lines.length ? (
            cart.lines.map((l) => <CartLineItem key={l.id} line={l} />)
          ) : (
            <div className="empty-state">
              <div className="empty-state__art">🍉</div>
              <h3>Giỏ hàng đang trống</h3>
              <p>Chọn một hộp trái cây tươi để tiếp thêm năng lượng nhé!</p>
              <Link className="btn btn--sm" to="/san-pham">
                Xem sản phẩm
              </Link>
            </div>
          )}
        </div>
        {cart.lines.length ? (
          <div className="drawer__foot">
            <div className="drawer__total">
              <span>Tổng tiền ({cart.count} hộp)</span>
              <strong>{formatVND(cart.total)}</strong>
            </div>
            <Link className="btn btn--block btn--lg" to="/dat-hang">
              Đặt hàng {icons.arrow}
            </Link>
            <button type="button" className="btn btn--ghost btn--block" onClick={closeCart}>
              Tiếp tục mua sắm
            </button>
          </div>
        ) : null}
      </aside>
    </>
  );
}

function ToastStack() {
  const toasts = toastStore.use();
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.type === "error" ? "toast--error" : ""} ${t.leaving ? "is-leaving" : ""}`}
          onAnimationEnd={() => t.leaving && removeToast(t.id)}
        >
          {t.image ? <img src={t.image} alt="" /> : null}
          <span>{t.message}</span>
          {t.openCartAction ? (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                openCart();
              }}
            >
              Xem giỏ
            </a>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function MobileBar() {
  const path = usePath();
  const cart = useCart();
  if (["/dat-hang", "/dat-hang-thanh-cong", "/admin"].includes(path)) return null;
  return (
    <div className={`mobile-bar ${cart.count > 0 ? "is-visible" : ""}`}>
      <div>
        <span>{cart.count} hộp trong giỏ</span>
        <strong>{formatVND(cart.total)}</strong>
      </div>
      <Link className="btn btn--butter btn--sm" to="/dat-hang">
        Đặt hàng {icons.arrow}
      </Link>
    </div>
  );
}

/** Hiệu ứng hiện dần khi cuộn tới, như website gốc. Dùng data-revealed (không đổi className do React quản lý). */
function useReveals() {
  const path = useRouterState({ select: (s) => s.location.href });
  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach((el) => el.setAttribute("data-revealed", ""));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.setAttribute("data-revealed", "");
            io.unobserve(en.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    const scan = () => document.querySelectorAll(".reveal:not([data-revealed])").forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [path]);
}

export function SiteLayout({ children }: { children: ReactNode }) {
  useReveals();
  return (
    <>
      <a className="sr-only" href="#main">
        Bỏ qua đến nội dung chính
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <CartDrawer />
      <MobileBar />
      <ToastStack />
    </>
  );
}
