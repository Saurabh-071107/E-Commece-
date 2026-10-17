import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, PackageCheck, Truck, CheckCircle2, Clock, RotateCcw, ArrowRight } from "lucide-react";
import { money } from "../data/products";
import { EmptyState } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { orderService } from "../services/api";

export default function Orders() {
  const { user } = useAuth();
  const { addToCart, triggerToast } = useStore();
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem("form-orders") || "[]"));

  useEffect(() => {
    if (!user) return;
    orderService.mine()
      .then(res => {
        if (res?.data?.orders?.length) {
          setOrders(res.data.orders);
        }
      })
      .catch(() => {});
  }, [user]);

  if (!user) {
    return (
      <div className="page-wrap">
        <div className="page-intro">
          <h1>Your orders, <em>in one place.</em></h1>
          <p className="text-muted mt-2">Sign in to view your order history and live dispatch status.</p>
          <Link to="/login" className="button button-dark mt-6">
            Sign in to continue
          </Link>
        </div>
      </div>
    );
  }

  const handleReorder = (item) => {
    addToCart(item, 1);
    triggerToast("Added to bag", `Re-ordered ${item.name}`, item.image);
  };

  return (
    <div className="page-wrap">
      <div className="page-intro compact">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <span className="eyebrow-dot" /> YOUR SPACE / ORDER HISTORY
            </p>
            <h1>Things on <em>their way.</em></h1>
            <p className="text-muted text-xs mt-1">Live tracking and itemized records for all your orders.</p>
          </div>
          <Link to="/shop" className="text-link hidden sm:inline-flex">
            Shop collection <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>

      {!orders.length ? (
        <EmptyState
          title="No orders placed yet."
          detail="Once you make a purchase, live courier tracking and invoice history will show up right here."
          action="Explore the collection"
          to="/shop"
        />
      ) : (
        <div className="orders-list">
          {orders.map(o => (
            <article className="order-card" key={o.id}>
              {/* HEADER */}
              <div className="order-card-head">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="eyebrow">ORDER REFERENCE</span>
                    <span className="font-mono text-xs font-bold text-ink">{o.id}</span>
                  </div>
                  <p className="text-muted text-xs mt-1">
                    Placed on {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="status-pill">
                    <PackageCheck size={14} /> {o.status || "Confirmed"}
                  </span>
                </div>
              </div>

              {/* TRACKING TIMELINE */}
              <div className="tracking-timeline mt-5 pt-4 border-t border-line/60">
                <div className="timeline-step completed">
                  <div className="timeline-dot"><CheckCircle2 size={12} /></div>
                  <span>Confirmed</span>
                </div>
                <div className="timeline-line completed" />
                <div className="timeline-step active">
                  <div className="timeline-dot"><Clock size={12} /></div>
                  <span>Prepared</span>
                </div>
                <div className="timeline-line" />
                <div className="timeline-step">
                  <div className="timeline-dot"><Truck size={12} /></div>
                  <span>In Transit</span>
                </div>
                <div className="timeline-line" />
                <div className="timeline-step">
                  <div className="timeline-dot"><CheckCircle2 size={12} /></div>
                  <span>Delivered</span>
                </div>
              </div>

              {/* ITEMS LIST */}
              <div className="order-card-items">
                {o.items.map(i => (
                  <div key={i.id} className="order-item-row">
                    <img src={i.image} alt={i.name} />
                    <div className="order-item-details">
                      <Link to={`/product/${i.slug}`} className="font-semibold text-xs text-ink hover:underline">
                        {i.name}
                      </Link>
                      <span className="text-[11px] text-muted">Quantity: {i.quantity} · {money(i.price)} each</span>
                    </div>
                    <button
                      onClick={() => handleReorder(i)}
                      className="button button-outline text-[10px] py-1 px-3 ml-auto"
                      title="Reorder this product"
                    >
                      <RotateCcw size={12} /> Buy again
                    </button>
                  </div>
                ))}
              </div>

              {/* FOOTER */}
              <div className="order-card-foot">
                <div className="text-xs text-muted">
                  <span>Shipping to: <strong>{o.shippingAddress?.city || "Customer Address"}</strong></span>
                  {o.payment && <span className="ml-2 font-mono uppercase">({o.payment})</span>}
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-muted mr-2">Total Amount</span>
                  <strong className="font-mono text-sm">{money(o.total)}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
