import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Minus, Plus, Trash2, ShoppingBag, Tag, Check, ShieldCheck, Truck, ArrowLeft } from "lucide-react";
import { money, products } from "../data/products";
import { useStore } from "../context/StoreContext";
import { EmptyState, FreeShippingBar, ProductCard } from "../components/ui";

export default function Cart() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    subtotal,
    discount,
    shipping,
    total,
    coupon,
    applyCoupon,
    removeCoupon
  } = useStore();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState(null);

  const handleApplyCoupon = e => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyCoupon(couponInput);
    setCouponMsg(res);
    if (res.success) setCouponInput("");
  };

  if (!cart.length) {
    return (
      <div className="page-wrap">
        <div className="page-intro compact">
          <p className="eyebrow">YOUR BAG</p>
          <h1>A little room <em>for good things.</em></h1>
        </div>
        <EmptyState
          title="Your shopping bag is taking a breather."
          detail="Explore our collection of studio audio, precision workspaces, and everyday carry."
          action="Explore the collection"
          to="/shop"
          icon="box"
        />

        <div className="mt-16 pt-12 border-t border-line">
          <p className="eyebrow mb-4">RECOMMENDED COMPANIONS</p>
          <div className="product-grid">
            {products.slice(0, 4).map(p => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <div className="page-intro compact">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">YOUR BAG / {cart.length} {cart.length === 1 ? "ITEM" : "ITEMS"}</p>
            <h1>Review your <em>selection.</em></h1>
          </div>
          <Link to="/shop" className="text-link hidden sm:inline-flex">
            <ArrowLeft size={15} /> Continue shopping
          </Link>
        </div>
      </div>

      <div className="cart-layout">
        {/* CART ITEMS LIST */}
        <section className="cart-items">
          {cart.map(item => (
            <article className="cart-item" key={item.id}>
              <Link to={`/product/${item.slug}`} className="cart-thumb">
                <img src={item.image} alt={item.name} />
              </Link>

              <div className="cart-item-info">
                <div className="flex items-center gap-2">
                  <span className="eyebrow">{item.category}</span>
                  {item.color && <span className="color-tag">· {item.color}</span>}
                </div>
                <Link to={`/product/${item.slug}`} className="cart-item-name">
                  {item.name}
                </Link>
                <p className="text-muted text-xs mt-1 font-mono">{money(item.price)} each</p>

                <div className="quantity-control mt-4">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={13} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              <div className="cart-item-end">
                <b className="font-mono text-sm">{money(item.price * item.quantity)}</b>
                <button
                  className="remove-button"
                  onClick={() => removeFromCart(item.id)}
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </article>
          ))}

          <div className="flex items-center justify-between pt-6">
            <Link to="/shop" className="text-link">
              ← Continue browsing collection
            </Link>
            <span className="text-xs text-muted">All prices include applicable taxes</span>
          </div>
        </section>

        {/* ORDER SUMMARY SIDEBAR */}
        <aside className="order-summary">
          <p className="eyebrow">ORDER BREAKDOWN</p>
          <h2>Summary</h2>

          {/* FREE SHIPPING PROGRESS BAR */}
          <FreeShippingBar current={subtotal} threshold={5000} />

          {/* SUMMARY LINES */}
          <div className="summary-line mt-4">
            <span>Subtotal</span>
            <span className="font-mono">{money(subtotal)}</span>
          </div>

          {coupon && (
            <div className="summary-line text-emerald-700">
              <span className="flex items-center gap-1">
                <Tag size={13} /> Discount ({coupon.code} −{coupon.percent}%)
              </span>
              <span className="font-mono font-semibold">−{money(discount)}</span>
            </div>
          )}

          <div className="summary-line">
            <span>Shipping</span>
            <span>{shipping === 0 ? <strong className="text-emerald-700 font-semibold">Complimentary</strong> : money(shipping)}</span>
          </div>

          {/* COUPON INPUT */}
          <div className="coupon-box mt-4 mb-4 pt-4 border-t border-line">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted block mb-2">
              Promotional Code
            </label>
            {coupon ? (
              <div className="applied-coupon">
                <span className="font-mono text-xs font-semibold flex items-center gap-1.5 text-emerald-800">
                  <Check size={14} /> {coupon.code} active
                </span>
                <button onClick={removeCoupon} className="text-xs text-rose-700 underline font-medium">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="coupon-form">
                <input
                  type="text"
                  placeholder="e.g. FORM10"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  className="coupon-input"
                  aria-label="Discount code"
                />
                <button type="submit" className="coupon-button">Apply</button>
              </form>
            )}

            {couponMsg && !coupon && (
              <p className={`text-xs mt-1.5 ${couponMsg.success ? "text-emerald-700" : "text-rose-700"}`}>
                {couponMsg.message}
              </p>
            )}

            {!coupon && (
              <div className="promo-hint mt-2">
                <span>Tip: Use code <button type="button" onClick={() => setCouponInput("FORM10")} className="font-bold underline">FORM10</button> for 10% off</span>
              </div>
            )}
          </div>

          <div className="summary-line summary-total">
            <span>Total Amount</span>
            <strong className="font-mono text-xl">{money(total)}</strong>
          </div>

          <button
            className="button button-dark w-full justify-center mt-6 py-3.5 text-sm"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout <ArrowRight size={17} />
          </button>

          <div className="cart-guarantees mt-5 pt-5 border-t border-line/60">
            <div className="flex items-center gap-2 text-xs text-muted mb-2">
              <ShieldCheck size={14} className="text-ink" />
              <span>256-Bit SSL Encrypted Checkout</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <Truck size={14} className="text-ink" />
              <span>Climate-Neutral Courier Delivery</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
