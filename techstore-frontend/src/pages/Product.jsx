import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Star,
  MapPin,
  CheckCircle2,
  Share2
} from "lucide-react";
import { productService } from "../services/api";
import { money, products } from "../data/products";
import { useStore } from "../context/StoreContext";
import { ProductCard, ErrorState, PageLoader } from "../components/ui";

export default function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [image, setImage] = useState("");
  const [added, setAdded] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [pincode, setPincode] = useState("");
  const [pinStatus, setPinStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  const { addToCart, wishlist, toggleWishlist, triggerToast } = useStore();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const p = await productService.get(id);
      if (!p) throw new Error("Product not found");
      setProduct(p);
      setImage(p.image);
      setSelectedColor(p.color || "Standard");
    } catch (e) {
      setError(e.message || "Could not load this product.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    setQty(1);
    setPinStatus(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (loading) return <div className="page-wrap"><PageLoader /></div>;
  if (error || !product) {
    return (
      <div className="page-wrap">
        <ErrorState message={error || "Product not found."} retry={load} />
        <Link to="/shop" className="text-link mt-5 inline-flex">Back to shop</Link>
      </div>
    );
  }

  const liked = wishlist.includes(product.id);

  const handleAddToCart = () => {
    if (!product.stock) return;
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const checkDelivery = e => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode.trim())) {
      setPinStatus({ ok: false, msg: "Please enter a valid 6-digit PIN code." });
      return;
    }
    setPinStatus({ ok: true, msg: "Complimentary Express Delivery available. Ships in 24 hours." });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    triggerToast("Link copied", "Product URL copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  const finishes = [product.color || "Standard", "Matte Slate", "Raw Aluminum"];

  return (
    <div className="page-wrap product-page">
      <div className="flex items-center justify-between mb-8">
        <Link to="/shop" className="back-link mb-0">
          <ArrowLeft size={15} /> Back to collection
        </Link>
        <button onClick={handleShare} className="share-link-btn" title="Share product">
          <Share2 size={15} />
          <span>{copied ? "Link Copied!" : "Share"}</span>
        </button>
      </div>

      <div className="product-detail-grid">
        {/* GALLERY */}
        <div className="product-gallery">
          <div className="product-main-image group">
            <img src={image || product.image} alt={product.name} />
            {product.badge ? (
              <span className="product-badge">{product.badge}</span>
            ) : discountPercent ? (
              <span className="product-badge bg-accent">−{discountPercent}% OFF</span>
            ) : null}
          </div>

          <div className="gallery-thumbs">
            {(product.gallery || [product.image]).map((src, i) => (
              <button
                key={src + i}
                className={image === src ? "active" : ""}
                onClick={() => setImage(src)}
                aria-label={`Select angle ${i + 1}`}
              >
                <img src={src} alt={`${product.name} angle ${i + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* INFO */}
        <div className="product-info">
          <p className="eyebrow flex items-center gap-2">
            <span className="eyebrow-dot" /> {product.category} / FORM SELECTION Nº {product.id}
          </p>
          <h1>{product.name}</h1>

          <div className="flex items-center gap-3 mt-2">
            <div className="detail-rating flex items-center gap-1.5 font-semibold">
              <Star size={13} fill="currentColor" className="text-amber-500" />
              <span>{product.rating}</span>
            </div>
            <span className="text-muted text-xs">({product.reviews} verified reviews)</span>
            <span className="spec-tag">Studio Calibrated</span>
          </div>

          <div className="detail-price">
            <span>{money(product.price)}</span>
            {product.oldPrice && <span className="line-through">{money(product.oldPrice)}</span>}
            {discountPercent && <span className="save-badge">Save {money(product.oldPrice - product.price)}</span>}
          </div>

          <p className="detail-description">{product.description}</p>

          {/* FINISH SELECTOR */}
          <div className="finish-selector mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted block mb-2">
              Finish: <strong className="text-ink font-bold">{selectedColor}</strong>
            </span>
            <div className="flex gap-2">
              {finishes.map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedColor(f)}
                  className={`finish-chip ${selectedColor === f ? "active" : ""}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="stock-status">
            <span className={`stock-dot ${product.stock > 0 ? "in-stock" : "out-of-stock"}`} />
            {product.stock > 0 ? (
              <span>In stock · <strong>{product.stock} units</strong> remaining in initial batch</span>
            ) : (
              <span>Currently unavailable for backorder</span>
            )}
          </div>

          {/* QUANTITY & ACTIONS */}
          <div className="quantity-row">
            <span className="font-semibold text-xs">Quantity</span>
            <div className="quantity-control">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity">
                <Minus size={14} />
              </button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock || 1, q + 1))} aria-label="Increase quantity">
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="detail-actions">
            <button
              disabled={!product.stock}
              className={`button button-dark flex-1 justify-center ${added ? "button-success" : ""}`}
              onClick={handleAddToCart}
            >
              {added ? (
                <>
                  <Check size={17} /> Added to bag
                </>
              ) : (
                <>Add to bag — {money(product.price * qty)}</>
              )}
            </button>
            <button
              className={`wishlist-detail ${liked ? "is-liked" : ""}`}
              onClick={() => toggleWishlist(product.id, product)}
              aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
              title={liked ? "Remove from wishlist" : "Save to wishlist"}
            >
              <Heart size={20} fill={liked ? "currentColor" : "none"} />
            </button>
          </div>

          {/* PINCODE DELIVERY CHECKER */}
          <div className="delivery-checker">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={14} className="text-muted" />
              <span className="text-xs font-semibold">Check Express Delivery</span>
            </div>
            <form onSubmit={checkDelivery} className="pincode-form">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={e => setPincode(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit PIN code"
                aria-label="Pincode"
              />
              <button type="submit">Verify</button>
            </form>
            {pinStatus && (
              <p className={`pincode-msg ${pinStatus.ok ? "text-emerald-700" : "text-rose-700"}`}>
                {pinStatus.ok ? <CheckCircle2 size={13} className="inline mr-1" /> : null}
                {pinStatus.msg}
              </p>
            )}
          </div>

          <div className="product-promises">
            <div>
              <Truck size={18} />
              <span>
                <b>Thoughtful Delivery</b>
                <small>Free express shipping over ₹5,000</small>
              </span>
            </div>
            <div>
              <ShieldCheck size={18} />
              <span>
                <b>2-Year Hardware Assurance</b>
                <small>Comprehensive parts & labor warranty</small>
              </span>
            </div>
            <div>
              <RotateCcw size={18} />
              <span>
                <b>30-Day In-Home Trial</b>
                <small>Zero friction returns if not satisfied</small>
              </span>
            </div>
          </div>

          {/* ACCORDION */}
          <div className="detail-accordion">
            <details open>
              <summary>Technical Specifications</summary>
              <div className="spec-table">
                <div className="spec-row">
                  <span>Acoustic Architecture</span>
                  <strong>Custom Dynamic Neodymium / Calibrated Profile</strong>
                </div>
                <div className="spec-row">
                  <span>Chassis Materials</span>
                  <strong>CNC Machined 6000-series Aluminum & Vegan Leather</strong>
                </div>
                <div className="spec-row">
                  <span>Connectivity</span>
                  <strong>Bluetooth 5.3 Low-Latency / 3.5mm Analog Audio Bypass</strong>
                </div>
                <div className="spec-row">
                  <span>Battery & Charging</span>
                  <strong>Up to 45 Hours Playback · USB-C Fast Charge (15m = 6h)</strong>
                </div>
              </div>
            </details>

            <details>
              <summary>In The Box</summary>
              <p className="text-xs leading-relaxed text-muted">
                FORM Hardware Unit, Braided USB-C to USB-C charging cable (1.5m), 3.5mm gold-plated audio cable, Magnetic protective carrying sleeve, and Quick Start Guide with serial registration.
              </p>
            </details>

            <details>
              <summary>Shipping, Customs & Returns</summary>
              <p className="text-xs leading-relaxed text-muted">
                Dispatches within 24 hours via climate-neutral priority courier. 30-day return policy applies to all hardware kept in original packaging.
              </p>
            </details>
          </div>
        </div>
      </div>

      {/* REVIEWS SPOTLIGHT SECTION */}
      <section className="product-reviews-section">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-line">
          <div>
            <p className="eyebrow mb-1">VERIFIED EXPERIENCES</p>
            <h2 className="text-2xl font-serif">Customer Evaluations</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <span className="text-3xl font-bold font-mono">{product.rating}</span>
              <div className="flex text-amber-500 justify-center mt-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
              </div>
            </div>
            <div className="h-10 w-px bg-line" />
            <span className="text-xs text-muted max-w-[130px] leading-tight">
              Based on {product.reviews} verified store purchases.
            </span>
          </div>
        </div>

        <div className="reviews-cards-row">
          <div className="review-box">
            <div className="flex items-center justify-between text-xs mb-2">
              <strong className="font-semibold">Nikhil T.</strong>
              <span className="text-muted">Verified Owner · 3 weeks ago</span>
            </div>
            <div className="flex text-amber-500 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Exceeded expectations. The build quality feels like something that will last a lifetime. Balanced acoustic stage with crisp mids.
            </p>
          </div>

          <div className="review-box">
            <div className="flex items-center justify-between text-xs mb-2">
              <strong className="font-semibold">Kavya M.</strong>
              <span className="text-muted">Verified Owner · 1 month ago</span>
            </div>
            <div className="flex text-amber-500 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Arrived in beautiful plastic-free packaging. Fits comfortably during long calls and sound insulation is exceptional.
            </p>
          </div>
        </div>
      </section>

      {/* RELATED PRODUCTS */}
      <section className="related-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">KEEP EXPLORING</p>
            <h2>Good together.</h2>
          </div>
          <Link to="/shop" className="text-link">
            Shop all <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="product-grid">
          {products
            .filter(p => p.id !== product.id)
            .slice(0, 4)
            .map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </section>

      {/* STICKY BOTTOM BAR FOR MOBILE */}
      <div className="mobile-sticky-buy-bar">
        <div className="flex items-center gap-3">
          <img src={image || product.image} alt="" className="w-10 h-10 object-cover rounded bg-paper" />
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate text-ink">{product.name}</p>
            <p className="text-xs font-mono font-bold text-ink">{money(product.price)}</p>
          </div>
        </div>
        <button
          disabled={!product.stock}
          className="button button-dark text-xs py-2 px-4"
          onClick={handleAddToCart}
        >
          {added ? "Added ✓" : "Add to bag"}
        </button>
      </div>
    </div>
  );
}
