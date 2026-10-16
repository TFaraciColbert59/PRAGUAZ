import Image from "next/image";
import Link from "next/link";
import { MajeFeaturedProducts, MajeServices, type MajeProduct } from "./data";
import { getProductSlug } from "./product-slugs";

function ProductTile({ product }: { product: MajeProduct }) {
  return (
    <article className="maje-tile">
      <Link href={`/fr/p/${getProductSlug(product)}`} className="maje-tile-link" aria-label={product.name}>
      <div className="maje-tile-img">
        {product.discount !== "" && (
          <span className="maje-badge">{product.discount}</span>
        )}
        <Image
          src={product.image}
          alt={product.alt}
          width={720}
          height={955}
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {product.hoverImage !== undefined && (
          <Image
            src={product.hoverImage}
            alt=""
            aria-hidden="true"
            width={720}
            height={955}
            sizes="(max-width: 768px) 50vw, 25vw"
            className="maje-tile-img--alt"
          />
        )}
      </div>
      <div className="maje-tile-body">
        <h3>{product.name}</h3>
        <p className="maje-price">
          {product.oldPrice !== "" && <s>{product.oldPrice}</s>}
          <strong>{product.newPrice}</strong>
        </p>
      </div>
      </Link>
    </article>
  );
}

export function MajeProductGrid() {
  return (
    <section className="maje-section" aria-label="Vos pièces favorites">
      <h2 className="maje-section-title">Vos pièces favorites</h2>
      <div className="maje-grid">
        {MajeFeaturedProducts.map((p) => (
          <ProductTile key={p.id} product={p} />
        ))}
      </div>
      <div className="maje-services">
        {MajeServices.map((s) => (
          <div key={s.title} className="maje-service">
            <strong>{s.title}</strong>
            <span>{s.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
