import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { icons } from "@/components/freshbox/icons";
import { formatDate, StatusPill } from "@/components/freshbox/order-view";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import type { Database } from "@/integrations/supabase/types";
import { formatVND, ORDER_STATUSES, PAYMENT_METHODS, type OrderStatus, type PaymentMethod } from "@/lib/catalog";
import { summarizeOrders } from "@/lib/admin-stats";
import { toast } from "@/lib/ui-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Quản lý đơn hàng – FRESH BOX" },
      { name: "description", content: "Trang quản lý đơn hàng, khách hàng và doanh thu của Fresh Box." },
      { property: "og:title", content: "Quản lý đơn hàng – FRESH BOX" },
      { property: "og:description", content: "Trang quản lý dành cho chủ cửa hàng Fresh Box." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItem = { id: string; name: string; price: number; quantity: number; lineTotal: number };

function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return { user, ready };
}

function AdminPage() {
  const { user, ready } = useAuthState();
  const role = useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", { _user_id: user!.id, _role: "admin" });
      if (error) throw error;
      return data === true;
    },
  });

  return (
    <div className="container admin">
      <section className="page-hero" style={{ paddingBottom: 20 }}>
        <h1 className="load-in">
          Quản lý <span className="scribble">đơn hàng</span>
        </h1>
      </section>
      {!ready || (user && role.isPending) ? (
        <div className="skeleton" style={{ height: 320 }} />
      ) : !user ? (
        <LoginPanel />
      ) : !role.data ? (
        <div className="panel admin-login">
          <h2>Chưa có quyền quản lý</h2>
          <p className="muted">
            Tài khoản <strong>{user.email}</strong> chưa được cấp quyền xem đơn hàng. Hãy đăng nhập bằng Gmail của chủ cửa hàng.
          </p>
          <button className="btn btn--block" type="button" onClick={() => supabase.auth.signOut()}>
            Đăng xuất
          </button>
        </div>
      ) : (
        <Dashboard email={user.email ?? ""} />
      )}
    </div>
  );
}

const GoogleLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
  </svg>
);

function LoginPanel() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!email.trim() || password.length < 6) {
      setMsg({ type: "error", text: "Vui lòng nhập email và mật khẩu (tối thiểu 6 ký tự)." });
      return;
    }
    setBusy(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) setMsg({ type: "error", text: error.message === "Invalid login credentials" ? "Email hoặc mật khẩu không đúng." : error.message });
    } else {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (error) setMsg({ type: "error", text: error.message });
      else setMsg({ type: "success", text: "Đã tạo tài khoản. Vui lòng mở email để xác nhận, sau đó quay lại đây đăng nhập." });
    }
    setBusy(false);
  };

  const google = async () => {
    setMsg(null);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/admin` });
    if (result.error) setMsg({ type: "error", text: "Không đăng nhập được bằng Google. Vui lòng thử lại." });
  };

  return (
    <div className="panel admin-login">
      <h2>{mode === "signin" ? "Đăng nhập quản lý" : "Tạo tài khoản quản lý"}</h2>
      <p className="muted">Chỉ chủ cửa hàng Fresh Box mới xem được đơn hàng.</p>
      <button className="btn btn--google btn--block" type="button" onClick={google}>
        <GoogleLogo />
        Continue with Google
      </button>
      <div className="divider">hoặc</div>
      <form onSubmit={onSubmit} noValidate>
        {msg ? (
          <div className={`notice ${msg.type === "error" ? "notice--error" : "notice--success"}`} role="alert">
            <p>{msg.text}</p>
          </div>
        ) : null}
        <div className="field">
          <label htmlFor="ad-email">Email</label>
          <input className="input" id="ad-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="ad-pass">Mật khẩu</label>
          <input
            className="input"
            id="ad-pass"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className={`btn btn--block ${busy ? "is-loading" : ""}`} type="submit" disabled={busy}>
          {mode === "signin" ? "Đăng nhập" : "Tạo tài khoản"}
        </button>
        <p className="muted" style={{ fontSize: ".88rem", margin: 0, textAlign: "center" }}>
          {mode === "signin" ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
          <button type="button" className="switch" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "Tạo tài khoản" : "Đăng nhập"}
          </button>
        </p>
      </form>
    </div>
  );
}

function Dashboard({ email }: { email: string }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"orders" | "customers">("orders");
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [q, setQ] = useState("");

  const orders = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(1000);
      if (error) throw error;
      return data;
    },
    refetchInterval: 30_000,
  });

  const update = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: OrderStatus }) => {
      const { error } = await supabase.from("orders").update({ status: next }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.setQueryData<OrderRow[]>(["admin-orders"], (old) => old?.map((o) => (o.id === v.id ? { ...o, status: v.next } : o)));
      toast(`Đã cập nhật: ${ORDER_STATUSES[v.next]}`);
    },
    onError: () => toast("Không cập nhật được trạng thái", { type: "error" }),
  });

  const rows = orders.data ?? [];
  const stats = useMemo(() => summarizeOrders(rows), [rows]);
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter(
      (o) =>
        (status === "all" || o.status === status) &&
        (!term || [o.code, o.customer_name, o.phone, o.email ?? "", o.address].some((v) => v.toLowerCase().includes(term))),
    );
  }, [rows, status, q]);

  return (
    <>
      <div className="admin-head">
        <div className="admin-tabs">
          <button className={`btn btn--sm ${tab === "orders" ? "" : "btn--ghost"}`} type="button" onClick={() => setTab("orders")}>
            Đơn hàng
          </button>
          <button className={`btn btn--sm ${tab === "customers" ? "" : "btn--ghost"}`} type="button" onClick={() => setTab("customers")}>
            Khách hàng
          </button>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <small className="muted">{email}</small>
          <button className="btn btn--ghost btn--sm" type="button" onClick={() => orders.refetch()}>
            Làm mới
          </button>
          <button className="btn btn--ghost btn--sm" type="button" onClick={() => supabase.auth.signOut()}>
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat admin-stat--static">
          <b>{formatVND(stats.deliveredRevenue)}</b>
          <span>Doanh thu đã giao</span>
        </div>
        <div className="admin-stat admin-stat--static">
          <b>{formatVND(stats.activeRevenue)}</b>
          <span>Doanh thu (trừ đơn hủy)</span>
        </div>
        <div className="admin-stat admin-stat--static">
          <b>{formatVND(stats.todayRevenue)}</b>
          <span>Hôm nay · {stats.todayOrders} đơn</span>
        </div>
        <div className="admin-stat admin-stat--static">
          <b>{stats.totalOrders}</b>
          <span>Tổng đơn hàng</span>
        </div>
        <div className="admin-stat admin-stat--static">
          <b>{stats.byStatus.pending}</b>
          <span>Chờ xác nhận</span>
        </div>
        <div className="admin-stat admin-stat--static">
          <b>{stats.customers.length}</b>
          <span>Khách hàng</span>
        </div>
      </div>

      {orders.isError ? (
        <div className="notice notice--error">
          {icons.alert}
          <p>Không tải được đơn hàng. Bấm “Làm mới” để thử lại.</p>
        </div>
      ) : orders.isPending ? (
        <div className="skeleton" style={{ height: 300 }} />
      ) : tab === "orders" ? (
        <>
          <div className="admin-toolbar">
            <input
              className="input"
              type="search"
              placeholder="Tìm mã đơn, tên, số điện thoại, địa chỉ…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Tìm đơn hàng"
            />
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Lọc theo trạng thái">
              <option value="all">Tất cả trạng thái ({rows.length})</option>
              {(Object.keys(ORDER_STATUSES) as OrderStatus[]).map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUSES[s]} ({stats.byStatus[s]})
                </option>
              ))}
            </select>
          </div>
          {filtered.length ? (
            <div className="order-list">
              {filtered.map((o) => (
                <OrderCard key={o.id} o={o} onStatus={(next) => update.mutate({ id: o.id, next })} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state__art">📦</div>
              <h3>{rows.length ? "Không có đơn phù hợp" : "Chưa có đơn hàng nào"}</h3>
            </div>
          )}
        </>
      ) : (
        <div className="table-wrap">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Liên hệ</th>
                <th>Địa chỉ gần nhất</th>
                <th className="num">Số đơn</th>
                <th className="num">Đã mua</th>
              </tr>
            </thead>
            <tbody>
              {stats.customers.map((c) => (
                <tr key={c.phone}>
                  <td>
                    <strong>{c.name}</strong>
                    <br />
                    <small className="muted">Đơn gần nhất: {formatDate(c.lastOrderAt)}</small>
                  </td>
                  <td>
                    <a href={`tel:${c.phone}`}>{c.phone}</a>
                    {c.email ? (
                      <>
                        <br />
                        <a href={`mailto:${c.email}`}>{c.email}</a>
                      </>
                    ) : null}
                  </td>
                  <td>{c.address}</td>
                  <td className="num">{c.orders}</td>
                  <td className="num">{formatVND(c.spent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

const EMAIL_LABEL: Record<string, string> = {
  sent: "Đã gửi Gmail",
  failed: "Gửi Gmail lỗi",
  not_configured: "Chưa cấu hình gửi Gmail",
  pending: "Đang gửi Gmail",
};

function OrderCard({ o, onStatus }: { o: OrderRow; onStatus: (s: OrderStatus) => void }) {
  const items = (o.items as OrderItem[]) ?? [];
  return (
    <div className="order-row">
      <div>
        <div className="order-row__code">{o.code}</div>
        <small>{formatDate(o.created_at)}</small>
        <div style={{ marginTop: 8 }}>
          <StatusPill status={o.status} />
        </div>
        <span className="email-flag" data-state={o.email_status} title={o.email_error ?? undefined}>
          {EMAIL_LABEL[o.email_status] ?? o.email_status}
        </span>
      </div>
      <div>
        <strong>{o.customer_name}</strong>
        <small>
          <a href={`tel:${o.phone}`}>{o.phone}</a>
          {o.email ? ` · ${o.email}` : ""}
        </small>
        <small>{o.address}</small>
        <small>{PAYMENT_METHODS[o.payment_method as PaymentMethod] ?? o.payment_method}</small>
      </div>
      <div>
        <ul className="order-row__items">
          {items.map((i) => (
            <li key={i.id}>
              {i.name} × {i.quantity}
            </li>
          ))}
        </ul>
        <div className="order-row__total">{formatVND(o.total)}</div>
      </div>
      <div>
        <label className="sr-only" htmlFor={`st-${o.id}`}>
          Trạng thái
        </label>
        <select id={`st-${o.id}`} className="input" value={o.status} onChange={(e) => onStatus(e.target.value as OrderStatus)}>
          {(Object.keys(ORDER_STATUSES) as OrderStatus[]).map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUSES[s]}
            </option>
          ))}
        </select>
      </div>
      {o.note ? <div className="order-row__note">Ghi chú: {o.note}</div> : null}
    </div>
  );
}
