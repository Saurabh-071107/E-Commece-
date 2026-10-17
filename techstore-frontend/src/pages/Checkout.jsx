import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Truck,
  CreditCard,
  QrCode,
  Banknote,
  Sparkles,
  PackageCheck
} from "lucide-react";
import { money } from "../data/products";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/api";

export default function Checkout() {
  const { cart, subtotal, discount, shipping, total, coupon, clearCart } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    payment: "upi"
  });

  const update = e => setForm({ ...form, [e.target.name]: e.target.value });

  const fillDemoData = () => {
    setForm({
      name: user?.name || "Aarav Sharma",
      email: user?.email || "aarav.sharma@example.com",
      phone: "9876543210",
      address: "402, Lotus Residency, 12th Main Road, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
      payment: "upi"
    });
  };

  const submit = async e => {
    e.preventDefault();
    setError("");

    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }

    const orderId = "FRM-" + Math.floor(1000000 + Math.random() * 9000000);
    const newOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      items: cart,
      subtotal,
      discount,
      shipping,
      total,
      coupon: coupon?.code || null,
      status: "Confirmed",
      payment: form.payment,
      shippingAddress: { ...form }
    };

    try {
      await orderService.create({
        items: cart.map(i => ({
          productId: i.id || i._id || "item",
          productName: i.name,
          price: i.price,
          quantity: i.quantity,
          productImage: i.image || ""
        })),
        shippingAddress: { ...form },
        totalAmount: total,
        paymentMethod: form.payment === "cod" ? "COD" : "Razorpay"
      });
    } catch (apiErr) {
      console.warn("Backend order creation:", apiErr.message);
    }

    const existingOrders = JSON.parse(localStorage.getItem("form-orders") || "[]");
    localStorage.setItem("form-orders", JSON.stringify([newOrder, ...existingOrders]));

    clearCart();
    setSubmittedOrder(newOrder);
  };

  // SUCCESS CONFIRMATION STATE
  if (submittedOrder) {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    const formattedDate = deliveryDate.toLocaleDateString("en-IN", {
      weekday: "long",
      month: "short",
      day: "numeric"
    });

    return (
      <div className="page-wrap">
        <div className="success-state">
          <div className="success-icon">
            <CheckCircle2 size={36} className="text-ink" />
          </div>
          <p className="eyebrow">ORDER CONFIRMED · REFERENCE Nº {submittedOrder.id}</p>
          <h1>
            Good things<br />
            <em>are on their way.</em>
          </h1>
          <p className="max-w-md mx-auto text-muted text-sm leading-relaxed mt-2">
            Thank you for choosing FORM. We've received your order and our logistics team is preparing your package with care.
          </p>

          <div className="order-receipt-card mt-8 text-left">
            <div className="flex justify-between items-center pb-4 border-b border-line">
              <div>
                <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Estimated Delivery</span>
                <p className="text-sm font-semibold text-ink mt-0.5">{formattedDate}</p>
              </div>
              <span className="status-pill">
                <PackageCheck size={14} /> Priority Dispatched
              </span>
            </div>

            <div className="py-4 space-y-3">
              {submittedOrder.items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <img src={item.image} alt="" className="w-8 h-8 object-cover rounded bg-paper" />
                    <span>{item.name} × {item.quantity}</span>
                  </div>
                  <span className="font-mono">{money(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-line flex justify-between items-center font-semibold text-sm">
              <span>Total Paid</span>
              <span className="font-mono font-bold text-base">{money(submittedOrder.total)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <Link to="/orders" className="button button-dark">
              Track Your Order <ArrowRight size={16} />
            </Link>
            <Link to="/shop" className="button button-outline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cart.length) {
    return (
      <div className="page-wrap">
        <div className="page-intro">
          <h1>Nothing to check out.</h1>
          <p className="text-muted mt-2">Your shopping bag is currently empty.</p>
          <Link to="/shop" className="button button-dark mt-6">
            Explore the collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <Link to="/cart" className="back-link">
        <ArrowLeft size={15} /> Back to bag
      </Link>

      <div className="page-intro compact flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <span className="eyebrow-dot" /> CHECKOUT STEP 01-03
          </p>
          <h1>Make it <em>official.</em></h1>
          <p className="text-muted text-xs mt-1">Delivery coordinates and payment selection.</p>
        </div>
        <button
          type="button"
          onClick={fillDemoData}
          className="autofill-btn self-start md:self-auto"
          title="Fills realistic demo address"
        >
          <Sparkles size={13} className="text-accent" /> Autofill Demo Data
        </button>
      </div>

      <form onSubmit={submit} className="checkout-layout">
        <div className="checkout-form">
          {/* STEP 1: CONTACT */}
          <section className="form-section">
            <div className="form-section-title">
              <span className="step-badge">01</span>
              <div>
                <h2>Contact Information</h2>
                <p>Order tracking notifications will be dispatched here.</p>
              </div>
            </div>

            <div className="field-grid">
              <label>
                Full Name
                <input
                  name="name"
                  value={form.name}
                  onChange={update}
                  required
                  placeholder="e.g. Aarav Sharma"
                />
              </label>

              <label>
                Email Address
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={update}
                  required
                  placeholder="you@example.com"
                />
              </label>

              <label className="full-field">
                Mobile Number (for Courier SMS)
                <input
                  name="phone"
                  value={form.phone}
                  onChange={update}
                  required
                  minLength="10"
                  maxLength="10"
                  placeholder="10-digit mobile number"
                  inputMode="tel"
                />
              </label>
            </div>
          </section>

          {/* STEP 2: ADDRESS */}
          <section className="form-section">
            <div className="form-section-title">
              <span className="step-badge">02</span>
              <div>
                <h2>Delivery Address</h2>
                <p>Climate-neutral doorstep delivery.</p>
              </div>
            </div>

            <div className="field-grid">
              <label className="full-field">
                Street Address, Flat / Villa No.
                <input
                  name="address"
                  value={form.address}
                  onChange={update}
                  required
                  placeholder="Apartment, building, and street name"
                />
              </label>

              <label>
                City
                <input
                  name="city"
                  value={form.city}
                  onChange={update}
                  required
                  placeholder="City"
                />
              </label>

              <label>
                State
                <input
                  name="state"
                  value={form.state}
                  onChange={update}
                  required
                  placeholder="State"
                />
              </label>

              <label className="full-field">
                6-Digit PIN Code
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={update}
                  required
                  maxLength="6"
                  inputMode="numeric"
                  placeholder="e.g. 560038"
                />
              </label>
            </div>
          </section>

          {/* STEP 3: PAYMENT METHOD */}
          <section className="form-section">
            <div className="form-section-title">
              <span className="step-badge">03</span>
              <div>
                <h2>Payment Method</h2>
                <p>Encrypted demo transaction channel.</p>
              </div>
            </div>

            <div className="payment-options-grid">
              <label className={`payment-card ${form.payment === "upi" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={form.payment === "upi"}
                  onChange={update}
                />
                <div className="payment-icon-wrap"><QrCode size={18} /></div>
                <div className="payment-info">
                  <b>UPI Instant (GPay / PhonePe / QR)</b>
                  <small>Zero surcharge, instant confirmation</small>
                </div>
              </label>

              <label className={`payment-card ${form.payment === "card" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={form.payment === "card"}
                  onChange={update}
                />
                <div className="payment-icon-wrap"><CreditCard size={18} /></div>
                <div className="payment-info">
                  <b>Credit / Debit Card</b>
                  <small>Visa, Mastercard, RuPay & Amex</small>
                </div>
              </label>

              <label className={`payment-card ${form.payment === "cod" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={form.payment === "cod"}
                  onChange={update}
                />
                <div className="payment-icon-wrap"><Banknote size={18} /></div>
                <div className="payment-info">
                  <b>Cash on Delivery (COD)</b>
                  <small>Pay upon package inspection at delivery</small>
                </div>
              </label>
            </div>
          </section>

          {error && <p className="form-error">{error}</p>}

          <button className="button button-dark w-full justify-center py-4 text-sm mt-4" type="submit">
            Place Order ({money(total)}) <ArrowRight size={17} />
          </button>

          <p className="secure-note mt-3">
            <ShieldCheck size={14} className="inline mr-1" />
            End-to-end 256-bit encryption. Safe & compliant checkout.
          </p>
        </div>

        {/* SUMMARY SIDEBAR */}
        <aside className="order-summary checkout-summary">
          <p className="eyebrow">YOUR BASKET</p>
          <h2>Order Summary</h2>

          <div className="mini-order-list">
            {cart.map(item => (
              <div className="mini-order-item" key={item.id}>
                <img src={item.image} alt={item.name} />
                <div>
                  <b>{item.name}</b>
                  <small>Qty {item.quantity} · {item.color || "Standard"}</small>
                </div>
                <span className="font-mono text-xs">{money(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="summary-line mt-5">
            <span>Subtotal</span>
            <span className="font-mono">{money(subtotal)}</span>
          </div>

          {coupon && (
            <div className="summary-line text-emerald-700">
              <span>Discount ({coupon.code})</span>
              <span className="font-mono">−{money(discount)}</span>
            </div>
          )}

          <div className="summary-line">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Complimentary" : money(shipping)}</span>
          </div>

          <div className="summary-line summary-total">
            <span>Total Payable</span>
            <strong className="font-mono text-xl">{money(total)}</strong>
          </div>

          <div className="checkout-trust-box mt-6">
            <div className="flex items-center gap-2 text-xs text-muted mb-2">
              <Truck size={14} />
              <span>Ships within 24 hours</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <ShieldCheck size={14} />
              <span>Full warranty coverage included</span>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
