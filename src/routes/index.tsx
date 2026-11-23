import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/freshbox/cart-ui";
import { icons } from "@/components/freshbox/icons";
import { PRODUCTS } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FRESH BOX – Hoa quả gọt sẵn | Tươi ngon mỗi ngày – Tiếp thêm năng lượng" },
      {
        name: "description",
        content:
          "Fresh Box – hộp trái cây gọt sẵn tươi ngon, sơ chế trong ngày, đóng gói sạch sẽ và giao hàng nhanh chóng. Đặt hàng online chỉ trong 1 phút.",
      },
      { property: "og:title", content: "FRESH BOX – Hoa quả gọt sẵn" },
      { property: "og:description", content: "Trái cây tươi gọt sẵn, sơ chế trong ngày, giao nhanh. Chỉ từ 25.000đ/hộp." },
    ],
  }),
  component: Home,
});

const BENEFITS = [
  { icon: icons.leaf, title: "100% trái cây tươi ngon, chọn lọc", text: "Tuyển chọn từng trái chín tới, không dập úng, nguồn gốc rõ ràng." },
  { icon: icons.sparkle, title: "Sơ chế sạch sẽ trong ngày", text: "Rửa, gọt và cắt mới mỗi sáng – không để qua đêm." },
  { icon: icons.shield, title: "Đóng gói an toàn, vệ sinh", text: "Hộp kín, bao bì thân thiện môi trường, bảo quản lạnh." },
  { icon: icons.clock, title: "Tiện lợi, tiết kiệm thời gian", text: "Mở nắp là ăn, có sẵn nĩa gỗ – không cần dao thớt." },
  { icon: icons.truck, title: "Giao hàng nhanh chóng", text: "Giao tận nơi trong ngày, giữ lạnh suốt quãng đường." },
];

const FRUITS = ["Dưa hấu", "Xoài cát", "Thanh long ruột đỏ", "Nho xanh", "Dứa mật", "Dâu tây", "Kiwi", "Trái cây theo mùa"];

function Home() {
  return (
    <>
      <section className="hero">
        <svg className="leaf leaf--a" viewBox="0 0 64 64" aria-hidden="true">
          <path fill="currentColor" d="M8 56C8 26 26 8 58 6c-2 32-20 50-50 50z" />
          <path d="M10 54 44 20" stroke="#fbf6ea" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <svg className="leaf leaf--b" viewBox="0 0 64 64" aria-hidden="true">
          <path fill="currentColor" d="M8 56C8 26 26 8 58 6c-2 32-20 50-50 50z" />
        </svg>
        <div className="container hero-grid">
          <div>
            <span className="eyebrow load-in">Tươi ngon mỗi ngày – Tiếp thêm năng lượng</span>
            <h1 className="load-in load-in-1">
              <span className="line">Hoa quả gọt sẵn –</span>
              <span className="line">
                Tiếp thêm <span className="scribble">năng lượng</span>
              </span>
              <span className="line">mỗi ngày</span>
            </h1>
            <p className="hero__lead load-in load-in-2">
              Trái cây tươi ngon, sơ chế trong ngày, đóng gói sạch sẽ, giao hàng nhanh chóng. Mở nắp là ăn – không cần dao thớt,
              không mất thời gian.
            </p>
            <div className="hero__actions load-in load-in-3">
              <Link className="btn btn--butter btn--lg" to="/san-pham">
                Khám phá sản phẩm
              </Link>
              <Link className="btn btn--lg" to="/dat-hang">
                Đặt hàng ngay {icons.arrow}
              </Link>
            </div>
            <div className="hero__trust load-in load-in-4">
              <div>
                <strong>100%</strong>
                <span>trái cây tươi chọn lọc</span>
              </div>
              <div>
                <strong>4–8°C</strong>
                <span>bảo quản lạnh tới tay bạn</span>
              </div>
              <div>
                <strong>5+</strong>
                <span>loại trái cây mỗi hộp</span>
              </div>
            </div>
          </div>
          <div className="hero__visual load-in load-in-2">
            <div className="hero__img-wrap">
              <img
                src="/assets/img/hero.webp"
                alt="Các hộp trái cây Fresh Box gọt sẵn: dưa hấu, xoài, thanh long, nho xanh trong hộp giấy kraft thân thiện môi trường"
                width={1376}
                height={768}
                fetchPriority="high"
              />
            </div>
            <div className="hero__tag hero__tag--1">
              <span className="dot">🥭</span>
              <span>
                <strong>Sơ chế trong ngày</strong>Cắt mới mỗi sáng
              </span>
            </div>
            <div className="hero__tag hero__tag--2">
              <span className="dot">🛵</span>
              <span>
                <strong>Giao nhanh</strong>Lạnh tới tận tay
              </span>
            </div>
            <div className="stamp" aria-hidden="true">
              <span>
                chỉ từ<b>25K</b>/hộp
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[...FRUITS, ...FRUITS].map((f, i) => (
            <span key={i}>{f}</span>
          ))}
        </div>
      </div>

      <section className="section" id="uu-diem">
        <div className="container">
          <div className="section-head section-head--center reveal">
            <span className="eyebrow">Vì sao chọn Fresh Box</span>
            <h2>
              Trái cây sạch, gọn, tiện – <span className="scribble">mỗi ngày</span>
            </h2>
            <p>Chúng tôi lo phần chọn, rửa, gọt và đóng gói. Bạn chỉ việc mở nắp và tận hưởng.</p>
          </div>
          <div className="benefits">
            {BENEFITS.map((b, i) => (
              <div key={b.title} className={`benefit reveal reveal-delay-${i % 4}`}>
                <span className="benefit__num">0{i + 1}</span>
                <div className="benefit__icon">{b.icon}</div>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint" id="san-pham">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Thực đơn hôm nay</span>
            <h2>Chọn hộp trái cây của bạn</h2>
            <p>Năm kích cỡ cho mọi nhu cầu – từ bữa phụ một người đến buổi họp cả văn phòng.</p>
          </div>
          <div className="products-grid">
            {PRODUCTS.map((p, i) => (
              <ProductCard key={p.id} p={p} i={i} />
            ))}
          </div>
          <div className="text-center mt-2 reveal">
            <Link className="btn btn--ghost" to="/san-pham">
              Xem tất cả sản phẩm
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container story">
          <div className="story__img reveal">
            <img
              src="/assets/img/about.webp"
              alt="Nhân viên Fresh Box đeo găng tay sơ chế xoài trong bếp sạch"
              width={1376}
              height={768}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="reveal reveal-delay-1">
            <span className="eyebrow">Từ vườn đến hộp</span>
            <h2>Sơ chế sạch sẽ trong ngày, đóng gói cẩn thận</h2>
            <p className="muted">
              Mỗi sáng, trái cây được tuyển chọn tại chợ đầu mối và nhà vườn quen, rửa qua nước sạch, gọt và cắt trong bếp đạt chuẩn
              vệ sinh an toàn thực phẩm.
            </p>
            <ul className="check-list">
              <li>Không chất bảo quản, không phẩm màu</li>
              <li>Nhân viên đeo găng tay, khẩu trang khi sơ chế</li>
              <li>Hộp giấy kraft và nhựa phân hủy sinh học, thân thiện môi trường</li>
              <li>Bảo quản lạnh 4–8°C cho đến khi giao</li>
            </ul>
            <Link className="btn" to="/san-pham">
              Chọn hộp trái cây
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--green">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Đặt hàng trong 1 phút</span>
            <h2>Bốn bước để có hộp trái cây tươi</h2>
          </div>
          <div className="steps">
            <div className="step reveal">
              <h3>Chọn hộp yêu thích</h3>
              <p>Xem chi tiết từng hộp và thêm vào giỏ với số lượng mong muốn.</p>
            </div>
            <div className="step reveal reveal-delay-1">
              <h3>Điền thông tin</h3>
              <p>Họ tên, số điện thoại và địa chỉ giao hàng – vậy là đủ.</p>
            </div>
            <div className="step reveal reveal-delay-2">
              <h3>Chọn thanh toán</h3>
              <p>Thanh toán khi nhận hàng (COD) hoặc chuyển khoản ngân hàng.</p>
            </div>
            <div className="step reveal reveal-delay-3">
              <h3>Nhận mã đơn & thưởng thức</h3>
              <p>Nhận mã đơn để tra cứu trạng thái, Fresh Box gọi xác nhận và giao ngay.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band reveal">
            <div>
              <h2>Hôm nay bạn đã ăn đủ trái cây chưa?</h2>
              <p>Đặt ngay một hộp Fresh Box – tươi ngon mỗi ngày, tiếp thêm năng lượng.</p>
            </div>
            <Link className="btn btn--lg" to="/dat-hang">
              Đặt hàng ngay {icons.arrow}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
