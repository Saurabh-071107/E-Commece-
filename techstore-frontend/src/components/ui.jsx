import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Heart, ShoppingBag, Star, PackageOpen, SearchX, Eye, X, Check, CheckCircle2, ShieldCheck, Truck } from "lucide-react";
import { money } from "../data/products";
import { useStore } from "../context/StoreContext";

export function ToastContainer() {
  const { toasts, removeToast } = useStore();
  if (!toasts.length) return null;

  return (
    <div className="toast-portal" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className="toast-item">
          {t.image ? (
            <img src={t.image} alt="" className="toast-image" />
          ) : (
            <div className="toast-icon-wrap"><CheckCircle2 size={18} /></div>
          )}
          <div className="toast-content">
            <p className="toast-title">{t.title}</p>
            {t.subtitle && <p className="toast-subtitle">{t.subtitle}</p>}
          </div>
          <Link to="/cart" className="toast-action">Bag</Link>
          <button onClick={() => removeToast(t.id)} className="toast-close" aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart, wishlist, toggleWishlist } = useStore();
  const [activeImg, setActiveImg] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!quickViewProduct) return null;
  const p = quickViewProduct;
  const liked = wishlist.includes(p.id);
  const currentImg = activeImg || p.image;

  const handleAdd = () => {
    addToCart(p, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="modal-backdrop" onClick={() => setQuickViewProduct(null)}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setQuickViewProduct(null)} aria-label="Close modal">
          <X size={18} />
        </button>

        <div className="quickview-grid">
          <div className="quickview-gallery">
            <div className="quickview-main-img">
              <img src={currentImg} alt={p.name} />
              {p.badge && <span className="product-badge">{p.badge}</span>}
            </div>
            {p.gallery && p.gallery.length > 1 && (
              <div className="quickview-thumbs">
                {p.gallery.map((src, i) => (
                  <button
                    key={src + i}
                    className={currentImg === src ? "active" : ""}
                    onClick={() => setActiveImg(src)}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="quickview-info">
            <p className="eyebrow">{p.category} · FORM EDITION</p>
            <h2 className="quickview-title">{p.name}</h2>
            <div className="flex items-center gap-2 text-xs text-muted mt-1">
              <span className="flex items-center gap-1 font-semibold text-ink"><Star size={12} fill="currentColor" /> {p.rating}</span>
              <span>· {p.reviews} reviews</span>
              <span className="stock-pill">{p.stock > 0 ? "In stock" : "Out of stock"}</span>
            </div>

            <div className="quickview-price">
              <span>{money(p.price)}</span>
              {p.oldPrice && <span className="line-through text-muted">{money(p.oldPrice)}</span>}
            </div>

            <p className="quickview-desc">{p.description}</p>

            <div className="flex items-center gap-4 mt-6">
              <div className="quantity-control">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity">-</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => Math.min(p.stock || 1, q + 1))} aria-label="Increase quantity">+</button>
              </div>

              <button
                onClick={handleAdd}
                className="button button-dark flex-1 justify-center"
                disabled={!p.stock}
              >
                {added ? <><Check size={16} /> Added</> : <>Add to bag — {money(p.price * qty)}</>}
              </button>

              <button
                onClick={() => toggleWishlist(p.id, p)}
                className={`wish-button-inline ${liked ? "is-liked" : ""}`}
                aria-label="Wishlist"
              >
                <Heart size={18} fill={liked ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="quickview-foot">
              <Link
                to={`/product/${p.slug}`}
                onClick={() => setQuickViewProduct(null)}
                className="text-link"
              >
                Full product specifications <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductCard({ product }) {
  const { addToCart, wishlist, toggleWishlist, setQuickViewProduct } = useStore();
  const [added, setAdded] = useState(false);
  const liked = wishlist.includes(product.id);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  return (
    <article className="product-card group">
      <div className="product-image-wrap">
        <Link to={`/product/${product.slug}`} aria-label={`View ${product.name}`} className="block h-full">
          <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
        </Link>

        {product.badge ? (
          <span className="product-badge">{product.badge}</span>
        ) : discountPercent ? (
          <span className="product-badge bg-accent">−{discountPercent}%</span>
        ) : null}

        <div className="card-actions-top">
          <button
            onClick={() => toggleWishlist(product.id, product)}
            className={`wish-button ${liked ? "is-liked" : ""}`}
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={16} fill={liked ? "currentColor" : "none"} />
          </button>
          <button
            onClick={() => setQuickViewProduct(product)}
            className="quick-view-btn"
            aria-label={`Quick view ${product.name}`}
            title="Quick preview"
          >
            <Eye size={16} />
          </button>
        </div>

        <button onClick={handleQuickAdd} className={`quick-add ${added ? "is-added" : ""}`}>
          {added ? <><Check size={14} /> Added</> : <><ShoppingBag size={14} /> Quick add</>}
        </button>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="eyebrow">{product.category}</span>
            {product.color && <span className="color-tag">· {product.color}</span>}
          </div>
          <Link to={`/product/${product.slug}`} className="product-name">
            {product.name}
          </Link>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
            <Star size={11} fill="currentColor" className="text-amber-500" />
            <span className="font-semibold text-ink">{product.rating}</span>
            <span>({product.reviews})</span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="font-semibold text-sm text-ink">{money(product.price)}</p>
          {product.oldPrice && (
            <p className="text-xs text-muted line-through">{money(product.oldPrice)}</p>
          )}
        </div>
      </div>
    </article>
  );
}

export function FreeShippingBar({ current = 0, threshold = 5000 }) {
  const percent = Math.min(100, Math.round((current / threshold) * 100));
  const remaining = Math.max(0, threshold - current);

  return (
    <div className="shipping-progress-card">
      <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
        <span className="flex items-center gap-1.5 text-ink">
          <Truck size={14} />
          {remaining === 0 ? "You've unlocked Free Express Shipping!" : `Add ${money(remaining)} for Free Express Shipping`}
        </span>
        <span className="text-muted font-mono">{percent}%</span>
      </div>
      <div className="shipping-bar-track">
        <div className="shipping-bar-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, detail, link, linkText = "Explore all" }) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow mb-2 flex items-center gap-2">
          <span className="eyebrow-dot" /> {eyebrow}
        </p>
        <h2>{title}</h2>
        {detail && <p className="mt-2 text-muted max-w-xl text-sm leading-relaxed">{detail}</p>}
      </div>
      {link && (
        <Link to={link} className="text-link group">
          <span>{linkText}</span>
          <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      )}
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", detail = "There’s nothing to show right now.", action, to = "/", icon = "box" }) {
  const Icon = icon === "search" ? SearchX : PackageOpen;
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon size={28} /></div>
      <h2>{title}</h2>
      <p>{detail}</p>
      {action && <Link to={to} className="button button-dark mt-6">{action}</Link>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="loading-grid">
      {[1, 2, 3, 4, 5, 6].map(n => (
        <div className="skeleton-card" key={n}>
          <div className="skeleton-image" />
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message = "We couldn’t load this content.", retry }) {
  return (
    <div className="notice-error">
      <p>{message}</p>
      {retry && <button className="text-link mt-3 font-semibold" onClick={retry}>Try again</button>}
    </div>
  );
}
