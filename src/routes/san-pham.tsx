import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/freshbox/cart-ui";
import { icons } from "@/components/freshbox/icons";
import { PRODUCTS } from "@/lib/catalog";
import { SHOP } from "@/lib/shop";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/san-pham")({
  head: () => ({
    meta: [
      { title: "Sản phẩm – FRESH BOX | Hộp trái cây gọt sẵn" },
      { name: "description", content: "Danh sách hộp trái cây gọt sẵn Fresh Box: Mini, Mix, Premium, Office, Family. Giá từ 25.000 VNĐ." },
      { property: "og:title", content: "Sản phẩm – FRESH BOX" },
      { property: "og:description", content: "5 hộp trái cây gọt sẵn Fresh Box, giá từ 25.000 VNĐ." },
    ],
  }),
  component: Products,
});

function Products() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Đường dẫn">
            <Link to="/">Trang chủ</Link> / Sản phẩm
          </nav>
          <h1 className="load-in">
            Hộp trái cây <span className="scribble">gọt sẵn</span>
          </h1>
          <p className="load-in load-in-1">
            Dưa hấu, xoài, thanh long, nho xanh và các loại trái cây theo mùa – sơ chế trong ngày, đóng gói sạch sẽ. Chọn số lượng và
            thêm vào giỏ chỉ với một chạm.
          </p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 10 }}>
        <div className="container">
          <div className="products-grid">
            {PRODUCTS.map((p, i) => (
              <ProductCard key={p.id} p={p} i={i} />
            ))}
          </div>
          <div className="notice mt-2 reveal">
            {icons.info}
            <p>
              Thành phần có thể thay đổi nhẹ theo mùa để luôn đảm bảo trái cây ngon nhất trong ngày. Cần đặt số lượng lớn cho sự kiện,
              công ty? Gọi <a href={`tel:${SHOP.phone}`}>{SHOP.phone}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
