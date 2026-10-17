import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  Box,
  ClipboardList,
  IndianRupee,
  Plus,
  ShieldAlert,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { products, money } from "../data/products";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState("products");
  const [searchQuery, setSearchQuery] = useState("");
  const orders = JSON.parse(localStorage.getItem("form-orders") || "[]");

  if (!user || user.role !== "admin") {
    return (
      <div className="page-wrap">
        <div className="restricted">
          <ShieldAlert size={36} className="text-rose-600 mb-3" />
          <h1>Admin access only.</h1>
          <p className="text-muted text-xs max-w-sm mt-2 leading-relaxed">
            This dashboard requires curator or administrator credentials. Please sign in with an account having role: "admin".
          </p>
          <Link to="/login" className="button button-dark mt-6">
            Sign in as Administrator
          </Link>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-wrap">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <Link to="/" className="wordmark">
          FORM<span>®</span>
          <small>ADMINISTRATIVE CONSOLE</small>
        </Link>

        <p className="eyebrow mt-8 mb-2">MANAGEMENT</p>
        <button
          className={tab === "products" ? "active" : ""}
          onClick={() => setTab("products")}
        >
          <Box size={17} /> Products ({products.length})
        </button>
        <button
          className={tab === "orders" ? "active" : ""}
          onClick={() => setTab("orders")}
        >
          <ClipboardList size={17} /> Orders ({orders.length})
        </button>
        <button
          className={tab === "customers" ? "active" : ""}
          onClick={() => setTab("customers")}
        >
          <Users size={17} /> Customer Registry
        </button>

        <Link to="/" className="admin-back flex items-center gap-1.5 mt-auto text-xs text-muted hover:text-ink">
          <ExternalLink size={14} /> Back to storefront
        </Link>
      </aside>

      {/* MAIN ADMIN CONTENT */}
      <section className="admin-main">
        <div className="admin-header">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <span className="eyebrow-dot" /> FORM / ADMINISTRATION
            </p>
            <h1>
              {tab === "products"
                ? "Catalog & Inventory"
                : tab === "orders"
                ? "Dispatched & Pending Orders"
                : "Customer Directory"}
            </h1>
          </div>
          <span className="account-tag">CURATOR SESSION ACTIVE</span>
        </div>

        {/* METRICS ROW */}
        <div className="admin-metrics">
          <div>
            <span>
              <Box size={16} /> Active SKUs
            </span>
            <strong>{products.length}</strong>
            <small className="text-emerald-700 font-medium">100% in circulation</small>
          </div>

          <div>
            <span>
              <ClipboardList size={16} /> Total Store Orders
            </span>
            <strong>{orders.length}</strong>
            <small className="text-emerald-700 font-medium">Real-time mock queue</small>
          </div>

          <div>
            <span>
              <IndianRupee size={16} /> Gross Merchandise Value
            </span>
            <strong>{money(totalRevenue)}</strong>
            <small className="text-muted">Recorded store volume</small>
          </div>
        </div>

        {/* TAB: PRODUCTS */}
        {tab === "products" && (
          <div className="admin-table-wrap">
            <div className="admin-table-head">
              <div className="flex items-center gap-3 flex-1 max-w-sm">
                <div className="header-search w-full">
                  <Search size={15} />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Filter products by name or SKU..."
                  />
                </div>
              </div>
              <button
                className="button button-dark"
                onClick={() => alert("Product creator dialogue connected to backend API schema.")}
              >
                <Plus size={16} /> New Product SKU
              </button>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Inventory</th>
                  <th>Stock Health</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="admin-product">
                        <img src={p.image} alt={p.name} />
                        <span>
                          {p.name}
                          <small className="font-mono text-muted">{p.id} · {p.color}</small>
                        </span>
                      </div>
                    </td>
                    <td><span className="font-medium">{p.category}</span></td>
                    <td className="font-mono font-semibold">{money(p.price)}</td>
                    <td className="font-mono">{p.stock} units</td>
                    <td>
                      <span className={`status-pill ${p.stock < 15 ? "bg-amber-100 text-amber-800" : ""}`}>
                        {p.stock > 15 ? (
                          <><CheckCircle2 size={13} className="text-emerald-700" /> Healthy</>
                        ) : (
                          <><AlertTriangle size={13} className="text-amber-700" /> Low Stock</>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: ORDERS */}
        {tab === "orders" && (
          <div className="admin-table-wrap">
            <div className="admin-table-head">
              <h2>Recent Customer Placements</h2>
              <span className="text-xs text-muted">{orders.length} recorded orders</span>
            </div>

            {orders.length ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order Reference</th>
                    <th>Customer Name</th>
                    <th>Destination</th>
                    <th>Payment</th>
                    <th>Total</th>
                    <th>Fulfillment</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td className="font-mono font-bold">{o.id}</td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-semibold">{o.shippingAddress?.name || "Customer"}</span>
                          <small className="text-muted">{o.shippingAddress?.email}</small>
                        </div>
                      </td>
                      <td>{o.shippingAddress?.city || "Direct Courier"}</td>
                      <td className="font-mono uppercase text-xs">{o.payment || "COD"}</td>
                      <td className="font-mono font-bold">{money(o.total)}</td>
                      <td>
                        <span className="status-pill">
                          <CheckCircle2 size={13} className="text-emerald-700" /> {o.status || "Confirmed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-8 text-center text-muted text-xs">
                No orders recorded yet. Place an order on the storefront to see live items populate here.
              </p>
            )}
          </div>
        )}

        {/* TAB: CUSTOMERS */}
        {tab === "customers" && (
          <div className="admin-table-wrap p-8">
            <h2 className="text-lg font-serif">Registered Customer Base</h2>
            <p className="text-muted text-xs mt-2 max-w-md leading-relaxed">
              Customer accounts automatically sync with the backend database upon authentication. Active members receive notifications for exclusive hardware drops.
            </p>
          </div>
        )}

        <p className="admin-footnote">
          FORM Hardware Administration Panel · Connected to client-side simulated state. Real mutations map to Express REST routes.
        </p>
      </section>
    </div>
  );
}
